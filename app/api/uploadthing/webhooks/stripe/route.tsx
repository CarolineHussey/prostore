import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order.actions";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET env");
    return NextResponse.json(
      { error: "Webhook config error" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook event received:", event.type);

  // adjust event types as needed (Stripe may send payment_intent.succeeded etc.)
  if (event.type === "charge.succeeded") {
    const { object } = event.data;
    const orderId = object?.metadata?.orderId;
    console.log("charge.succeeded object metadata:", object?.metadata);

    if (!orderId) {
      console.error("No orderId in charge metadata; skipping update");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    try {
      await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: object.id,
          status: "COMPLETED",
          email_address: object.billing_details.email!,
          pricePaid: object?.amount ? (object.amount / 100).toFixed() : "0",
        },
      });
      console.log("updateOrderToPaid succeeded for order:", orderId);
      return NextResponse.json({ message: "updateOrderToPaid was successful" });
    } catch (err) {
      console.error("updateOrderToPaid failed:", err);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "event ignored" });
}

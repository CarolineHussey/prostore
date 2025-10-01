import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import ShippingAddressForm from "./shipping-address-form";
import { getUserById } from "@/lib/actions/user.actions";

export const metaData = {
  title: "Shipping Address",
};
const ShippingAddressPage = async () => {
  const getCart = await getMyCart();
  const cart =
    getCart && "items" in getCart && Array.isArray(getCart.items)
      ? getCart
      : undefined;
  if (!cart || cart.items.length == 0) redirect("/cart");
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("User Id does not exist");
  const user = await getUserById(userId);

  return (
    <>
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;

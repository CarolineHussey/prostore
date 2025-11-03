"use server";

import z from "zod";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validators";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

//create & update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    //validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    //get product
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });
    if (!product) throw new Error("Product not found");
    //check if user already reviewed the product
    const reviewExists = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        //update the review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        //create a new review
        await tx.review.create({ data: review });
      }

      //review stats
      const avgRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });
      //update rating and numReviews in Product
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: avgRating._avg.rating || 0,
          numReviews: numReviews,
        },
      });
    });
    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: "Review submitted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId: productId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return { data };
}

//get a review written by current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authenticated");

  return await prisma.review.findFirst({
    where: { productId, userId: session?.user?.id },
  });
}

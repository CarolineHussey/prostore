"use server";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { convertToPlainObject } from "../utils"; // Utility function to convert Prisma objects to plain JS objects
import { prisma } from "../../db/prisma";
import { PrismaClient } from "@/db/prisma/client";

//get latest products
export async function getLatestProducts() {
  const prisma2 = new PrismaClient();
  try {
    const data = await prisma2.product.findMany({
      orderBy: { createdAt: "desc" },
      take: LATEST_PRODUCTS_LIMIT, // Limit the number of products returned
    });
    return convertToPlainObject(data);
  } catch (error) {
    console.error("Error fetching latest products:", error);
    throw error;
  }
}

//get single product by slug
export async function getSingleProductBySlug(slug: string) {
  //const prisma = new PrismaClient();
  try {
    return await prisma.product.findFirst({
      where: { slug: slug },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

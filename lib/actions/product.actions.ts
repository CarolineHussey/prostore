"use server";
import { revalidatePath } from "next/cache";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { convertToPlainObject, formatError } from "../utils";
import { prisma } from "@/db/prisma";
import { insertProductSchema, updateProductSchema } from "../validators";
import z from "zod";
import { Prisma } from "@/db/prisma/client";

//get latest products
export async function getLatestProducts() {
  try {
    //returns a prisma object
    const data = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: LATEST_PRODUCTS_LIMIT, // Limit the number of products returned
    });
    //convert prisma object to plain object
    return convertToPlainObject(data);
  } catch (error) {
    console.error("Error fetching latest products:", error);
    throw error;
  }
}

//get single product by slug
export async function getSingleProductBySlug(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { slug: slug },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

//get single product by ID
/*export async function getSingleProductById(productId: string) {
  try {
    const data = await prisma.product.findFirst({
      where: { id: productId },
    });

    return convertToPlainObject(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}*/

// Get single product by ID
export async function getSingleProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

//get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? {
          category,
        }
      : {};
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "toprated"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//delete a product

export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });
    if (!productExists) throw new Error("Product not found");
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true, message: "Product was successfully deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });
    revalidatePath("/admin/products");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error("Producct not found");

    await prisma.product.update({ where: { id: product.id }, data: product });

    revalidatePath("/admin/products");
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//get all categoroes
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });
  return data;
}

//get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  return convertToPlainObject(data);
}

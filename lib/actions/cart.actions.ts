"use server";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import {
  convertToPlainObject,
  formatError,
  formatNumberWithDecimal,
  roundToTwoDecimalPlaces,
} from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/db/prisma/client";

//calculate cart prices
const calculatePrice = (items: CartItem[]) => {
  const itemsPrice = roundToTwoDecimalPlaces(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = roundToTwoDecimalPlaces(
      itemsPrice > 100 ? "0.00" : "10.00"
    ),
    taxPrice = roundToTwoDecimalPlaces(0.15 * itemsPrice),
    totalPrice = roundToTwoDecimalPlaces(itemsPrice + taxPrice + shippingPrice);
  return {
    itemsPrice: formatNumberWithDecimal(itemsPrice),
    shippingPrice: formatNumberWithDecimal(shippingPrice),
    taxPrice: formatNumberWithDecimal(taxPrice),
    totalPrice: formatNumberWithDecimal(totalPrice),
  };
};

//add item to cart
//get the user from the sessionCartID (stored in cookie), then get the item that triggered addItemToCart (by clicking on addItemToCart button). Look up the product in the db and if it exists, add it to the cart table.
export async function addItemToCart(data: CartItem) {
  try {
    //check for the session cart cookie (generated in auth.ts)
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("No cart session found");
    }

    //get session and userId if logged in
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //get Cart
    const cart = await getMyCart();

    //parse and validate data (CartItem from the form)
    const item = cartItemSchema.parse(data);

    //find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!cart) {
      //create new cart
      try {
        const newCart = insertCartSchema.parse({
          userId: userId,
          items: [item],
          sessionCartId: sessionCartId,
          itemsPrice: calculatePrice([item]).itemsPrice,
          shippingPrice: calculatePrice([item]).shippingPrice,
          taxPrice: calculatePrice([item]).taxPrice,
          totalPrice: calculatePrice([item]).totalPrice,
        });

        await prisma.cart.create({
          data: newCart,
        });

        //revalidate cache for /cart page
        revalidatePath(`/product/${product.slug}`);

        return { success: true, message: `${product.name} added to cart` };
      } catch (error) {
        console.error(error);
      }
    } else {
      //check if item is already in cart

      if ("items" in cart && Array.isArray(cart.items)) {
        const existItem = (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        );
        if (existItem) {
          // check there is enough stock to add more
          if (product.stock < existItem.qty + 1) {
            throw new Error("Not enough stock available");
          }

          //if item exists update qty in cart
          existItem.qty++;
        } else {
          //if item does not exist
          //check there is enough stock to add one
          if (product.stock < 1) {
            throw new Error("Not enough stock available");
          }
          //add item to cart
          cart.items.push(item);
        }
        //save to database
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calculatePrice(cart.items as CartItem[]),
          },
        });
        revalidatePath(`/product/${product.slug}`);
        return {
          success: true,
          message: `${product.name} ${
            existItem ? "updated in" : "added to"
          } cart`,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  try {
    //check for the session cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("No cart session found");
    }

    //get session and userId
    const session = await auth();
    const userId = session?.user?.id ? session.user.id : undefined;

    //get user cart from the db
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
    });

    if (!cart) return undefined;

    //if cart exists convert prisma object to plain object and return
    return convertToPlainObject({
      ...cart,
      items: cart.items as CartItem[],
      itemsPrice: cart.itemsPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
    });
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    //check for the session cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("No cart session found");
    }

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    const cart = await getMyCart();
    if (!cart) {
      throw new Error("No cart found");
    }

    if ("items" in cart && Array.isArray(cart.items)) {
      const items = (cart.items as CartItem[]).find(
        (x) => x.productId === productId
      );

      if (!items) {
        throw new Error("Item not found in cart");
      }
      if (items.qty === 1) {
        //remove item from cart
        cart.items = (cart.items as CartItem[]).filter(
          (x) => x.productId !== productId
        );
      } else {
        //decrease qty by 1
        items.qty--;
      }
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calculatePrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);
      return { success: true, message: `${product.name} removed from cart` };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

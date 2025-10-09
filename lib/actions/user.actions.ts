"use server";
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import z from "zod";

//sign in user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    //use zod to parse & validate the data
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    //sign in with credentials - returns action state for React actionState hook called in credentials-sign-in-form.tsx
    await signIn("credentials", user);
    return { success: true, message: "Sign in successful" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    //returns action atate
    return {
      success: false,
      message: "Sign in failed due to invalid credentials",
    };
  }
}

//sign out user
export async function signOutUser() {
  await signOut();
}

//sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    //use zod to parse & validate the data
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    //hash the password
    const hashedPassword = hashSync(user.password, 10);

    //create user in the db
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });

    //await signIn with the new user's credentials
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });
    return { success: true, message: "Sign up successful" };
  } catch (error) {
    /*
    console.log(error);
    console.log(error.name);
    console.log(error.code);
    console.log(error.errors);
    console.log(error.meta?.target);
*/
    if (isRedirectError(error)) {
      throw error;
    }
    //returns action atate
    return {
      success: false,
      message: formatError(error) || "Sign up failed",
    };
  }
}

//get user by id

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

//update user address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });
    return { success: true, message: "User address updated successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//update users payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });
    if (!currentUser) throw new Error("User not found");
    const paymentMethod = paymentMethodSchema.parse(data);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });
    return {
      success: true,
      message: "Payment method updated",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//update user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });
    if (!currentUser) throw new Error("User not found");
    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: { name: user.name },
    });
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

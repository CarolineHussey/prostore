"use server";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";

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

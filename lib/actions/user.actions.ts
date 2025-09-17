"use server";
import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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

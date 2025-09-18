import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();

  //if user is already signed in redirect to home page
  if (session) {
    return redirect(callbackUrl || "/");
  }

  //returns sign in form
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={100}
              height={100}
              priority={true}
            />
          </Link>
          <CardTitle className="text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information below to sign up for an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm></SignUpForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;

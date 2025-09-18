"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signUpDefaultValues } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUpUser } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  const [data, formAction] = useActionState(signUpUser, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button className="w-full" variant="default" disabled={pending}>
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="pb-2">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="Name"
            autoComplete="name"
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email" className="pb-2">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password" className="pb-2">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="password"
            defaultValue={signUpDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="pb-2">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="text"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            autoComplete="confirmPassword"
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>
        <div>
          <SignUpButton></SignUpButton>
        </div>
        {data && !data.success && (
          <div className="text-destructive text-center">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" target="_self" className="link">
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;

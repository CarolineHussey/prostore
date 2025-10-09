import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Unauthorised",
};

const UnauthorisedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/images/logo.svg"
        width={48}
        height={48}
        alt={`${APP_NAME} logo`}
        priority={true}
      />
      <div className="p-6 w-1/3 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Not Authorised</h1>
        <p className="text-destructive">
          You do not have permission to view this page
        </p>
        <Button variant="outline" className="mt-4 ml-2" asChild>
          <Link href={"/"}>Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
};

export default UnauthorisedPage;

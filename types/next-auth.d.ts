import { DefaultSession } from "next-auth";

//extends next auth to include the user role in the session
declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
    } & DefaultSession["user"]; //this flags that everything else in the session remains unchanged
  }
}

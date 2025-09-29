import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  callbacks: {
    //middleware & sessionId management
    //https://authjs.dev/getting-started/session-management/protecting-routes#middleware
    //authorized will be called every time a user visits the site (and any auth route)
    authorized({ request, auth }) {
      //check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        //set a session cart cookie if it doesn't exist
        const sessionCartId = crypto.randomUUID();
        //console.log(sessionCartId);

        //create new request headers object and response
        const newRequestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        //set the response cookies with the newly generated sessionCartId
        //title, value
        response.cookies.set("sessionCartId", sessionCartId);

        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

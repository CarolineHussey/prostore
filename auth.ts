import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      //credentials will come as an object from the sign-in form
      async authorize(credentials) {
        if (credentials == null) return null;

        const user = await prisma.user.findUnique({
          //where user.email matches credentials.email
          where: { email: credentials.email as string },
        });

        //if user exists and has a password
        if (user && user.password) {
          //compare the password from the form with the hashed password in the db
          const isValidPassword = compareSync(
            credentials.password as string,
            user.password
          );

          if (isValidPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }
        //if user not found or password is invalid return null
        return null;
      },
    }),
  ],
  callbacks: {
    //session callback
    async session({ session, user, trigger, token }: any) {
      //set the user ID from the JSON token (user is stored in the JSON sub property)
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      //console.log(token);

      //if username update is triggered set the user Name in the session to the one provided
      if (trigger === "update" && user) {
        session.user.name = user.name;
      }

      return session;
    },

    //jwt callbback
    async jwt({ session, user, trigger, token }: any) {
      //assign user fields to the token
      if (user) {
        token.role = user.role;

        //if user has no name then use the first part of the email
        if (user.name === "NO_NAME" && user.email) {
          token.name = user.email.split("@")[0];
          //update the name in the db
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },

    //middleware & sessionId management
    //https://authjs.dev/getting-started/session-management/protecting-routes#middleware
    //authorized will be called every time a user visits the site (and any auth route)
    authorized({ request, auth }: any) {
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
};

//signIn and signOut: server actions
//handlers: route.ts
export const { handlers, auth, signIn, signOut } = NextAuth(config);

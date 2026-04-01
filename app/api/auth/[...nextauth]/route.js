import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day = 86400 seconds
    updateAge: 0, // prevent silent session extension
  },
  jwt: {
    maxAge: 24 * 60 * 60, // match same expiry
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          // Fetch user by email from Convex
          const user = await fetchQuery(api.users.getUserByEmail, {
            email: credentials.email,
          });

          if (!user) return null;

          // Check role match
          if (user.role !== credentials.role) {
            console.warn("Role mismatch:", {
              selected: credentials.role,
              actual: user.role,
            });

            return null;
          }

          // Verify password
          const valid = await compare(credentials.password, user.password);
          if (!valid) return null;

          return {
            id: user._id,
            email: user.email,
            name: user.fullName,
            role: user.role,
          };
        } catch (err) {
          console.error("NextAuth authorize error:", err);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      // When user first logs in, attach expiry and user data
      if (user) {
        const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 day from now
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.email = user.email;
        token.realExp = exp;
      }

      // Expire token if time passed
      if (token.realExp && Date.now() / 1000 > token.realExp) {
        console.warn("JWT expired — clearing session");
        return {}; // clears session
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          id: token.id,
          name: token.name,
          role: token.role,
          email: token.email,
        };

        // Provide expiry timestamp to frontend
        session.realExpiry = new Date(token.realExp * 1000).toISOString();
      }

      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: "citycare.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/" },
    },
    csrfToken: {
      name: "citycare.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/" },
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
});

export { handler as GET, handler as POST };

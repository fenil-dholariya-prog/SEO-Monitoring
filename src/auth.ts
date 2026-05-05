import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { encryptToken } from "@/lib/auth/crypto";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            process.env.GOOGLE_OAUTH_SCOPES ||
            "openid email profile https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        await prisma.googleConnection.upsert({
          where: {
            userId_providerAccountId: {
              userId: user.id,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            encryptedAccessToken: encryptToken(account.access_token),
            encryptedRefreshToken: encryptToken(account.refresh_token),
            scopes: account.scope,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          },
          create: {
            userId: user.id,
            providerAccountId: account.providerAccountId,
            encryptedAccessToken: encryptToken(account.access_token),
            encryptedRefreshToken: encryptToken(account.refresh_token),
            scopes: account.scope,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

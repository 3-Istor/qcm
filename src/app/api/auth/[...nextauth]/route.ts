import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const baseAdapter = PrismaAdapter(prisma);

// Custom Adapter wrapper to sanitize non-standard Keycloak parameters
const customAdapter = {
  ...baseAdapter,
  linkAccount: async (account: Record<string, unknown>) => {
    const sanitizedAccount = { ...account };

    // Safely strip Keycloak-specific fields that violate the database schema
    delete sanitizedAccount["not-before-policy"];
    delete sanitizedAccount["refresh_expires_in"];

    if (baseAdapter.linkAccount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return baseAdapter.linkAccount(sanitizedAccount as any);
    }
  }
};

interface KeycloakProfile {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  groups?: string[];
}

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: customAdapter as any,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // 1. Capture the true database User.id (CUID) during the initial sign in
      if (user) {
        token.userId = user.id;
      }
      if (account) {
        token.idToken = account.id_token;
      }
      if (profile) {
        const p = profile as KeycloakProfile;
        token.given_name = p.given_name;
        token.family_name = p.family_name;
        token.groups = p.groups || [];
        token.picture = p.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken as string;
      if (session.user) {
        // 2. Map the true database CUID as the session user ID to preserve foreign keys
        session.user.id = token.userId as string;
        session.user.given_name = token.given_name as string;
        session.user.family_name = token.family_name as string;
        session.user.groups = (token.groups as string[]) || [];
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

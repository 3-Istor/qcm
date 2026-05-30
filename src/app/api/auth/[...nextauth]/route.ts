import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const prisma = new PrismaClient();

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
  adapter: PrismaAdapter(prisma),
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
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.idToken = account.id_token;
      }
      if (profile) {
        const p = profile as KeycloakProfile; // <-- Utilisation du type KeycloakProfile au lieu de "any"
        token.sub = p.sub;
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
        session.user.id = token.sub as string;
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

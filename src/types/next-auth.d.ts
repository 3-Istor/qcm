import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    idToken?: string;
    user: {
      id: string;
      given_name?: string;
      family_name?: string;
      groups?: string[];
    } & DefaultSession["user"];
  }
}

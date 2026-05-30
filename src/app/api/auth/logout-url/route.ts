import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!session || !session.idToken) {
    return NextResponse.json({ url: appUrl });
  }

  const issuer = process.env.KEYCLOAK_ISSUER!;
  const logoutUrl = new URL(`${issuer}/protocol/openid-connect/logout`);

  // Required parameters for Keycloak 18+ to seamlessly logout
  logoutUrl.searchParams.append("id_token_hint", session.idToken);
  logoutUrl.searchParams.append("post_logout_redirect_uri", appUrl);

  return NextResponse.json({ url: logoutUrl.toString() });
}

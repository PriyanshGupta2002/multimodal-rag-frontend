import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccessTokenExpiry } from "@/lib/access-token";

const ACCESS_TOKEN_COOKIE = "access_token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const expiresAt = token ? getAccessTokenExpiry(token) : null;
  const authenticated =
    expiresAt !== null && expiresAt > Math.floor(Date.now() / 1000);

  return NextResponse.json(
    { authenticated },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Session requests must come from this application." },
      { status: 403 },
    );
  }

  const payload: unknown = await request.json();

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("access_token" in payload) ||
    typeof payload.access_token !== "string"
  ) {
    return NextResponse.json(
      { message: "A valid access token is required." },
      { status: 400 },
    );
  }

  const expiresAt = getAccessTokenExpiry(payload.access_token);
  if (expiresAt === null) {
    return NextResponse.json(
      { message: "The access token is invalid or expired." },
      { status: 401 },
    );
  }

  const maxAge = expiresAt - Math.floor(Date.now() / 1000);
  if (maxAge <= 0) {
    return NextResponse.json(
      { message: "The access token is invalid or expired." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
    expires: new Date(expiresAt * 1000),
  });

  return response;
}

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Session requests must come from this application." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}

import { NextResponse } from "next/server";

export async function POST(request) {
  const referer = request.headers.get("referer");
  const url = new URL(referer || "/", request.url);
  const response = NextResponse.redirect(url, { status: 303 });

  response.cookies.set("loviant_age_verified", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

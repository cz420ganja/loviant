import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminCookieName,
  getAdminCookieOptions,
  isAdminConfigured,
} from "../../../lib/adminAuth";

function redirectToLogin(message) {
  const params = new URLSearchParams({ error: message });
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/admin/login?${params.toString()}`,
    },
  });
}

export async function POST(request) {
  if (!isAdminConfigured()) {
    return redirectToLogin("Admin password is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.");
  }

  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const expected = String(process.env.ADMIN_PASSWORD || "");
  const passwordBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  const valid =
    passwordBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(passwordBuffer, expectedBuffer);

  if (!valid) {
    return redirectToLogin("Wrong admin password.");
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/admin",
    },
  });

  response.cookies.set(getAdminCookieName(), createAdminSession(), getAdminCookieOptions());
  return response;
}

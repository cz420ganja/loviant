import { cookies } from "next/headers";
import crypto from "crypto";
import {
  createAdminSession,
  getAdminCookieName,
  getAdminCookieOptions,
  isAdminConfigured,
} from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!isAdminConfigured()) {
    return Response.json(
      { ok: false, message: "Admin password is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");
  const expected = String(process.env.ADMIN_PASSWORD || "");

  const passwordBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  const valid =
    passwordBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(passwordBuffer, expectedBuffer);

  if (!valid) {
    return Response.json({ ok: false, message: "Wrong admin password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), createAdminSession(), getAdminCookieOptions());

  return Response.json({ ok: true });
}

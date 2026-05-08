import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminSession } from "../../../../lib/adminAuth";
import { getAdminDashboardData } from "../../../../lib/adminData";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSession(session)) {
    return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const dashboard = await getAdminDashboardData();
  return Response.json(dashboard, { status: dashboard.ok ? 200 : 503 });
}

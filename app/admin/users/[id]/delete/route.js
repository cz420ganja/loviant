import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminSession } from "../../../../../lib/adminAuth";
import { createAdminClient, isSupabaseAdminConfigured } from "../../../../../lib/supabase/admin";

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSession(session)) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const form = await request.formData();
  const confirmation = String(form.get("confirmation") || "");

  if (confirmation !== "DELETE") {
    redirect(`/admin/users/${id}?error=${encodeURIComponent("Type DELETE exactly before removing an account.")}`);
  }

  if (!isSupabaseAdminConfigured()) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent("Supabase service role key is missing.")}`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin?success=${encodeURIComponent("Account removed.")}`);
}

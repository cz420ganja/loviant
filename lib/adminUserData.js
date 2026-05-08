import { createAdminClient, isSupabaseAdminConfigured } from "./supabase/admin";

export async function getAdminUserData(userId) {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      setupRequired: true,
      message: "Add SUPABASE_SERVICE_ROLE_KEY to read and manage users.",
      profile: null,
      authUser: null,
      ledger: [],
      jobs: [],
      payments: [],
    };
  }

  const supabase = createAdminClient();

  const [authResult, profileResult, ledgerResult, jobsResult, paymentsResult] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("profiles")
      .select("id, email, username, role, credits, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("credit_ledger")
      .select("id, amount, balance_after, reason, source, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("generation_jobs")
      .select("id, type, status, companion_id, prompt, source_image_path, output_url, credits_reserved, credits_spent, runpod_job_id, error_message, cost_estimate_usd, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("payments")
      .select("id, provider, status, amount_usd, credits, currency, tx_hash, checkout_session_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const firstError = [authResult, profileResult, ledgerResult, jobsResult, paymentsResult].find((result) => result.error)?.error;

  if (firstError) {
    return {
      ok: false,
      setupRequired: false,
      message: firstError.message,
      profile: null,
      authUser: null,
      ledger: [],
      jobs: [],
      payments: [],
    };
  }

  const authUser = authResult.data?.user || null;
  const profile = profileResult.data || {
    id: userId,
    email: authUser?.email || "",
    username: authUser?.user_metadata?.username || "",
    role: "user",
    credits: 0,
    created_at: authUser?.created_at,
    updated_at: authUser?.updated_at,
  };

  return {
    ok: true,
    setupRequired: false,
    message: "",
    profile,
    authUser,
    ledger: ledgerResult.data || [],
    jobs: jobsResult.data || [],
    payments: paymentsResult.data || [],
  };
}

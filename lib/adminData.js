import { createAdminClient, isSupabaseAdminConfigured } from "./supabase/admin";

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function todayIsoStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export async function getAdminDashboardData() {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      setupRequired: true,
      message: "Add SUPABASE_SERVICE_ROLE_KEY to read admin-wide Supabase data.",
      stats: {
        users: 0,
        creditsIssued: 0,
        creditsSpent: 0,
        pendingJobs: 0,
        failedJobs: 0,
        dailySpendLimitUsd: 25,
        estimatedSpendTodayUsd: 0,
      },
      recentJobs: [],
      recentPayments: [],
      recentLedger: [],
      recentUsers: [],
    };
  }

  const supabase = createAdminClient();

  const [
    profilesResult,
    ledgerResult,
    pendingJobsResult,
    failedJobsResult,
    todaySpendResult,
    settingsResult,
    recentJobsResult,
    recentPaymentsResult,
    recentLedgerResult,
    recentUsersResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("credit_ledger").select("amount, reason"),
    supabase.from("generation_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    supabase.from("generation_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
    supabase.from("generation_jobs").select("cost_estimate_usd").gte("created_at", todayIsoStart()),
    supabase.from("admin_settings").select("key, value").in("key", ["runpod_enabled", "daily_spend_limit_usd"]),
    supabase
      .from("generation_jobs")
      .select("id, user_id, type, status, companion_id, credits_reserved, credits_spent, cost_estimate_usd, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("payments")
      .select("id, user_id, provider, status, amount_usd, credits, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("credit_ledger")
      .select("id, user_id, amount, reason, source, note, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id, email, username, credits, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const firstError = [
    profilesResult,
    ledgerResult,
    pendingJobsResult,
    failedJobsResult,
    todaySpendResult,
    settingsResult,
    recentJobsResult,
    recentPaymentsResult,
    recentLedgerResult,
    recentUsersResult,
  ].find((result) => result.error)?.error;

  if (firstError) {
    return {
      ok: false,
      setupRequired: true,
      message: firstError.message,
      stats: {
        users: 0,
        creditsIssued: 0,
        creditsSpent: 0,
        pendingJobs: 0,
        failedJobs: 0,
        dailySpendLimitUsd: 25,
        estimatedSpendTodayUsd: 0,
      },
      recentJobs: [],
      recentPayments: [],
      recentLedger: [],
      recentUsers: [],
    };
  }

  const ledger = ledgerResult.data || [];
  const issued = sum(ledger.filter((row) => row.amount > 0), "amount");
  const spent = Math.abs(sum(ledger.filter((row) => row.amount < 0), "amount"));
  const settings = Object.fromEntries((settingsResult.data || []).map((row) => [row.key, row.value]));

  return {
    ok: true,
    setupRequired: false,
    message: "",
    stats: {
      users: profilesResult.count || 0,
      creditsIssued: issued,
      creditsSpent: spent,
      pendingJobs: pendingJobsResult.count || 0,
      failedJobs: failedJobsResult.count || 0,
      runpodEnabled: Boolean(settings.runpod_enabled ?? false),
      dailySpendLimitUsd: Number(settings.daily_spend_limit_usd ?? 25),
      estimatedSpendTodayUsd: sum(todaySpendResult.data || [], "cost_estimate_usd"),
    },
    recentJobs: recentJobsResult.data || [],
    recentPayments: recentPaymentsResult.data || [],
    recentLedger: recentLedgerResult.data || [],
    recentUsers: recentUsersResult.data || [],
  };
}

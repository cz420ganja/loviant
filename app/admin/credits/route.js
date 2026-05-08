import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "../../../lib/adminAuth";
import { createAdminClient, isSupabaseAdminConfigured } from "../../../lib/supabase/admin";

function redirectToAdmin(type, message) {
  const params = new URLSearchParams({ [type]: message });
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/admin?${params.toString()}`,
    },
  });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSession(session)) {
    return redirectToAdmin("error", "Admin session expired. Sign in again.");
  }

  if (!isSupabaseAdminConfigured()) {
    return redirectToAdmin("error", "SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  const formData = await request.formData();
  const userLookup = String(formData.get("userLookup") || "").trim();
  const action = String(formData.get("action") || "add");
  const rawAmount = Number(formData.get("amount"));
  const note = String(formData.get("note") || "").trim();

  if (!userLookup || !Number.isInteger(rawAmount) || rawAmount <= 0) {
    return redirectToAdmin("error", "Enter a user email/ID and a whole credit amount above 0.");
  }

  if (action !== "add" && action !== "remove") {
    return redirectToAdmin("error", "Choose add or remove.");
  }

  const supabase = createAdminClient();
  const lookupColumn = userLookup.includes("@") ? "email" : "id";
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, username, credits")
    .eq(lookupColumn, userLookup)
    .maybeSingle();

  if (profileError) {
    return redirectToAdmin("error", profileError.message);
  }

  if (!profile) {
    return redirectToAdmin("error", "No user found for that email or user ID.");
  }

  const adjustment = action === "add" ? rawAmount : -rawAmount;
  const nextBalance = Number(profile.credits || 0) + adjustment;

  if (nextBalance < 0) {
    return redirectToAdmin("error", `Cannot remove ${rawAmount} credits. User only has ${profile.credits}.`);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits: nextBalance })
    .eq("id", profile.id);

  if (updateError) {
    return redirectToAdmin("error", updateError.message);
  }

  const { error: ledgerError } = await supabase.from("credit_ledger").insert({
    user_id: profile.id,
    amount: adjustment,
    balance_after: nextBalance,
    reason: "admin_adjustment",
    source: "admin",
    note: note || `${action === "add" ? "Added" : "Removed"} ${rawAmount} credits from admin panel`,
    metadata: {
      admin_action: action,
      user_lookup: userLookup,
    },
  });

  if (ledgerError) {
    await supabase.from("profiles").update({ credits: profile.credits }).eq("id", profile.id);
    return redirectToAdmin("error", `Ledger failed, balance reverted. ${ledgerError.message}`);
  }

  return redirectToAdmin(
    "success",
    `${action === "add" ? "Added" : "Removed"} ${rawAmount} credits for ${profile.email || profile.username}. New balance: ${nextBalance}.`
  );
}

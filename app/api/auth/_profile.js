export async function ensureProfile(supabase, user) {
  const username = user.user_metadata?.username || user.email?.split("@")[0] || "user";

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, username, email, role, credits")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Could not read profile. Run supabase/schema.sql in Supabase SQL Editor first. ${selectError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data: profile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      username,
      credits: 3,
    })
    .select("id, username, email, role, credits")
    .single();

  if (insertError) {
    throw new Error(`Could not create profile. Check profiles table and RLS policies. ${insertError.message}`);
  }

  return profile;
}

import { createClient } from "../../../../lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ ok: false, message: "Not signed in." }, { status: 401 });
  }

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "user";

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, username, email, role, credits")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    return Response.json(
      {
        ok: false,
        message: "Could not read profile. Run supabase/schema.sql in Supabase SQL Editor first.",
        detail: selectError.message,
      },
      { status: 500 }
    );
  }

  if (existing) {
    return Response.json({ ok: true, profile: existing });
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
    return Response.json(
      {
        ok: false,
        message: "Could not create profile. Check profiles table and RLS policies.",
        detail: insertError.message,
      },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, profile });
}

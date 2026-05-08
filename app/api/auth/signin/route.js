import { createClient } from "../../../../lib/supabase/server";
import { ensureProfile } from "../_profile";

export async function POST(request) {
  const { login, password } = await request.json();

  if (!login?.trim() || !password) {
    return Response.json({ ok: false, message: "Email and password are required." }, { status: 400 });
  }

  if (!login.includes("@")) {
    return Response.json(
      { ok: false, message: "Username login is not wired yet. Please sign in with your email for now." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: login.trim().toLowerCase(),
    password,
  });

  if (error) {
    return Response.json({ ok: false, message: error.message }, { status: 400 });
  }

  try {
    const profile = await ensureProfile(supabase, data.user);
    return Response.json({ ok: true, profile });
  } catch (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
}

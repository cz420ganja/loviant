import { createClient } from "../../../../lib/supabase/server";
import { ensureProfile } from "../_profile";

export async function POST(request) {
  const { username, email, password } = await request.json().catch(() => ({}));

  if (!username?.trim() || !email?.trim() || !password) {
    return Response.json({ ok: false, message: "Username, email, and password are required." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 });
    }

    if (data?.user?.identities?.length === 0) {
      return Response.json({ ok: false, message: "This email is already registered. Try signing in instead." }, { status: 409 });
    }

    let user = data.user;

    if (!data.session) {
      const signInResult = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInResult.error) {
        return Response.json(
          {
            ok: false,
            message:
              "Supabase created the account, but did not start a session. Please sign in with this email and password.",
            detail: signInResult.error.message,
          },
          { status: 400 }
        );
      }

      user = signInResult.data.user;
    }

    const profile = await ensureProfile(supabase, user);
    return Response.json({ ok: true, profile });
  } catch (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
}

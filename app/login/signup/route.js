import { NextResponse } from "next/server";
import { ensureProfile } from "../../api/auth/_profile";
import { createRouteClient } from "../../../lib/supabase/route";

function loginRedirect(request, mode, message) {
  const params = new URLSearchParams({ mode, error: message });
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/login?${params.toString()}`,
    },
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!username || !email || !password) {
    return loginRedirect(request, "signup", "Username, email, and password are required.");
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/",
    },
  });
  const supabase = createRouteClient(request, response);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return loginRedirect(request, "signup", error.message);
  }

  if (data?.user?.identities?.length === 0) {
    return loginRedirect(request, "signin", "This email is already registered. Try signing in instead.");
  }

  let user = data.user;

  if (!data.session) {
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      return loginRedirect(request, "signup", signInResult.error.message);
    }

    user = signInResult.data.user;
  }

  try {
    await ensureProfile(supabase, user);
  } catch (error) {
    return loginRedirect(request, "signup", error.message || "Account created, but could not create your profile.");
  }

  return response;
}

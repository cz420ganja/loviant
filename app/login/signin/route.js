import { NextResponse } from "next/server";
import { ensureProfile } from "../../api/auth/_profile";
import { createRouteClient } from "../../../lib/supabase/route";

function loginRedirect(request, message) {
  const params = new URLSearchParams({ mode: "signin", error: message });
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/login?${params.toString()}`,
    },
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const login = String(formData.get("login") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!login || !password) {
    return loginRedirect(request, "Email and password are required.");
  }

  if (!login.includes("@")) {
    return loginRedirect(request, "Username login is not wired yet. Please sign in with your email for now.");
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/",
    },
  });
  const supabase = createRouteClient(request, response);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: login,
    password,
  });

  if (error) {
    return loginRedirect(request, error.message);
  }

  try {
    await ensureProfile(supabase, data.user);
  } catch (error) {
    return loginRedirect(request, error.message || "Signed in, but could not create your profile.");
  }

  return response;
}

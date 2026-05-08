import { NextResponse } from "next/server";
import { createRouteClient } from "../../../lib/supabase/route";

export async function POST(request) {
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/",
    },
  });

  const supabase = createRouteClient(request, response);
  await supabase.auth.signOut();

  return response;
}

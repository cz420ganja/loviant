export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  return Response.json({
    ok: false,
    status: "not_configured",
    message: "RunPod backend route is ready for auth, credit checks, rate limits, and RUNPOD_API_KEY integration.",
    received: body,
  }, { status: 501 });
}

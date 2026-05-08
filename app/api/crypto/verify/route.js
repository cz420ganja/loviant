export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  return Response.json({
    ok: false,
    status: "not_configured",
    message: "Crypto verification route is ready for Base USDC tx hash verification and crediting.",
    received: body,
  }, { status: 501 });
}

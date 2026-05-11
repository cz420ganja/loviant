import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient, isSupabaseAdminConfigured } from "../../../../lib/supabase/admin";
import { buildZImageTurboPrompt } from "../../../../lib/workflows/zImageTurbo";

function buildCompanionPrompt(body) {
  const parts = [
    "realistic 9:16 portrait photo of an attractive adult woman",
    "natural skin texture, detailed eyes, realistic hair, high quality",
    body.name ? `character name ${body.name}` : "",
    body.ethnicity ? `${body.ethnicity} background` : "",
    body.style ? `${body.style} style` : "",
    body.ageRange ? `adult age range ${body.ageRange}` : "adult 18+",
    body.scene ? `${body.scene} scene` : "",
    body.outfit ? `${body.outfit}` : "",
    body.position ? `${body.position}` : "",
    body.details ? body.details : "",
  ];

  return parts.filter(Boolean).join(", ");
}

function extractImageUrl(output) {
  if (!output) return "";
  if (typeof output === "string") {
    if (output.startsWith("http") || output.startsWith("data:image")) return output;
    return "";
  }

  const direct = output.image_url || output.imageUrl || output.url || output.output_url;
  if (direct) return direct;

  const images = output.images || output.image || output.result;
  if (Array.isArray(images)) {
    for (const item of images) {
      const url = extractImageUrl(item);
      if (url) return url;
      if (item?.data) return item.data.startsWith("data:image") ? item.data : `data:image/png;base64,${item.data}`;
      if (item?.base64) return item.base64.startsWith("data:image") ? item.base64 : `data:image/png;base64,${item.base64}`;
    }
  }

  if (output.data) return output.data.startsWith("data:image") ? output.data : `data:image/png;base64,${output.data}`;
  if (output.base64) return output.base64.startsWith("data:image") ? output.base64 : `data:image/png;base64,${output.base64}`;

  return "";
}

async function callRunPod(workflow) {
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_IMAGE_ENDPOINT_ID;

  if (!apiKey || !endpointId) {
    return {
      ok: false,
      status: 501,
      body: {
        ok: false,
        status: "not_configured",
        message: "Add RUNPOD_API_KEY and RUNPOD_IMAGE_ENDPOINT_ID to .env.local and Vercel env vars.",
      },
    };
  }

  const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/runsync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        workflow,
        prompt: workflow,
      },
    }),
    signal: AbortSignal.timeout(Number(process.env.RUNPOD_SYNC_TIMEOUT_MS || 120000)),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body: {
        ok: false,
        status: "runpod_error",
        message: data?.error || data?.message || "RunPod request failed.",
        runpod: data,
      },
    };
  }

  return { ok: true, status: 200, body: data };
}

async function refundCredit(admin, profile, jobId, reason) {
  const nextBalance = Number(profile.credits || 0) + 1;
  await admin.from("profiles").update({ credits: nextBalance }).eq("id", profile.id);
  await admin.from("credit_ledger").insert({
    user_id: profile.id,
    amount: 1,
    balance_after: nextBalance,
    reason: "refund",
    source: "runpod",
    reference_id: jobId,
    note: reason,
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult?.user;

  if (!user) {
    return Response.json({ ok: false, message: "Please sign in before generating." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ ok: false, message: "SUPABASE_SERVICE_ROLE_KEY is required for credit spending." }, { status: 501 });
  }

  const admin = createAdminClient();
  const profileResult = await admin
    .from("profiles")
    .select("id, email, username, credits")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return Response.json({ ok: false, message: profileResult.error?.message || "Profile not found." }, { status: 400 });
  }

  const profile = profileResult.data;
  const creditCost = 1;
  if (Number(profile.credits || 0) < creditCost) {
    return Response.json({ ok: false, message: "You need at least 1 credit to generate." }, { status: 402 });
  }

  const nextBalance = Number(profile.credits) - creditCost;
  const prompt = buildCompanionPrompt(body);
  const workflow = buildZImageTurboPrompt({ prompt, width: 768, height: 1344 });

  const jobResult = await admin
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      type: "image",
      status: "running",
      prompt,
      credits_reserved: creditCost,
      metadata: { workflow: "z-image-turbo", form: body },
    })
    .select("id")
    .single();

  if (jobResult.error) {
    return Response.json({ ok: false, message: jobResult.error.message }, { status: 500 });
  }

  const jobId = jobResult.data.id;

  await admin.from("profiles").update({ credits: nextBalance }).eq("id", user.id);
  await admin.from("credit_ledger").insert({
    user_id: user.id,
    amount: -creditCost,
    balance_after: nextBalance,
    reason: "generation_spend",
    source: "runpod",
    reference_id: jobId,
    note: "Z-Image Turbo companion generation",
  });

  try {
    const runpod = await callRunPod(workflow);
    if (!runpod.ok) {
      await refundCredit(admin, { ...profile, credits: nextBalance }, jobId, runpod.body.message);
      await admin
        .from("generation_jobs")
        .update({ status: "failed", error_message: runpod.body.message, completed_at: new Date().toISOString() })
        .eq("id", jobId);
      return Response.json(runpod.body, { status: runpod.status });
    }

    const imageUrl = extractImageUrl(runpod.body?.output || runpod.body);
    await admin
      .from("generation_jobs")
      .update({
        status: "succeeded",
        output_url: imageUrl || null,
        runpod_job_id: runpod.body?.id || null,
        credits_reserved: 0,
        credits_spent: creditCost,
        completed_at: new Date().toISOString(),
        metadata: { workflow: "z-image-turbo", form: body, runpod: runpod.body },
      })
      .eq("id", jobId);

    return Response.json({
      ok: true,
      jobId,
      imageUrl,
      credits: nextBalance,
      message: imageUrl ? "Image generated." : "RunPod finished, but no image URL was found in the response.",
      runpod: runpod.body,
    });
  } catch (error) {
    await refundCredit(admin, { ...profile, credits: nextBalance }, jobId, error.message);
    await admin
      .from("generation_jobs")
      .update({ status: "failed", error_message: error.message, completed_at: new Date().toISOString() })
      .eq("id", jobId);
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
}

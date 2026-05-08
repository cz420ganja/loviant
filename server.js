const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 8080;
const runpodPodUrl =
  process.env.RUNPOD_POD_URL || "https://ruffvhu5z9xle8-8188.proxy.runpod.net";
let companions = [];
let usdcRateCache = {
  rate: 1,
  updatedAt: 0,
};

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function buildComfyWorkflow(prompt) {
  return {
    "3": {
      class_type: "CheckpointLoaderSimple",
      inputs: {
        ckpt_name: "cyberrealisticXL_v100.safetensors",
      },
    },
    "4": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["3", 1],
        text: prompt,
      },
    },
    "5": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["3", 1],
        text:
          "low quality, blurry, distorted face, bad anatomy, extra fingers, extra limbs, deformed hands, watermark, text, logo, cropped, duplicate person",
      },
    },
    "6": {
      class_type: "EmptyLatentImage",
      inputs: {
        width: 768,
        height: 1344,
        batch_size: 1,
      },
    },
    "7": {
      class_type: "KSampler",
      inputs: {
        model: ["3", 0],
        positive: ["4", 0],
        negative: ["5", 0],
        latent_image: ["6", 0],
        seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        steps: 25,
        cfg: 7,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise: 1,
      },
    },
    "8": {
      class_type: "VAEDecode",
      inputs: {
        samples: ["7", 0],
        vae: ["3", 2],
      },
    },
    "9": {
      class_type: "SaveImage",
      inputs: {
        filename_prefix: "loviant_companion",
        images: ["8", 0],
      },
    },
  };
}

function toComfyImageUrl(podUrl, image) {
  const params = new URLSearchParams({
    filename: image.filename,
    subfolder: image.subfolder || "",
    type: image.type || "output",
  });

  return `${podUrl.replace(/\/$/, "")}/view?${params.toString()}`;
}

async function generateComfyImage({ prompt }) {
  const podUrl = runpodPodUrl.replace(/\/$/, "");
  const workflow = buildComfyWorkflow(prompt);
  const promptResponse = await fetch(`${podUrl}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: "loviant-local-test",
      prompt: workflow,
    }),
  });

  if (!promptResponse.ok) {
    throw new Error(`ComfyUI prompt failed with ${promptResponse.status}`);
  }

  const promptData = await promptResponse.json();
  const promptId = promptData.prompt_id;

  if (!promptId) {
    throw new Error("ComfyUI did not return a prompt_id");
  }

  for (let attempt = 0; attempt < 90; attempt += 1) {
    await wait(2000);

    const historyResponse = await fetch(`${podUrl}/history/${promptId}`);

    if (!historyResponse.ok) {
      continue;
    }

    const history = await historyResponse.json();
    const result = history[promptId];
    const outputs = result?.outputs || {};

    for (const output of Object.values(outputs)) {
      if (output.images?.length) {
        return {
          prompt_id: promptId,
          image_url: toComfyImageUrl(podUrl, output.images[0]),
        };
      }
    }
  }

  throw new Error("Timed out waiting for ComfyUI image output");
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/runpod/companion-image")) {
    if (request.method !== "POST") {
      response.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    readJsonBody(request)
      .then((payload) => {
        return generateComfyImage({
          prompt: payload.prompt || "",
          workflow: payload.workflow || {},
        });
      })
      .then((data) => {
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify(data));
      })
      .catch((error) => {
        response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        response.end(
          JSON.stringify({
            status: "error",
            message: "Could not reach RunPod pod for companion image generation.",
            detail: error.message,
          })
        );
      });

    return;
  }

  if (request.url.startsWith("/api/usdc-rate")) {
    const cacheAge = Date.now() - usdcRateCache.updatedAt;

    if (cacheAge < 30000 && usdcRateCache.updatedAt) {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify(usdcRateCache));
      return;
    }

    fetch("https://api.coinbase.com/v2/exchange-rates?currency=USDC")
      .then((coinbaseResponse) => coinbaseResponse.json())
      .then((data) => {
        const rate = Number(data?.data?.rates?.USD);

        if (!Number.isFinite(rate) || rate <= 0) {
          throw new Error("Invalid USDC rate");
        }

        usdcRateCache = {
          rate,
          updatedAt: Date.now(),
        };

        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify(usdcRateCache));
      })
      .catch(() => {
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        response.end(
          JSON.stringify({
            ...usdcRateCache,
            fallback: true,
          })
        );
      });

    return;
  }

  if (request.url.startsWith("/api/companions")) {
    const companionDeleteMatch = request.url.match(/^\/api\/companions\/([^/?]+)/);

    if (companionDeleteMatch && request.method === "DELETE") {
      const id = decodeURIComponent(companionDeleteMatch[1]);
      companions = companions.filter((companion) => companion.id !== id);
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.method === "GET") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ companions }));
      return;
    }

    if (request.method === "POST") {
      let body = "";

      request.on("data", (chunk) => {
        body += chunk;
      });

      request.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const companion = {
            id: Date.now().toString(),
            name: payload.name || "Custom Companion",
            ethnicity: payload.ethnicity || "",
            style: payload.style || "Realistic",
            ageRange: payload.ageRange || "",
            scene: payload.scene || "",
            outfit: payload.outfit || "",
            position: payload.position || "",
            details: payload.details || "",
            imageUrl: payload.imageUrl || "",
            imageBase64: payload.imageBase64 || "",
            createdAt: new Date().toISOString(),
          };

          companions.push(companion);
          response.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ companion }));
        } catch {
          response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });

      return;
    }

    response.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const pathname = request.url.split("?")[0];
  const urlPath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const cleanPath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, cleanPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(content);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Velora AI is running at http://127.0.0.1:${port}`);
});

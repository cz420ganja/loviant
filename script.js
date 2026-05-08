const generateButton = document.querySelector("#generateButton");
const previewBox = document.querySelector("#previewBox");
const promptInput = document.querySelector("#prompt");
const videoButton = document.querySelector("#videoButton");
const videoPrompt = document.querySelector("#videoPrompt");
const videoPreview = document.querySelector("#videoPreview");
const createCompanionForm = document.querySelector("#createCompanionForm");
const companionTemplate = document.querySelector("#companionTemplate");
const companionName = document.querySelector("#companionName");
const companionEthnicity = document.querySelector("#companionEthnicity");
const companionStyle = document.querySelector("#companionStyle");
const companionAgeRange = document.querySelector("#companionAgeRange");
const companionScene = document.querySelector("#companionScene");
const companionOutfit = document.querySelector("#companionOutfit");
const companionPosition = document.querySelector("#companionPosition");
const companionDetails = document.querySelector("#companionDetails");
const createCompanionStatus = document.querySelector("#createCompanionStatus");
const videoCompanionSelect = document.querySelector("#videoCompanionSelect");
const generatedCompanionPhoto = document.querySelector("#generatedCompanionPhoto");
const previewCompanionName = document.querySelector("#previewCompanionName");
const previewCompanionDetails = document.querySelector("#previewCompanionDetails");
const previewCompanionTags = document.querySelector("#previewCompanionTags");
const videoRedirectButton = document.querySelector("#videoRedirectButton");
const savedCompanionGrid = document.querySelector("#savedCompanionGrid");
const imageCompanionSelect = document.querySelector("#imageCompanionSelect");
const imageUpload = document.querySelector("#imageUpload");
const imageEditPrompt = document.querySelector("#imageEditPrompt");
const imageCanvas = document.querySelector("#imageCanvas");
const emptyCanvas = document.querySelector("#emptyCanvas");
const brightnessRange = document.querySelector("#brightnessRange");
const contrastRange = document.querySelector("#contrastRange");
const saturationRange = document.querySelector("#saturationRange");
const warmthRange = document.querySelector("#warmthRange");
const resetImageButton = document.querySelector("#resetImageButton");
const saveImageButton = document.querySelector("#saveImageButton");
const savedImageGrid = document.querySelector("#savedImageGrid");
const checkoutOverlay = document.querySelector("#checkoutOverlay");
const checkoutClose = document.querySelector("#checkoutClose");
const checkoutButtons = document.querySelectorAll(".checkout-button");
const checkoutPack = document.querySelector("#checkoutPack");
const checkoutPrice = document.querySelector("#checkoutPrice");
const checkoutCredits = document.querySelector("#checkoutCredits");
const checkoutUsdc = document.querySelector("#checkoutUsdc");
const checkoutRate = document.querySelector("#checkoutRate");
const cardTab = document.querySelector("#cardTab");
const cryptoTab = document.querySelector("#cryptoTab");
const cardPanel = document.querySelector("#cardPanel");
const cryptoPanel = document.querySelector("#cryptoPanel");
const signInTab = document.querySelector("#signInTab");
const signUpTab = document.querySelector("#signUpTab");
const signInForm = document.querySelector("#signInForm");
const signUpForm = document.querySelector("#signUpForm");

function setupAgeGate() {
  const ageGateKey = "loviantAgeGateAccepted";

  if (localStorage.getItem(ageGateKey) === "true") return;

  document.body.classList.add("age-gate-locked");

  const overlay = document.createElement("div");
  overlay.className = "age-gate-overlay is-visible";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "ageGateTitle");
  overlay.innerHTML = `
    <section class="age-gate-modal">
      <p class="eyebrow">Age restricted</p>
      <h2 id="ageGateTitle">This site is for 18+ users only.</h2>
      <p>By entering, you confirm that you are at least 18 years old and are allowed to view this type of AI companion content in your location.</p>
      <div class="age-gate-actions">
        <button class="secondary-action" id="ageGateLeave" type="button">Leave</button>
        <button class="generate-button" id="ageGateAccept" type="button">I am 18+</button>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("#ageGateAccept")?.addEventListener("click", () => {
    localStorage.setItem(ageGateKey, "true");
    document.body.classList.remove("age-gate-locked");
    overlay.remove();
  });

  overlay.querySelector("#ageGateLeave")?.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}

setupAgeGate();

function showAuthPanel(mode) {
  const signingUp = mode === "signup";

  signInTab?.classList.toggle("is-active", !signingUp);
  signUpTab?.classList.toggle("is-active", signingUp);
  signInForm?.classList.toggle("is-active", !signingUp);
  signUpForm?.classList.toggle("is-active", signingUp);
}

signInTab?.addEventListener("click", () => showAuthPanel("signin"));
signUpTab?.addEventListener("click", () => showAuthPanel("signup"));

function getSiteDepthPrefix() {
  const path = window.location.pathname.replace(/\\/g, "/");
  const folderMatch = path.match(/\/([^/]+)\/index\.html$/);
  return folderMatch ? "../" : "";
}

function getAssetPath(relativePath) {
  if (/^https?:|^data:|^\//.test(relativePath)) return relativePath;
  return `${getSiteDepthPrefix()}${relativePath}`;
}

function getPagePath(relativePath, companionId) {
  const url = `${getSiteDepthPrefix()}${relativePath}`;
  return companionId ? `${url}?companion=${encodeURIComponent(companionId)}` : url;
}

const imageStorageKey = "loviantEditedImages";
let currentEditorImage = null;
let activeCheckoutPrice = 0;
let usdcRateTimer = null;

function getSavedImages() {
  try {
    return JSON.parse(localStorage.getItem(imageStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveEditedImage(dataUrl, prompt) {
  const images = getSavedImages();
  images.unshift({ id: Date.now().toString(), dataUrl, prompt });
  localStorage.setItem(imageStorageKey, JSON.stringify(images.slice(0, 12)));
}

function deleteEditedImage(id) {
  const images = getSavedImages().filter((image) => image.id !== id);
  localStorage.setItem(imageStorageKey, JSON.stringify(images));
}

function drawEditorImage() {
  if (!imageCanvas || !currentEditorImage) return;

  const context = imageCanvas.getContext("2d");
  const brightness = brightnessRange?.value || 100;
  const contrast = contrastRange?.value || 100;
  const saturation = saturationRange?.value || 100;
  const warmth = Number(warmthRange?.value || 0);
  const canvasRatio = imageCanvas.width / imageCanvas.height;
  const imageRatio = currentEditorImage.width / currentEditorImage.height;
  let sourceWidth = currentEditorImage.width;
  let sourceHeight = currentEditorImage.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = sourceHeight * canvasRatio;
    sourceX = (currentEditorImage.width - sourceWidth) / 2;
  } else {
    sourceHeight = sourceWidth / canvasRatio;
    sourceY = (currentEditorImage.height - sourceHeight) / 2;
  }

  context.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  context.drawImage(
    currentEditorImage,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );

  if (warmth > 0) {
    context.filter = "none";
    context.fillStyle = `rgba(255, 121, 80, ${warmth / 300})`;
    context.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
  }
}

function loadEditorImage(src) {
  if (!imageCanvas || !emptyCanvas || !src) return;

  const image = new Image();
  image.addEventListener("load", () => {
    currentEditorImage = image;
    emptyCanvas.style.display = "none";
    drawEditorImage();
  });
  image.src = src;
}

function renderSavedImages() {
  if (!savedImageGrid) return;
  const savedImages = getSavedImages();
  savedImageGrid.innerHTML = "";

  if (!savedImages.length) {
    const empty = document.createElement("p");
    empty.className = "muted-note";
    empty.textContent = "Saved edits will appear here.";
    savedImageGrid.appendChild(empty);
    return;
  }

  savedImages.forEach((image) => {
    const card = document.createElement("article");
    card.className = "saved-image-card";

    const img = document.createElement("img");
    img.src = image.dataUrl;
    img.alt = "Saved edited companion";

    card.appendChild(img);

    if (image.prompt) {
      const prompt = document.createElement("p");
      prompt.textContent = image.prompt;
      card.appendChild(prompt);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-edit-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete edit";
    deleteButton.addEventListener("click", () => {
      deleteEditedImage(image.id);
      renderSavedImages();
    });

    card.appendChild(deleteButton);
    savedImageGrid.appendChild(card);
  });
}

if (generateButton && previewBox && promptInput) {
  generateButton.addEventListener("click", () => {
    const prompt = promptInput.value.trim();

    previewBox.classList.add("is-active");
    previewBox.textContent = prompt
      ? "Companion preview queued: " + prompt.slice(0, 90)
      : "Companion preview queued. Connect RunPod here when the backend is ready.";
  });
}

if (videoButton && videoPrompt && videoPreview) {
  videoButton.addEventListener("click", () => {
    const prompt = videoPrompt.value.trim();

    videoPreview.classList.add("is-active");
    videoPreview.textContent = prompt
      ? "Video queued: " + prompt.slice(0, 100)
      : "Video queued. Connect RunPod here when the backend is ready.";
  });
}

async function createCloudCompanion(payload) {
  const response = await fetch("/api/companions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not save companion");
  }

  const data = await response.json();
  return data.companion;
}

async function getCloudCompanions() {
  const response = await fetch("/api/companions");

  if (!response.ok) {
    throw new Error("Could not load companions");
  }

  const data = await response.json();
  return data.companions || [];
}

function normalizeEthnicity(value) {
  const ethnicity = value.trim();
  const lower = ethnicity.toLowerCase();

  if (["white", "caucasian", "european"].includes(lower)) {
    return "white/Caucasian ethnicity, fair skin";
  }

  if (["black", "african", "african american"].includes(lower)) {
    return "Black/African ethnicity";
  }

  if (["latina", "latino", "hispanic"].includes(lower)) {
    return "Latina/Hispanic ethnicity";
  }

  if (["asian", "east asian"].includes(lower)) {
    return "East Asian ethnicity";
  }

  if (["arab", "middle eastern"].includes(lower)) {
    return "Arab/Middle Eastern ethnicity";
  }

  return ethnicity;
}

function buildCompanionPrompt(companion) {
  const ethnicity = companion.ethnicity ? normalizeEthnicity(companion.ethnicity) : "";

  return [
    "Create a high-quality 9:16 realistic AI dating companion portrait of one adult woman.",
    `Pose/position must be: ${companion.position}.`,
    ethnicity ? `The subject must have ${ethnicity}.` : "",
    `Name: ${companion.name}.`,
    `Visual style: ${companion.style}.`,
    `Age range: ${companion.ageRange}.`,
    `Scene/background: ${companion.scene}.`,
    `Outfit: ${companion.outfit}.`,
    companion.details ? `Extra details: ${companion.details}.` : "",
    "Full body or upper body framing should clearly reflect the selected pose when possible.",
    "Polished portrait, attractive lighting, consistent character design, safe for a premium companion website.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateCompanionImage(payload) {
  const response = await fetch("/api/runpod/companion-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || "Could not generate companion image");
  }

  if (data.status === "error" || data.status === "not_configured") {
    throw new Error(data.detail || data.message || "RunPod generation failed");
  }

  if (!data.image_url && !data.output_url && !data.url && !data.image_base64 && !data.output_base64) {
    throw new Error("RunPod did not return an image");
  }

  return data;
}

async function deleteCloudCompanion(id) {
  const response = await fetch(`/api/companions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Could not delete companion");
  }
}

function renderCompanionCollage(companions) {
  if (!savedCompanionGrid) return;
  savedCompanionGrid.innerHTML = "";

  if (!companions.length) {
    const empty = document.createElement("p");
    empty.className = "muted-note";
    empty.textContent = "Saved companions will appear here.";
    savedCompanionGrid.appendChild(empty);
    return;
  }

  companions.forEach((companion, index) => {
    const card = document.createElement("article");
    card.className = "saved-companion-card";

    const avatar = document.createElement("div");
    avatar.className = `avatar avatar-${["one", "two", "three", "four", "five", "six"][index % 6]}`;

    const imageSrc =
      companion.imageUrl || (companion.imageBase64 ? `data:image/png;base64,${companion.imageBase64}` : "");

    if (imageSrc) {
      avatar.style.backgroundImage = `url("${imageSrc}")`;
      avatar.classList.add("has-generated-image");
    }

    const body = document.createElement("div");
    body.className = "saved-companion-body";

    const title = document.createElement("h3");
    title.textContent = companion.name;

    const description = document.createElement("p");
    description.textContent = [
      companion.ethnicity || "Custom background",
      companion.style || "Realistic",
      companion.position || "Custom pose",
    ].join(" - ");

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-edit-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete companion";
    deleteButton.addEventListener("click", async () => {
      await deleteCloudCompanion(companion.id);
      loadCompanionCollage();
    });

    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(deleteButton);
    card.appendChild(avatar);
    card.appendChild(body);
    savedCompanionGrid.appendChild(card);
  });
}

async function loadCompanionCollage() {
  if (!savedCompanionGrid) return;

  try {
    const companions = await getCloudCompanions();
    renderCompanionCollage(companions);
  } catch {
    savedCompanionGrid.innerHTML = '<p class="muted-note">Could not load saved companions.</p>';
  }
}

if (createCompanionForm && companionName && companionEthnicity && companionStyle && companionDetails) {
  createCompanionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = companionName.value.trim() || "Custom Companion";
    const payload = {
      name,
      ethnicity: companionEthnicity.value.trim(),
      style: companionStyle.value,
      ageRange: companionAgeRange?.value || "21-25",
      scene: companionScene?.value || "Studio portrait",
      outfit: companionOutfit?.value || "Custom",
      position: companionPosition?.value || "Standing pose",
      details: companionDetails.value.trim(),
    };
    const prompt = buildCompanionPrompt(payload);

    if (createCompanionStatus) {
      createCompanionStatus.textContent = "";
    }

    let companion;
    let generatedImageData = null;

    try {
      generatedImageData = await generateCompanionImage({
        prompt,
        workflow: payload,
      });

      const imageUrl =
        generatedImageData.image_url || generatedImageData.output_url || generatedImageData.url || "";
      const imageBase64 = generatedImageData.image_base64 || generatedImageData.output_base64 || "";

      companion = await createCloudCompanion({
        ...payload,
        imageUrl,
        imageBase64,
      });
    } catch (error) {
      if (createCompanionStatus) {
        createCompanionStatus.textContent = `Generation failed: ${error.message}`;
      }
      return;
    }

    if (createCompanionStatus) {
      createCompanionStatus.textContent = "Companion generated and saved.";
    }

    if (previewCompanionName) {
      previewCompanionName.textContent = companion.name;
    }

    if (previewCompanionDetails) {
      const ethnicity = companion.ethnicity
        ? `${companion.ethnicity} background, `
        : "";
      const details = companion.details || "Ready for images, voice, and video generation.";
      previewCompanionDetails.textContent = `${ethnicity}${companion.style.toLowerCase()} style. ${details}`;
    }

    if (previewCompanionTags) {
      previewCompanionTags.innerHTML = "";
      [companion.ethnicity || "Custom", companion.style, "Generated"].forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        previewCompanionTags.appendChild(span);
      });
    }

    if (generatedCompanionPhoto && generatedImageData) {
      const imageUrl = generatedImageData.image_url || generatedImageData.output_url || generatedImageData.url;
      const imageBase64 = generatedImageData.image_base64 || generatedImageData.output_base64;
      const src = imageUrl || (imageBase64 ? `data:image/png;base64,${imageBase64}` : "");

      if (src) {
        generatedCompanionPhoto.style.backgroundImage = `url("${src}")`;
        generatedCompanionPhoto.classList.add("has-generated-image");
      }
    }

    if (videoRedirectButton) {
      videoRedirectButton.href = getPagePath("video/index.html", companion.id);
      videoRedirectButton.classList.add("is-visible");
    }

    loadCompanionCollage();
  });
}

loadCompanionCollage();

if (videoCompanionSelect) {
  const params = new URLSearchParams(window.location.search);
  const selectedCompanionId = params.get("companion");

  getCloudCompanions()
    .then((companions) => {
      companions.forEach((companion) => {
        const option = document.createElement("option");
        option.value = companion.id;
        option.textContent = companion.name;
        videoCompanionSelect.appendChild(option);
      });

      if (selectedCompanionId) {
        videoCompanionSelect.value = selectedCompanionId;
      }
    })
    .catch(() => {
      const option = document.createElement("option");
      option.textContent = "Cloud companions unavailable";
      option.disabled = true;
      videoCompanionSelect.appendChild(option);
    });
}

if (imageUpload && imageCanvas && emptyCanvas) {
  renderSavedImages();

  imageCompanionSelect?.addEventListener("change", () => {
    const selected = imageCompanionSelect.value;
    const companion = featuredCompanionProfiles[selected];

    if (!companion) {
      currentEditorImage = null;
      imageCanvas.getContext("2d").clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      emptyCanvas.style.display = "grid";
      return;
    }

    if (imageEditPrompt && !imageEditPrompt.value.trim()) {
      imageEditPrompt.placeholder = `Example: edit ${companion.name}'s outfit, lighting, pose, or background while keeping the same face...`;
    }

    loadEditorImage(companion.image);
  });

  const initialImageCompanion = new URLSearchParams(window.location.search)
    .get("companion")
    ?.toLowerCase();

  if (initialImageCompanion && featuredCompanionProfiles[initialImageCompanion]) {
    imageCompanionSelect.value = initialImageCompanion;
    imageCompanionSelect.dispatchEvent(new Event("change"));
  }

  imageUpload.addEventListener("change", () => {
    const file = imageUpload.files?.[0];
    if (!file) return;

    if (imageCompanionSelect) imageCompanionSelect.value = "upload";

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      loadEditorImage(reader.result);
    });
    reader.readAsDataURL(file);
  });

  [brightnessRange, contrastRange, saturationRange, warmthRange].forEach((range) => {
    range?.addEventListener("input", drawEditorImage);
  });

  resetImageButton?.addEventListener("click", () => {
    if (brightnessRange) brightnessRange.value = 100;
    if (contrastRange) contrastRange.value = 100;
    if (saturationRange) saturationRange.value = 100;
    if (warmthRange) warmthRange.value = 0;
    drawEditorImage();
  });

  saveImageButton?.addEventListener("click", () => {
    if (!currentEditorImage) return;
    saveEditedImage(
      imageCanvas.toDataURL("image/jpeg", 0.9),
      imageEditPrompt?.value.trim() || ""
    );
    renderSavedImages();
  });

}

function setPaymentMethod(method) {
  const cryptoActive = method === "crypto";

  cardTab?.classList.toggle("is-active", !cryptoActive);
  cryptoTab?.classList.toggle("is-active", cryptoActive);
  cardPanel?.classList.toggle("is-active", !cryptoActive);
  cryptoPanel?.classList.toggle("is-active", cryptoActive);
}

function updateUsdcAmount(rate, fallback = false) {
  if (!activeCheckoutPrice || !checkoutUsdc) return;

  const amount = activeCheckoutPrice / rate;
  checkoutUsdc.textContent = amount.toFixed(2);

  if (checkoutRate) {
    checkoutRate.textContent = fallback
      ? `Fallback: 1 USDC = $${rate.toFixed(4)}`
      : `1 USDC = $${rate.toFixed(4)}`;
  }
}

async function refreshUsdcRate() {
  if (!checkoutOverlay?.classList.contains("is-visible")) return;

  try {
    const response = await fetch("/api/usdc-rate");
    const data = await response.json();
    const rate = Number(data.rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid USDC rate");
    }

    updateUsdcAmount(rate, Boolean(data.fallback));
  } catch {
    updateUsdcAmount(1, true);
  }
}

function openCheckout(button) {
  const pack = button.dataset.pack || "Credits";
  const price = button.dataset.price || "0.00";
  const credits = button.dataset.credits || "0";
  activeCheckoutPrice = Number(price);

  if (checkoutPack) checkoutPack.textContent = pack;
  if (checkoutPrice) checkoutPrice.textContent = `$${price}`;
  if (checkoutCredits) checkoutCredits.textContent = credits;
  if (checkoutUsdc) checkoutUsdc.textContent = activeCheckoutPrice.toFixed(2);
  if (checkoutRate) checkoutRate.textContent = "Loading...";

  setPaymentMethod("card");
  checkoutOverlay?.classList.add("is-visible");
  checkoutOverlay?.setAttribute("aria-hidden", "false");
  refreshUsdcRate();

  window.clearInterval(usdcRateTimer);
  usdcRateTimer = window.setInterval(refreshUsdcRate, 30000);
}

function closeCheckout() {
  checkoutOverlay?.classList.remove("is-visible");
  checkoutOverlay?.setAttribute("aria-hidden", "true");
  window.clearInterval(usdcRateTimer);
}

if (checkoutOverlay) {
  checkoutButtons.forEach((button) => {
    button.addEventListener("click", () => openCheckout(button));
  });

  checkoutClose?.addEventListener("click", closeCheckout);
  cardTab?.addEventListener("click", () => setPaymentMethod("card"));
  cryptoTab?.addEventListener("click", () => setPaymentMethod("crypto"));

  checkoutOverlay.addEventListener("click", (event) => {
    if (event.target === checkoutOverlay) {
      closeCheckout();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCheckout();
    }
  });
}


const featuredCompanionProfiles = {
  mira: {
    id: "mira",
    name: "Mira",
    age: 24,
    status: "Online now - image and video ready",
    image: getAssetPath("images/mira.png"),
    title: "Mira, 24",
    summary:
      "Mira is romantic, playful, and warm. She is built for polished companion images and short video scenes.",
    aboutTitle: "About Mira",
    about:
      "Best for users who want affectionate conversation, soft flirting, personalized creative roleplay, and companion-based image or video generation.",
    tags: ["Romantic", "Playful", "Voice ready", "Image requests", "Video scenes"],
    opener: "I was hoping you would come back. What kind of mood are we creating tonight?",
    second: "I like that. Give me one detail: city lights, candlelight, or rain?",
  },
  nova: {
    id: "nova",
    name: "Nova",
    age: 23,
    status: "Online now - image and video ready",
    image: getAssetPath("images/nova.png"),
    title: "Nova, 23",
    summary:
      "Nova is confident, witty, and bold. She is built for sharp styling, glamorous image edits, and video scenes.",
    aboutTitle: "About Nova",
    about:
      "Best for users who want a confident companion with playful teasing, strong visual direction, and premium portrait or video prompts.",
    tags: ["Confident", "Witty", "Image ready", "Glamour", "Video scenes"],
    opener: "You picked me. Good choice. What kind of scene are we making first?",
    second: "Give me the vibe: glossy, playful, cinematic, or a little dangerous?",
  },
  seren: {
    id: "seren",
    name: "Seren",
    age: 22,
    status: "Online now - image and voice ready",
    image: getAssetPath("images/seren.png"),
    title: "Seren, 22",
    summary:
      "Seren is calm, affectionate, and thoughtful. She is designed for cozy late-night messages, softer intimacy, and natural companion moments.",
    aboutTitle: "About Seren",
    about:
      "Best for users who want gentle conversation, warm emotional tone, personal attention, and polished companion images.",
    tags: ["Calm", "Affectionate", "Image ready", "Soft tone", "Image requests"],
    opener: "Hi, I am glad you chose me. What would make tonight feel easy for you?",
    second: "We can keep it soft. Tell me one detail you want me to remember.",
  },
  elera: {
    id: "elera",
    name: "Elera",
    age: 24,
    status: "Online now - video and image ready",
    image: getAssetPath("images/elera.png"),
    title: "Elera, 24",
    summary:
      "Elera is elegant, mysterious, and magnetic. She is built for darker cinematic styling and slow-burn image or video scenes.",
    aboutTitle: "About Elera",
    about:
      "Best for users who want a polished gothic-glam companion with dramatic lighting, refined style, and cinematic prompt direction.",
    tags: ["Elegant", "Mysterious", "Video ready", "Glamour", "Cinematic"],
    opener: "You found me. Tell me what kind of atmosphere you want tonight.",
    second: "Make it simple: candlelight, velvet shadows, or something more dangerous?",
  },
  luna: {
    id: "luna",
    name: "Luna",
    age: 22,
    status: "Online now - voice and image ready",
    image: getAssetPath("images/luna.png"),
    title: "Luna, 22",
    summary:
      "Luna is soft, playful, and affectionate. She is made for sweet messages, casual images, and warm companion moments.",
    aboutTitle: "About Luna",
    about:
      "Best for users who want a friendly, flirty companion with everyday charm, gentle energy, and image-first interaction.",
    tags: ["Soft", "Playful", "Voice ready", "Affectionate", "Casual"],
    opener: "Hi, I was waiting for you. What should we make together first?",
    second: "I can keep it cute. Give me a mood, a place, and one tiny detail.",
  },
  aria: {
    id: "aria",
    name: "Aria",
    age: 23,
    status: "Online now - image and video ready",
    image: getAssetPath("images/aria.png"),
    title: "Aria, 23",
    summary:
      "Aria is stylish, creative, and direct. She works well for bold portraits, confident styling, and fashion-led image prompts.",
    aboutTitle: "About Aria",
    about:
      "Best for users who want a visual-first companion with strong styling, confident expression, and premium image generation potential.",
    tags: ["Stylish", "Creative", "Image ready", "Confident", "Fashion"],
    opener: "You chose Aria. Good. What look are we creating?",
    second: "Give me the styling: clean, bold, glossy, or something a little sharper?",
  },
};

function getSelectedCompanion() {
  const params = new URLSearchParams(window.location.search);
  const id = (params.get("companion") || "mira").toLowerCase();
  return featuredCompanionProfiles[id] || featuredCompanionProfiles.mira;
}

function setCompanionPhoto(element, companion) {
  if (!element || !companion.image) return;
  element.style.backgroundImage = `linear-gradient(180deg, rgba(8, 10, 16, 0), rgba(8, 10, 16, 0.18)), url("${companion.image}")`;
}

function renderProfileCompanion() {
  const profileDetail = document.querySelector(".profile-detail");
  const profilePhoto = document.querySelector(".profile-photo.large-photo");

  if (!profileDetail || !profilePhoto) return;

  const companion = getSelectedCompanion();
  const title = profileDetail.querySelector("h1");
  const summary = profileDetail.querySelector(".hero-text");
  const aboutTitle = profileDetail.querySelector(".bio-panel h2");
  const about = profileDetail.querySelector(".bio-panel p");
  const tags = profileDetail.querySelector(".profile-tags");
  const videoLink = profileDetail.querySelector('a[href*="video/index.html"]');
  const imageLink = profileDetail.querySelector('a[href*="images/index.html"]');

  document.title = `${companion.name} | Loviant`;
  setCompanionPhoto(profilePhoto, companion);
  if (title) title.textContent = companion.title;
  if (summary) summary.textContent = companion.summary;
  if (aboutTitle) aboutTitle.textContent = companion.aboutTitle;
  if (about) about.textContent = companion.about;
  if (videoLink) videoLink.href = getPagePath("video/index.html", companion.id);
  if (imageLink) imageLink.href = getPagePath("images/index.html", companion.id);

  if (tags) {
    tags.innerHTML = "";
    companion.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      tags.appendChild(span);
    });
  }
}

function renderVideoCompanionSelection() {
  if (!videoCompanionSelect) return;

  const companion = getSelectedCompanion();
  [...videoCompanionSelect.options].forEach((option) => {
    if (option.textContent.trim().toLowerCase() === companion.id) {
      option.selected = true;
    }
  });
}

renderProfileCompanion();
renderVideoCompanionSelection();


const builderCompanionTemplates = {
  mira: {
    name: "Mira",
    ethnicity: "European",
    style: "Realistic",
    ageRange: "18-25",
    scene: "Luxury apartment",
    outfit: "Casual outfit",
    position: "Standing pose",
    details:
      "Romantic, playful, warm personality, soft flirting, long brunette hair, polished realistic portrait style, video-ready companion.",
  },
  nova: {
    name: "Nova",
    ethnicity: "European",
    style: "Glamour",
    ageRange: "18-25",
    scene: "Studio portrait",
    outfit: "Glamour look",
    position: "Standing pose",
    details:
      "Confident, witty, bold personality, blonde hair, blue eyes, glamorous realistic portrait style, strong image-led companion.",
  },
  seren: {
    name: "Seren",
    ethnicity: "East Asian",
    style: "Realistic",
    ageRange: "18-25",
    scene: "Studio portrait",
    outfit: "Casual outfit",
    position: "Standing pose",
    details:
      "Calm, affectionate, thoughtful personality, dark straight hair, soft natural beauty, cozy image and video style.",
  },
};

function setSelectValue(select, value) {
  if (!select) return;
  const hasOption = [...select.options].some((option) => option.value === value || option.textContent === value);
  if (hasOption) {
    select.value = value;
  }
}

function updateBuilderPreviewFromTemplate(id) {
  const profile = featuredCompanionProfiles?.[id];

  if (!profile) {
    if (previewCompanionName) previewCompanionName.textContent = "Your Companion";
    if (previewCompanionDetails) {
      previewCompanionDetails.textContent =
        "A private AI personality ready for images, voice, and video generation.";
    }
    if (previewCompanionTags) {
      previewCompanionTags.innerHTML = "<span>Private</span><span>Custom</span><span>Video ready</span>";
    }
    if (generatedCompanionPhoto) {
      generatedCompanionPhoto.style.backgroundImage = "linear-gradient(135deg, rgba(255, 79, 147, 0.18), rgba(255, 209, 102, 0.1)), #160b11";
      generatedCompanionPhoto.classList.remove("has-generated-image");
    }
    return;
  }

  if (previewCompanionName) previewCompanionName.textContent = profile.name;
  if (previewCompanionDetails) previewCompanionDetails.textContent = profile.summary;
  if (previewCompanionTags) {
    previewCompanionTags.innerHTML = "";
    profile.tags.slice(0, 3).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      previewCompanionTags.appendChild(span);
    });
  }
  if (generatedCompanionPhoto) {
    generatedCompanionPhoto.style.backgroundImage = `url("${profile.image}")`;
    generatedCompanionPhoto.classList.add("has-generated-image");
  }
}

function applyBuilderCompanionTemplate(id) {
  const template = builderCompanionTemplates[id];

  if (!template) {
    if (companionName) companionName.value = "";
    if (companionEthnicity) companionEthnicity.value = "";
    setSelectValue(companionStyle, "Realistic");
    setSelectValue(companionAgeRange, "18-25");
    setSelectValue(companionScene, "Studio portrait");
    setSelectValue(companionOutfit, "Casual outfit");
    setSelectValue(companionPosition, "Standing pose");
    if (companionDetails) companionDetails.value = "";
    updateBuilderPreviewFromTemplate("new");
    return;
  }

  if (companionName) companionName.value = template.name;
  if (companionEthnicity) companionEthnicity.value = template.ethnicity;
  setSelectValue(companionStyle, template.style);
  setSelectValue(companionAgeRange, template.ageRange);
  setSelectValue(companionScene, template.scene);
  setSelectValue(companionOutfit, template.outfit);
  setSelectValue(companionPosition, template.position);
  if (companionDetails) companionDetails.value = template.details;
  updateBuilderPreviewFromTemplate(id);
}

if (companionTemplate) {
  companionTemplate.addEventListener("change", () => {
    applyBuilderCompanionTemplate(companionTemplate.value);
  });

  const params = new URLSearchParams(window.location.search);
  const initialCompanion = (params.get("companion") || "new").toLowerCase();
  if (builderCompanionTemplates[initialCompanion]) {
    companionTemplate.value = initialCompanion;
    applyBuilderCompanionTemplate(initialCompanion);
  }
}

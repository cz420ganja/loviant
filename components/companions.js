export const companions = [
  {
    id: "mira",
    name: "Mira",
    age: 24,
    image: "/images/mira.png",
    avatarClass: "avatar-one",
    type: "Video",
    description: "Warm, playful, and perfect for romantic image and video scenes.",
    summary: "Mira is romantic, playful, and warm. She is ready for companion image edits and short video scenes.",
    tags: ["Romantic", "Playful", "Voice ready", "Image requests", "Video scenes"],
    about: "Best for users who want affectionate visuals, soft flirting, personalized creative roleplay, and companion-based image or video generation.",
    primaryAction: "video",
  },
  {
    id: "nova",
    name: "Nova",
    age: 23,
    image: "/images/nova.png",
    avatarClass: "avatar-two",
    type: "Image",
    description: "Confident, witty, and great for bold image-led roleplay.",
    summary: "Nova is confident, witty, and bold. She is built for sharp styling, glamorous image edits, and video scenes.",
    tags: ["Confident", "Witty", "Image ready", "Glamour", "Video scenes"],
    about: "Best for users who want a confident companion with playful visual direction and premium portrait or video prompts.",
    primaryAction: "image",
  },
  {
    id: "seren",
    name: "Seren",
    age: 22,
    image: "/images/seren.png",
    avatarClass: "avatar-three",
    type: "Image",
    description: "Calm, affectionate, and made for polished companion images.",
    summary: "Seren is calm, affectionate, and thoughtful. She is designed for softer intimacy and natural companion moments.",
    tags: ["Calm", "Affectionate", "Image ready", "Soft tone", "Image requests"],
    about: "Best for users who want gentle visuals, warm emotional tone, personal attention, and polished companion images.",
    primaryAction: "image",
  },
  {
    id: "elera",
    name: "Elera",
    age: 24,
    image: "/images/elera.png",
    avatarClass: "avatar-four",
    type: "Video",
    description: "Elegant, mysterious, and built for slow-burn video prompts.",
    summary: "Elera is elegant, mysterious, and magnetic. She is built for darker cinematic styling and slow-burn image or video scenes.",
    tags: ["Elegant", "Mysterious", "Video ready", "Glamour", "Cinematic"],
    about: "Best for users who want a polished gothic-glam companion with dramatic lighting, refined style, and cinematic prompt direction.",
    primaryAction: "video",
  },
  {
    id: "luna",
    name: "Luna",
    age: 22,
    image: "/images/luna.png",
    avatarClass: "avatar-five",
    type: "Voice",
    description: "Soft, playful, and perfect for affectionate everyday messages.",
    summary: "Luna is soft, playful, and affectionate. She is made for sweet images, casual edits, and warm companion moments.",
    tags: ["Soft", "Playful", "Voice ready", "Affectionate", "Casual"],
    about: "Best for users who want a friendly, flirty companion with everyday charm, gentle energy, and image-first interaction.",
    primaryAction: "image",
  },
  {
    id: "aria",
    name: "Aria",
    age: 23,
    image: "/images/aria.png",
    avatarClass: "avatar-six",
    type: "Image",
    description: "Creative, stylish, and made for vivid image-led prompts.",
    summary: "Aria is stylish, creative, and direct. She works well for bold portraits, confident styling, and fashion-led image prompts.",
    tags: ["Stylish", "Creative", "Image ready", "Confident", "Fashion"],
    about: "Best for users who want a visual-first companion with strong styling, confident expression, and premium image generation potential.",
    primaryAction: "image",
  },
];

export function getCompanion(id) {
  return companions.find((companion) => companion.id === id) || companions[0];
}

export function companionActionHref(companion) {
  const path = companion.primaryAction === "video" ? "/video" : "/images";
  return `${path}?companion=${encodeURIComponent(companion.id)}`;
}

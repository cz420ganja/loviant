"use client";

import { useState } from "react";

export function CreateCompanionForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");

  return (
    <section className="builder-grid">
      <form
        className="studio-panel builder-form"
        id="createCompanionForm"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsGenerating(true);
          setStatusType("");
          setStatus("Generating with Z-Image Turbo...");

          const formData = new FormData(event.currentTarget);
          const payload = Object.fromEntries(formData.entries());

          try {
            const response = await fetch("/api/runpod/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok || !result.ok) {
              throw new Error(result.message || "Generation failed.");
            }

            if (result.imageUrl) {
              setGeneratedImage(result.imageUrl);
            }
            setStatusType("is-success");
            setStatus(result.imageUrl ? "Companion generated." : result.message);
          } catch (error) {
            setStatusType("is-error");
            setStatus(error.message);
          } finally {
            setIsGenerating(false);
          }
        }}
      >
        <div className="panel-topbar" id="companion-builder">
          <span>Companion Builder</span>
          <span className="credits">Cost: 1 credit</span>
        </div>
        <label className="prompt-label">Name <input name="name" value={name} onChange={(event) => setName(event.target.value)} type="text" placeholder="Name your new companion" /></label>
        <label className="prompt-label">Ethnicity / background <input name="ethnicity" type="text" placeholder="Example: Latina, Korean, Arab, mixed, etc." /></label>
        <label className="prompt-label">Style
          <select name="style"><option>Realistic</option><option>Anime</option><option>Glamour</option><option>Casual</option></select>
        </label>
        <div className="control-grid">
          <label className="prompt-label">Age range <select name="ageRange"><option>18-25</option><option>26-30</option><option>31-40</option></select></label>
          <label className="prompt-label">Scene <select name="scene"><option>Studio portrait</option><option>Luxury apartment</option><option>Neon city</option><option>Beach sunset</option><option>Bedroom setting</option><option>Custom in details</option></select></label>
        </div>
        <div className="control-grid">
          <label className="prompt-label">Outfit <select name="outfit"><option>Casual outfit</option><option>Glamour look</option><option>Streetwear</option><option>Custom in details</option></select></label>
          <label className="prompt-label">Position <select name="position"><option>Standing pose</option><option>Portrait pose</option><option>Custom in details</option></select></label>
        </div>
        <label className="prompt-label">Details
          <textarea name="details" rows="6" placeholder="Describe hair, body type, outfit, voice, hobbies, image style, video style, and personality..."></textarea>
        </label>
        <button className="generate-button" type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Companion"}
        </button>
        <p className={`form-status ${statusType}`} aria-live="polite">{status}</p>
      </form>
      <section className="match-panel builder-preview">
        <div
          className={`profile-photo generated-photo ${generatedImage ? "has-generated-image" : ""}`}
          style={generatedImage ? { backgroundImage: `url(${generatedImage})` } : undefined}
        >
          <div className="match-badge">{isGenerating ? "Generating" : "Custom"}</div>
        </div>
        <div className="profile-content">
          <h2>{name || "Your Companion"}</h2>
          <p>A private AI personality ready for images, voice, and video generation.</p>
          <div className="profile-tags"><span>Private</span><span>Custom</span><span>Video ready</span></div>
        </div>
      </section>
    </section>
  );
}

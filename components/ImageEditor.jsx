"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { companions } from "./companions";

function drawImageToCanvas(canvas, image) {
  const context = canvas.getContext("2d");
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = image.width / image.height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = sourceHeight * canvasRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = sourceWidth / canvasRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
}

export function ImageEditor() {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const [hasImage, setHasImage] = useState(false);
  const [saved, setSaved] = useState([]);
  const initialCompanionId = searchParams.get("companion") || "upload";
  const [selectedCompanionId, setSelectedCompanionId] = useState(initialCompanionId);
  const selectedCompanion = companions.find((item) => item.id === selectedCompanionId);

  function loadImage(src) {
    const image = new Image();
    image.onload = () => {
      if (canvasRef.current) {
        drawImageToCanvas(canvasRef.current, image);
        setHasImage(true);
      }
    };
    image.src = src;
  }

  useEffect(() => {
    const companionId = searchParams.get("companion");
    const companion = companions.find((item) => item.id === companionId);
    if (companion) loadImage(companion.image);
  }, [searchParams]);

  return (
    <>
      <section className="image-editor-grid">
        <section className="studio-panel editor-controls">
          <div className="panel-topbar"><span>Image Edit</span><span className="credits">Cost: 1 credit</span></div>
          <label className="prompt-label">Choose companion
            <select
              value={selectedCompanionId}
              onChange={(event) => {
                setSelectedCompanionId(event.target.value);
                const companion = companions.find((item) => item.id === event.target.value);
                if (companion) loadImage(companion.image);
                if (!companion) setHasImage(false);
              }}
            >
              <option value="upload">Upload new image</option>
              {companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.name}</option>)}
            </select>
          </label>
          <div className={`selected-companion-panel ${selectedCompanion ? "is-selected" : ""}`}>
            {selectedCompanion ? (
              <>
                <div className="selected-companion-thumb" style={{ backgroundImage: `url(${selectedCompanion.image})` }} />
                <div>
                  <span>Selected companion</span>
                  <strong>{selectedCompanion.name}, {selectedCompanion.age}</strong>
                  <p>{selectedCompanion.description}</p>
                </div>
              </>
            ) : (
              <p>No companion selected. Upload your own image below.</p>
            )}
          </div>
          <label className="prompt-label">Image prompt
            <textarea rows="5" placeholder="Example: change the outfit to a black dress, add soft studio lighting, keep the same face..."></textarea>
          </label>
          <label className="upload-drop">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setSelectedCompanionId("upload");
                const reader = new FileReader();
                reader.onload = () => loadImage(reader.result);
                reader.readAsDataURL(file);
              }}
            />
            <span>Choose image</span>
            <small>PNG, JPG, or WebP</small>
          </label>
          <div className="editor-actions single-action">
            <button
              className="generate-button"
              type="button"
              onClick={() => {
                if (!canvasRef.current || !hasImage) return;
                setSaved((items) => [canvasRef.current.toDataURL("image/jpeg", 0.9), ...items].slice(0, 12));
              }}
            >
              Save Edit
            </button>
          </div>
        </section>
        <section className="image-canvas-card">
          <canvas ref={canvasRef} width="720" height="960"></canvas>
          {!hasImage && <div className="empty-canvas">Upload an image to start editing</div>}
        </section>
      </section>
      <section className="section saved-section">
        <div className="section-heading"><p className="eyebrow">Saved</p><h2>Edited Images</h2></div>
        <div className="saved-image-grid">
          {saved.length ? saved.map((src, index) => <article className="saved-image-card" key={src}><img src={src} alt={`Saved edit ${index + 1}`} /></article>) : <p className="muted-note">Saved edits will appear here.</p>}
        </div>
      </section>
    </>
  );
}

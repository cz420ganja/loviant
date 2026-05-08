"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { companions } from "./companions";

export function VideoForm() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("companion") || "mira";
  const [selectedId, setSelectedId] = useState(initial);
  const [preview, setPreview] = useState("Video preview will appear here");
  const [sourceMode, setSourceMode] = useState("companion");
  const [uploadedName, setUploadedName] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState("");
  const selected = useMemo(() => companions.find((item) => item.id === selectedId) || companions[0], [selectedId]);
  const previewImage =
    sourceMode === "upload"
      ? uploadedPreview
      : selectedId !== "new"
        ? selected.image
        : "";

  useEffect(() => {
    return () => {
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
    };
  }, [uploadedPreview]);

  function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setUploadedName("");
      setUploadedPreview("");
      setPreview("Upload an image to preview the video source");
      return;
    }

    setUploadedName(file.name);
    setPreview("Uploaded image ready. Add your video scene prompt.");
    setUploadedPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function chooseSourceMode(mode) {
    setSourceMode(mode);
    if (mode === "upload") {
      setSelectedId("new");
      setPreview(uploadedPreview ? "Uploaded image ready. Add your video scene prompt." : "Upload an image to preview the video source");
    } else {
      const nextId = companions.some((item) => item.id === selectedId) ? selectedId : "mira";
      setSelectedId(nextId);
      setPreview("Video preview will appear here");
    }
  }

  return (
    <section className="video-grid">
      <form className="studio-panel video-form">
        <div className="panel-topbar"><span>Create Video Scene</span><span className="credits">Cost: 2 credits</span></div>

        <div className="source-toggle" aria-label="Choose video source">
          <button className={sourceMode === "companion" ? "is-active" : ""} type="button" onClick={() => chooseSourceMode("companion")}>Select companion</button>
          <button className={sourceMode === "upload" ? "is-active" : ""} type="button" onClick={() => chooseSourceMode("upload")}>Upload image</button>
        </div>

        {sourceMode === "companion" && (
          <label className="prompt-label">Select companion
            <select name="companion" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.name}</option>)}
              <option value="new">New unsaved companion</option>
            </select>
          </label>
        )}

        {sourceMode === "upload" && (
          <label className="upload-drop video-upload"> 
            <input
              type="file"
              name="sourceImage"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUpload}
            />
            {uploadedPreview && <img className="upload-preview-thumb" src={uploadedPreview} alt="Uploaded video source preview" />}
            <span>{uploadedName || "Choose source image"}</span>
            <small>Use a face or full-body image as the first frame/reference.</small>
          </label>
        )}

        <label className="prompt-label">Video scene prompt
          <textarea id="videoPrompt" rows="8" placeholder="Describe exactly what you want the video to show: subject action, camera movement, lighting, outfit, background, framing, and style."></textarea>
        </label>

        <div className="control-grid">
          <label>Length <select><option>4 seconds</option><option>6 seconds</option><option>8 seconds</option></select></label>
          <label>Output ratio <select><option>9:16 vertical</option><option>1:1 square</option><option>16:9 landscape</option></select></label>
        </div>

        <button className="generate-button" type="button" onClick={() => setPreview("Video queued. Backend RunPod generation will connect here next.")}>Queue Video</button>
      </form>
      <section className="video-preview-card">
        <div
          className="video-frame is-active"
          style={previewImage ? { backgroundImage: `linear-gradient(180deg, rgba(12, 8, 12, 0.1), rgba(12, 8, 12, 0.62)), url(${previewImage})` } : undefined}
        >
          <span>{preview}</span>
        </div>
        <div className="profile-content">
          <h2>Generation Queue</h2>
          <p>The final button will spend credits first, then send the job to your backend RunPod queue.</p>
          <div className="profile-tags"><span>RunPod</span><span>Credit gated</span><span>Queue limits</span></div>
        </div>
      </section>
    </section>
  );
}

import React, { useState, useRef, useCallback } from "react";
import { submitReport } from "../api";

const GUWAHATI_CENTER = { lat: 26.1445, lng: 91.7362 };

export default function UploadModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("form"); // form | loading | success | error
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (JPEG, PNG, or WebP).");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg("");
  }, []);

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setErrorMsg("Could not get location. Please enter coordinates manually.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const useGuwahatiDefault = () => {
    // Slightly randomise around Guwahati centre for demo purposes
    const jitter = () => (Math.random() - 0.5) * 0.05;
    setLat((GUWAHATI_CENTER.lat + jitter()).toFixed(6));
    setLng((GUWAHATI_CENTER.lng + jitter()).toFixed(6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!imageFile) { setErrorMsg("Please select an image."); return; }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) { setErrorMsg("Please enter valid coordinates."); return; }

    setStep("loading");
    try {
      const report = await submitReport(imageFile, latNum, lngNum, locationLabel || null);
      setResult(report);
      setStep("success");
      onSuccess(report);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStep("error");
    }
  };

  const severityColor = {
    clear: "#22c55e",
    caution: "#f59e0b",
    avoid: "#ef4444",
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "20px 20px 0 0",
        width: "100%",
        maxWidth: 480,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Report Road Condition</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Upload a photo to help other commuters</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Loading state */}
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 15, color: "#f1f5f9", fontWeight: 600 }}>Analyzing road condition…</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Gemini Vision is reviewing your image</p>
          </div>
        )}

        {/* Success state */}
        {step === "success" && result && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Report submitted!</p>
            <div style={{
              display: "inline-block",
              background: `${severityColor[result.severity]}22`,
              border: `1px solid ${severityColor[result.severity]}`,
              borderRadius: 20, padding: "6px 16px", marginBottom: 12,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: severityColor[result.severity], textTransform: "capitalize" }}>
                {result.severity}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>
                {result.water_coverage_pct}% water · {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>{result.reasoning}</p>
            <button
              onClick={onClose}
              style={{
                background: "#3b82f6", color: "white", border: "none",
                borderRadius: 10, padding: "10px 28px", fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              View on map
            </button>
          </div>
        )}

        {/* Error state */}
        {step === "error" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>Submission failed</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>{errorMsg}</p>
            <button
              onClick={() => { setStep("form"); setErrorMsg(""); }}
              style={{
                background: "#334155", color: "#f1f5f9", border: "none",
                borderRadius: 10, padding: "10px 24px", fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit}>
            {/* Image drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${imageFile ? "#3b82f6" : "#334155"}`,
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 16,
                background: imageFile ? "rgba(59,130,246,0.05)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, objectFit: "cover" }}
                />
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 14, color: "#f1f5f9", fontWeight: 500 }}>Tap to upload or drag a photo</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>JPEG, PNG, WebP — max 10 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={onFileChange}
              style={{ display: "none" }}
            />

            {/* Location */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                Location (lat, lng)
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={useMyLocation} style={smallBtnStyle} disabled={locating}>
                  {locating ? "Locating…" : "📍 Use my location"}
                </button>
                <button type="button" onClick={useGuwahatiDefault} style={smallBtnStyle}>
                  🗺 Use Guwahati (demo)
                </button>
              </div>
            </div>

            {/* Location label (optional) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                Location name <span style={{ fontWeight: 400, color: "#64748b" }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Uzanbazar near flyover"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>

            {/* Error */}
            {errorMsg && step === "form" && (
              <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>{errorMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Analyze &amp; Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#f1f5f9",
  fontSize: 13,
  outline: "none",
};

const smallBtnStyle = {
  fontSize: 12,
  color: "#94a3b8",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "6px 12px",
  cursor: "pointer",
  flexShrink: 0,
};

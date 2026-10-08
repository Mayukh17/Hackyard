import React from "react";
import { getSeverityConfig, formatAge } from "../utils";

export default function ReportPopup({ report }) {
  const { severity, confidence, water_coverage_pct, reasoning, image_url, location_label, age_seconds, is_stale } = report;
  const cfg = getSeverityConfig(severity, is_stale);

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Image thumbnail */}
      {image_url && (
        <div style={{ width: "100%", height: 120, overflow: "hidden", background: "#0f172a" }}>
          <img
            src={image_url}
            alt="Road condition"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      <div style={{ padding: "12px 14px" }}>
        {/* Severity badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: cfg.bg,
          border: `1px solid ${cfg.color}`,
          borderRadius: 20,
          padding: "3px 10px",
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 10 }}>{cfg.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          {is_stale && (
            <span style={{ fontSize: 10, color: "#94a3b8" }}>(stale)</span>
          )}
        </div>

        {/* Location label */}
        {location_label && (
          <p style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
            📍 {location_label}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: "#64748b" }}>Water coverage</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{water_coverage_pct}%</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#64748b" }}>Confidence</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{Math.round(confidence * 100)}%</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#64748b" }}>Reported</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: is_stale ? "#94a3b8" : "#f1f5f9" }}>
              {formatAge(age_seconds)}
            </p>
          </div>
        </div>

        {/* Reasoning */}
        {reasoning && (
          <p style={{
            fontSize: 11,
            color: "#94a3b8",
            lineHeight: 1.5,
            borderTop: "1px solid #334155",
            paddingTop: 8,
          }}>
            {reasoning}
          </p>
        )}
      </div>
    </div>
  );
}

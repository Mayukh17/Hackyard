import React from "react";

export default function Header({ reportCount, onToggleStale, showStale, lastUpdated }) {
  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      background: "rgba(15,23,42,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #334155",
    }}>
      {/* Logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>💧</span>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
            FloodLens
          </h1>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1 }}>
            Road waterlogging map
          </p>
        </div>
      </div>

      {/* Stats + controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {lastUpdated && (
          <span style={{ fontSize: 11, color: "#64748b" }}>
            Updated {lastUpdated}
          </span>
        )}
        <span style={{
          fontSize: 12,
          color: "#94a3b8",
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 20,
          padding: "3px 10px",
        }}>
          {reportCount} report{reportCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onToggleStale}
          title={showStale ? "Hide stale reports" : "Show all reports including stale (>2h old)"}
          style={{
            fontSize: 11,
            color: showStale ? "#3b82f6" : "#64748b",
            background: "transparent",
            border: `1px solid ${showStale ? "#3b82f6" : "#334155"}`,
            borderRadius: 20,
            padding: "3px 10px",
            cursor: "pointer",
          }}
        >
          {showStale ? "⚫ Showing stale" : "Show stale"}
        </button>
      </div>
    </header>
  );
}

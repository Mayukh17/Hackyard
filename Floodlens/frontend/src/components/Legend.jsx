import React from "react";

const items = [
  { color: "#22c55e", label: "Clear", desc: "Road passable" },
  { color: "#f59e0b", label: "Caution", desc: "Drive slowly" },
  { color: "#ef4444", label: "Avoid", desc: "Unsafe / flooded" },
  { color: "#94a3b8", label: "Stale", desc: "> 2 hours old" },
];

export default function Legend() {
  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      left: 16,
      zIndex: 1000,
      background: "rgba(15,23,42,0.92)",
      backdropFilter: "blur(12px)",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: "10px 14px",
      minWidth: 160,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Legend
      </p>
      {items.map(({ color, label, desc }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 11, color: "#64748b" }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Returns display config for a severity level.
 */
export function getSeverityConfig(severity, isStale = false) {
  if (isStale) {
    return {
      color: "#94a3b8",
      label: "Stale",
      emoji: "⚫",
      bg: "rgba(148,163,184,0.15)",
    };
  }
  switch (severity) {
    case "clear":
      return { color: "#22c55e", label: "Clear", emoji: "🟢", bg: "rgba(34,197,94,0.15)" };
    case "caution":
      return { color: "#f59e0b", label: "Caution", emoji: "🟡", bg: "rgba(245,158,11,0.15)" };
    case "avoid":
      return { color: "#ef4444", label: "Avoid", emoji: "🔴", bg: "rgba(239,68,68,0.15)" };
    default:
      return { color: "#94a3b8", label: "Unknown", emoji: "⚪", bg: "rgba(148,163,184,0.15)" };
  }
}

/**
 * Format seconds into a human-readable "X mins ago" string.
 */
export function formatAge(seconds) {
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Create a Leaflet divIcon for a severity marker.
 */
export function createMarkerIcon(severity, isStale = false) {
  // Dynamically imported in the component to avoid SSR issues
  const L = window.L;
  if (!L) return null;

  const { color, emoji } = getSeverityConfig(severity, isStale);
  const size = isStale ? 28 : 36;
  const opacity = isStale ? 0.5 : 1;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        opacity: ${opacity};
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        <span style="
          display:block;
          transform: rotate(45deg);
          text-align:center;
          line-height:${size - 4}px;
          font-size:${size * 0.45}px;
        ">${severity === "clear" ? "✓" : severity === "caution" ? "!" : "✕"}</span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

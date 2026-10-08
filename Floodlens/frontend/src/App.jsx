import React, { useState, useEffect, useCallback, useRef } from "react";
import FloodMap from "./components/FloodMap";
import UploadModal from "./components/UploadModal";
import Header from "./components/Header";
import Legend from "./components/Legend";
import { fetchReports } from "./api";

const REFRESH_INTERVAL_MS = 60_000; // auto-refresh every 60 seconds

export default function App() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [latestReport, setLatestReport] = useState(null);
  const [showStale, setShowStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);
  const intervalRef = useRef(null);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports(showStale);
      setReports(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      showToast("⚠️ Could not refresh reports", "warn");
    }
  }, [showStale]);

  // Initial load + periodic refresh
  useEffect(() => {
    loadReports();
    intervalRef.current = setInterval(loadReports, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [loadReports]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSuccess = (report) => {
    setLatestReport(report);
    setReports((prev) => [report, ...prev]);
    setShowModal(false);
    const severityLabel = report.severity.charAt(0).toUpperCase() + report.severity.slice(1);
    showToast(`${severityLabel} — ${report.reasoning}`, "success");
  };

  const toastColors = {
    success: "#22c55e",
    warn: "#f59e0b",
    info: "#3b82f6",
  };

  return (
    <>
      <Header
        reportCount={reports.length}
        onToggleStale={() => setShowStale((v) => !v)}
        showStale={showStale}
        lastUpdated={lastUpdated}
      />

      <FloodMap reports={reports} latestReport={latestReport} />

      <Legend />

      {/* FAB — report button */}
      <button
        onClick={() => setShowModal(true)}
        title="Report road condition"
        style={{
          position: "fixed",
          bottom: 28,
          right: 20,
          zIndex: 2000,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "white",
          border: "none",
          fontSize: 26,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(59,130,246,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        📷
      </button>

      {/* Upload modal */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3000,
          background: "#1e293b",
          border: `1px solid ${toastColors[toast.type]}`,
          borderRadius: 10,
          padding: "10px 18px",
          maxWidth: 340,
          fontSize: 13,
          color: "#f1f5f9",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          lineHeight: 1.4,
          textAlign: "center",
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
}

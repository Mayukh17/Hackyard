import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import ReportPopup from "./ReportPopup";
import { getSeverityConfig } from "../utils";

// Guwahati, Assam — default map centre
const DEFAULT_CENTER = [26.1445, 91.7362];
const DEFAULT_ZOOM = 13;

/**
 * Fly to a newly added report.
 */
function FlyToReport({ report }) {
  const map = useMap();
  useEffect(() => {
    if (report) {
      map.flyTo([report.lat, report.lng], 15, { duration: 1.2 });
    }
  }, [report, map]);
  return null;
}

export default function FloodMap({ reports, latestReport }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100vh", width: "100vw" }}
      zoomControl={true}
    >
      {/* Dark tile layer (Carto Dark Matter) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />

      {reports.map((report) => {
        const cfg = getSeverityConfig(report.severity, report.is_stale);
        const radius = report.is_stale ? 8 : 11;

        return (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={radius}
            pathOptions={{
              color: cfg.color,
              fillColor: cfg.color,
              fillOpacity: report.is_stale ? 0.35 : 0.8,
              weight: 2,
            }}
          >
            <Popup minWidth={240} maxWidth={280}>
              <ReportPopup report={report} />
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Fly to latest submitted report */}
      {latestReport && <FlyToReport report={latestReport} />}
    </MapContainer>
  );
}

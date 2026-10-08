const BASE = "/api";

/**
 * Fetch all reports from the backend.
 * @param {boolean} includeStale - include reports older than 2 hours
 * @returns {Promise<Array>}
 */
export async function fetchReports(includeStale = false) {
  const url = `${BASE}/reports?include_stale=${includeStale}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.statusText}`);
  return res.json();
}

/**
 * Submit a new road condition report.
 * @param {File} imageFile
 * @param {number} lat
 * @param {number} lng
 * @param {string|null} locationLabel
 * @returns {Promise<Object>} - the created report
 */
export async function submitReport(imageFile, lat, lng, locationLabel = null) {
  const form = new FormData();
  form.append("image", imageFile);
  form.append("lat", String(lat));
  form.append("lng", String(lng));
  if (locationLabel) form.append("location_label", locationLabel);

  const res = await fetch(`${BASE}/report`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Submission failed");
  }
  return res.json();
}

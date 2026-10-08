# 💧 FloodLens

**Community-powered road waterlogging assessment for flood-prone cities.**

Upload a road photo → Gemini Vision classifies the waterlogging severity → pin appears on a live map. Built for the last-mile problem: knowing whether *your specific street* is passable right now.

---

## Features

- 📷 Upload or capture road photos directly from mobile
- 🤖 Gemini 1.5 Flash Vision classifies severity: **Clear / Caution / Avoid**
- 🗺 Live Leaflet map with color-coded markers centred on Guwahati
- ⏱ Staleness indicator — reports older than 2 hours fade to grey
- 📍 Optional location label and GPS coordinate input
- 🔄 Auto-refreshes every 60 seconds
- 🗄 Local SQLite + disk storage by default; Supabase for production

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Python · FastAPI · SQLAlchemy (async) · aiosqlite |
| Vision | Google Gemini 1.5 Flash (via `google-generativeai`) |
| Storage | SQLite (local) or Supabase (production) |
| Frontend | React 18 · Vite · Leaflet · react-leaflet |
| Deployment | Render (backend) · Render Static Sites (frontend) |

---

## Quick Start

### 1. Clone and set up environment

```bash
git clone <your-repo-url>
cd Floodlens
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

```bash
# (Optional) Seed demo data around Guwahati
python seed.py

# Start the backend
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. The Vite dev proxy forwards `/api` to the backend automatically.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/report` | Submit image + coords → classify → store |
| `GET` | `/api/reports` | Fetch all reports (supports bbox + stale filters) |
| `DELETE` | `/api/report/{id}` | Delete a report |
| `GET` | `/api/health` | Health check |

### POST `/api/report`

Form-data body:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✅ | Road photo (JPEG/PNG/WebP, max 10 MB) |
| `lat` | float | ✅ | Latitude |
| `lng` | float | ✅ | Longitude |
| `location_label` | string | ❌ | Human-readable location name |

Response:
```json
{
  "id": "uuid",
  "lat": 26.1445,
  "lng": 91.7362,
  "severity": "caution",
  "confidence": 0.82,
  "water_coverage_pct": 38,
  "reasoning": "Partial waterlogging observed; road visible but slow driving advised.",
  "image_url": "/images/abc123.jpg",
  "location_label": "Uzanbazar",
  "created_at": "2026-10-24T10:30:00+00:00",
  "age_seconds": 12,
  "is_stale": false
}
```

---

## Production Deployment (Render)

### Backend

1. Create a new **Web Service** on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`

### Frontend

1. Create a new **Static Site** on Render
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_BASE=https://your-backend.onrender.com`

Then update `frontend/src/api.js` to use:
```js
const BASE = import.meta.env.VITE_API_BASE || "/api";
```

### Supabase Storage Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Storage** → create a bucket named `floodlens-images`
3. Set the bucket to **Public**
4. Copy your project URL and anon key into `.env`

---

## Project Structure

```
Floodlens/
├── backend/
│   ├── main.py            # FastAPI app, routes
│   ├── models.py          # SQLAlchemy models + DB init
│   ├── vision.py          # Gemini Vision classification
│   ├── storage.py         # Image storage (Supabase or local)
│   ├── config.py          # Env config
│   ├── seed.py            # Demo data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Root component, state, auto-refresh
│   │   ├── api.js         # fetch wrappers
│   │   ├── utils.js       # severity config, formatting
│   │   ├── index.css      # Global styles
│   │   └── components/
│   │       ├── FloodMap.jsx     # Leaflet map + markers
│   │       ├── UploadModal.jsx  # Image upload + submission flow
│   │       ├── ReportPopup.jsx  # Marker popup content
│   │       ├── Header.jsx       # Top bar
│   │       └── Legend.jsx       # Map legend
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Judging Criteria Alignment

| Criterion | How FloodLens addresses it |
|-----------|---------------------------|
| **Build (40%)** | Working end-to-end prototype: image → AI classification → map pin |
| **Problem (20%)** | Solves the last-mile gap for commuters in flood-prone cities like Guwahati |
| **Ingenuity (20%)** | Community crowdsourcing + AI vision + staleness-aware map in one flow |
| **Potential (20%)** | Extensible to pothole detection, damage assessment, municipal monitoring |

---

Built at **Hackyard Build 2026 · IIT Guwahati**

"""
FloodLens — FastAPI backend
Endpoints:
  POST /api/report   — upload image + coords → classify → store → return report
  GET  /api/reports  — fetch all reports (optionally filter by bounding box)
  GET  /api/health   — health check
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import Report, init_db, get_db
from vision import classify_image
from storage import save_image
from config import LOCAL_IMAGE_DIR


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="FloodLens API", version="1.0.0", lifespan=lifespan)

# CORS — allow the Vite dev server and any origin in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve locally stored images
app.mount("/images", StaticFiles(directory=LOCAL_IMAGE_DIR), name="images")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def report_to_dict(r: Report) -> dict:
    created_at = r.created_at
    # Ensure timezone-aware for age calculation
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    age_seconds = int((datetime.now(timezone.utc) - created_at).total_seconds())
    is_stale = age_seconds > 7200  # older than 2 hours

    return {
        "id": r.id,
        "lat": r.lat,
        "lng": r.lng,
        "severity": r.severity,
        "confidence": round(r.confidence, 3),
        "water_coverage_pct": r.water_coverage_pct,
        "reasoning": r.reasoning,
        "image_url": r.image_url,
        "location_label": r.location_label,
        "created_at": created_at.isoformat(),
        "age_seconds": age_seconds,
        "is_stale": is_stale,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "FloodLens API"}


@app.post("/api/report", status_code=201)
async def create_report(
    image: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...),
    location_label: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Accept a road image + GPS coordinates, run vision classification,
    persist the report, and return the result.
    """
    # Validate file type
    if image.content_type not in ("image/jpeg", "image/png", "image/webp", "image/heic"):
        raise HTTPException(
            status_code=415,
            detail="Unsupported image type. Use JPEG, PNG, WebP, or HEIC.",
        )

    # Validate coordinates
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=422, detail="Invalid coordinates.")

    image_bytes = await image.read()

    if len(image_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="Image too large. Max 10 MB.")

    # Run vision classification
    try:
        classification = await classify_image(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Vision model error: {str(e)}")

    # Save image
    try:
        image_url = await save_image(image_bytes, image.content_type)
    except Exception as e:
        image_url = None  # non-fatal — report still saved without image URL

    # Persist report
    report = Report(
        lat=lat,
        lng=lng,
        severity=classification["severity"],
        confidence=classification["confidence"],
        water_coverage_pct=classification["water_coverage_pct"],
        reasoning=classification["reasoning"],
        image_url=image_url,
        location_label=location_label,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report_to_dict(report)


@app.get("/api/reports")
async def get_reports(
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lng: Optional[float] = None,
    max_lng: Optional[float] = None,
    include_stale: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    Return all reports. Optionally filter by bounding box and staleness.
    Stale = older than 2 hours. Fresh reports are returned by default.
    """
    query = select(Report).order_by(Report.created_at.desc())

    if not include_stale:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
        query = query.where(Report.created_at >= cutoff)

    if min_lat is not None:
        query = query.where(Report.lat >= min_lat)
    if max_lat is not None:
        query = query.where(Report.lat <= max_lat)
    if min_lng is not None:
        query = query.where(Report.lng >= min_lng)
    if max_lng is not None:
        query = query.where(Report.lng <= max_lng)

    result = await db.execute(query)
    reports = result.scalars().all()
    return [report_to_dict(r) for r in reports]


@app.delete("/api/report/{report_id}", status_code=204)
async def delete_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a report by ID (admin/demo use)."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    await db.delete(report)
    await db.commit()

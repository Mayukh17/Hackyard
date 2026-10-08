"""
Vision module — calls Gemini 1.5 Flash to classify road waterlogging severity.
Uses the google-genai SDK (Python 3.14 compatible).
"""

import json
import re
import io
from PIL import Image
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

# Initialise client once at module load
_client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a road condition analyst specializing in urban flood assessment.
Analyze the road image provided and return ONLY a valid JSON object — no markdown, no explanation.

JSON schema:
{
  "severity": "clear" | "caution" | "avoid",
  "water_coverage_pct": <integer 0-100>,
  "confidence": <float 0.0-1.0>,
  "reasoning": "<one concise sentence explaining your assessment>"
}

Severity definitions:
- "clear":   No visible water or only negligible puddles. Road surface fully visible. Safe to drive.
- "caution": Partial waterlogging. Road surface partially visible. Slow driving possible but care needed.
- "avoid":   Significant waterlogging. Road surface not fully visible or submerged. Unsafe to drive.

Be conservative: if you are unsure between "caution" and "avoid", choose "avoid".
If the image does not show a road clearly, set confidence below 0.5 and default to "caution".
"""


def _extract_json(text: str) -> dict:
    """Extract JSON from model response, handling any extra text."""
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Strip markdown fences if present
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))

    # Find first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError(f"Could not extract JSON from model response: {text[:300]}")


async def classify_image(image_bytes: bytes) -> dict:
    """
    Classify road waterlogging severity from raw image bytes.

    Returns:
        {
            "severity": "clear" | "caution" | "avoid",
            "water_coverage_pct": int,
            "confidence": float,
            "reasoning": str
        }
    """
    # Load and validate image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid or unreadable image: {e}")

    # Convert PIL image back to bytes for the API
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    response = _client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            types.Part.from_text(text=SYSTEM_PROMPT),
            types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
        ],
        config=types.GenerateContentConfig(
            temperature=0.1,
            max_output_tokens=256,
        ),
    )

    raw_text = response.text.strip()
    result = _extract_json(raw_text)

    # Validate and normalise fields
    if result.get("severity") not in ("clear", "caution", "avoid"):
        result["severity"] = "caution"

    result["water_coverage_pct"] = max(0, min(100, int(result.get("water_coverage_pct", 0))))
    result["confidence"] = max(0.0, min(1.0, float(result.get("confidence", 0.5))))
    result["reasoning"] = str(result.get("reasoning", "No reasoning provided."))

    return result

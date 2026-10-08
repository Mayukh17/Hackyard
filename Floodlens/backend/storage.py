"""
Storage module — saves uploaded images to local disk and returns a URL.
Supabase support can be re-added once the httpx version conflict is resolved upstream.
"""

import os
import uuid
from config import LOCAL_IMAGE_DIR


async def save_image(image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    """
    Save image bytes to local disk and return a relative URL served by FastAPI.
    """
    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(LOCAL_IMAGE_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return f"/images/{filename}"

import os
from dotenv import load_dotenv

load_dotenv()

# Gemini Vision
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Storage mode: local disk only (Supabase can be re-added later)
STORAGE_MODE = "local"

# Local image storage path
LOCAL_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "uploaded_images")
os.makedirs(LOCAL_IMAGE_DIR, exist_ok=True)

# SQLite DB path
DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(__file__), 'floodlens.db')}"

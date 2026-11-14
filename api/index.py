import os
import sys

# Ensure backend directory is discoverable by Python on Vercel Serverless
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault("VERCEL", "1")

from app.main import app

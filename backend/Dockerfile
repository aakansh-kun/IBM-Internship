# ==============================================================================
# Dockerfile for Medicraft FastAPI Health AI & ML Processing Layer
# Lightweight, reproducible Python environment for ML models, RAG, and LLM services
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing bytecode and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Copy dependency manifest first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies without caching wheel files to keep image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code, ML models, and clinical knowledge base
COPY . .

# Expose backend API port
EXPOSE 8000

# Standard Docker container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start Uvicorn server bound to all interfaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

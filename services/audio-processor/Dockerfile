FROM python:3.11-slim

# System deps for Demucs + librosa + soundfile
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and setuptools
RUN pip install --upgrade pip "setuptools>=68" wheel

# Install dependencies directly (skip package build entirely)
RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.32.0" \
    "python-multipart>=0.0.12" \
    "demucs>=4.0.1" \
    "basic-pitch>=0.3.5" \
    "librosa>=0.10.2" \
    "numpy>=1.26.0" \
    "soundfile>=0.12.1" \
    "httpx>=0.27.0" \
    "python-dotenv>=1.0.0"

# Pre-download Demucs htdemucs model weights at build time
RUN python -c "import demucs.pretrained; demucs.pretrained.get_model('htdemucs')"

# Copy source
COPY src/ ./src/

ENV ENV=production
ENV AUDIO_PROCESSOR_PORT=5001
ENV PYTHONPATH=/app

EXPOSE 5001

CMD ["python", "-m", "src.main"]
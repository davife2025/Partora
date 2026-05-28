FROM python:3.11-slim

# System deps for Demucs + librosa + soundfile
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and setuptools first
RUN pip install --upgrade pip setuptools wheel

# Install Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Pre-download Demucs htdemucs model weights at build time
RUN python -c "import demucs.pretrained; demucs.pretrained.get_model('htdemucs')"

# Copy source
COPY src/ ./src/

ENV ENV=production
ENV AUDIO_PROCESSOR_PORT=5001

EXPOSE 5001

CMD ["python", "-m", "src.main"]
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/fonts \
    && ln -sf /usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc /usr/local/share/fonts/NotoSansCJK-Regular.ttc

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY app /app/app

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}


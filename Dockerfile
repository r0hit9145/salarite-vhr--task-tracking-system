# ---- Stage 1: build the React frontend ----
FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Python backend + built frontend ----
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir --default-timeout=100 --retries=5 -r backend/requirements.txt

COPY backend/ backend/
COPY --from=frontend /build/dist frontend/dist

WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Hosts like Render provide the port in $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
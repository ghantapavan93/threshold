FROM python:3.13-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt "psycopg[binary]==3.2.3"
COPY . .
EXPOSE 8000
# Shell form so ${PORT} expands (Render/Fly inject it; default 8000 locally) and
# migrations run against the real database before the API starts serving.
CMD alembic upgrade head && python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

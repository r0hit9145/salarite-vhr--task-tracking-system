from fastapi import FastAPI
from .database import Base, engine
from . import models  # noqa: F401  (ensures models are registered before create_all)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salarite Virtual HR")


@app.get("/api/health")
def health():
    return {"status": "ok"}
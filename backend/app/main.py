from fastapi import FastAPI

from . import models  # noqa: F401  (ensures models are registered before create_all)
from .database import Base, engine
from .routers import auth as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salarite Virtual HR")

app.include_router(auth_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
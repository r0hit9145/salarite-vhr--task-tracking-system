from fastapi import FastAPI

from . import models  # noqa: F401  (ensures models are registered before create_all)
from .database import Base, engine
from .routers import auth as auth_router
from .routers import tasks as tasks_router
from .routers import users as users_router
from .routers import interviews as interviews_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salarite Virtual HR")

app.include_router(auth_router.router)
app.include_router(tasks_router.router)
app.include_router(users_router.router)
app.include_router(interviews_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
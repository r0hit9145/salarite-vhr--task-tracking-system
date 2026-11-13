from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import models  # noqa: F401
from .database import Base, engine
from .routers import auth as auth_router
from .routers import interviews as interviews_router
from .routers import tasks as tasks_router
from .routers import users as users_router
from .seed import seed_demo_data

# <project root>/frontend/dist, which exists after `npm run build`
FRONTEND_DIST = (Path(__file__).resolve().parents[2] / "frontend" / "dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_demo_data()   # recreate demo users on startup (free hosts wipe the DB file)
    yield


app = FastAPI(title="Salarite Virtual HR", lifespan=lifespan)

app.include_router(auth_router.router)
app.include_router(tasks_router.router)
app.include_router(users_router.router)
app.include_router(interviews_router.router)



@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve the React app. This must stay LAST so it never blocks the API routes.
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = (FRONTEND_DIST / full_path).resolve()
        if full_path and candidate.is_file() and FRONTEND_DIST in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
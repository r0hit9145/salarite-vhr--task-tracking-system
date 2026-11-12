from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./salarite.db"

# check_same_thread=False is needed because FastAPI handles requests in multiple threads
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency: gives each request its own DB session and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
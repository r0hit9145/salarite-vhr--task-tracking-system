from app.database import Base, engine
from app.seed import seed_demo_data

Base.metadata.create_all(bind=engine)
seed_demo_data()
print("Seed complete.")
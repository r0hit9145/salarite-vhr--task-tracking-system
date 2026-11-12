from app.database import SessionLocal, Base, engine
from app.models import User, Task, TaskUpdate
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).count() == 0:
    employer = User(name="Acme Employer", email="employer@salarite.com",
                    password_hash=hash_password("employer123"), role="employer")
    hr1 = User(name="Priya (Virtual HR)", email="hr1@salarite.com",
               password_hash=hash_password("hr123"), role="hr")
    hr2 = User(name="Rahul (Virtual HR)", email="hr2@salarite.com",
               password_hash=hash_password("hr123"), role="hr")
    db.add_all([employer, hr1, hr2])
    db.commit()

    t1 = Task(title="Screen 20 resumes for Backend role", description="Shortlist top 5 for Python/FastAPI.",
              priority="high", assigned_to=hr1.id, created_by=employer.id)
    t2 = Task(title="Schedule round-1 interviews", description="Coordinate with shortlisted candidates.",
              priority="medium", assigned_to=hr2.id, created_by=employer.id)
    db.add_all([t1, t2])
    db.commit()
    print("Seeded demo data.")
else:
    print("Data already exists, skipping seed.")

db.close()
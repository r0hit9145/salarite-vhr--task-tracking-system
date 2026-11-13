from .database import SessionLocal
from .models import Task, TaskUpdate, User
from .security import hash_password


def seed_demo_data() -> None:
    """Create demo users and tasks if the database is empty. Safe to call on every startup."""
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        employer = User(name="Acme Employer", email="employer@salarite.com",
                        password_hash=hash_password("employer123"), role="employer")
        hr1 = User(name="Priya (Virtual HR)", email="hr1@salarite.com",
                   password_hash=hash_password("hr123"), role="hr")
        hr2 = User(name="Rahul (Virtual HR)", email="hr2@salarite.com",
                   password_hash=hash_password("hr123"), role="hr")
        db.add_all([employer, hr1, hr2])
        db.commit()

        t1 = Task(title="Screen 20 resumes for Backend role",
                  description="Shortlist top 5 for Python/FastAPI.",
                  priority="high", assigned_to=hr1.id, created_by=employer.id)
        t2 = Task(title="Schedule round-1 interviews",
                  description="Coordinate with shortlisted candidates.",
                  priority="medium", assigned_to=hr2.id, created_by=employer.id)
        db.add_all([t1, t2])
        db.commit()

        db.add_all([
            TaskUpdate(task_id=t1.id, updated_by=employer.id, status="pending",

                       note=f"Task assigned to {hr1.name}"),
            TaskUpdate(task_id=t2.id, updated_by=employer.id, status="pending",
                       note=f"Task assigned to {hr2.name}"),
        ])
        db.commit()
    finally:
        db.close()
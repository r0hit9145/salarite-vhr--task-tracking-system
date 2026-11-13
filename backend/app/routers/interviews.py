from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Interview, Task, TaskUpdate, User, utcnow
from ..schemas import InterviewCreate, InterviewOut, InterviewStatus, InterviewStatusUpdate

router = APIRouter(prefix="/api/interviews", tags=["interviews"])

SLOT_MINUTES = 30


def naive_utcnow():
    # scheduled_at is stored as naive UTC, so compare against naive UTC
    return utcnow().replace(tzinfo=None)


def load_interview_for_user(db: Session, interview_id: int, user: User) -> Interview:
    interview = (
        db.query(Interview)
        .options(joinedload(Interview.hr))
        .filter(Interview.id == interview_id)
        .first()
    )
    if interview is None or (user.role == "hr" and interview.hr_id != user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Interview not found")
    return interview



@router.get("", response_model=list[InterviewOut])
def list_interviews(
    status_filter: InterviewStatus | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Interview).options(joinedload(Interview.hr))
    if user.role == "hr":
        query = query.filter(Interview.hr_id == user.id)
    if status_filter:
        query = query.filter(Interview.status == status_filter)
    return query.order_by(Interview.scheduled_at.asc()).all()


@router.post("", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
def schedule_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    hr: User = Depends(require_role("hr")),
):
    if data.scheduled_at <= naive_utcnow():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Interview must be scheduled in the future")

    task = None
    if data.task_id is not None:
        task = db.get(Task, data.task_id)
        if task is None or task.assigned_to != hr.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")

    # Prevent double-booking: no other scheduled interview within 30 minutes for this HR
    window = timedelta(minutes=SLOT_MINUTES)
    clash = (

        db.query(Interview)
        .filter(
            Interview.hr_id == hr.id,
            Interview.status == "scheduled",
            Interview.scheduled_at > data.scheduled_at - window,
            Interview.scheduled_at < data.scheduled_at + window,
        )
        .first()
    )
    if clash:
        raise HTTPException(status.HTTP_409_CONFLICT, "You already have an interview in that time slot")

    interview = Interview(**data.model_dump(), hr_id=hr.id)
    db.add(interview)

    # If linked to a task, log it so the employer sees it live in the task's activity feed
    if task is not None:
        db.add(TaskUpdate(
            task_id=task.id, updated_by=hr.id, status=task.status,
            note=f"Scheduled {data.mode} interview with {data.candidate_name}",
        ))
        task.updated_at = utcnow()

    db.commit()
    db.refresh(interview)
    return interview


@router.patch("/{interview_id}/status", response_model=InterviewOut)
def update_interview_status(
    interview_id: int,
    data: InterviewStatusUpdate,

    db: Session = Depends(get_db),
    hr: User = Depends(require_role("hr")),
):
    interview = load_interview_for_user(db, interview_id, hr)
    if interview.status != "scheduled":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Interview is already {interview.status}")

    interview.status = data.status
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/start")
def start_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    hr: User = Depends(require_role("hr")),
):
    """Placeholder for the inbuilt calling system (voice / video / chat)."""
    interview = load_interview_for_user(db, interview_id, hr)
    if interview.status != "scheduled":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Interview is already {interview.status}")

    return {
        "interview_id": interview.id,
        "mode": interview.mode,
        "room_id": f"room-{interview.id}-{interview.mode}",
        "message": f"Placeholder {interview.mode} session ready. The inbuilt calling integration plugs in here.",
    }
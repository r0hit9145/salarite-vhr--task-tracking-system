from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Task, TaskUpdate, User, utcnow
from ..schemas import StatusUpdateRequest, TaskCreate, TaskDetailOut, TaskOut

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def load_task_for_user(db: Session, task_id: int, user: User) -> Task:
    """Fetch a task and enforce that an HR can only touch their own tasks."""
    task = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.updates).joinedload(TaskUpdate.author))
        .filter(Task.id == task_id)
        .first()
    )
    if task is None or (user.role == "hr" and task.assigned_to != user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Task).options(joinedload(Task.assignee))
    if user.role == "hr":
        query = query.filter(Task.assigned_to == user.id)   # HR sees only their own tasks
    if status_filter:
        query = query.filter(Task.status == status_filter)
    return query.order_by(Task.updated_at.desc()).all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    employer: User = Depends(require_role("employer")),
):
    assignee = db.get(User, data.assigned_to)
    if assignee is None or assignee.role != "hr":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "assigned_to must be a valid Virtual HR user")

    task = Task(**data.model_dump(), created_by=employer.id)
    db.add(task)
    db.flush()  # gives task.id without committing yet

    # First entry in the activity log, so the timeline never starts empty
    db.add(TaskUpdate(task_id=task.id, updated_by=employer.id, status="pending",
                      note=f"Task assigned to {assignee.name}"))
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskDetailOut)
def get_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return load_task_for_user(db, task_id, user)


@router.patch("/{task_id}/status", response_model=TaskDetailOut)
def update_task_status(
    task_id: int,
    data: StatusUpdateRequest,
    db: Session = Depends(get_db),
    hr: User = Depends(require_role("hr")),
):
    task = load_task_for_user(db, task_id, hr)

    task.status = data.status
    task.updated_at = utcnow()   # bump even when only a note changed
    db.add(TaskUpdate(task_id=task.id, updated_by=hr.id, status=data.status, note=data.note))
    db.commit()
    db.refresh(task)
    return task
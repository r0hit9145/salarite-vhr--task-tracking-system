from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

TaskStatus = Literal["pending", "in_progress", "done"]
Priority = Literal["low", "medium", "high"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Task updates
# ---------- Tasks ----------
class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = ""
    priority: Priority = "medium"
    due_date: date | None = None
    assigned_to: int


class StatusUpdateRequest(BaseModel):
    status: TaskStatus
    note: str = ""


class TaskUpdateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    note: str
    created_at: datetime
    author: UserOut


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    priority: str
    status: str
    due_date: date | None
    created_at: datetime
    updated_at: datetime
    assignee: UserOut


class TaskDetailOut(TaskOut):
    updates: list[TaskUpdateOut]


# ---------- Interviews ----------
InterviewMode = Literal["voice", "video", "chat"]
InterviewStatus = Literal["scheduled", "completed", "cancelled"]


class InterviewCreate(BaseModel):
    candidate_name: str = Field(min_length=2, max_length=100)
    candidate_email: EmailStr
    mode: InterviewMode
    scheduled_at: datetime
    task_id: int | None = None

    @field_validator("scheduled_at")
    @classmethod
    def normalize_to_naive_utc(cls, v: datetime) -> datetime:
        # SQLite stores naive datetimes, so we convert everything to UTC and drop tzinfo
        if v.tzinfo is not None:
            v = v.astimezone(timezone.utc).replace(tzinfo=None)
        return v


class InterviewStatusUpdate(BaseModel):
    status: Literal["completed", "cancelled"]   # you can't "re-schedule" through this endpoint


class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_name: str
    candidate_email: str
    mode: str

    scheduled_at: datetime
    status: str
    task_id: int | None
    created_at: datetime
    hr: UserOut
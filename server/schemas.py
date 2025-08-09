from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MeOut(BaseModel):
    id: str
    email: str
    name: Optional[str]

class ProjectCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    privacy: Optional[str] = "org"
    default_language: Optional[str] = "en"
    default_model: Optional[str] = "OpenAI"
    budget_cap: Optional[float] = 0.0
    auto_start: Optional[bool] = False

class ProjectOut(BaseModel):
    id: str
    name: str
    status: Optional[str] = "Active"
    docs: Optional[int] = 0
    cost: Optional[str] = "$0.00"
    updated: Optional[str] = "just now"

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    file_name: str
    size: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProcessingStatus(BaseModel):
    progress: float
    stage: str
    events: List[str] = []


class BoardSnapshotCreate(BaseModel):
    snapshot: dict


class BoardSnapshotOut(BaseModel):
    id: str
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class ShareLinkOut(BaseModel):
    url: str


class BoardSnapshotDetail(BaseModel):
    id: str
    version: int
    created_at: datetime
    snapshot: dict

class ProjectDetail(BaseModel):
    id: str
    name: str
    slug: Optional[str]
    privacy: Optional[str]
    default_language: Optional[str]
    default_model: Optional[str]
    budget_cap: Optional[float]
    cost: Optional[float]
    status: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

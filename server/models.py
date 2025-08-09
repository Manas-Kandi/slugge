from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, ForeignKey, Boolean
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    privacy = Column(String, default="org")
    default_language = Column(String, default="en")
    default_model = Column(String, default="OpenAI")
    budget_cap = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ShareToken(Base):
    __tablename__ = "share_tokens"

    token = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    revoked = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    file_name = Column(String, nullable=False)
    size = Column(Integer, default=0)
    status = Column(String, default="Uploaded")
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BoardSnapshot(Base):
    __tablename__ = "board_snapshots"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    version = Column(Integer, default=1)
    snapshot_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

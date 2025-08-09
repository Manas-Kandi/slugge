import os
import uuid
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from .models import Project, Document, BoardSnapshot, ShareToken
from .schemas import (
    MeOut,
    ProjectCreate,
    ProjectOut,
    ProjectDetail,
    DocumentOut,
    ProcessingStatus,
    BoardSnapshotCreate,
    BoardSnapshotOut,
    BoardSnapshotDetail,
    ShareLinkOut,
)

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# ----- DB setup -----
Base.metadata.create_all(bind=engine)

# ----- FastAPI app -----
app = FastAPI(title="Slugge API", version="0.1.0")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
SHARE_BASE_URL = os.getenv("SHARE_BASE_URL", "http://localhost:5173/share")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Dependencies -----

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----- Health -----

@app.get("/v1/healthz")
async def healthz():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

# ----- Auth stubs -----

class LoginIn(BaseModel):
    email: str
    password: str

@app.get("/v1/me", response_model=MeOut)
async def me():
    # Stubbed auth: always return a demo user in dev
    if DEMO_MODE:
        return MeOut(id="demo", email="demo@slugge.dev", name="Demo User")
    raise HTTPException(status_code=401, detail="Not implemented")

@app.post("/v1/auth/login", response_model=MeOut)
async def login(_body: LoginIn):
    if DEMO_MODE:
        return MeOut(id="demo", email="demo@slugge.dev", name="Demo User")
    raise HTTPException(status_code=501, detail="Login not implemented")

@app.post("/v1/auth/signup", response_model=MeOut)
async def signup(_body: dict):
    if DEMO_MODE:
        return MeOut(id="demo", email="demo@slugge.dev", name="Demo User")
    raise HTTPException(status_code=501, detail="Signup not implemented")

# ----- Projects -----

@app.get("/v1/projects", response_model=List[ProjectOut])
async def list_projects(db: Session = Depends(get_db)):
    rows = db.query(Project).order_by(Project.created_at.desc()).all()
    def to_out(p: Project) -> ProjectOut:
        return ProjectOut(
            id=p.id,
            name=p.name,
            status=p.status or "Active",
            docs=0,
            cost=f"${(p.cost or 0.0):.2f}",
            updated="just now",
        )
    return [to_out(p) for p in rows]

@app.post("/v1/projects", response_model=ProjectDetail)
async def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    # choose id as provided slug or random short id
    pid = (body.slug or uuid.uuid4().hex[:8]).lower()
    # ensure uniqueness
    existing = db.query(Project).filter(Project.id == pid).first()
    if existing:
        pid = f"{pid}-{uuid.uuid4().hex[:4]}"
    proj = Project(
        id=pid,
        name=body.name.strip(),
        slug=(body.slug or pid).lower(),
        privacy=body.privacy or "org",
        default_language=body.default_language or "en",
        default_model=body.default_model or "OpenAI",
        budget_cap=body.budget_cap or 0.0,
        cost=0.0,
        status="Active",
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return ProjectDetail(
        id=proj.id,
        name=proj.name,
        slug=proj.slug,
        privacy=proj.privacy,
        default_language=proj.default_language,
        default_model=proj.default_model,
        budget_cap=proj.budget_cap,
        cost=proj.cost,
        status=proj.status,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
    )

@app.get("/v1/projects/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectDetail(
        id=proj.id,
        name=proj.name,
        slug=proj.slug,
        privacy=proj.privacy,
        default_language=proj.default_language,
        default_model=proj.default_model,
        budget_cap=proj.budget_cap,
        cost=proj.cost,
        status=proj.status,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
    )

@app.delete("/v1/projects/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"ok": True}


# ----- Documents (M4) -----

@app.post("/v1/projects/{project_id}/documents", response_model=DocumentOut)
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    doc_id = uuid.uuid4().hex
    raw = await file.read()
    text: str | None = None
    try:
        # best-effort decode
        text = raw.decode("utf-8")
    except Exception:
        text = None
    doc = Document(
        id=doc_id,
        project_id=project_id,
        file_name=file.filename,
        size=len(raw),
        status="Uploaded",
        content=text,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


@app.get("/v1/projects/{project_id}/documents", response_model=List[DocumentOut])
async def list_documents(project_id: str, db: Session = Depends(get_db)):
    rows = db.query(Document).filter(Document.project_id == project_id).order_by(Document.created_at.desc()).all()
    return [DocumentOut.model_validate(r) for r in rows]


@app.delete("/v1/projects/{project_id}/documents/{doc_id}")
async def delete_document(project_id: str, doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.project_id == project_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"ok": True}


# ----- Processing (M5) -----

PROCESS: Dict[str, Dict[str, Any]] = {}

async def _simulate_processing(project_id: str):
    PROCESS[project_id] = {"progress": 0.0, "stage": "Queued", "events": []}
    stages = [
        ("Normalizing transcripts", 0.35),
        ("Chunking & embedding", 0.70),
        ("Generating themes", 0.90),
        ("Finalizing", 1.0),
    ]
    for stage, target in stages:
        PROCESS[project_id]["stage"] = stage
        while PROCESS[project_id]["progress"] < target:
            await asyncio.sleep(0.5)
            PROCESS[project_id]["progress"] = round(min(target, PROCESS[project_id]["progress"] + 0.05), 2)
            PROCESS[project_id]["events"].append(f"{stage}… {int(PROCESS[project_id]['progress']*100)}%")
    PROCESS[project_id]["stage"] = "Complete"


@app.post("/v1/projects/{project_id}/processing/start", response_model=ProcessingStatus)
async def start_processing(project_id: str, background: BackgroundTasks, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    background.add_task(_simulate_processing, project_id)
    return ProcessingStatus(progress=0.0, stage="Queued", events=[])


@app.get("/v1/projects/{project_id}/processing/status", response_model=ProcessingStatus)
async def processing_status(project_id: str):
    data = PROCESS.get(project_id) or {"progress": 0.0, "stage": "Idle", "events": []}
    return ProcessingStatus(**data)


# ----- Assistant WebSocket (M6) -----

def _simple_retrieve(db: Session, project_id: str, query: str) -> list[str]:
    rows = db.query(Document).filter(Document.project_id == project_id).all()
    q = query.lower()
    hits: list[str] = []
    for r in rows:
        if r.content and q in r.content.lower():
            hits.append(r.file_name)
    return hits[:5]


@app.websocket("/v1/ws/assistant")
async def ws_assistant(ws: WebSocket):
    await ws.accept()
    project_id: str | None = None
    try:
        while True:
            msg = await ws.receive_json()  # expect {"type":"user","project_id":"..","text":".."}
            if not isinstance(msg, dict):
                continue
            if msg.get("type") != "user":
                continue
            project_id = msg.get("project_id")
            text = (msg.get("text") or "").strip()
            if not project_id or not text:
                await ws.send_json({"type": "error", "message": "project_id and text required"})
                continue
            # Retrieve
            with SessionLocal() as db:
                hits = _simple_retrieve(db, project_id, text)
            await ws.send_json({"type": "retrieval", "hits": hits})
            # Stream a stub response
            response = f"I found {len(hits)} related document(s): {', '.join(hits) if hits else 'none'}. You asked: {text}"
            for token in response.split(" "):
                await asyncio.sleep(0.05)
                await ws.send_json({"type": "chunk", "text": token + " "})
            cost = round(len(response) * 0.000001, 6)
            await ws.send_json({"type": "done", "cost": cost})
    except WebSocketDisconnect:
        return


# ----- Board Snapshots (M7) -----

@app.post("/v1/projects/{project_id}/board/snapshots", response_model=BoardSnapshotDetail)
async def create_snapshot(project_id: str, body: BoardSnapshotCreate, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    latest = db.query(BoardSnapshot).filter(BoardSnapshot.project_id == project_id).order_by(BoardSnapshot.version.desc()).first()
    version = (latest.version + 1) if latest else 1
    snap = BoardSnapshot(
        id=uuid.uuid4().hex,
        project_id=project_id,
        version=version,
        snapshot_json=json.dumps(body.snapshot or {}),
    )
    db.add(snap)
    db.commit()
    db.refresh(snap)
    return BoardSnapshotDetail(id=snap.id, version=snap.version, created_at=snap.created_at, snapshot=json.loads(snap.snapshot_json))


@app.get("/v1/projects/{project_id}/board/snapshots", response_model=List[BoardSnapshotOut])
async def list_snapshots(project_id: str, db: Session = Depends(get_db)):
    rows = db.query(BoardSnapshot).filter(BoardSnapshot.project_id == project_id).order_by(BoardSnapshot.version.desc()).all()
    return [BoardSnapshotOut(id=r.id, version=r.version, created_at=r.created_at) for r in rows]


@app.get("/v1/projects/{project_id}/board/snapshots/{snapshot_id}", response_model=BoardSnapshotDetail)
async def get_snapshot(project_id: str, snapshot_id: str, db: Session = Depends(get_db)):
    snap = db.query(BoardSnapshot).filter(BoardSnapshot.project_id == project_id, BoardSnapshot.id == snapshot_id).first()
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return BoardSnapshotDetail(id=snap.id, version=snap.version, created_at=snap.created_at, snapshot=json.loads(snap.snapshot_json))


# ----- Share Links (M8) -----

@app.post("/v1/projects/{project_id}/share/mint", response_model=ShareLinkOut)
async def mint_share_link(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    token = uuid.uuid4().hex
    record = ShareToken(token=token, project_id=project_id, created_at=datetime.utcnow(), expires_at=datetime.utcnow() + timedelta(days=30))
    db.add(record)
    db.commit()
    return ShareLinkOut(url=f"{SHARE_BASE_URL}/{token}")


@app.get("/v1/share/{token}", response_model=ProjectDetail)
async def public_project(token: str, db: Session = Depends(get_db)):
    rec = db.query(ShareToken).filter(ShareToken.token == token, ShareToken.revoked == False).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Share token not found")
    proj = db.query(Project).filter(Project.id == rec.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectDetail(
        id=proj.id,
        name=proj.name,
        slug=proj.slug,
        privacy=proj.privacy,
        default_language=proj.default_language,
        default_model=proj.default_model,
        budget_cap=proj.budget_cap,
        cost=proj.cost,
        status=proj.status,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
    )


# ----- Billing stubs (M9) -----

class CheckoutOut(BaseModel):
    url: str | None = None
    sessionId: str | None = None


@app.post("/v1/billing/checkout", response_model=CheckoutOut)
async def billing_checkout(body: dict):
    # In demo mode, just return a placeholder URL
    return CheckoutOut(url="https://billing.example.com/checkout/demo")


@app.post("/v1/billing/portal", response_model=Dict[str, str])
async def billing_portal():
    return {"url": "https://billing.example.com/portal/demo"}

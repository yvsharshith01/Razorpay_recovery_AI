from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db, Base
from models import Transaction
from schemas import TransactionOut, DashboardMetrics, ManualResultPayload
from services.recovery_service import RecoveryService
from services.metrics_service import MetricsService
from utils.seed_data import seed_database

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RecoveryAI - AI Revenue Recovery Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    if db.query(Transaction).count() == 0:
        seed_database()

@app.get("/api/dashboard", response_model=DashboardMetrics)
def get_dashboard(db: Session = Depends(get_db)):
    return MetricsService.get_dashboard_metrics(db)

@app.get("/api/transactions", response_model=List[TransactionOut])
def get_transactions(status: str = None, db: Session = Depends(get_db)):
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    return query.order_by(Transaction.created_at.desc()).all()

@app.get("/api/transactions/{txn_id}", response_model=TransactionOut)
def get_transaction(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@app.post("/api/recovery/{txn_id}/analyze")
def analyze_txn(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return RecoveryService.analyze_transaction(db, txn)

@app.post("/api/recovery/{txn_id}/execute")
def execute_txn_recovery(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return RecoveryService.execute_recovery(db, txn)

@app.post("/api/recovery/{txn_id}/result")
def record_outcome(txn_id: str, payload: ManualResultPayload, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    RecoveryService.record_outcome(db, txn, payload.status)
    return {"status": "UPDATED", "current_status": txn.status}

@app.post("/api/recovery/simulate-batch")
def simulate_batch(db: Session = Depends(get_db)):
    txns = db.query(Transaction).filter(Transaction.status == "FAILED").limit(50).all()
    recovered_count = 0
    blocked_count = 0

    for txn in txns:
        res = RecoveryService.execute_recovery(db, txn)
        if res.get("status") == "INITIATED":
            outcome = "SUCCESS" if (txn.amount < 5000 and hash(txn.id) % 100 < 62) else "FAILED"
            RecoveryService.record_outcome(db, txn, outcome)
            if outcome == "SUCCESS":
                recovered_count += 1
        else:
            blocked_count += 1

    return {
        "batch_processed": len(txns),
        "recovered": recovered_count,
        "blocked": blocked_count
    }
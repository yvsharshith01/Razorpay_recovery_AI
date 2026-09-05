import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_method = Column(String, nullable=False)
    status = Column(String, default="FAILED")
    failure_code = Column(String)
    failure_reason = Column(String)
    attempt_count = Column(Integer, default=1)
    previous_successful_payments = Column(Integer, default=0)
    previous_failed_payments = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    recovered_amount = Column(Float, default=0.0)

    decisions = relationship("AgentDecision", back_populates="transaction", cascade="all, delete-orphan")
    recovery_attempts = relationship("RecoveryAttempt", back_populates="transaction", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="transaction", cascade="all, delete-orphan")

class AgentDecision(Base):
    __tablename__ = "agent_decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    diagnosis = Column(String, nullable=False)
    recoverability = Column(String, nullable=False)
    recovery_probability = Column(Float, nullable=False)
    recommended_action = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="decisions")

class RecoveryAttempt(Base):
    __tablename__ = "recovery_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    attempt_number = Column(Integer, nullable=False)
    recommended_action = Column(String, nullable=False)
    approved_action = Column(String, nullable=False)
    policy_result = Column(String, nullable=False)
    policy_reason = Column(String, nullable=True)
    payment_link_id = Column(String, nullable=True)
    payment_link_url = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    amount_recovered = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    transaction = relationship("Transaction", back_populates="recovery_attempts")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    event_type = Column(String, nullable=False)
    actor = Column(String, default="SYSTEM")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="audit_events")
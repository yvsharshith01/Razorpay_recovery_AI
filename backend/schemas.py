from pydantic import BaseModel
from typing import List, Optional
import datetime

class AgentDecisionSchema(BaseModel):
    diagnosis: str
    recoverability: str
    recovery_probability: float
    recommended_action: str
    reason: str
    confidence: float

class AuditEventOut(BaseModel):
    event_type: str
    actor: str
    message: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class RecoveryAttemptOut(BaseModel):
    attempt_number: int
    approved_action: str
    policy_result: str
    policy_reason: Optional[str]
    payment_link_url: Optional[str]
    status: str
    amount_recovered: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TransactionOut(BaseModel):
    id: str
    customer_id: str
    amount: float
    currency: str
    payment_method: str
    status: str
    failure_code: str
    failure_reason: str
    attempt_count: int
    created_at: datetime.datetime
    recovered_amount: float
    decisions: List[AgentDecisionSchema] = []
    recovery_attempts: List[RecoveryAttemptOut] = []
    audit_events: List[AuditEventOut] = []

    class Config:
        from_attributes = True

class DashboardMetrics(BaseModel):
    revenue_at_risk: float
    total_failed: int
    eligible_for_recovery: int
    recovery_attempts: int
    successful_recoveries: int
    revenue_recovered: float
    recovery_rate: float
    stopped: int

class ManualResultPayload(BaseModel):
    status: str
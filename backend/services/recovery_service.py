import datetime
from sqlalchemy.orm import Session
from models import Transaction, AgentDecision, RecoveryAttempt, AuditEvent
from services.ai_agent import AIAgent
from services.policy_engine import PolicyEngine
from services.razorpay_service import RazorpayService

class RecoveryService:
    @staticmethod
    def log_audit(db: Session, txn_id: str, actor: str, event_type: str, message: str):
        event = AuditEvent(
            transaction_id=txn_id,
            actor=actor,
            event_type=event_type,
            message=message,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(event)
        db.commit()

    @classmethod
    def analyze_transaction(cls, db: Session, txn: Transaction):
        payload = {
            "transaction_id": txn.id,
            "amount": txn.amount,
            "currency": txn.currency,
            "payment_method": txn.payment_method,
            "failure_code": txn.failure_code,
            "failure_reason": txn.failure_reason,
            "attempt_count": txn.attempt_count,
            "previous_successful_payments": txn.previous_successful_payments,
            "previous_failed_payments": txn.previous_failed_payments
        }

        decision_data = AIAgent.diagnose(payload)
        
        decision = AgentDecision(
            transaction_id=txn.id,
            diagnosis=decision_data.diagnosis,
            recoverability=decision_data.recoverability,
            recovery_probability=decision_data.recovery_probability,
            recommended_action=decision_data.recommended_action,
            reason=decision_data.reason,
            confidence=decision_data.confidence
        )
        db.add(decision)
        db.commit()

        cls.log_audit(
            db, txn.id, "AI_AGENT", "AI_DIAGNOSIS_COMPLETED",
            f"Diagnosis: {decision.diagnosis} | Recommendation: {decision.recommended_action} (p={decision.recovery_probability})"
        )
        return decision

    @classmethod
    def execute_recovery(cls, db: Session, txn: Transaction):
        decision = db.query(AgentDecision).filter(AgentDecision.transaction_id == txn.id).order_by(AgentDecision.id.desc()).first()
        if not decision:
            decision = cls.analyze_transaction(db, txn)

        allowed, reason = PolicyEngine.evaluate(txn, decision)

        if not allowed:
            txn.status = "ESCALATED" if txn.attempt_count >= 2 else "STOPPED"
            attempt = RecoveryAttempt(
                transaction_id=txn.id,
                attempt_number=txn.attempt_count + 1,
                recommended_action=decision.recommended_action,
                approved_action="NONE",
                policy_result="BLOCKED",
                policy_reason=reason,
                status="BLOCKED"
            )
            db.add(attempt)
            db.commit()

            cls.log_audit(db, txn.id, "POLICY_ENGINE", "RECOVERY_BLOCKED", f"Action blocked: {reason}")
            return {"status": "BLOCKED", "reason": reason}

        cls.log_audit(db, txn.id, "POLICY_ENGINE", "POLICY_APPROVED", f"Action approved: {reason}")
        rzp_res = RazorpayService.create_payment_link(txn.id, txn.amount, txn.customer_id)

        txn.status = "RECOVERING"
        txn.attempt_count += 1
        
        attempt = RecoveryAttempt(
            transaction_id=txn.id,
            attempt_number=txn.attempt_count,
            recommended_action=decision.recommended_action,
            approved_action=decision.recommended_action,
            policy_result="APPROVED",
            policy_reason=reason,
            payment_link_id=rzp_res.get("id"),
            payment_link_url=rzp_res.get("short_url"),
            status="PENDING"
        )
        db.add(attempt)
        db.commit()

        cls.log_audit(db, txn.id, "RECOVERY_EXECUTOR", "PAYMENT_LINK_CREATED", f"Link created: {rzp_res.get('short_url')}")
        return {
            "status": "INITIATED",
            "payment_link": rzp_res.get("short_url"),
            "attempt_number": txn.attempt_count
        }

    @classmethod
    def record_outcome(cls, db: Session, txn: Transaction, outcome_status: str):
        attempt = db.query(RecoveryAttempt).filter(
            RecoveryAttempt.transaction_id == txn.id
        ).order_by(RecoveryAttempt.id.desc()).first()

        if outcome_status == "SUCCESS":
            txn.status = "RECOVERED"
            txn.recovered_amount = txn.amount
            if attempt:
                attempt.status = "SUCCESS"
                attempt.amount_recovered = txn.amount
                attempt.completed_at = datetime.datetime.utcnow()
            cls.log_audit(db, txn.id, "RECOVERY_EXECUTOR", "RECOVERY_SUCCEEDED", f"Payment successful. Recovered INR {txn.amount}")
        else:
            txn.status = "ESCALATED" if txn.attempt_count >= 2 else "FAILED"
            if attempt:
                attempt.status = "FAILED"
                attempt.completed_at = datetime.datetime.utcnow()
            cls.log_audit(db, txn.id, "RECOVERY_EXECUTOR", "RECOVERY_FAILED", "Secondary payment retry unsuccessful")

        db.commit()
        return txn
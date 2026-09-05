from sqlalchemy.orm import Session
from models import Transaction, RecoveryAttempt

class MetricsService:
    @staticmethod
    def get_dashboard_metrics(db: Session) -> dict:
        txns = db.query(Transaction).all()
        total_failed = len(txns)

        revenue_at_risk = sum(t.amount for t in txns if t.status in ["FAILED", "RECOVERING"])
        revenue_recovered = sum(t.recovered_amount for t in txns if t.status == "RECOVERED")
        successful_recoveries = sum(1 for t in txns if t.status == "RECOVERED")
        stopped = sum(1 for t in txns if t.status in ["STOPPED", "ESCALATED"])

        attempts = db.query(RecoveryAttempt).filter(RecoveryAttempt.policy_result == "APPROVED").count()
        eligible_for_recovery = sum(1 for t in txns if t.attempt_count < 2 and 100.0 <= t.amount <= 50000.0)

        recovery_rate = (successful_recoveries / attempts * 100.0) if attempts > 0 else 0.0

        return {
            "revenue_at_risk": round(revenue_at_risk, 2),
            "total_failed": total_failed,
            "eligible_for_recovery": eligible_for_recovery,
            "recovery_attempts": attempts,
            "successful_recoveries": successful_recoveries,
            "revenue_recovered": round(revenue_recovered, 2),
            "recovery_rate": round(recovery_rate, 1),
            "stopped": stopped
        }
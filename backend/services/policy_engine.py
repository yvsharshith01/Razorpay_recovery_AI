from config import settings
from schemas import AgentDecisionSchema
from models import Transaction

class PolicyEngine:
    @staticmethod
    def evaluate(txn: Transaction, decision: AgentDecisionSchema) -> tuple[bool, str]:
        if txn.attempt_count >= settings.MAX_RECOVERY_ATTEMPTS:
            return False, f"Maximum recovery attempts reached ({txn.attempt_count}/{settings.MAX_RECOVERY_ATTEMPTS})"

        if txn.amount > settings.MAX_AMOUNT:
            return False, f"Amount INR {txn.amount} exceeds automated ceiling of INR {settings.MAX_AMOUNT}"
        if txn.amount < settings.MIN_AMOUNT:
            return False, f"Amount INR {txn.amount} is below threshold of INR {settings.MIN_AMOUNT}"

        if decision.recovery_probability < settings.MIN_PROBABILITY_THRESHOLD:
            return False, f"Estimated recovery probability {decision.recovery_probability} below cutoff {settings.MIN_PROBABILITY_THRESHOLD}"

        allowed_actions = ["RETRY_NOW", "RETRY_LATER", "ALTERNATIVE_PAYMENT_METHOD"]
        if decision.recommended_action not in allowed_actions:
            return False, f"Action {decision.recommended_action} rejected by safety policy"

        if txn.status in ["RECOVERED", "STOPPED", "ESCALATED"]:
            return False, f"Transaction in immutable terminal state: {txn.status}"

        return True, "All automated recovery policy checks passed"
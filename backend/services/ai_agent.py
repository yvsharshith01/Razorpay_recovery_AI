import json
import requests
from config import settings
from schemas import AgentDecisionSchema

class AIAgent:
    @staticmethod
    def get_deterministic_fallback(txn_data: dict) -> AgentDecisionSchema:
        reason = txn_data.get("failure_reason", "").lower()
        prev_success = txn_data.get("previous_successful_payments", 0)
        attempts = txn_data.get("attempt_count", 1)

        prob = 0.50
        if "timeout" in reason or "network" in reason or "temporary" in reason:
            prob += 0.25
        elif "declined" in reason:
            prob -= 0.25
        elif "authentication" in reason:
            prob += 0.05

        if prev_success >= 3:
            prob += 0.15
        if attempts >= 2:
            prob -= 0.20

        prob = max(0.05, min(0.95, round(prob, 2)))

        if prob >= 0.70:
            recoverability = "HIGH"
        elif prob >= 0.40:
            recoverability = "MEDIUM"
        else:
            recoverability = "LOW"

        if "timeout" in reason or "network" in reason or "temporary" in reason:
            diag = "Transient network or banking timeout detected"
            action = "RETRY_NOW"
            expl = f"Failure is transient and customer has {prev_success} previous successful transactions."
        elif "authentication" in reason:
            diag = "Customer authentication or 3DS verification failed"
            action = "ALTERNATIVE_PAYMENT_METHOD"
            expl = "Authentication drop detected; offering alternative payment method prevents recurring drop-off."
        elif "declined" in reason:
            diag = "Card or issuer hard decline"
            action = "ALTERNATIVE_PAYMENT_METHOD" if prob >= 0.3 else "STOP_AND_ESCALATE"
            expl = "Issuing bank declined direct charge. Fallback payment method needed."
        elif "abandoned" in reason:
            diag = "User initiated checkout but session timed out"
            action = "RETRY_LATER"
            expl = "Checkout abandonment is non-technical. Delayed recovery nudge recommended."
        else:
            diag = f"Unclassified failure: {reason}"
            action = "RETRY_NOW" if prob >= 0.5 else "STOP_AND_ESCALATE"
            expl = "Standard automated recovery intervention applied."

        return AgentDecisionSchema(
            diagnosis=diag,
            recoverability=recoverability,
            recovery_probability=prob,
            recommended_action=action,
            reason=expl,
            confidence=0.88
        )

    @classmethod
    def diagnose(cls, txn_data: dict) -> AgentDecisionSchema:
        if not settings.OPENAI_API_KEY:
            return cls.get_deterministic_fallback(txn_data)

        prompt = f"""
        Analyze this payment failure and respond ONLY in valid JSON matching the schema:
        Transaction Data: {json.dumps(txn_data)}

        Allowed recommended_action: RETRY_NOW, RETRY_LATER, ALTERNATIVE_PAYMENT_METHOD, STOP_AND_ESCALATE
        Allowed recoverability: HIGH, MEDIUM, LOW

        JSON Schema:
        {{
            "diagnosis": "string",
            "recoverability": "HIGH" | "MEDIUM" | "LOW",
            "recovery_probability": float,
            "recommended_action": "action",
            "reason": "short explanation",
            "confidence": float
        }}
        """
        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=4)
            if res.status_code == 200:
                raw_json = json.loads(res.json()["choices"][0]["message"]["content"])
                return AgentDecisionSchema(**raw_json)
            return cls.get_deterministic_fallback(txn_data)
        except Exception:
            return cls.get_deterministic_fallback(txn_data)
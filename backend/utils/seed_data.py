import random
from database import SessionLocal, engine, Base
from models import Transaction, AuditEvent

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    showcases = [
        Transaction(
            id="TXN-2499-RECOVERABLE", customer_id="CUST-142", amount=2499.0,
            currency="INR", payment_method="upi", status="FAILED",
            failure_code="BANK_TIMEOUT", failure_reason="bank_timeout",
            attempt_count=1, previous_successful_payments=4, previous_failed_payments=0
        ),
        Transaction(
            id="TXN-4999-BLOCKED-MAX", customer_id="CUST-309", amount=4999.0,
            currency="INR", payment_method="upi", status="FAILED",
            failure_code="BANK_TIMEOUT", failure_reason="bank_timeout",
            attempt_count=2, previous_successful_payments=1, previous_failed_payments=2
        ),
        Transaction(
            id="TXN-52000-BLOCKED-CEILING", customer_id="CUST-881", amount=52000.0,
            currency="INR", payment_method="card", status="FAILED",
            failure_code="BANK_DECLINED", failure_reason="bank_declined",
            attempt_count=1, previous_successful_payments=5, previous_failed_payments=0
        ),
        Transaction(
            id="TXN-0050-BLOCKED-FLOOR", customer_id="CUST-012", amount=50.0,
            currency="INR", payment_method="upi", status="FAILED",
            failure_code="NETWORK_ERROR", failure_reason="network_error",
            attempt_count=1, previous_successful_payments=0, previous_failed_payments=1
        )
    ]

    for s in showcases:
        db.add(s)
        audit = AuditEvent(
            transaction_id=s.id,
            actor="REVENUE_MONITOR",
            event_type="PAYMENT_FAILURE_DETECTED",
            message=f"Detected failed transaction INR {s.amount} via {s.payment_method}. Reason: {s.failure_reason}"
        )
        db.add(audit)

    failure_pool = [
        ("bank_timeout", "BANK_TIMEOUT", "upi"),
        ("network_error", "NETWORK_ERROR", "upi"),
        ("upi_temporary_failure", "UPI_TEMPORARY_FAILURE", "upi"),
        ("authentication_failed", "AUTHENTICATION_FAILED", "card"),
        ("bank_declined", "BANK_DECLINED", "card"),
        ("user_abandoned", "USER_ABANDONED", "netbanking"),
    ]
    amounts = [499, 799, 1249, 1899, 2499, 3499, 4999, 8500, 15000]

    for i in range(1, 97):
        f_reason, f_code, p_method = random.choice(failure_pool)
        amt = float(random.choice(amounts))
        prev_success = random.randint(0, 6)
        attempts = 2 if random.random() < 0.12 else 1
        txn_id = f"TXN-{1000 + i}"

        txn = Transaction(
            id=txn_id,
            customer_id=f"CUST-{random.randint(100, 999)}",
            amount=amt,
            currency="INR",
            payment_method=p_method,
            status="FAILED",
            failure_code=f_code,
            failure_reason=f_reason,
            attempt_count=attempts,
            previous_successful_payments=prev_success,
            previous_failed_payments=random.randint(0, 2)
        )
        db.add(txn)
        audit = AuditEvent(
            transaction_id=txn_id,
            actor="REVENUE_MONITOR",
            event_type="PAYMENT_FAILURE_DETECTED",
            message=f"Detected failed transaction INR {amt} via {p_method} ({f_code})"
        )
        db.add(audit)

    db.commit()
    db.close()
    print("Database seeded with 100 test transactions.")

if __name__ == "__main__":
    seed_database()
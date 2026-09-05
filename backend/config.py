import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_dummykey123")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "dummysecret123")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATABASE_URL: str = "sqlite:///./recovery_ai.db"

    # Deterministic policy bounds
    MAX_RECOVERY_ATTEMPTS: int = 2
    MIN_AMOUNT: float = 100.0
    MAX_AMOUNT: float = 50000.0
    COOLDOWN_MINUTES: int = 5
    MIN_PROBABILITY_THRESHOLD: float = 0.30

settings = Settings()
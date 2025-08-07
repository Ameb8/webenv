import jwt
import datetime
from dotenv import load_dotenv
import os
from typing import Optional


def load_dotenv() -> None:
    # Get path to dotenv
    dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

    # Load .env file
    load_dotenv()


def get_valid_jwt() -> str:
    # Get secret from .env
    JWT_SECRET: Optional[str] = os.getenv('JWT_SECRET')

    if not JWT_SECRET: # Error loading secret
        raise ValueError("JWT_SECRET not set in .env file")

    # Define payload
    payload: dict[str, object] = {
        "sub": "1234567890",
        "name": "Test User",
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    # Encode JWT
    token: str = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return token
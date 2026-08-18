import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "AIVOA Pharma Complaint Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "gemma2-9b-it")
    FALLBACK_GROQ_MODEL: str = os.getenv("FALLBACK_GROQ_MODEL", "llama-3.3-70b-versatile")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qms_complaints.db")

settings = Settings()

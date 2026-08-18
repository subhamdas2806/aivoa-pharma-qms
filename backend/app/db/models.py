import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Integer
from app.db.session import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(50), default="Ready to Commit")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Form fields
    complaint_source = Column(String(100), nullable=True)
    customer_name = Column(String(200), nullable=True)
    product_name = Column(String(200), nullable=True)
    product_strength = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    affected_quantity = Column(String(100), nullable=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    complaint_details = Column(Text, nullable=True)

    # Risk Assessment
    severity = Column(String(20), default="Medium")
    risk_summary = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    root_cause_recommendation = Column(Text, nullable=True)
    capa_recommendation = Column(Text, nullable=True)

    # Metadata / chat transcript snapshot
    raw_transcript = Column(JSON, nullable=True)
    document_name = Column(String(255), nullable=True)

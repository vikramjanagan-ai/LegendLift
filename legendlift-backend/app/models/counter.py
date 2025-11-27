"""
Sequential Counter Model for generating sequential IDs
Stores last used number for each ID type
"""
from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from app.db.session import Base


class SequentialCounter(Base):
    """
    Stores sequential counters for various entity types
    Ensures sequential ID generation with daily reset
    """
    __tablename__ = "sequential_counters"

    id = Column(String, primary_key=True, index=True)  # Format: service_20241009
    entity_type = Column(String, nullable=False, index=True)  # service, report, contract, payment
    date_key = Column(String, nullable=False, index=True)  # YYYYMMDD
    last_number = Column(Integer, default=0, nullable=False)  # Last sequential number used
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

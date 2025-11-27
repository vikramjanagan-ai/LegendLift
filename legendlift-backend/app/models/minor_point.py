from sqlalchemy import Column, String, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class MinorPointStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class MinorPoint(Base):
    __tablename__ = "minor_points"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(Enum(MinorPointStatus), nullable=False, default=MinorPointStatus.OPEN, index=True)
    reported_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_date = Column(DateTime, nullable=True)
    closure_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", foreign_keys=[customer_id])
    technician = relationship("User", foreign_keys=[technician_id])

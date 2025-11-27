from sqlalchemy import Boolean, Column, String, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ComplaintPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, nullable=False, index=True)  # e.g., "COMP-001"
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Customer user account (optional)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    issue_type = Column(String, nullable=False)  # breakdown, noise, door_issue, etc.
    priority = Column(Enum(ComplaintPriority), default=ComplaintPriority.MEDIUM)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.OPEN)
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True)  # Technician
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="complaints")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    reported_by = relationship("User", foreign_keys=[user_id])

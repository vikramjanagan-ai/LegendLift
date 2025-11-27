from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class EscalationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EscalationStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    issue_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(EscalationPriority), nullable=False, index=True)
    status = Column(Enum(EscalationStatus), nullable=False, default=EscalationStatus.OPEN, index=True)
    raised_by = Column(String, nullable=False)
    raised_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    resolved_date = Column(DateTime, nullable=True)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="escalations")
    assigned_to = relationship("User", back_populates="escalations")

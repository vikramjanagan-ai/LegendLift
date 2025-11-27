from sqlalchemy import Column, String, DateTime, Enum, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class RepairStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Repair(Base):
    __tablename__ = "repairs"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True, index=True)  # Nullable for non-customers
    created_by_admin_id = Column(String, ForeignKey("users.id"), nullable=False)

    # For non-customers
    customer_name = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    scheduled_date = Column(DateTime, nullable=False, index=True)
    status = Column(Enum(RepairStatus), nullable=False, default=RepairStatus.PENDING, index=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    technicians = Column(JSON, nullable=True)  # Array of technician IDs (unlimited)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", foreign_keys=[customer_id])
    created_by = relationship("User", foreign_keys=[created_by_admin_id])

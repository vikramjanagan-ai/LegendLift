from sqlalchemy import Column, String, DateTime, Enum, Text, JSON, ForeignKey, Numeric
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

    # Repair details
    repair_type = Column(String, nullable=True)
    work_done = Column(Text, nullable=True)
    materials_used = Column(JSON, nullable=True)  # Array of materials
    before_images = Column(JSON, nullable=True)
    after_images = Column(JSON, nullable=True)
    customer_approved = Column(String, nullable=True, default="false")

    # Cost tracking
    materials_cost = Column(Numeric(10, 2), nullable=True, default=0)
    labor_cost = Column(Numeric(10, 2), nullable=True, default=0)
    total_cost = Column(Numeric(10, 2), nullable=True, default=0)
    charged_amount = Column(Numeric(10, 2), nullable=True, default=0)
    payment_status = Column(String, nullable=True, default="pending")

    # Time tracking
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", foreign_keys=[customer_id])
    created_by = relationship("User", foreign_keys=[created_by_admin_id])

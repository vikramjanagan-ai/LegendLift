from sqlalchemy import Column, String, DateTime, Enum, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class CallBackStatus(str, enum.Enum):
    PENDING = "PENDING"
    PICKED = "PICKED"  # Technician picked the job
    ON_THE_WAY = "ON_THE_WAY"  # Moving to site
    AT_SITE = "AT_SITE"  # Reached the site
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class LiftStatus(str, enum.Enum):
    SHUT_DOWN = "SHUT_DOWN"
    NORMAL_RUNNING = "NORMAL_RUNNING"
    RUNNING_WITH_ERROR = "RUNNING_WITH_ERROR"


class CallBack(Base):
    __tablename__ = "callbacks"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    created_by_admin_id = Column(String, ForeignKey("users.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False, index=True)
    status = Column(Enum(CallBackStatus), nullable=False, default=CallBackStatus.PENDING, index=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    technicians = Column(JSON, nullable=True)  # Array of technician IDs (max 3)
    responded_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Enhanced closure fields
    issue_faced = Column(Text, nullable=True)
    customer_reporting_person = Column(String, nullable=True)
    problem_solved = Column(Text, nullable=True)
    report_attachment_url = Column(String, nullable=True)  # Video or photo URL
    materials_changed = Column(JSON, nullable=True)  # Array of materials
    lift_status_on_closure = Column(Enum(LiftStatus), nullable=True)
    requires_followup = Column(String, nullable=True, default="false")  # "true" if closed with error

    # On-site tracking
    picked_at = Column(DateTime, nullable=True)
    on_the_way_at = Column(DateTime, nullable=True)
    at_site_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", foreign_keys=[customer_id])
    created_by = relationship("User", foreign_keys=[created_by_admin_id])

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text, Integer, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class ServiceStatus(str, enum.Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class ServiceType(str, enum.Enum):
    SERVICE = "SERVICE"  # Auto-generated AMC services
    CALLBACK = "CALLBACK"  # Admin-created callbacks
    REPAIR = "REPAIR"  # Admin-created repairs


class ServiceSchedule(Base):
    __tablename__ = "service_schedules"

    id = Column(String, primary_key=True, index=True)
    service_id = Column(String, unique=True, nullable=False, index=True)  # Human-readable ID: SRV-20241009-A3F8K
    contract_id = Column(String, ForeignKey("amc_contracts.id"), nullable=True, index=True)  # Can be null for ad-hoc
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=True, index=True)  # Can be null for ad-hoc
    actual_date = Column(DateTime, nullable=True)
    status = Column(Enum(ServiceStatus), nullable=False, default=ServiceStatus.PENDING, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    technician2_id = Column(String, ForeignKey("users.id"), nullable=True)
    technician3_id = Column(String, ForeignKey("users.id"), nullable=True)  # Third technician for SERVICE/CALLBACK
    days_overdue = Column(Integer, nullable=True)
    overdue_days = Column(Integer, nullable=True, default=0)  # Calculated field
    is_high_priority = Column(Boolean, nullable=False, default=False, index=True)  # True if overdue > 10 days
    is_adhoc = Column(String, default=False)  # True for technician-created services
    service_type = Column(Enum(ServiceType), default=ServiceType.SERVICE, index=True)  # SERVICE, CALLBACK, REPAIR
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contract = relationship("AMCContract", back_populates="services")
    customer = relationship("Customer", back_populates="services")
    technician = relationship("User", back_populates="assigned_services", foreign_keys=[technician_id])
    technician2 = relationship("User", back_populates="assigned_services_2", foreign_keys=[technician2_id])
    technician3 = relationship("User", foreign_keys=[technician3_id])
    reports = relationship("ServiceReport", back_populates="service", cascade="all, delete-orphan")


class ServiceReport(Base):
    __tablename__ = "service_reports"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, unique=True, nullable=False, index=True)  # Human-readable ID: RPT-20241009-D2L7Q
    service_id = Column(String, ForeignKey("service_schedules.id"), nullable=False, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    check_in_time = Column(DateTime, nullable=False)
    check_out_time = Column(DateTime, nullable=True)
    check_in_location = Column(JSON, nullable=True)  # {"latitude": float, "longitude": float}
    check_out_location = Column(JSON, nullable=True)
    work_done = Column(Text, nullable=False)
    parts_replaced = Column(JSON, nullable=True)  # Array of strings
    images = Column(JSON, nullable=True)  # Array of image URLs
    customer_signature = Column(String, nullable=True)  # Image URL
    technician_signature = Column(String, nullable=True)  # Image URL
    customer_feedback = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5
    completion_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("ServiceSchedule", back_populates="reports")
    technician = relationship("User", back_populates="service_reports")

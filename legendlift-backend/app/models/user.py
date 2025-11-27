from sqlalchemy import Boolean, Column, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TECHNICIAN = "technician"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    profile_image = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_services = relationship("ServiceSchedule", back_populates="technician", foreign_keys="ServiceSchedule.technician_id")
    assigned_services_2 = relationship("ServiceSchedule", back_populates="technician2", foreign_keys="ServiceSchedule.technician2_id")
    service_reports = relationship("ServiceReport", back_populates="technician")
    escalations = relationship("Escalation", back_populates="assigned_to")

"""
Association table for many-to-many relationship between services and technicians
Allows multiple technicians to be assigned to a single service/ticket
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class ServiceTechnician(Base):
    """
    Many-to-many association between services and technicians
    Tracks which technicians are assigned to which tickets
    """
    __tablename__ = "service_technicians"

    id = Column(String, primary_key=True, index=True)
    service_id = Column(String, ForeignKey("service_schedules.id"), nullable=False, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    assigned_by = Column(String, ForeignKey("users.id"), nullable=True)  # Who assigned (admin or self-assigned)
    is_primary = Column(Boolean, default=False)  # Is this the primary/lead technician
    order = Column(Integer, default=0)  # Order of assignment (0 = first, 1 = second, etc.)

    # Relationships
    service = relationship("ServiceSchedule", back_populates="assigned_technicians")
    technician = relationship("User", foreign_keys=[technician_id], back_populates="service_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])

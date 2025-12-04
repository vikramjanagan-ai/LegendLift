from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class MaterialUsage(Base):
    __tablename__ = "material_usage"

    id = Column(String, primary_key=True, index=True)
    service_id = Column(String, ForeignKey("service_schedules.id"), nullable=True, index=True)
    callback_id = Column(String, ForeignKey("callbacks.id"), nullable=True, index=True)
    repair_id = Column(String, ForeignKey("repairs.id"), nullable=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    technician_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)

    material_name = Column(String, nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, nullable=True)  # pieces, bottles, units, liters, kg
    unit_cost = Column(Numeric(10, 2), nullable=True)
    total_cost = Column(Numeric(10, 2), nullable=False)

    used_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("ServiceSchedule", foreign_keys=[service_id])
    callback = relationship("CallBack", foreign_keys=[callback_id])
    repair = relationship("Repair", foreign_keys=[repair_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    technician = relationship("User", foreign_keys=[technician_id])

from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class ContractType(str, enum.Enum):
    ACTIVE = "Active"
    WARRANTY = "Warranty"
    RENEWAL = "Renewal"
    CLOSED = "Closed"


class ServiceFrequency(str, enum.Enum):
    MONTHLY = "monthly"
    BI_MONTHLY = "bi_monthly"
    QUARTERLY = "quarterly"
    HALF_YEARLY = "half_yearly"
    YEARLY = "yearly"


class AMCContract(Base):
    __tablename__ = "amc_contracts"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    contract_type = Column(Enum(ContractType), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    service_frequency = Column(Enum(ServiceFrequency), nullable=False)
    total_services = Column(Integer, nullable=False)
    completed_services = Column(Integer, default=0)
    pending_services = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    terms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="contracts")
    services = relationship("ServiceSchedule", back_populates="contract", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="contract", cascade="all, delete-orphan")

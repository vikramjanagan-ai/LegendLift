from sqlalchemy import Column, String, Integer, Float, DateTime, Date, Enum, Boolean, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class AMCStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class ServicesPerYear(int, enum.Enum):
    SIX = 6
    NINE = 9
    TEN = 10
    TWELVE = 12


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    job_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, index=True)
    site_name = Column(String, nullable=True)
    area = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    contact_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    route = Column(Integer, nullable=False, index=True)

    # AMC Information
    amc_valid_from = Column(Date, nullable=True, index=True)
    amc_valid_to = Column(Date, nullable=True, index=True)
    services_per_year = Column(Integer, nullable=True)
    amc_amount = Column(Numeric(10, 2), nullable=True)
    amc_amount_received = Column(Numeric(10, 2), nullable=True, default=0)
    amc_status = Column(Enum(AMCStatus), nullable=True, default=AMCStatus.ACTIVE, index=True)
    aiims_status = Column(Boolean, nullable=False, default=False)

    # Equipment Details
    amc_type = Column(String, nullable=True)
    door_type = Column(String, nullable=True)
    controller_type = Column(String, nullable=True)
    number_of_floors = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contracts = relationship("AMCContract", back_populates="customer", cascade="all, delete-orphan")
    services = relationship("ServiceSchedule", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="customer", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="customer", cascade="all, delete-orphan")

from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False, index=True)
    contract_id = Column(String, ForeignKey("amc_contracts.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    paid_date = Column(DateTime, nullable=True)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING, index=True)
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="payments")
    contract = relationship("AMCContract", back_populates="payments")

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentBase(BaseModel):
    customer_id: str
    contract_id: str
    amount: float
    due_date: datetime
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    status: Optional[PaymentStatus] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: str
    paid_date: Optional[datetime] = None
    status: PaymentStatus
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

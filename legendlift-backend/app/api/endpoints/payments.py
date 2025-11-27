from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.customer import Customer
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[dict])
def get_payments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[PaymentStatus] = None,
    customer_id: Optional[str] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments with optional filters"""
    query = db.query(Payment)

    if status:
        query = query.filter(Payment.status == status)

    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)

    if overdue_only:
        query = query.filter(
            Payment.status != PaymentStatus.PAID,
            Payment.due_date < datetime.utcnow()
        )

    payments = query.order_by(Payment.due_date.desc()).offset(skip).limit(limit).all()

    # Enrich with customer info
    result = []
    for payment in payments:
        payment_dict = {
            "id": payment.id,
            "customer_id": payment.customer_id,
            "contract_id": payment.contract_id,
            "amount": payment.amount,
            "amount_paid": payment.amount if payment.status == PaymentStatus.PAID else 0,
            "due_date": payment.due_date,
            "payment_date": payment.paid_date,
            "status": payment.status.value.upper(),
            "payment_method": payment.payment_method,
            "transaction_id": payment.transaction_id,
            "notes": payment.notes,
            "invoice_number": f"INV-{payment.id[:8].upper()}",
            "created_at": payment.created_at,
            "updated_at": payment.updated_at,
        }

        # Get customer info
        customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
        if customer:
            payment_dict["customer_name"] = customer.name
            payment_dict["customer_job_number"] = customer.job_number

        result.append(payment_dict)

    return result


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment by ID"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Enrich with customer info
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    if customer:
        payment.customer_name = customer.name
        payment.job_no = customer.job_no
        payment.location = customer.location

    return payment


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Create a new payment (Admin only)"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Create payment
    db_payment = Payment(
        id=str(uuid.uuid4()),
        **payment.dict()
    )

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    return db_payment


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Update payment (Admin only)"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Update fields
    update_data = payment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_payment, field, value)

    db_payment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_payment)

    return db_payment


@router.patch("/{payment_id}/mark-paid", response_model=PaymentResponse)
def mark_payment_paid(
    payment_id: str,
    payment_method: str = "cash",
    transaction_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Mark payment as paid (Admin only)"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db_payment.status = PaymentStatus.PAID
    db_payment.paid_date = datetime.utcnow()
    db_payment.payment_method = payment_method
    if transaction_id:
        db_payment.transaction_id = transaction_id
    db_payment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_payment)

    return db_payment


@router.delete("/{payment_id}")
def delete_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """Delete payment (Admin only)"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db.delete(db_payment)
    db.commit()

    return {"message": "Payment deleted successfully"}


@router.get("/stats/overview")
def get_payment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment statistics"""
    total_payments = db.query(Payment).count()

    paid_payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.PAID
    ).count()

    pending_payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.PENDING
    ).count()

    overdue_payments = db.query(Payment).filter(
        Payment.status != PaymentStatus.PAID,
        Payment.due_date < datetime.utcnow()
    ).count()

    total_amount = db.query(Payment).with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    total_paid = db.query(Payment).filter(
        Payment.status == PaymentStatus.PAID
    ).with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    total_pending = db.query(Payment).filter(
        Payment.status == PaymentStatus.PENDING
    ).with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    total_overdue = db.query(Payment).filter(
        Payment.status != PaymentStatus.PAID,
        Payment.due_date < datetime.utcnow()
    ).with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    return {
        "payments_count": total_payments,
        "total_paid": total_paid,
        "total_pending": total_pending,
        "total_overdue": total_overdue,
        "paid_count": paid_payments,
        "pending_count": pending_payments,
        "overdue_count": overdue_payments,
        "total_amount": total_amount,
        "collection_rate": round((total_paid / total_amount * 100), 2) if total_amount > 0 else 0
    }

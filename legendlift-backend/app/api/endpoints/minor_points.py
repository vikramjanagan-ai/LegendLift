from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.models.minor_point import MinorPoint, MinorPointStatus
from app.models.customer import Customer
from app.api.deps import get_current_user

router = APIRouter()


class MinorPointCreate(BaseModel):
    customer_id: str
    technician_id: str
    description: str


class MinorPointClose(BaseModel):
    closure_notes: str


@router.get("/customer/{customer_id}")
def get_customer_minor_points(
    customer_id: str,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all minor points for a specific customer
    """
    query = db.query(MinorPoint).filter(MinorPoint.customer_id == customer_id)

    if status_filter:
        query = query.filter(MinorPoint.status == status_filter)

    points = query.order_by(MinorPoint.reported_date.desc()).all()

    result = []
    for point in points:
        # Get technician info
        tech = db.query(User).filter(User.id == point.technician_id).first()

        result.append({
            "id": point.id,
            "customer_id": point.customer_id,
            "technician_id": point.technician_id,
            "technician_name": tech.name if tech else "Unknown",
            "description": point.description,
            "status": point.status,
            "reported_date": point.reported_date,
            "closed_date": point.closed_date,
            "closure_notes": point.closure_notes,
            "created_at": point.created_at,
            "updated_at": point.updated_at,
        })

    return result


@router.post("/")
def create_minor_point(
    request: MinorPointCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new minor point for a customer
    """
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == request.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    minor_point = MinorPoint(
        id=str(uuid.uuid4()),
        customer_id=request.customer_id,
        technician_id=request.technician_id,
        description=request.description,
        status=MinorPointStatus.OPEN,
        reported_date=datetime.utcnow(),
    )

    db.add(minor_point)
    db.commit()
    db.refresh(minor_point)

    return {
        "id": minor_point.id,
        "customer_id": minor_point.customer_id,
        "technician_id": minor_point.technician_id,
        "description": minor_point.description,
        "status": minor_point.status,
        "reported_date": minor_point.reported_date,
        "message": "Minor point created successfully"
    }


@router.post("/{point_id}/close")
def close_minor_point(
    point_id: str,
    request: MinorPointClose,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Close a minor point
    """
    point = db.query(MinorPoint).filter(MinorPoint.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Minor point not found"
        )

    if point.status == MinorPointStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minor point is already closed"
        )

    point.status = MinorPointStatus.CLOSED
    point.closed_date = datetime.utcnow()
    point.closure_notes = request.closure_notes

    db.commit()
    db.refresh(point)

    return {
        "id": point.id,
        "status": point.status,
        "closed_date": point.closed_date,
        "closure_notes": point.closure_notes,
        "message": "Minor point closed successfully"
    }


@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_minor_point(
    point_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a minor point
    """
    point = db.query(MinorPoint).filter(MinorPoint.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Minor point not found"
        )

    db.delete(point)
    db.commit()
    return None

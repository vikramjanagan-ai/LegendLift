"""
Technician-specific service endpoints
Allows technicians to register and manage services on-site
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.service import ServiceSchedule, ServiceReport, ServiceStatus
from app.models.customer import Customer
from app.schemas.service import (
    ServiceScheduleResponse,
    ServiceReportCreate,
    ServiceReportResponse,
)
from app.api.deps import get_current_user
from app.utils.id_generator import generate_sequential_service_id, generate_report_id, generate_uuid
from pydantic import BaseModel

router = APIRouter()


class AdHocServiceCreate(BaseModel):
    """Schema for creating ad-hoc service by technician"""
    customer_id: str
    service_type: str = "adhoc"  # adhoc, emergency, callback
    issue_type: Optional[str] = None  # Type of issue: breakdown, maintenance, inspection, etc.
    notes: Optional[str] = None
    location: Optional[dict] = None  # {"latitude": float, "longitude": float}


class ServiceCheckIn(BaseModel):
    """Schema for technician check-in"""
    customer_id: str
    location: dict  # {"latitude": float, "longitude": float}
    notes: Optional[str] = None
    service_type: str = "adhoc"  # adhoc, scheduled, emergency


@router.post("/register-service", response_model=ServiceScheduleResponse, status_code=status.HTTP_201_CREATED)
def register_adhoc_service(
    service_data: AdHocServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register a new ad-hoc service by technician at customer location
    This creates a service record when technician arrives on-site

    Use cases:
    - Emergency repairs
    - Callback visits
    - Unscheduled maintenance
    - Customer complaints
    """

    # Verify technician role
    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can register ad-hoc services"
        )

    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == service_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Generate sequential service ID
    service_id = generate_sequential_service_id(db)

    # Create service record
    service = ServiceSchedule(
        id=generate_uuid(),
        service_id=service_id,
        customer_id=service_data.customer_id,
        contract_id=None,  # No contract for ad-hoc
        scheduled_date=None,  # Not scheduled
        actual_date=datetime.now(),
        status=ServiceStatus.IN_PROGRESS,
        technician_id=current_user.id,
        is_adhoc=True,
        service_type=service_data.service_type,
        notes=service_data.notes,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@router.post("/check-in", response_model=dict, status_code=status.HTTP_201_CREATED)
def check_in_service(
    check_in_data: ServiceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician checks in at customer location to start service

    This endpoint:
    1. Creates a service record (if not exists)
    2. Creates a service report with check-in time and location
    3. Returns service ID and report ID

    Technician workflow:
    1. Arrive at customer location
    2. Call this endpoint to check-in
    3. Perform service
    4. Complete service report
    5. Get customer signature
    6. Check-out
    """

    # Verify technician role
    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can check-in to services"
        )

    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == check_in_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Check if there's an existing pending service for this customer and technician
    existing_service = db.query(ServiceSchedule).filter(
        ServiceSchedule.customer_id == check_in_data.customer_id,
        ServiceSchedule.technician_id == current_user.id,
        ServiceSchedule.status.in_([ServiceStatus.PENDING, ServiceStatus.SCHEDULED])
    ).first()

    if existing_service:
        # Use existing scheduled service
        service = existing_service
        service.status = ServiceStatus.IN_PROGRESS
        service.actual_date = datetime.now()
    else:
        # Create new ad-hoc service
        service_id = generate_sequential_service_id(db)
        service = ServiceSchedule(
            id=generate_uuid(),
            service_id=service_id,
            customer_id=check_in_data.customer_id,
            contract_id=None,
            scheduled_date=None,
            actual_date=datetime.now(),
            status=ServiceStatus.IN_PROGRESS,
            technician_id=current_user.id,
            is_adhoc=True,
            service_type=check_in_data.service_type,
            notes=check_in_data.notes,
        )
        db.add(service)
        db.flush()  # Get service.id

    # Create service report with check-in
    report_id = generate_report_id()
    report = ServiceReport(
        id=generate_uuid(),
        report_id=report_id,
        service_id=service.id,
        technician_id=current_user.id,
        check_in_time=datetime.now(),
        check_in_location=check_in_data.location,
        work_done="",  # Will be filled later
    )

    db.add(report)
    db.commit()
    db.refresh(service)
    db.refresh(report)

    return {
        "message": "Successfully checked in",
        "service_id": service.service_id,
        "service_db_id": service.id,
        "report_id": report.report_id,
        "report_db_id": report.id,
        "customer_name": customer.name,
        "customer_location": customer.area,
        "check_in_time": report.check_in_time.isoformat(),
    }


@router.get("/my-services/today", response_model=List[dict])
def get_my_today_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all services for current technician for today
    Includes both scheduled and ad-hoc services
    """

    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can access this endpoint"
        )

    today = datetime.now().date()

    # Get all services (scheduled + ad-hoc)
    services = db.query(ServiceSchedule).join(Customer).filter(
        ServiceSchedule.technician_id == current_user.id,
        ServiceSchedule.status.in_([
            ServiceStatus.PENDING,
            ServiceStatus.SCHEDULED,
            ServiceStatus.IN_PROGRESS
        ])
    ).all()

    result = []
    for service in services:
        customer = db.query(Customer).filter(Customer.id == service.customer_id).first()
        result.append({
            "id": service.id,
            "service_id": service.service_id,
            "customer_id": service.customer_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_location": customer.area if customer else "Unknown",
            "customer_address": customer.address if customer else "Unknown",
            "customer_phone": customer.phone if customer else "Unknown",
            "scheduled_date": service.scheduled_date.isoformat() if service.scheduled_date else None,
            "status": service.status.value,
            "service_type": service.service_type,
            "is_adhoc": service.is_adhoc,
            "notes": service.notes,
        })

    return result


@router.get("/service-history", response_model=List[dict])
def get_service_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get service history for current technician
    Shows all completed services
    """

    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can access this endpoint"
        )

    services = db.query(ServiceSchedule).join(Customer).filter(
        ServiceSchedule.technician_id == current_user.id,
        ServiceSchedule.status == ServiceStatus.COMPLETED
    ).order_by(ServiceSchedule.actual_date.desc()).offset(skip).limit(limit).all()

    result = []
    for service in services:
        customer = db.query(Customer).filter(Customer.id == service.customer_id).first()

        # Get report for this service
        report = db.query(ServiceReport).filter(
            ServiceReport.service_id == service.id
        ).first()

        result.append({
            "service_id": service.service_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_location": customer.area if customer else "Unknown",
            "actual_date": service.actual_date.isoformat() if service.actual_date else None,
            "service_type": service.service_type,
            "is_adhoc": service.is_adhoc,
            "report_id": report.report_id if report else None,
            "rating": report.rating if report else None,
            "work_done": report.work_done if report else None,
        })

    return result

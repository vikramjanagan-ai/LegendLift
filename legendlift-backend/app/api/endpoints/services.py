from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
import uuid
from app.db.session import get_db
from app.models.user import User
from app.models.service import ServiceSchedule, ServiceReport, ServiceStatus
from app.schemas.service import (
    ServiceScheduleCreate,
    ServiceScheduleUpdate,
    ServiceScheduleResponse,
    ServiceReportCreate,
    ServiceReportUpdate,
    ServiceReportResponse,
)
from app.api.deps import get_current_user, get_current_active_admin
from app.utils.id_generator import generate_sequential_service_id
from app.models.service_technician import ServiceTechnician

router = APIRouter()


def enrich_service_with_technicians(service_dict: dict, service_id: str, db: Session) -> dict:
    """
    Helper function to enrich service dict with all assigned technicians
    """
    # Get all assigned technicians from service_technicians table
    assignments = db.query(ServiceTechnician).filter(
        ServiceTechnician.service_id == service_id
    ).order_by(ServiceTechnician.order).all()

    assigned_technicians = []
    for assignment in assignments:
        tech = db.query(User).filter(User.id == assignment.technician_id).first()
        if tech:
            assigned_technicians.append({
                "id": tech.id,
                "name": tech.name,
                "is_primary": assignment.is_primary,
                "order": assignment.order
            })

    service_dict["assigned_technicians"] = assigned_technicians
    service_dict["technician_count"] = len(assigned_technicians)
    return service_dict


# Service Schedule Endpoints
@router.get("/schedules", response_model=List[ServiceScheduleResponse])
def get_service_schedules(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = Query(None, alias="status"),
    technician_id: str = Query(None),
    customer_id: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get service schedules with optional filters
    """
    from app.models.customer import Customer

    query = db.query(ServiceSchedule)

    # If technician, only show their services
    if current_user.role == "technician":
        query = query.filter(
            or_(
                ServiceSchedule.technician_id == current_user.id,
                ServiceSchedule.technician2_id == current_user.id,
            )
        )
    elif technician_id:
        query = query.filter(
            or_(
                ServiceSchedule.technician_id == technician_id,
                ServiceSchedule.technician2_id == technician_id,
            )
        )

    if status_filter:
        query = query.filter(ServiceSchedule.status == status_filter)

    if customer_id:
        query = query.filter(ServiceSchedule.customer_id == customer_id)

    if date_from:
        query = query.filter(ServiceSchedule.scheduled_date >= datetime.fromisoformat(date_from))

    if date_to:
        query = query.filter(ServiceSchedule.scheduled_date <= datetime.fromisoformat(date_to))

    services = query.order_by(ServiceSchedule.scheduled_date.desc()).offset(skip).limit(limit).all()

    # Enrich with customer and technician data
    result = []
    for service in services:
        service_dict = {
            "id": service.id,
            "service_id": service.service_id,
            "contract_id": service.contract_id,
            "customer_id": service.customer_id,
            "scheduled_date": service.scheduled_date,
            "actual_date": service.actual_date,
            "status": service.status,
            "technician_id": service.technician_id,
            "technician2_id": service.technician2_id,
            "days_overdue": service.days_overdue,
            "is_adhoc": service.is_adhoc,
            "service_type": service.service_type,
            "notes": service.notes,
            "created_at": service.created_at,
            "updated_at": service.updated_at,
        }

        # Add customer data
        if service.customer:
            service_dict["customer_name"] = service.customer.name
            service_dict["job_number"] = service.customer.job_number
            service_dict["area"] = service.customer.area
            service_dict["route"] = service.customer.route

        # Add technician data
        if service.technician:
            service_dict["technician_name"] = service.technician.name
        if service.technician2:
            service_dict["technician2_name"] = service.technician2.name

        # Add all assigned technicians
        service_dict = enrich_service_with_technicians(service_dict, service.id, db)

        result.append(service_dict)

    return result


@router.get("/schedules/today", response_model=List[ServiceScheduleResponse])
def get_today_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get today's services for technician
    """
    today = datetime.now().date()
    query = db.query(ServiceSchedule).filter(
        and_(
            ServiceSchedule.scheduled_date >= today,
            ServiceSchedule.scheduled_date < today + timedelta(days=1),
            or_(
                ServiceSchedule.technician_id == current_user.id,
                ServiceSchedule.technician2_id == current_user.id,
            ),
        )
    )

    services = query.order_by(ServiceSchedule.scheduled_date).all()

    # Enrich with customer and technician data
    result = []
    for service in services:
        service_dict = {
            "id": service.id,
            "service_id": service.service_id,
            "contract_id": service.contract_id,
            "customer_id": service.customer_id,
            "scheduled_date": service.scheduled_date,
            "actual_date": service.actual_date,
            "status": service.status,
            "technician_id": service.technician_id,
            "technician2_id": service.technician2_id,
            "days_overdue": service.days_overdue,
            "is_adhoc": service.is_adhoc,
            "service_type": service.service_type,
            "notes": service.notes,
            "created_at": service.created_at,
            "updated_at": service.updated_at,
        }

        # Add customer data
        if service.customer:
            service_dict["customer_name"] = service.customer.name
            service_dict["job_number"] = service.customer.job_number
            service_dict["area"] = service.customer.area
            service_dict["route"] = service.customer.route

        # Add technician data
        if service.technician:
            service_dict["technician_name"] = service.technician.name
        if service.technician2:
            service_dict["technician2_name"] = service.technician2.name

        # Add all assigned technicians
        service_dict = enrich_service_with_technicians(service_dict, service.id, db)

        result.append(service_dict)

    return result


@router.get("/schedules/{service_id}", response_model=ServiceScheduleResponse)
def get_service_schedule(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get service schedule by ID
    """
    service = db.query(ServiceSchedule).filter(ServiceSchedule.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Enrich with customer and technician data
    service_dict = {
        "id": service.id,
        "service_id": service.service_id,
        "contract_id": service.contract_id,
        "customer_id": service.customer_id,
        "scheduled_date": service.scheduled_date,
        "actual_date": service.actual_date,
        "status": service.status,
        "technician_id": service.technician_id,
        "technician2_id": service.technician2_id,
        "days_overdue": service.days_overdue,
        "is_adhoc": service.is_adhoc,
        "service_type": service.service_type,
        "notes": service.notes,
        "created_at": service.created_at,
        "updated_at": service.updated_at,
    }

    # Add customer data
    if service.customer:
        service_dict["customer_name"] = service.customer.name
        service_dict["job_number"] = service.customer.job_number
        service_dict["area"] = service.customer.area
        service_dict["route"] = service.customer.route

    # Add technician data
    if service.technician:
        service_dict["technician_name"] = service.technician.name
    if service.technician2:
        service_dict["technician2_name"] = service.technician2.name

    # Add all assigned technicians
    service_dict = enrich_service_with_technicians(service_dict, service.id, db)

    return service_dict


@router.post("/schedules", response_model=ServiceScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_service_schedule(
    service_in: ServiceScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create new service schedule (Admin only)
    """
    # Generate sequential service ID
    service_id = generate_sequential_service_id(db)

    service = ServiceSchedule(
        id=str(uuid.uuid4()),
        service_id=service_id,
        **service_in.model_dump()
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/schedules/{service_id}", response_model=ServiceScheduleResponse)
def update_service_schedule(
    service_id: str,
    service_in: ServiceScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update service schedule
    """
    service = db.query(ServiceSchedule).filter(ServiceSchedule.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Only admin or assigned technician can update
    if current_user.role != "admin" and service.technician_id != current_user.id and service.technician2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this service"
        )

    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


# Service Report Endpoints
@router.get("/reports", response_model=List[ServiceReportResponse])
def get_service_reports(
    skip: int = 0,
    limit: int = 100,
    service_id: str = Query(None),
    technician_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get service reports
    """
    query = db.query(ServiceReport)

    # If technician, only show their reports
    if current_user.role == "technician":
        query = query.filter(ServiceReport.technician_id == current_user.id)
    elif technician_id:
        query = query.filter(ServiceReport.technician_id == technician_id)

    if service_id:
        query = query.filter(ServiceReport.service_id == service_id)

    reports = query.order_by(ServiceReport.created_at.desc()).offset(skip).limit(limit).all()
    return reports


@router.get("/reports/{report_id}", response_model=ServiceReportResponse)
def get_service_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get service report by ID
    """
    report = db.query(ServiceReport).filter(ServiceReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service report not found"
        )
    return report


@router.post("/reports", response_model=ServiceReportResponse, status_code=status.HTTP_201_CREATED)
def create_service_report(
    report_in: ServiceReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create service report (Technician starts service)
    """
    # Verify service exists
    service = db.query(ServiceSchedule).filter(ServiceSchedule.id == report_in.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Only assigned technician can create report
    if service.technician_id != current_user.id and service.technician2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to report on this service"
        )

    report = ServiceReport(
        id=str(uuid.uuid4()),
        technician_id=current_user.id,
        check_in_time=datetime.now(),
        **report_in.model_dump()
    )

    # Update service status
    service.status = ServiceStatus.IN_PROGRESS

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.put("/reports/{report_id}", response_model=ServiceReportResponse)
def update_service_report(
    report_id: str,
    report_in: ServiceReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update service report (Complete service)
    """
    report = db.query(ServiceReport).filter(ServiceReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service report not found"
        )

    # Only the technician who created the report can update it
    if report.technician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this report"
        )

    update_data = report_in.model_dump(exclude_unset=True)

    # If completing the service
    if update_data.get("completion_time"):
        # Update service schedule
        service = db.query(ServiceSchedule).filter(ServiceSchedule.id == report.service_id).first()
        service.status = ServiceStatus.COMPLETED
        service.actual_date = datetime.now()

    for field, value in update_data.items():
        setattr(report, field, value)

    db.commit()
    db.refresh(report)
    return report


@router.get("/stats/count", status_code=status.HTTP_200_OK)
def get_services_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get count statistics for services by status
    """
    today = datetime.now().date()

    pending_count = db.query(ServiceSchedule).filter(
        or_(
            ServiceSchedule.status == ServiceStatus.PENDING,
            ServiceSchedule.status == ServiceStatus.SCHEDULED
        )
    ).count()

    completed_today_count = db.query(ServiceSchedule).filter(
        and_(
            ServiceSchedule.status == ServiceStatus.COMPLETED,
            ServiceSchedule.actual_date >= datetime.combine(today, datetime.min.time()),
            ServiceSchedule.actual_date < datetime.combine(today + timedelta(days=1), datetime.min.time())
        )
    ).count()

    overdue_count = db.query(ServiceSchedule).filter(
        ServiceSchedule.status == ServiceStatus.OVERDUE
    ).count()

    total_services = db.query(ServiceSchedule).count()

    return {
        "total_services": total_services,
        "pending_services": pending_count,
        "completed_today": completed_today_count,
        "overdue_services": overdue_count
    }

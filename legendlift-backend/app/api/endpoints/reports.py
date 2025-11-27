"""
Admin Reporting API Endpoints
Generate and view service reports on daily, monthly, and yearly basis
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User
from app.models.service import ServiceSchedule, ServiceReport, ServiceStatus
from app.models.customer import Customer
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()


class DailyReportSummary(BaseModel):
    """Daily service report summary"""
    date: str
    total_services: int
    completed_services: int
    in_progress_services: int
    pending_services: int
    adhoc_services: int
    scheduled_services: int
    technician_performance: List[dict]


class MonthlyReportSummary(BaseModel):
    """Monthly service report summary"""
    month: str  # YYYY-MM
    year: int
    month_name: str
    total_services: int
    completed_services: int
    in_progress_services: int
    pending_services: int
    adhoc_services: int
    scheduled_services: int
    daily_breakdown: List[dict]
    technician_performance: List[dict]
    completion_rate: float


class YearlyReportSummary(BaseModel):
    """Yearly service report summary"""
    year: int
    total_services: int
    completed_services: int
    in_progress_services: int
    pending_services: int
    adhoc_services: int
    scheduled_services: int
    monthly_breakdown: List[dict]
    technician_performance: List[dict]
    completion_rate: float


@router.get("/daily", response_model=DailyReportSummary)
def get_daily_report(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (default: today)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get daily service report

    Shows:
    - Total services for the day
    - Status breakdown (completed, in progress, pending)
    - Service type breakdown (adhoc, scheduled)
    - Technician performance

    Only accessible by admin users
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access reports"
        )

    # Parse date or use today
    if date:
        try:
            report_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    else:
        report_date = datetime.now().date()

    # Get services for the date
    services = db.query(ServiceSchedule).filter(
        func.date(ServiceSchedule.created_at) == report_date
    ).all()

    # Count by status
    total_services = len(services)
    completed_services = len([s for s in services if s.status == ServiceStatus.COMPLETED])
    in_progress_services = len([s for s in services if s.status == ServiceStatus.IN_PROGRESS])
    pending_services = len([s for s in services if s.status == ServiceStatus.PENDING])

    # Count by type
    adhoc_services = len([s for s in services if s.is_adhoc])
    scheduled_services = len([s for s in services if not s.is_adhoc])

    # Technician performance
    technicians = {}
    for service in services:
        if service.technician_id:
            if service.technician_id not in technicians:
                tech = db.query(User).filter(User.id == service.technician_id).first()
                technicians[service.technician_id] = {
                    "technician_id": service.technician_id,
                    "technician_name": tech.name if tech else "Unknown",
                    "total_assigned": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "pending": 0,
                }

            technicians[service.technician_id]["total_assigned"] += 1
            if service.status == ServiceStatus.COMPLETED:
                technicians[service.technician_id]["completed"] += 1
            elif service.status == ServiceStatus.IN_PROGRESS:
                technicians[service.technician_id]["in_progress"] += 1
            elif service.status == ServiceStatus.PENDING:
                technicians[service.technician_id]["pending"] += 1

    return DailyReportSummary(
        date=report_date.strftime("%Y-%m-%d"),
        total_services=total_services,
        completed_services=completed_services,
        in_progress_services=in_progress_services,
        pending_services=pending_services,
        adhoc_services=adhoc_services,
        scheduled_services=scheduled_services,
        technician_performance=list(technicians.values()),
    )


@router.get("/monthly", response_model=MonthlyReportSummary)
def get_monthly_report(
    month: Optional[int] = Query(None, description="Month (1-12)"),
    year: Optional[int] = Query(None, description="Year (e.g., 2024)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get monthly service report

    Shows:
    - Total services for the month
    - Status breakdown
    - Service type breakdown
    - Daily breakdown
    - Technician performance
    - Completion rate

    Only accessible by admin users
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access reports"
        )

    # Use current month/year if not provided
    now = datetime.now()
    report_month = month or now.month
    report_year = year or now.year

    # Validate month
    if report_month < 1 or report_month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )

    # Calculate date range
    start_date = datetime(report_year, report_month, 1)
    if report_month == 12:
        end_date = datetime(report_year + 1, 1, 1)
    else:
        end_date = datetime(report_year, report_month + 1, 1)

    # Get services for the month
    services = db.query(ServiceSchedule).filter(
        and_(
            ServiceSchedule.created_at >= start_date,
            ServiceSchedule.created_at < end_date
        )
    ).all()

    # Count by status
    total_services = len(services)
    completed_services = len([s for s in services if s.status == ServiceStatus.COMPLETED])
    in_progress_services = len([s for s in services if s.status == ServiceStatus.IN_PROGRESS])
    pending_services = len([s for s in services if s.status == ServiceStatus.PENDING])

    # Count by type
    adhoc_services = len([s for s in services if s.is_adhoc])
    scheduled_services = len([s for s in services if not s.is_adhoc])

    # Completion rate
    completion_rate = (completed_services / total_services * 100) if total_services > 0 else 0

    # Daily breakdown
    daily_stats = {}
    for service in services:
        day = service.created_at.date()
        if day not in daily_stats:
            daily_stats[day] = {"date": day.strftime("%Y-%m-%d"), "total": 0, "completed": 0}

        daily_stats[day]["total"] += 1
        if service.status == ServiceStatus.COMPLETED:
            daily_stats[day]["completed"] += 1

    # Technician performance
    technicians = {}
    for service in services:
        if service.technician_id:
            if service.technician_id not in technicians:
                tech = db.query(User).filter(User.id == service.technician_id).first()
                technicians[service.technician_id] = {
                    "technician_id": service.technician_id,
                    "technician_name": tech.name if tech else "Unknown",
                    "total_assigned": 0,
                    "completed": 0,
                    "completion_rate": 0,
                }

            technicians[service.technician_id]["total_assigned"] += 1
            if service.status == ServiceStatus.COMPLETED:
                technicians[service.technician_id]["completed"] += 1

    # Calculate completion rates for technicians
    for tech_id in technicians:
        total = technicians[tech_id]["total_assigned"]
        completed = technicians[tech_id]["completed"]
        technicians[tech_id]["completion_rate"] = (completed / total * 100) if total > 0 else 0

    # Month name
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    month_name = month_names[report_month - 1]

    return MonthlyReportSummary(
        month=f"{report_year}-{report_month:02d}",
        year=report_year,
        month_name=month_name,
        total_services=total_services,
        completed_services=completed_services,
        in_progress_services=in_progress_services,
        pending_services=pending_services,
        adhoc_services=adhoc_services,
        scheduled_services=scheduled_services,
        daily_breakdown=list(daily_stats.values()),
        technician_performance=list(technicians.values()),
        completion_rate=round(completion_rate, 2),
    )


@router.get("/yearly", response_model=YearlyReportSummary)
def get_yearly_report(
    year: Optional[int] = Query(None, description="Year (e.g., 2024)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get yearly service report

    Shows:
    - Total services for the year
    - Status breakdown
    - Service type breakdown
    - Monthly breakdown
    - Technician performance
    - Completion rate

    Only accessible by admin users
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access reports"
        )

    # Use current year if not provided
    report_year = year or datetime.now().year

    # Calculate date range
    start_date = datetime(report_year, 1, 1)
    end_date = datetime(report_year + 1, 1, 1)

    # Get services for the year
    services = db.query(ServiceSchedule).filter(
        and_(
            ServiceSchedule.created_at >= start_date,
            ServiceSchedule.created_at < end_date
        )
    ).all()

    # Count by status
    total_services = len(services)
    completed_services = len([s for s in services if s.status == ServiceStatus.COMPLETED])
    in_progress_services = len([s for s in services if s.status == ServiceStatus.IN_PROGRESS])
    pending_services = len([s for s in services if s.status == ServiceStatus.PENDING])

    # Count by type
    adhoc_services = len([s for s in services if s.is_adhoc])
    scheduled_services = len([s for s in services if not s.is_adhoc])

    # Completion rate
    completion_rate = (completed_services / total_services * 100) if total_services > 0 else 0

    # Monthly breakdown
    monthly_stats = {}
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for month in range(1, 13):
        monthly_stats[month] = {
            "month": month,
            "month_name": month_names[month - 1],
            "total": 0,
            "completed": 0,
        }

    for service in services:
        month = service.created_at.month
        monthly_stats[month]["total"] += 1
        if service.status == ServiceStatus.COMPLETED:
            monthly_stats[month]["completed"] += 1

    # Technician performance
    technicians = {}
    for service in services:
        if service.technician_id:
            if service.technician_id not in technicians:
                tech = db.query(User).filter(User.id == service.technician_id).first()
                technicians[service.technician_id] = {
                    "technician_id": service.technician_id,
                    "technician_name": tech.name if tech else "Unknown",
                    "total_assigned": 0,
                    "completed": 0,
                    "completion_rate": 0,
                }

            technicians[service.technician_id]["total_assigned"] += 1
            if service.status == ServiceStatus.COMPLETED:
                technicians[service.technician_id]["completed"] += 1

    # Calculate completion rates for technicians
    for tech_id in technicians:
        total = technicians[tech_id]["total_assigned"]
        completed = technicians[tech_id]["completed"]
        technicians[tech_id]["completion_rate"] = (completed / total * 100) if total > 0 else 0

    return YearlyReportSummary(
        year=report_year,
        total_services=total_services,
        completed_services=completed_services,
        in_progress_services=in_progress_services,
        pending_services=pending_services,
        adhoc_services=adhoc_services,
        scheduled_services=scheduled_services,
        monthly_breakdown=list(monthly_stats.values()),
        technician_performance=list(technicians.values()),
        completion_rate=round(completion_rate, 2),
    )


@router.get("/services/detailed")
def get_detailed_services_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    technician_id: Optional[str] = Query(None, description="Filter by technician"),
    status: Optional[str] = Query(None, description="Filter by status"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed service list with filters

    Supports filtering by:
    - Date range
    - Technician
    - Status
    - Service type

    Returns detailed service information including customer details,
    technician info, and service reports
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access detailed reports"
        )

    # Build query
    query = db.query(ServiceSchedule)

    # Apply filters
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(ServiceSchedule.created_at >= start_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(ServiceSchedule.created_at < end_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    if technician_id:
        query = query.filter(ServiceSchedule.technician_id == technician_id)

    if status:
        query = query.filter(ServiceSchedule.status == status)

    if service_type:
        query = query.filter(ServiceSchedule.service_type == service_type)

    # Get services
    services = query.order_by(ServiceSchedule.created_at.desc()).all()

    # Build detailed response
    result = []
    for service in services:
        customer = db.query(Customer).filter(Customer.id == service.customer_id).first()
        technician = db.query(User).filter(User.id == service.technician_id).first()
        report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()

        result.append({
            "service_id": service.service_id,
            "service_db_id": service.id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_location": customer.area if customer else "Unknown",
            "customer_job_number": customer.job_number if customer else None,
            "technician_name": technician.name if technician else "Unassigned",
            "technician_phone": technician.phone if technician else None,
            "status": service.status.value,
            "service_type": service.service_type,
            "is_adhoc": service.is_adhoc,
            "scheduled_date": service.scheduled_date.isoformat() if service.scheduled_date else None,
            "actual_date": service.actual_date.isoformat() if service.actual_date else None,
            "created_at": service.created_at.isoformat(),
            "report_id": report.report_id if report else None,
            "check_in_time": report.check_in_time.isoformat() if report and report.check_in_time else None,
            "check_out_time": report.check_out_time.isoformat() if report and report.check_out_time else None,
            "rating": report.rating if report else None,
            "notes": service.notes,
        })

    return {
        "total_count": len(result),
        "services": result,
    }

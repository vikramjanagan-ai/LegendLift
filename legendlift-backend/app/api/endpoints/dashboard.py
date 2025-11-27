from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.user import User
from app.models.customer import Customer, AMCStatus
from app.models.service import ServiceSchedule, ServiceStatus, ServiceReport
from app.models.callback import CallBack, CallBackStatus
from app.models.repair import Repair, RepairStatus
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get dashboard overview with SEPARATE icon metrics
    Each metric is independent, not paired comparisons

    Time-based metrics (Services, Callbacks, Repairs, Reports) show last 30 days
    Customer metrics show all-time totals
    Auto-updates as time progresses
    """
    # Get last 30 days date range (rolling window - auto-updates)
    now = datetime.now()
    last_month_start = now - timedelta(days=30)

    # CUSTOMER METRICS (All-time)
    total_customers = db.query(Customer).count()
    active_customers = db.query(Customer).filter(Customer.amc_status == AMCStatus.ACTIVE).count()

    # SERVICE METRICS (Last 30 days)
    total_services = db.query(ServiceSchedule).filter(
        ServiceSchedule.created_at >= last_month_start
    ).count()
    completed_services = db.query(ServiceSchedule).filter(
        ServiceSchedule.created_at >= last_month_start,
        ServiceSchedule.status == ServiceStatus.COMPLETED
    ).count()

    # CALLBACK METRICS (Last 30 days)
    total_callbacks = db.query(CallBack).filter(
        CallBack.created_at >= last_month_start
    ).count()
    completed_callbacks = db.query(CallBack).filter(
        CallBack.created_at >= last_month_start,
        CallBack.status == CallBackStatus.COMPLETED
    ).count()

    # REPAIR METRICS (Last 30 days)
    total_repairs = db.query(Repair).filter(
        Repair.created_at >= last_month_start
    ).count()
    completed_repairs = db.query(Repair).filter(
        Repair.created_at >= last_month_start,
        Repair.status == RepairStatus.COMPLETED
    ).count()

    # REPORT METRICS (Last 30 days)
    total_reports = db.query(ServiceReport).filter(
        ServiceReport.created_at >= last_month_start
    ).count()
    completed_reports = db.query(ServiceReport).filter(
        ServiceReport.created_at >= last_month_start,
        ServiceReport.check_out_time.isnot(None)
    ).count()

    # Return as SEPARATE ICONS (not paired)
    return {
        "period": "Last 30 Days",
        "date_range": {
            "from": last_month_start.strftime("%Y-%m-%d"),
            "to": now.strftime("%Y-%m-%d")
        },
        "current_date": now.strftime("%Y-%m-%d"),
        "icons": [
            {
                "id": 1,
                "title": "Total Customers",
                "value": total_customers,
                "icon": "users",
                "color": "#4CAF50",
                "period": "All Time"
            },
            {
                "id": 2,
                "title": "Active Customers",
                "value": active_customers,
                "icon": "user-check",
                "color": "#2196F3",
                "period": "All Time"
            },
            {
                "id": 3,
                "title": "Total Services",
                "value": total_services,
                "icon": "briefcase",
                "color": "#FF9800",
                "period": "Last 30 Days"
            },
            {
                "id": 4,
                "title": "Completed Services",
                "value": completed_services,
                "icon": "check-circle",
                "color": "#4CAF50",
                "period": "Last 30 Days"
            },
            {
                "id": 5,
                "title": "Total Callbacks",
                "value": total_callbacks,
                "icon": "phone",
                "color": "#F44336",
                "period": "Last 30 Days"
            },
            {
                "id": 6,
                "title": "Completed Callbacks",
                "value": completed_callbacks,
                "icon": "phone-check",
                "color": "#4CAF50",
                "period": "Last 30 Days"
            },
            {
                "id": 7,
                "title": "Total Repairs",
                "value": total_repairs,
                "icon": "tool",
                "color": "#9C27B0",
                "period": "Last 30 Days"
            },
            {
                "id": 8,
                "title": "Completed Repairs",
                "value": completed_repairs,
                "icon": "check-square",
                "color": "#4CAF50",
                "period": "Last 30 Days"
            },
            {
                "id": 9,
                "title": "Total Reports",
                "value": total_reports,
                "icon": "file-text",
                "color": "#607D8B",
                "period": "Last 30 Days"
            },
            {
                "id": 10,
                "title": "Completed Reports",
                "value": completed_reports,
                "icon": "file-check",
                "color": "#4CAF50",
                "period": "Last 30 Days"
            }
        ]
    }

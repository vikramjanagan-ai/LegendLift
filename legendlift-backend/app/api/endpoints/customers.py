from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from app.db.session import get_db
from app.models.user import User
from app.models.customer import Customer, AMCStatus
from app.models.service import ServiceSchedule, ServiceStatus, ServiceType
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, AIIMSStatusUpdate
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


def create_services_for_customer(customer: Customer, db: Session):
    """
    Automatically create services based on AMC dates and services_per_year
    Services are distributed evenly throughout the AMC period
    """
    if not customer.amc_valid_from or not customer.services_per_year:
        return []

    # Calculate interval between services in months
    amc_duration_months = 12  # AMC is typically for one year
    interval_months = amc_duration_months / customer.services_per_year

    services_created = []
    service_date = datetime.combine(customer.amc_valid_from, datetime.min.time())

    for i in range(customer.services_per_year):
        # Generate service ID
        date_str = service_date.strftime("%Y%m%d")
        random_str = uuid.uuid4().hex[:5].upper()
        service_id = f"SRV-{date_str}-{random_str}"

        service = ServiceSchedule(
            id=str(uuid.uuid4()),
            service_id=service_id,
            customer_id=customer.id,
            contract_id=None,  # Will be set when AMC contract is created
            scheduled_date=service_date,
            status=ServiceStatus.PENDING,
            service_type=ServiceType.SERVICE,
            is_adhoc=False,
            notes=f"Auto-generated service {i+1}/{customer.services_per_year}"
        )

        db.add(service)
        services_created.append(service)

        # Calculate next service date
        service_date = service_date + relativedelta(months=int(interval_months))

    return services_created


def check_and_update_amc_status(customer: Customer, db: Session):
    """
    Check if AMC has expired > 30 days and update status to INACTIVE
    """
    if not customer.amc_valid_to:
        return

    today = datetime.now().date()
    expiry_date = customer.amc_valid_to
    days_since_expiry = (today - expiry_date).days

    # If expired for more than 30 days, set to INACTIVE
    if days_since_expiry > 30 and customer.amc_status == AMCStatus.ACTIVE:
        customer.amc_status = AMCStatus.INACTIVE
        db.commit()


@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    route: int = Query(None),
    area: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all customers with optional filters
    """
    query = db.query(Customer)

    if route:
        query = query.filter(Customer.route == route)

    if area:
        query = query.filter(Customer.area.ilike(f"%{area}%"))

    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.job_number.ilike(f"%{search}%"),
                Customer.contact_person.ilike(f"%{search}%"),
            )
        )

    customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get customer by ID
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create new customer (Admin only)

    Automatically creates services based on:
    - amc_valid_from: Start date of AMC
    - services_per_year: Number of services (6, 9, 10, or 12)

    Services are distributed evenly throughout the year.
    Only ADMIN can set aiims_status to active.
    """
    # Check if job number already exists
    existing_customer = db.query(Customer).filter(
        Customer.job_number == customer_in.job_number
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job number already exists"
        )

    # Validate services_per_year if provided
    if customer_in.services_per_year and customer_in.services_per_year not in [6, 9, 10, 12]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="services_per_year must be one of: 6, 9, 10, or 12"
        )

    customer = Customer(
        id=str(uuid.uuid4()),
        **customer_in.model_dump()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    # Automatically create services if AMC dates are provided
    if customer.amc_valid_from and customer.services_per_year:
        services_created = create_services_for_customer(customer, db)
        db.commit()
        print(f"✅ Created {len(services_created)} services for customer {customer.name}")

    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update customer (Admin only)
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete customer (Admin only)
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()
    return None


@router.patch("/{customer_id}/aiims-status", response_model=CustomerResponse)
def update_aiims_status(
    customer_id: str,
    status_update: AIIMSStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update AIIMS status (Admin only)
    Only admins can activate/deactivate AIIMS status
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    customer.aiims_status = status_update.aiims_status
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/active-amc/", response_model=List[CustomerResponse])
def get_active_amc_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all customers with ACTIVE AMC status
    Used for callback creation (only active AMC customers)
    """
    customers = db.query(Customer).filter(
        Customer.amc_status == "ACTIVE"
    ).offset(skip).limit(limit).all()
    return customers


@router.post("/update-amc-statuses", status_code=status.HTTP_200_OK)
def update_all_amc_statuses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Check all customers and update AMC status to INACTIVE
    if AMC has expired for more than 30 days (Admin only)

    This endpoint can be called manually or scheduled as a cron job.
    """
    customers = db.query(Customer).filter(
        Customer.amc_valid_to.isnot(None),
        Customer.amc_status == AMCStatus.ACTIVE
    ).all()

    updated_count = 0
    for customer in customers:
        today = datetime.now().date()
        days_since_expiry = (today - customer.amc_valid_to).days

        if days_since_expiry > 30:
            customer.amc_status = AMCStatus.INACTIVE
            updated_count += 1

    db.commit()

    return {
        "message": f"Updated {updated_count} customer(s) to INACTIVE status",
        "updated_count": updated_count,
        "checked_customers": len(customers)
    }


@router.get("/stats/count", status_code=status.HTTP_200_OK)
def get_customers_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get total count of customers and active AMC contracts
    """
    total_customers = db.query(Customer).count()
    active_amc = db.query(Customer).filter(Customer.amc_status == AMCStatus.ACTIVE).count()

    return {
        "total_customers": total_customers,
        "active_contracts": active_amc
    }


@router.get("/{customer_id}/period-report")
def get_customer_period_report(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get customer-based report for the active contract period
    Shows services, callbacks, repairs, and materials within contract period
    """
    from app.models.callback import CallBack
    from app.models.repair import Repair
    from app.models.service import ServiceReport

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Get contract period
    if not customer.amc_valid_from or not customer.amc_valid_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer does not have active contract period defined"
        )

    period_start = datetime.combine(customer.amc_valid_from, datetime.min.time())
    period_end = datetime.combine(customer.amc_valid_to, datetime.max.time())

    # Get services completed in the period
    services = db.query(ServiceSchedule).filter(
        ServiceSchedule.customer_id == customer_id,
        ServiceSchedule.status == ServiceStatus.COMPLETED,
        ServiceSchedule.actual_date >= period_start,
        ServiceSchedule.actual_date <= period_end
    ).all()

    # Get callbacks raised in the period
    callbacks = db.query(CallBack).filter(
        CallBack.customer_id == customer_id,
        CallBack.created_at >= period_start,
        CallBack.created_at <= period_end
    ).all()

    # Get repairs performed in the period
    repairs = db.query(Repair).filter(
        Repair.customer_id == customer_id,
        Repair.created_at >= period_start,
        Repair.created_at <= period_end
    ).all()

    # Collect all materials replaced
    all_materials = []

    # From service reports
    for service in services:
        reports = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).all()
        for report in reports:
            if report.parts_replaced:
                import json
                try:
                    parts = json.loads(report.parts_replaced) if isinstance(report.parts_replaced, str) else report.parts_replaced
                    all_materials.extend(parts)
                except:
                    pass

    # From callbacks
    for callback in callbacks:
        if callback.materials_changed:
            import json
            try:
                materials = json.loads(callback.materials_changed) if isinstance(callback.materials_changed, str) else callback.materials_changed
                all_materials.extend(materials)
            except:
                pass

    # Prepare repair details
    repair_details = []
    for repair in repairs:
        repair_details.append({
            "id": repair.id,
            "description": repair.description,
            "scheduled_date": repair.scheduled_date,
            "status": repair.status,
        })

    # Prepare callback details
    callback_details = []
    for callback in callbacks:
        callback_details.append({
            "id": callback.id,
            "description": callback.description,
            "status": callback.status,
            "scheduled_date": callback.scheduled_date,
            "lift_status_on_closure": callback.lift_status_on_closure,
        })

    return {
        "customer_id": customer_id,
        "customer_name": customer.name,
        "job_number": customer.job_number,
        "period": {
            "start": customer.amc_valid_from,
            "end": customer.amc_valid_to,
        },
        "summary": {
            "total_services_completed": len(services),
            "total_callbacks_raised": len(callbacks),
            "total_repairs_performed": len(repairs),
            "total_materials_replaced": len(all_materials),
        },
        "details": {
            "services": [{"id": s.id, "service_id": s.service_id, "date": s.actual_date} for s in services],
            "callbacks": callback_details,
            "repairs": repair_details,
            "materials_replaced": list(set(all_materials)),  # Unique materials
        }
    }

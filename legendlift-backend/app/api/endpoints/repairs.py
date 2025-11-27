from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid
import json
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.models.repair import Repair
from app.models.customer import Customer
from app.schemas.repair import RepairCreate, RepairUpdate, RepairResponse, RepairAssignTechnician
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[RepairResponse])
def get_repairs(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = Query(None, alias="status"),
    customer_id: str = Query(None),
    technician_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all repairs with optional filters
    """
    query = db.query(Repair)

    if status_filter:
        query = query.filter(Repair.status == status_filter)

    if customer_id:
        query = query.filter(Repair.customer_id == customer_id)

    if technician_id:
        # Filter repairs where technician_id is in the technicians JSON array
        query = query.filter(Repair.technicians.contains(f'"{technician_id}"'))

    repairs = query.offset(skip).limit(limit).all()

    # Enrich with customer and admin info
    result = []
    for repair in repairs:
        repair_dict = {
            "id": repair.id,
            "customer_id": repair.customer_id,
            "created_by_admin_id": repair.created_by_admin_id,
            "customer_name": repair.customer_name,
            "contact_number": repair.contact_number,
            "scheduled_date": repair.scheduled_date,
            "status": repair.status,
            "description": repair.description,
            "notes": repair.notes,
            "technicians": json.loads(repair.technicians) if repair.technicians else [],
            "completed_at": repair.completed_at,
            "created_at": repair.created_at,
            "updated_at": repair.updated_at,
        }

        # Get existing customer info if customer_id is set
        if repair.customer_id:
            customer = db.query(Customer).filter(Customer.id == repair.customer_id).first()
            if customer:
                repair_dict["existing_customer_name"] = customer.name
                repair_dict["customer_job_number"] = customer.job_number

        # Get admin info
        admin = db.query(User).filter(User.id == repair.created_by_admin_id).first()
        if admin:
            repair_dict["admin_name"] = admin.email

        # Count technicians
        technicians = json.loads(repair.technicians) if repair.technicians else []
        repair_dict["technician_count"] = len(technicians)

        result.append(repair_dict)

    return result


@router.get("/{repair_id}", response_model=RepairResponse)
def get_repair(
    repair_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get repair by ID
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": json.loads(repair.technicians) if repair.technicians else [],
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
    }

    # Get existing customer info if customer_id is set
    if repair.customer_id:
        customer = db.query(Customer).filter(Customer.id == repair.customer_id).first()
        if customer:
            repair_dict["existing_customer_name"] = customer.name
            repair_dict["customer_job_number"] = customer.job_number

    technicians = json.loads(repair.technicians) if repair.technicians else []
    repair_dict["technician_count"] = len(technicians)

    return repair_dict


@router.post("/", response_model=RepairResponse, status_code=status.HTTP_201_CREATED)
def create_repair(
    repair_in: RepairCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create new repair (Admin only)
    Can create repairs for any customer status or non-customers
    """
    # If customer_id is provided, check if customer exists (but don't validate AMC status)
    if repair_in.customer_id:
        customer = db.query(Customer).filter(Customer.id == repair_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
    else:
        # For non-customers, require customer_name and contact_number
        if not repair_in.customer_name or not repair_in.contact_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="For non-customers, customer_name and contact_number are required"
            )

    repair = Repair(
        id=str(uuid.uuid4()),
        customer_id=repair_in.customer_id,
        created_by_admin_id=current_user.id,
        customer_name=repair_in.customer_name,
        contact_number=repair_in.contact_number,
        scheduled_date=repair_in.scheduled_date,
        description=repair_in.description,
        notes=repair_in.notes,
        status="PENDING",
        technicians=json.dumps([]),  # Empty array initially
    )

    db.add(repair)
    db.commit()
    db.refresh(repair)

    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": [],
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
        "technician_count": 0,
    }

    if repair.customer_id:
        customer = db.query(Customer).filter(Customer.id == repair.customer_id).first()
        if customer:
            repair_dict["existing_customer_name"] = customer.name
            repair_dict["customer_job_number"] = customer.job_number

    return repair_dict


@router.put("/{repair_id}", response_model=RepairResponse)
def update_repair(
    repair_id: str,
    repair_in: RepairUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update repair
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    update_data = repair_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(repair, field, value)

    db.commit()
    db.refresh(repair)

    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": json.loads(repair.technicians) if repair.technicians else [],
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
    }

    technicians = json.loads(repair.technicians) if repair.technicians else []
    repair_dict["technician_count"] = len(technicians)

    return repair_dict


@router.post("/{repair_id}/assign", response_model=RepairResponse)
def assign_technician_to_repair(
    repair_id: str,
    assignment: RepairAssignTechnician,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Assign technician to repair (Admin only)
    Unlimited technicians allowed for repairs
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    # Parse current technicians
    technicians = json.loads(repair.technicians) if repair.technicians else []

    # Check if technician already assigned
    if assignment.technician_id in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician already assigned to this repair"
        )

    # Verify technician exists
    technician = db.query(User).filter(User.id == assignment.technician_id).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Add technician (no limit for repairs)
    technicians.append(assignment.technician_id)
    repair.technicians = json.dumps(technicians)

    db.commit()
    db.refresh(repair)

    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": technicians,
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
        "technician_count": len(technicians),
    }

    return repair_dict


@router.post("/{repair_id}/join", response_model=RepairResponse)
def join_repair(
    repair_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician joins repair (self-assignment)
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    # Parse current technicians
    technicians = json.loads(repair.technicians) if repair.technicians else []

    # Check if already joined
    if current_user.id in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already assigned to this repair"
        )

    # Add current user
    technicians.append(current_user.id)
    repair.technicians = json.dumps(technicians)

    # Update status to IN_PROGRESS if first technician
    if repair.status == "PENDING":
        repair.status = "IN_PROGRESS"

    db.commit()
    db.refresh(repair)

    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": technicians,
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
        "technician_count": len(technicians),
    }

    return repair_dict


@router.delete("/{repair_id}/unassign/{technician_id}", response_model=RepairResponse)
def unassign_technician_from_repair(
    repair_id: str,
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Unassign technician from repair (Admin only)
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    # Parse current technicians
    technicians = json.loads(repair.technicians) if repair.technicians else []

    # Check if technician is assigned
    if technician_id not in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician not assigned to this repair"
        )

    # Remove technician
    technicians.remove(technician_id)
    repair.technicians = json.dumps(technicians)

    db.commit()
    db.refresh(repair)

    # Build response with existing customer info if available
    repair_dict = {
        "id": repair.id,
        "customer_id": repair.customer_id,
        "created_by_admin_id": repair.created_by_admin_id,
        "customer_name": repair.customer_name,
        "contact_number": repair.contact_number,
        "scheduled_date": repair.scheduled_date,
        "status": repair.status,
        "description": repair.description,
        "notes": repair.notes,
        "technicians": technicians,
        "completed_at": repair.completed_at,
        "created_at": repair.created_at,
        "updated_at": repair.updated_at,
        "technician_count": len(technicians),
    }

    if repair.customer_id:
        customer = db.query(Customer).filter(Customer.id == repair.customer_id).first()
        if customer:
            repair_dict["existing_customer_name"] = customer.name
            repair_dict["existing_customer_job_number"] = customer.job_number

    return repair_dict


@router.get("/technician/my-repairs", response_model=List[RepairResponse])
def get_my_repairs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get repairs assigned to current technician OR unassigned repairs
    Returns:
    - Repairs where current user is in technicians array
    - Repairs with no technicians assigned (empty array) - visible to all technicians
    """
    from sqlalchemy import or_

    # Find repairs where:
    # 1. Current user is in technicians array, OR
    # 2. Technicians array is empty (unassigned - visible to all)
    repairs = db.query(Repair).filter(
        or_(
            Repair.technicians.contains(f'"{current_user.id}"'),
            Repair.technicians == json.dumps([]),
            Repair.technicians == None
        )
    ).offset(skip).limit(limit).all()

    result = []
    for repair in repairs:
        repair_dict = {
            "id": repair.id,
            "customer_id": repair.customer_id,
            "created_by_admin_id": repair.created_by_admin_id,
            "customer_name": repair.customer_name,
            "contact_number": repair.contact_number,
            "scheduled_date": repair.scheduled_date,
            "status": repair.status,
            "description": repair.description,
            "notes": repair.notes,
            "technicians": json.loads(repair.technicians) if repair.technicians else [],
            "completed_at": repair.completed_at,
            "created_at": repair.created_at,
            "updated_at": repair.updated_at,
        }

        # Get existing customer info if customer_id is set
        if repair.customer_id:
            customer = db.query(Customer).filter(Customer.id == repair.customer_id).first()
            if customer:
                repair_dict["existing_customer_name"] = customer.name
                repair_dict["customer_job_number"] = customer.job_number

        technicians = json.loads(repair.technicians) if repair.technicians else []
        repair_dict["technician_count"] = len(technicians)

        result.append(repair_dict)

    return result


@router.get("/{repair_id}/technicians")
def get_repair_technicians(
    repair_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get technicians assigned to repair
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    # Parse technician IDs from JSON
    technician_ids = json.loads(repair.technicians) if repair.technicians else []

    # Fetch technician details
    result = []
    for tech_id in technician_ids:
        technician = db.query(User).filter(User.id == tech_id).first()
        if technician:
            result.append({
                "id": technician.id,
                "name": technician.name,
                "email": technician.email,
                "phone": technician.phone,
            })

    return result


@router.delete("/{repair_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_repair(
    repair_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete repair (Admin only)
    """
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair not found"
        )

    db.delete(repair)
    db.commit()
    return None

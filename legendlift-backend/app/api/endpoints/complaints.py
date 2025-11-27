from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import uuid
from app.db.session import get_db
from app.models.user import User
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
)
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


# ===============================================
# TECHNICIAN CALLBACK/REPAIR WORKFLOW ENDPOINTS
# (Must be defined BEFORE /{complaint_id} to avoid route conflicts)
# ===============================================

@router.get("/available", response_model=List[ComplaintResponse])
def get_available_callbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all unassigned callbacks/complaints (available for technicians to pick)
    Returns complaints sorted by: Priority (URGENT->HIGH->MEDIUM->LOW) then Created Time (oldest first)
    Only returns OPEN and IN_PROGRESS complaints with no assigned technician
    """
    if current_user.role not in ["admin", "technician"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians and admins can view available callbacks"
        )

    # Get unassigned complaints (OPEN or IN_PROGRESS with no technician)
    complaints = (
        db.query(Complaint)
        .filter(
            Complaint.assigned_to_id.is_(None),
            or_(
                Complaint.status == ComplaintStatus.OPEN,
                Complaint.status == ComplaintStatus.IN_PROGRESS
            )
        )
        .all()
    )

    # Custom sorting: Priority order (URGENT > HIGH > MEDIUM > LOW), then oldest first
    priority_order = {
        ComplaintPriority.URGENT: 0,
        ComplaintPriority.HIGH: 1,
        ComplaintPriority.MEDIUM: 2,
        ComplaintPriority.LOW: 3,
    }

    complaints_sorted = sorted(
        complaints,
        key=lambda c: (priority_order.get(c.priority, 999), c.created_at)
    )

    # Enrich with customer data
    result = []
    for complaint in complaints_sorted:
        complaint_dict = {
            "id": complaint.id,
            "complaint_id": complaint.complaint_id,
            "customer_id": complaint.customer_id,
            "user_id": complaint.user_id,
            "title": complaint.title,
            "description": complaint.description,
            "issue_type": complaint.issue_type,
            "status": complaint.status,
            "priority": complaint.priority,
            "assigned_to_id": complaint.assigned_to_id,
            "resolved_at": complaint.resolved_at,
            "resolution_notes": complaint.resolution_notes,
            "created_at": complaint.created_at,
            "updated_at": complaint.updated_at,
        }

        if complaint.customer:
            complaint_dict["customer_name"] = complaint.customer.name
            complaint_dict["customer_phone"] = complaint.customer.phone

        result.append(complaint_dict)

    return result


@router.get("/my-callbacks", response_model=List[ComplaintResponse])
def get_my_callbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get callbacks assigned to current technician
    Returns complaints grouped by status: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
    Within each status: sorted by Priority then Created Time (oldest first)
    """
    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can view their assigned callbacks"
        )

    # Get technician's assigned complaints
    complaints = (
        db.query(Complaint)
        .filter(Complaint.assigned_to_id == current_user.id)
        .all()
    )

    # Custom sorting
    status_order = {
        ComplaintStatus.OPEN: 0,
        ComplaintStatus.IN_PROGRESS: 1,
        ComplaintStatus.RESOLVED: 2,
        ComplaintStatus.CLOSED: 3,
    }

    priority_order = {
        ComplaintPriority.URGENT: 0,
        ComplaintPriority.HIGH: 1,
        ComplaintPriority.MEDIUM: 2,
        ComplaintPriority.LOW: 3,
    }

    complaints_sorted = sorted(
        complaints,
        key=lambda c: (
            status_order.get(c.status, 999),
            priority_order.get(c.priority, 999),
            c.created_at
        )
    )

    # Enrich with customer data
    result = []
    for complaint in complaints_sorted:
        complaint_dict = {
            "id": complaint.id,
            "complaint_id": complaint.complaint_id,
            "customer_id": complaint.customer_id,
            "user_id": complaint.user_id,
            "title": complaint.title,
            "description": complaint.description,
            "issue_type": complaint.issue_type,
            "status": complaint.status,
            "priority": complaint.priority,
            "assigned_to_id": complaint.assigned_to_id,
            "resolved_at": complaint.resolved_at,
            "resolution_notes": complaint.resolution_notes,
            "created_at": complaint.created_at,
            "updated_at": complaint.updated_at,
        }

        if complaint.customer:
            complaint_dict["customer_name"] = complaint.customer.name
            complaint_dict["customer_phone"] = complaint.customer.phone

        if complaint.assigned_to:
            complaint_dict["assigned_technician_name"] = complaint.assigned_to.name

        result.append(complaint_dict)

    return result


@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    customer_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get complaints with optional filters
    """
    query = db.query(Complaint)

    # If customer, only show their complaints
    if current_user.role == "customer":
        query = query.filter(Complaint.customer_id == current_user.customer_id)
    elif customer_id:
        query = query.filter(Complaint.customer_id == customer_id)

    if status_filter:
        try:
            status = ComplaintStatus(status_filter.upper())
            query = query.filter(Complaint.status == status)
        except ValueError:
            pass

    complaints = query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

    # Enrich with customer data
    result = []
    for complaint in complaints:
        complaint_dict = {
            "id": complaint.id,
            "complaint_id": complaint.complaint_id,
            "customer_id": complaint.customer_id,
            "user_id": complaint.user_id,
            "title": complaint.title,
            "description": complaint.description,
            "issue_type": complaint.issue_type,
            "status": complaint.status,
            "priority": complaint.priority,
            "assigned_to_id": complaint.assigned_to_id,
            "resolved_at": complaint.resolved_at,
            "resolution_notes": complaint.resolution_notes,
            "created_at": complaint.created_at,
            "updated_at": complaint.updated_at,
        }

        # Add customer data
        if complaint.customer:
            complaint_dict["customer_name"] = complaint.customer.name
            complaint_dict["customer_phone"] = complaint.customer.phone

        # Add assigned technician data
        if complaint.assigned_to:
            complaint_dict["assigned_technician_name"] = complaint.assigned_to.name

        result.append(complaint_dict)

    return result


@router.post("/{complaint_id}/claim", response_model=ComplaintResponse)
def claim_callback(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician claims/picks an unassigned callback
    Updates assigned_to_id and sets status to IN_PROGRESS
    """
    if current_user.role != "technician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians can claim callbacks"
        )

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Callback not found"
        )

    # Check if already assigned
    if complaint.assigned_to_id is not None:
        # Get the technician who already claimed this
        assigned_technician_name = "another technician"
        if complaint.assigned_to:
            assigned_technician_name = complaint.assigned_to.name

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This complaint has already been claimed by {assigned_technician_name}"
        )

    # Assign to current technician
    complaint.assigned_to_id = current_user.id
    complaint.status = ComplaintStatus.IN_PROGRESS
    complaint.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(complaint)

    result = {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "customer_id": complaint.customer_id,
        "user_id": complaint.user_id,
        "title": complaint.title,
        "description": complaint.description,
        "issue_type": complaint.issue_type,
        "status": complaint.status,
        "priority": complaint.priority,
        "assigned_to_id": complaint.assigned_to_id,
        "resolved_at": complaint.resolved_at,
        "resolution_notes": complaint.resolution_notes,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }

    if complaint.customer:
        result["customer_name"] = complaint.customer.name
        result["customer_phone"] = complaint.customer.phone

    if complaint.assigned_to:
        result["assigned_technician_name"] = complaint.assigned_to.name

    return result


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get complaint by ID
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Check authorization
    if current_user.role == "customer" and complaint.customer_id != current_user.customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this complaint"
        )

    # Enrich with related data
    result = {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "customer_id": complaint.customer_id,
        "user_id": complaint.user_id,
        "title": complaint.title,
        "description": complaint.description,
        "issue_type": complaint.issue_type,
        "status": complaint.status,
        "priority": complaint.priority,
        "assigned_to_id": complaint.assigned_to_id,
        "resolved_at": complaint.resolved_at,
        "resolution_notes": complaint.resolution_notes,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }

    if complaint.customer:
        result["customer_name"] = complaint.customer.name
        result["customer_phone"] = complaint.customer.phone

    if complaint.assigned_to:
        result["assigned_technician_name"] = complaint.assigned_to.name

    return result


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create new complaint
    """
    # Generate unique complaint_id
    today = datetime.now().strftime("%Y%m%d")
    random_str = str(uuid.uuid4())[:5].upper()
    complaint_id = f"CMP-{today}-{random_str}"

    # If customer, use their customer_id
    customer_id = complaint_in.customer_id
    if current_user.role == "customer":
        customer_id = current_user.customer_id

    complaint = Complaint(
        id=str(uuid.uuid4()),
        complaint_id=complaint_id,
        customer_id=customer_id,
        user_id=current_user.id,
        title=complaint_in.title,
        description=complaint_in.description,
        issue_type=complaint_in.issue_type,
        priority=complaint_in.priority,
        status=ComplaintStatus.OPEN,
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    result = {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "customer_id": complaint.customer_id,
        "user_id": complaint.user_id,
        "title": complaint.title,
        "description": complaint.description,
        "issue_type": complaint.issue_type,
        "status": complaint.status,
        "priority": complaint.priority,
        "assigned_to_id": complaint.assigned_to_id,
        "resolved_at": complaint.resolved_at,
        "resolution_notes": complaint.resolution_notes,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }

    if complaint.customer:
        result["customer_name"] = complaint.customer.name
        result["customer_phone"] = complaint.customer.phone

    return result


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: str,
    complaint_in: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update complaint (Admin or assigned technician only)
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Only admin or assigned technician can update
    if current_user.role not in ["admin", "technician"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this complaint"
        )

    if current_user.role == "technician" and complaint.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this complaint"
        )

    update_data = complaint_in.model_dump(exclude_unset=True)

    # If resolving the complaint
    if update_data.get("status") == ComplaintStatus.RESOLVED and not complaint.resolved_at:
        complaint.resolved_at = datetime.utcnow()

    for field, value in update_data.items():
        setattr(complaint, field, value)

    db.commit()
    db.refresh(complaint)

    result = {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "customer_id": complaint.customer_id,
        "user_id": complaint.user_id,
        "title": complaint.title,
        "description": complaint.description,
        "issue_type": complaint.issue_type,
        "status": complaint.status,
        "priority": complaint.priority,
        "assigned_to_id": complaint.assigned_to_id,
        "resolved_at": complaint.resolved_at,
        "resolution_notes": complaint.resolution_notes,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }

    if complaint.customer:
        result["customer_name"] = complaint.customer.name
        result["customer_phone"] = complaint.customer.phone

    if complaint.assigned_to:
        result["assigned_technician_name"] = complaint.assigned_to.name

    return result


@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete complaint (Admin only)
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    db.delete(complaint)
    db.commit()
    return None

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import json
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.models.callback import CallBack
from app.models.customer import Customer
from app.schemas.callback import CallBackCreate, CallBackUpdate, CallBackResponse, CallBackAssignTechnician
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


class MarkResultRequest(BaseModel):
    issue_faced: str
    customer_reporting_person: str
    problem_solved: str
    lift_status_on_closure: str
    requires_followup: str = "false"
    materials_changed: Optional[List[dict]] = None
    report_attachment_url: Optional[str] = None


@router.get("/", response_model=List[CallBackResponse])
def get_callbacks(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = Query(None, alias="status"),
    customer_id: str = Query(None),
    technician_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all callbacks with optional filters
    """
    query = db.query(CallBack)

    if status_filter:
        query = query.filter(CallBack.status == status_filter)

    if customer_id:
        query = query.filter(CallBack.customer_id == customer_id)

    if technician_id:
        # Filter callbacks where technician_id is in the technicians JSON array
        query = query.filter(CallBack.technicians.contains(f'"{technician_id}"'))

    callbacks = query.offset(skip).limit(limit).all()

    # Enrich with customer and admin info
    result = []
    for callback in callbacks:
        # Handle double-encoded JSON strings
        technicians_data = []
        if callback.technicians:
            try:
                parsed = json.loads(callback.technicians)
                # If it's still a string, parse again (double-encoded)
                if isinstance(parsed, str):
                    technicians_data = json.loads(parsed)
                else:
                    technicians_data = parsed
            except:
                technicians_data = []

        callback_dict = {
            "id": callback.id,
            "customer_id": callback.customer_id,
            "created_by_admin_id": callback.created_by_admin_id,
            "scheduled_date": callback.scheduled_date,
            "status": callback.status,
            "description": callback.description,
            "notes": callback.notes,
            "technicians": technicians_data,
            "responded_at": callback.responded_at,
            "completed_at": callback.completed_at,
            "created_at": callback.created_at,
            "updated_at": callback.updated_at,
        }

        # Get customer info
        customer = db.query(Customer).filter(Customer.id == callback.customer_id).first()
        if customer:
            callback_dict["customer_name"] = customer.name
            callback_dict["customer_job_number"] = customer.job_number

        # Get admin info
        admin = db.query(User).filter(User.id == callback.created_by_admin_id).first()
        if admin:
            callback_dict["admin_name"] = admin.email

        result.append(callback_dict)

    return result


@router.get("/{callback_id}", response_model=CallBackResponse)
def get_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get callback by ID
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    # Handle double-encoded JSON strings
    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

    # Get customer info
    customer = db.query(Customer).filter(Customer.id == callback.customer_id).first()
    if customer:
        callback_dict["customer_name"] = customer.name
        callback_dict["customer_job_number"] = customer.job_number

    return callback_dict


@router.post("/", response_model=CallBackResponse, status_code=status.HTTP_201_CREATED)
def create_callback(
    callback_in: CallBackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create new callback (Admin only)
    Can only create callbacks for customers with ACTIVE AMC status
    """
    # Check if customer exists and has ACTIVE AMC status
    customer = db.query(Customer).filter(Customer.id == callback_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    if customer.amc_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create callback for customer with INACTIVE AMC status"
        )

    callback = CallBack(
        id=str(uuid.uuid4()),
        customer_id=callback_in.customer_id,
        created_by_admin_id=current_user.id,
        scheduled_date=callback_in.scheduled_date,
        description=callback_in.description,
        notes=callback_in.notes,
        status="PENDING",
        technicians=json.dumps([]),  # Empty array initially
    )

    db.add(callback)
    db.commit()
    db.refresh(callback)

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": [],
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
        "customer_name": customer.name,
        "customer_job_number": customer.job_number,
    }

    return callback_dict


@router.put("/{callback_id}", response_model=CallBackResponse)
def update_callback(
    callback_id: str,
    callback_in: CallBackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update callback
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    update_data = callback_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(callback, field, value)

    db.commit()
    db.refresh(callback)

    # Handle double-encoded JSON strings
    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

    return callback_dict


@router.post("/{callback_id}/assign", response_model=CallBackResponse)
def assign_technician_to_callback(
    callback_id: str,
    assignment: CallBackAssignTechnician,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Assign technician to callback (Admin only)
    Maximum 3 technicians allowed per callback
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    # Parse current technicians
    technicians = json.loads(callback.technicians) if callback.technicians else []

    # Check if technician already assigned
    if assignment.technician_id in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician already assigned to this callback"
        )

    # Check maximum technicians limit (3)
    if len(technicians) >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 technicians allowed per callback"
        )

    # Verify technician exists
    technician = db.query(User).filter(User.id == assignment.technician_id).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Add technician
    technicians.append(assignment.technician_id)
    callback.technicians = json.dumps(technicians)

    db.commit()
    db.refresh(callback)

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

    return callback_dict


@router.delete("/{callback_id}/unassign/{technician_id}", response_model=CallBackResponse)
def unassign_technician_from_callback(
    callback_id: str,
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Unassign technician from callback (Admin only)
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    # Parse current technicians
    technicians = json.loads(callback.technicians) if callback.technicians else []

    # Check if technician is assigned
    if technician_id not in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician not assigned to this callback"
        )

    # Remove technician
    technicians.remove(technician_id)
    callback.technicians = json.dumps(technicians)

    db.commit()
    db.refresh(callback)

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

    return callback_dict


@router.post("/{callback_id}/respond", response_model=CallBackResponse)
def respond_to_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician responds to callback (marks as IN_PROGRESS)
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    callback.status = "IN_PROGRESS"
    callback.responded_at = datetime.utcnow()

    db.commit()
    db.refresh(callback)

    # Handle double-encoded JSON strings
    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    callback_dict = {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

    return callback_dict


@router.get("/technician/my-callbacks", response_model=List[CallBackResponse])
def get_my_callbacks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get callbacks assigned to current technician OR unassigned callbacks
    Returns:
    - Callbacks where current user is in technicians array (all statuses including IN_PROGRESS)
    - Callbacks with no technicians assigned (empty array) - visible to all technicians
    """
    from sqlalchemy import or_

    # Find callbacks where:
    # 1. Current user is in technicians array (includes NEW and IN_PROGRESS), OR
    # 2. Technicians array is empty (unassigned - visible to all)
    # NOTE: This now shows both NEW and IN_PROGRESS callbacks to assigned technicians
    callbacks = db.query(CallBack).filter(
        or_(
            CallBack.technicians.contains(f'"{current_user.id}"'),
            CallBack.technicians == json.dumps([]),
            CallBack.technicians == None
        )
    ).offset(skip).limit(limit).all()

    result = []
    for callback in callbacks:
        callback_dict = {
            "id": callback.id,
            "customer_id": callback.customer_id,
            "created_by_admin_id": callback.created_by_admin_id,
            "scheduled_date": callback.scheduled_date,
            "status": callback.status,
            "description": callback.description,
            "notes": callback.notes,
            "technicians": json.loads(callback.technicians) if callback.technicians else [],
            "responded_at": callback.responded_at,
            "completed_at": callback.completed_at,
            "created_at": callback.created_at,
            "updated_at": callback.updated_at,
        }

        # Get customer info
        customer = db.query(Customer).filter(Customer.id == callback.customer_id).first()
        if customer:
            callback_dict["customer_name"] = customer.name
            callback_dict["customer_job_number"] = customer.job_number

        result.append(callback_dict)

    return result


@router.get("/{callback_id}/technicians")
def get_callback_technicians(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get technicians assigned to callback
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    # Parse technician IDs from JSON
    technician_ids = json.loads(callback.technicians) if callback.technicians else []

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


@router.delete("/{callback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete callback (Admin only)
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    db.delete(callback)
    db.commit()
    return None


@router.post("/{callback_id}/pick", response_model=CallBackResponse)
def pick_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician picks the callback job
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    callback.status = "PICKED"
    callback.picked_at = datetime.utcnow()

    db.commit()
    db.refresh(callback)

    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    return {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }


@router.post("/{callback_id}/on-the-way", response_model=CallBackResponse)
def mark_on_the_way(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician marks as on the way to site
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    callback.status = "ON_THE_WAY"
    callback.on_the_way_at = datetime.utcnow()

    db.commit()
    db.refresh(callback)

    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    return {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }


@router.post("/{callback_id}/at-site", response_model=CallBackResponse)
def mark_at_site(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician marks as reached the site
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    callback.status = "AT_SITE"
    callback.at_site_at = datetime.utcnow()

    db.commit()
    db.refresh(callback)

    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    return {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }


@router.post("/{callback_id}/join", response_model=CallBackResponse)
def join_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Technician joins an IN_PROGRESS callback to assist
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    if callback.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only join IN_PROGRESS callbacks"
        )

    # Parse current technicians (handle double-encoded JSON)
    if callback.technicians:
        try:
            technicians = json.loads(callback.technicians)
            # If result is string (double-encoded), parse again
            if isinstance(technicians, str):
                technicians = json.loads(technicians)
        except:
            technicians = []
    else:
        technicians = []

    # Ensure it's a list
    if not isinstance(technicians, list):
        technicians = []

    # Check if already assigned
    if current_user.id in technicians:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already assigned to this callback"
        )

    # Check maximum limit
    if len(technicians) >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 technicians allowed per callback"
        )

    # Add technician
    technicians.append(current_user.id)
    callback.technicians = json.dumps(technicians)

    db.commit()
    db.refresh(callback)

    return {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }


@router.post("/{callback_id}/mark-result")
def mark_callback_result(
    callback_id: str,
    request: MarkResultRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark callback result with detailed closure information
    Includes: issue faced, customer contact, problem solved, materials changed, lift status
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    # Update callback with closure details
    callback.issue_faced = request.issue_faced
    callback.customer_reporting_person = request.customer_reporting_person
    callback.problem_solved = request.problem_solved
    callback.report_attachment_url = request.report_attachment_url
    callback.materials_changed = json.dumps(request.materials_changed) if request.materials_changed else json.dumps([])
    callback.lift_status_on_closure = request.lift_status_on_closure
    callback.requires_followup = request.requires_followup
    callback.status = "COMPLETED"
    callback.completed_at = datetime.utcnow()

    # Set follow-up flag if closed with error or shutdown
    if request.lift_status_on_closure in ["SHUT_DOWN", "RUNNING_WITH_ERROR"]:
        callback.requires_followup = "true"
    else:
        callback.requires_followup = "false"

    db.commit()
    db.refresh(callback)

    return {
        "id": callback.id,
        "status": callback.status,
        "requires_followup": callback.requires_followup,
        "lift_status_on_closure": callback.lift_status_on_closure,
        "message": "Callback marked as completed with result details"
    }


@router.post("/{callback_id}/reopen", response_model=CallBackResponse)
def reopen_callback(
    callback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reopen a callback that was closed with errors for follow-up work
    """
    callback = db.query(CallBack).filter(CallBack.id == callback_id).first()
    if not callback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CallBack not found"
        )

    if callback.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only reopen completed callbacks"
        )

    if callback.requires_followup != "true":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This callback was closed without errors and cannot be reopened"
        )

    # Reopen the callback
    callback.status = "IN_PROGRESS"
    callback.completed_at = None

    db.commit()
    db.refresh(callback)

    technicians_data = []
    if callback.technicians:
        try:
            parsed = json.loads(callback.technicians)
            if isinstance(parsed, str):
                technicians_data = json.loads(parsed)
            else:
                technicians_data = parsed
        except:
            technicians_data = []

    return {
        "id": callback.id,
        "customer_id": callback.customer_id,
        "created_by_admin_id": callback.created_by_admin_id,
        "scheduled_date": callback.scheduled_date,
        "status": callback.status,
        "description": callback.description,
        "notes": callback.notes,
        "technicians": technicians_data,
        "responded_at": callback.responded_at,
        "completed_at": callback.completed_at,
        "created_at": callback.created_at,
        "updated_at": callback.updated_at,
    }

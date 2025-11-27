"""
Admin User Management API Endpoints
Allows admin to add and manage technicians
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.api.deps import get_current_user
from app.core.security import get_password_hash
from app.utils.id_generator import generate_uuid
from pydantic import BaseModel, EmailStr

router = APIRouter()


class TechnicianQuickAdd(BaseModel):
    """Quick schema for adding technician by email/phone"""
    name: str
    email: EmailStr
    phone: str
    password: str


class UserListResponse(BaseModel):
    """Response for user list"""
    total_count: int
    users: List[UserResponse]


@router.post("/technicians", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def add_technician(
    technician_data: TechnicianQuickAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a new technician

    Admin can add technicians by providing:
    - Name
    - Email
    - Phone number
    - Initial password (technician can change later)

    Use case:
    - Admin wants to give app access to a new technician
    - Admin enters email and phone
    - System creates account with technician role
    - Credentials sent to technician
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can add technicians"
        )

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == technician_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if phone already exists
    existing_phone = db.query(User).filter(User.phone == technician_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Create new technician
    new_technician = User(
        id=generate_uuid(),
        name=technician_data.name,
        email=technician_data.email,
        phone=technician_data.phone,
        hashed_password=get_password_hash(technician_data.password),
        role=UserRole.TECHNICIAN,
        active=True,
    )

    db.add(new_technician)
    db.commit()
    db.refresh(new_technician)

    return new_technician


@router.get("/technicians", response_model=UserListResponse)
def get_all_technicians(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    active_only: bool = Query(True, description="Show only active technicians"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of all technicians

    Admin can:
    - View all registered technicians
    - Filter by active/inactive status
    - See contact information
    - Manage technician accounts
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can view technicians list"
        )

    # Build query
    query = db.query(User).filter(User.role == UserRole.TECHNICIAN)

    if active_only:
        query = query.filter(User.active == True)

    # Get total count
    total_count = query.count()

    # Get paginated results
    technicians = query.offset(skip).limit(limit).all()

    return UserListResponse(
        total_count=total_count,
        users=technicians
    )


@router.get("/technicians/{technician_id}", response_model=UserResponse)
def get_technician_by_id(
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get technician details by ID

    Returns:
    - Technician profile information
    - Contact details
    - Account status
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can view technician details"
        )

    technician = db.query(User).filter(
        User.id == technician_id,
        User.role == UserRole.TECHNICIAN
    ).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    return technician


@router.put("/technicians/{technician_id}", response_model=UserResponse)
def update_technician(
    technician_id: str,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update technician information

    Admin can update:
    - Name
    - Phone number
    - Active/inactive status
    - Profile image

    Use cases:
    - Technician changed phone number
    - Deactivate technician who left company
    - Update technician profile
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can update technician details"
        )

    technician = db.query(User).filter(
        User.id == technician_id,
        User.role == UserRole.TECHNICIAN
    ).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Update fields
    if update_data.name is not None:
        technician.name = update_data.name

    if update_data.phone is not None:
        # Check if phone already exists (for different user)
        existing = db.query(User).filter(
            User.phone == update_data.phone,
            User.id != technician_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already in use"
            )
        technician.phone = update_data.phone

    if update_data.active is not None:
        technician.active = update_data.active

    if update_data.profile_image is not None:
        technician.profile_image = update_data.profile_image

    db.commit()
    db.refresh(technician)

    return technician


@router.delete("/technicians/{technician_id}")
def delete_technician(
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete/Deactivate technician account

    Note: This sets the account to inactive rather than deleting
    to preserve service history and data integrity

    Use case:
    - Technician left the company
    - Account needs to be disabled
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete technicians"
        )

    technician = db.query(User).filter(
        User.id == technician_id,
        User.role == UserRole.TECHNICIAN
    ).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Soft delete by setting inactive
    technician.active = False
    db.commit()

    return {
        "message": f"Technician {technician.name} has been deactivated",
        "technician_id": technician_id,
    }


@router.post("/technicians/{technician_id}/activate")
def activate_technician(
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reactivate a deactivated technician account

    Use case:
    - Technician rejoins company
    - Account was disabled by mistake
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can activate technicians"
        )

    technician = db.query(User).filter(
        User.id == technician_id,
        User.role == UserRole.TECHNICIAN
    ).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    technician.active = True
    db.commit()

    return {
        "message": f"Technician {technician.name} has been activated",
        "technician_id": technician_id,
    }


@router.get("/users/search")
def search_users(
    query: str = Query(..., min_length=2, description="Search by name, email, or phone"),
    role: Optional[str] = Query(None, description="Filter by role (admin/technician)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search users by name, email, or phone

    Admin can search to:
    - Find specific technician
    - Check if email/phone already registered
    - Quick lookup
    """
    # Verify admin role
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can search users"
        )

    # Build search query
    search_query = db.query(User).filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%"),
            User.phone.ilike(f"%{query}%"),
        )
    )

    if role:
        search_query = search_query.filter(User.role == role)

    users = search_query.limit(20).all()

    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role.value,
                "active": user.active,
            }
            for user in users
        ],
    }


# Import for SQLAlchemy or_
from sqlalchemy import or_

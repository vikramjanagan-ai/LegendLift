from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.complaint import ComplaintStatus, ComplaintPriority


class ComplaintBase(BaseModel):
    title: str
    description: str
    issue_type: str
    priority: Optional[ComplaintPriority] = ComplaintPriority.MEDIUM


class ComplaintCreate(ComplaintBase):
    customer_id: Optional[str] = None  # Optional because customers will use their own ID
    user_id: Optional[str] = None


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    issue_type: Optional[str] = None
    status: Optional[ComplaintStatus] = None
    priority: Optional[ComplaintPriority] = None
    assigned_to_id: Optional[str] = None
    resolution_notes: Optional[str] = None


class ComplaintResponse(ComplaintBase):
    id: str
    complaint_id: str
    customer_id: str
    user_id: Optional[str] = None
    status: ComplaintStatus
    assigned_to_id: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields from related tables
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    assigned_technician_name: Optional[str] = None

    class Config:
        from_attributes = True

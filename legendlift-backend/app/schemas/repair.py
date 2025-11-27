from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RepairBase(BaseModel):
    customer_id: Optional[str] = None  # Nullable for non-customers
    customer_name: Optional[str] = None  # For non-customers
    contact_number: Optional[str] = None  # For non-customers
    scheduled_date: datetime
    description: Optional[str] = None
    notes: Optional[str] = None


class RepairCreate(RepairBase):
    pass


class RepairUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    status: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None


class RepairAssignTechnician(BaseModel):
    technician_id: str


class RepairResponse(RepairBase):
    id: str
    created_by_admin_id: str
    status: str
    technicians: Optional[List[str]] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields
    existing_customer_name: Optional[str] = None
    customer_job_number: Optional[str] = None
    admin_name: Optional[str] = None
    technician_count: Optional[int] = 0

    class Config:
        from_attributes = True

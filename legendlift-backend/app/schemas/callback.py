from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CallBackBase(BaseModel):
    customer_id: str
    scheduled_date: datetime
    description: Optional[str] = None
    notes: Optional[str] = None


class CallBackCreate(CallBackBase):
    pass


class CallBackUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    status: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    responded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class CallBackAssignTechnician(BaseModel):
    technician_id: str


class CallBackResponse(CallBackBase):
    id: str
    created_by_admin_id: str
    status: str
    technicians: Optional[List[str]] = None
    responded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields
    customer_name: Optional[str] = None
    customer_job_number: Optional[str] = None
    admin_name: Optional[str] = None

    class Config:
        from_attributes = True

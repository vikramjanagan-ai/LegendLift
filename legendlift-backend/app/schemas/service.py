from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from app.models.service import ServiceStatus


class ServiceScheduleBase(BaseModel):
    contract_id: Optional[str] = None
    customer_id: str
    scheduled_date: datetime
    status: ServiceStatus = ServiceStatus.PENDING
    notes: Optional[str] = None


class ServiceScheduleCreate(ServiceScheduleBase):
    technician_id: Optional[str] = None
    technician2_id: Optional[str] = None


class ServiceScheduleUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    actual_date: Optional[datetime] = None
    status: Optional[ServiceStatus] = None
    technician_id: Optional[str] = None
    technician2_id: Optional[str] = None
    technician3_id: Optional[str] = None
    days_overdue: Optional[int] = None
    notes: Optional[str] = None


class ServiceScheduleResponse(BaseModel):
    id: str
    contract_id: Optional[str] = None
    customer_id: str
    service_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None  # Make optional to handle NULL values
    actual_date: Optional[datetime] = None
    status: ServiceStatus = ServiceStatus.PENDING
    technician_id: Optional[str] = None
    technician2_id: Optional[str] = None
    technician3_id: Optional[str] = None
    days_overdue: Optional[int] = None
    is_adhoc: Optional[str] = None
    service_type: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields from related tables
    customer_name: Optional[str] = None
    job_number: Optional[str] = None
    area: Optional[str] = None
    route: Optional[int] = None
    technician_name: Optional[str] = None
    technician2_name: Optional[str] = None
    technician3_name: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceReportBase(BaseModel):
    service_id: str
    work_done: str
    parts_replaced: Optional[List[str]] = None
    customer_feedback: Optional[str] = None
    rating: Optional[int] = None


class ServiceReportCreate(ServiceReportBase):
    check_in_location: Optional[Dict[str, float]] = None
    images: Optional[List[str]] = None
    customer_signature: Optional[str] = None
    technician_signature: Optional[str] = None


class ServiceReportUpdate(BaseModel):
    work_done: Optional[str] = None
    parts_replaced: Optional[List[str]] = None
    images: Optional[List[str]] = None
    customer_signature: Optional[str] = None
    technician_signature: Optional[str] = None
    customer_feedback: Optional[str] = None
    rating: Optional[int] = None
    check_out_location: Optional[Dict[str, float]] = None
    check_out_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None


class ServiceReportResponse(ServiceReportBase):
    id: str
    technician_id: str
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    check_in_location: Optional[Dict[str, float]] = None
    check_out_location: Optional[Dict[str, float]] = None
    images: Optional[List[str]] = None
    customer_signature: Optional[str] = None
    technician_signature: Optional[str] = None
    completion_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

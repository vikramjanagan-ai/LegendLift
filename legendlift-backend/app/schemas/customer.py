from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class CustomerBase(BaseModel):
    job_number: str
    name: str
    site_name: Optional[str] = None
    area: str
    address: str
    contact_person: str
    phone: str
    contact_number: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    route: int

    # AMC Information
    amc_valid_from: Optional[date] = None
    amc_valid_to: Optional[date] = None
    services_per_year: Optional[int] = None  # 6, 9, 10, or 12
    amc_amount: Optional[Decimal] = None
    amc_amount_received: Optional[Decimal] = None
    amc_status: Optional[str] = "ACTIVE"  # ACTIVE or INACTIVE
    aiims_status: Optional[bool] = False

    # Equipment Details
    amc_type: Optional[str] = None
    door_type: Optional[str] = None
    controller_type: Optional[str] = None
    number_of_floors: Optional[int] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    site_name: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    route: Optional[int] = None

    # AMC Information
    amc_valid_from: Optional[date] = None
    amc_valid_to: Optional[date] = None
    services_per_year: Optional[int] = None
    amc_amount: Optional[Decimal] = None
    amc_amount_received: Optional[Decimal] = None
    amc_status: Optional[str] = None
    aiims_status: Optional[bool] = None

    # Equipment Details
    amc_type: Optional[str] = None
    door_type: Optional[str] = None
    controller_type: Optional[str] = None
    number_of_floors: Optional[int] = None


class CustomerResponse(CustomerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIIMSStatusUpdate(BaseModel):
    aiims_status: bool

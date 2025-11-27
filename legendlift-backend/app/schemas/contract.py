from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.contract import ContractType, ServiceFrequency


class ContractBase(BaseModel):
    customer_id: str
    contract_type: ContractType
    start_date: datetime
    end_date: datetime
    service_frequency: ServiceFrequency
    total_services: int
    amount: float
    terms: Optional[str] = None
    notes: Optional[str] = None


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    contract_type: Optional[ContractType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    service_frequency: Optional[ServiceFrequency] = None
    total_services: Optional[int] = None
    completed_services: Optional[int] = None
    pending_services: Optional[int] = None
    amount: Optional[float] = None
    terms: Optional[str] = None
    notes: Optional[str] = None


class ContractResponse(ContractBase):
    id: str
    completed_services: int
    pending_services: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

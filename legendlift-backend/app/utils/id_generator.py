"""
ID Generation utilities for LegendLift
Generates unique IDs for various entities with sequential numbering
"""
import uuid
from datetime import datetime
import random
import string
from sqlalchemy.orm import Session
from typing import Optional


def generate_sequential_service_id(db: Session) -> str:
    """
    Generate sequential service ID in format: SRV-YYYYMMDD-NNNN
    Example: SRV-20241009-0001, SRV-20241009-0002, etc.

    Sequential numbering resets daily for better organization
    """
    from app.models.counter import SequentialCounter

    date_str = datetime.now().strftime("%Y%m%d")
    counter_id = f"service_{date_str}"

    # Get or create counter for today
    counter = db.query(SequentialCounter).filter(
        SequentialCounter.id == counter_id
    ).first()

    if not counter:
        # Create new counter for today
        counter = SequentialCounter(
            id=counter_id,
            entity_type="service",
            date_key=date_str,
            last_number=0
        )
        db.add(counter)
        db.flush()

    # Increment counter
    counter.last_number += 1
    next_number = counter.last_number
    db.commit()

    # Format: SRV-20241009-0001
    return f"SRV-{date_str}-{next_number:04d}"


def generate_service_id() -> str:
    """
    DEPRECATED: Use generate_sequential_service_id with db session
    Generate unique service ID in format: SRV-YYYYMMDD-XXXXX
    Example: SRV-20241009-A3F8K
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"SRV-{date_str}-{random_str}"


def generate_job_number() -> str:
    """
    Generate unique job number for customers
    Format: JB-XXXX
    Example: JB-1234
    """
    random_num = random.randint(1000, 9999)
    return f"JB-{random_num}"


def generate_payment_id() -> str:
    """
    Generate unique payment reference ID
    Format: PAY-YYYYMMDD-XXXXX
    Example: PAY-20241009-B7K2M
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"PAY-{date_str}-{random_str}"


def generate_contract_id() -> str:
    """
    Generate unique contract ID
    Format: AMC-YYYYMMDD-XXXXX
    Example: AMC-20241009-C9N4P
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"AMC-{date_str}-{random_str}"


def generate_report_id() -> str:
    """
    Generate unique service report ID
    Format: RPT-YYYYMMDD-XXXXX
    Example: RPT-20241009-D2L7Q
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"RPT-{date_str}-{random_str}"


def generate_uuid() -> str:
    """Generate standard UUID"""
    return str(uuid.uuid4())

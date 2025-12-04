"""
Utility functions for LegendLift Backend
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.counter import SequentialCounter
import uuid


def generate_callback_job_id(db: Session) -> str:
    """
    Generate a human-readable sequential Job ID for callbacks.
    Format: CB-YYYYMMDD-NNN
    Example: CB-20250128-001, CB-20250128-002, etc.

    Uses SequentialCounter to track the last number per day.
    """
    today = datetime.now()
    date_key = today.strftime("%Y%m%d")
    entity_type = "callback"
    counter_id = f"{entity_type}_{date_key}"

    # Get or create counter for today
    counter = db.query(SequentialCounter).filter(
        SequentialCounter.entity_type == entity_type,
        SequentialCounter.date_key == date_key
    ).first()

    if not counter:
        # Create new counter for today
        counter = SequentialCounter(
            id=counter_id,
            entity_type=entity_type,
            date_key=date_key,
            last_number=0
        )
        db.add(counter)
        db.flush()

    # Increment counter
    counter.last_number += 1
    db.flush()

    # Generate Job ID: CB-20250128-001
    job_id = f"CB-{date_key}-{counter.last_number:03d}"

    return job_id


def generate_service_job_id(db: Session) -> str:
    """
    Generate a human-readable sequential Job ID for services.
    Format: SV-YYYYMMDD-NNN
    Example: SV-20250128-001, SV-20250128-002, etc.
    """
    today = datetime.now()
    date_key = today.strftime("%Y%m%d")
    entity_type = "service"
    counter_id = f"{entity_type}_{date_key}"

    counter = db.query(SequentialCounter).filter(
        SequentialCounter.entity_type == entity_type,
        SequentialCounter.date_key == date_key
    ).first()

    if not counter:
        counter = SequentialCounter(
            id=counter_id,
            entity_type=entity_type,
            date_key=date_key,
            last_number=0
        )
        db.add(counter)
        db.flush()

    counter.last_number += 1
    db.flush()

    job_id = f"SV-{date_key}-{counter.last_number:03d}"

    return job_id


def generate_repair_job_id(db: Session) -> str:
    """
    Generate a human-readable sequential Job ID for repairs.
    Format: RP-YYYYMMDD-NNN
    Example: RP-20250128-001, RP-20250128-002, etc.
    """
    today = datetime.now()
    date_key = today.strftime("%Y%m%d")
    entity_type = "repair"
    counter_id = f"{entity_type}_{date_key}"

    counter = db.query(SequentialCounter).filter(
        SequentialCounter.entity_type == entity_type,
        SequentialCounter.date_key == date_key
    ).first()

    if not counter:
        counter = SequentialCounter(
            id=counter_id,
            entity_type=entity_type,
            date_key=date_key,
            last_number=0
        )
        db.add(counter)
        db.flush()

    counter.last_number += 1
    db.flush()

    job_id = f"RP-{date_key}-{counter.last_number:03d}"

    return job_id

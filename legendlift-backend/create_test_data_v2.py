#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive test script for LegendLift system
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.user import User, UserRole
from app.models.customer import Customer, AMCStatus
from app.models.callback import CallBack, CallBackStatus, LiftStatus
from app.models.repair import Repair, RepairStatus
from app.models.service import ServiceSchedule, ServiceStatus, ServiceType
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import uuid
import random
import json

# Sample data
TECHNICIAN_NAMES = [
    "Rajesh Kumar", "Amit Singh", "Pradeep Sharma", "Vijay Reddy", "Suresh Patel",
    "Rahul Verma", "Anil Gupta", "Sandeep Joshi", "Manoj Yadav", "Dinesh Kumar"
]

CUSTOMER_NAMES = [
    "AIIMS Delhi", "Apollo Hospital", "Max Healthcare", "Fortis Hospital", "Medanta",
    "BLK Hospital", "Sir Ganga Ram Hospital", "Safdarjung Hospital", "RML Hospital", "GTB Hospital"
]

AREAS = ["Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"]

def generate_job_number():
    return f"JOB-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

def generate_callback_id():
    return f"CB-{datetime.now().strftime('%Y%m%d')}-{random.randint(1, 999):03d}"

def create_admin_user(db: Session):
    admin = db.query(User).filter(User.email == "admin@legendlift.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            name="Admin User",
            email="admin@legendlift.com",
            phone="9999999999",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Created admin user")
    else:
        print("Admin user already exists")
    return admin

def create_technicians(db: Session, count=10):
    print(f"\nCreating {count} Technicians...")
    technicians = []

    for i, name in enumerate(TECHNICIAN_NAMES[:count], 1):
        email = f"tech{i}@legendlift.com"
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            technicians.append(existing)
            print(f"  Technician {name} already exists")
            continue

        tech = User(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            phone=f"98765432{i:02d}",
            hashed_password=get_password_hash("tech123"),
            role=UserRole.TECHNICIAN,
            active=True
        )
        db.add(tech)
        technicians.append(tech)
        print(f"  Created: {name}")

    db.commit()
    for tech in technicians:
        db.refresh(tech)

    return technicians

def create_customers(db: Session, count=10):
    print(f"\nCreating {count} Customers...")
    customers = []

    for i, name in enumerate(CUSTOMER_NAMES[:count], 1):
        job_number = generate_job_number()

        customer = Customer(
            id=str(uuid.uuid4()),
            job_number=job_number,
            name=name,
            site_name=f"{name} - Main Building",
            area=random.choice(AREAS),
            address=f"{i}, Medical Complex, Delhi - 11000{i}",
            contact_person=f"Dr. Contact Person {i}",
            phone=f"011234567{i:02d}",
            contact_number=f"98765432{i:02d}",
            email=f"contact{i}@hospital{i}.com",
            latitude=28.6 + (i * 0.01),
            longitude=77.2 + (i * 0.01),
            route=random.randint(1, 5),
            amc_valid_from=datetime.now().date() - timedelta(days=30),
            amc_valid_to=datetime.now().date() + timedelta(days=335),
            services_per_year=12,
            amc_amount=120000.00,
            amc_amount_received=60000.00,
            amc_status=AMCStatus.ACTIVE,
            aiims_status=(i == 1),
            amc_type="Comprehensive",
            door_type="Automatic",
            controller_type="Modern",
            number_of_floors=random.randint(5, 15)
        )
        db.add(customer)
        customers.append(customer)
        print(f"  Created: {name} ({job_number})")

    db.commit()
    for customer in customers:
        db.refresh(customer)

    return customers

def create_services(db: Session, customers, technicians, count=10):
    print(f"\nCreating {count} Service Schedules...")
    services = []

    for i in range(count):
        customer = random.choice(customers)
        assigned_techs = random.sample(technicians, min(random.randint(1, 3), len(technicians)))

        service = ServiceSchedule(
            id=str(uuid.uuid4()),
            service_id=f"SRV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}",
            customer_id=customer.id,
            scheduled_date=datetime.now() + timedelta(days=random.randint(-5, 30)),
            status=random.choice([ServiceStatus.PENDING, ServiceStatus.SCHEDULED, ServiceStatus.IN_PROGRESS]),
            technician_id=assigned_techs[0].id if len(assigned_techs) > 0 else None,
            technician2_id=assigned_techs[1].id if len(assigned_techs) > 1 else None,
            technician3_id=assigned_techs[2].id if len(assigned_techs) > 2 else None,
            service_type=ServiceType.SERVICE,
            notes=f"Regular AMC service for {customer.name}"
        )
        db.add(service)
        services.append(service)
        print(f"  Created: {service.service_id} for {customer.name}")

    db.commit()
    for service in services:
        db.refresh(service)

    return services

def create_callbacks(db: Session, customers, technicians, admin, count=10):
    print(f"\nCreating {count} Callback Tickets...")
    callbacks = []

    for i in range(count):
        customer = random.choice(customers)
        assigned_techs = random.sample(technicians, min(random.randint(1, 3), len(technicians)))
        tech_ids = [tech.id for tech in assigned_techs]

        callback = CallBack(
            id=str(uuid.uuid4()),
            job_id=generate_callback_id(),
            customer_id=customer.id,
            created_by_admin_id=admin.id,
            scheduled_date=datetime.now() + timedelta(hours=random.randint(1, 48)),
            status=CallBackStatus.PENDING,
            description=f"Callback request {i+1}: Elevator malfunction reported",
            notes=f"Customer reported issue with elevator. Priority: {'High' if i % 3 == 0 else 'Normal'}",
            technicians=json.dumps(tech_ids)
        )
        db.add(callback)
        callbacks.append(callback)
        print(f"  Created: {callback.job_id} for {customer.name}")

    db.commit()
    for callback in callbacks:
        db.refresh(callback)

    return callbacks

def create_repairs(db: Session, customers, technicians, admin, count=10):
    print(f"\nCreating {count} Repair Jobs...")
    repairs = []

    for i in range(count):
        has_customer = random.random() < 0.7
        customer = random.choice(customers) if has_customer else None
        assigned_techs = random.sample(technicians, min(random.randint(1, 3), len(technicians)))
        tech_ids = [tech.id for tech in assigned_techs]

        repair = Repair(
            id=str(uuid.uuid4()),
            customer_id=customer.id if customer else None,
            customer_name=None if customer else f"Non-AMC Customer {i+1}",
            contact_number=None if customer else f"99887766{i:02d}",
            created_by_admin_id=admin.id,
            scheduled_date=datetime.now() + timedelta(hours=random.randint(1, 72)),
            status=RepairStatus.PENDING,
            description=f"Repair job {i+1}: Door mechanism repair required",
            notes=f"Estimated time: {random.randint(2, 8)} hours",
            technicians=json.dumps(tech_ids),
            repair_type=random.choice(["Mechanical", "Electrical", "Electronic", "Structural"]),
            materials_cost=random.randint(5000, 25000),
            labor_cost=random.randint(3000, 15000),
            total_cost=random.randint(8000, 40000)
        )
        db.add(repair)
        repairs.append(repair)
        customer_name = customer.name if customer else repair.customer_name
        print(f"  Created repair for {customer_name}")

    db.commit()
    for repair in repairs:
        db.refresh(repair)

    return repairs

def simulate_callback_workflow(db: Session, callback: CallBack, technician: User):
    print(f"\n{'='*60}")
    print(f"Simulating Workflow: {callback.job_id}")
    print(f"{'='*60}")

    # PICKED
    print("\n[1] PICKED - Technician picked the job")
    callback.status = CallBackStatus.PICKED
    callback.picked_at = datetime.now() - timedelta(hours=2)
    db.commit()

    # ON_THE_WAY
    print("[2] ON_THE_WAY - Technician is on the way")
    callback.status = CallBackStatus.ON_THE_WAY
    callback.on_the_way_at = datetime.now() - timedelta(hours=1, minutes=45)
    db.commit()

    # AT_SITE
    print("[3] AT_SITE - Reached the site (2 arrival images)")
    callback.status = CallBackStatus.AT_SITE
    callback.at_site_at = datetime.now() - timedelta(hours=1, minutes=30)
    callback.completion_images = json.dumps([
        f"https://storage.example.com/arrivals/{callback.job_id}-arrival-1.jpg",
        f"https://storage.example.com/arrivals/{callback.job_id}-arrival-2.jpg"
    ])
    db.commit()

    # IN_PROGRESS
    print("[4] IN_PROGRESS - Working on the issue (3 progress images)")
    callback.status = CallBackStatus.IN_PROGRESS
    callback.responded_at = datetime.now() - timedelta(hours=1, minutes=15)
    existing_images = json.loads(callback.completion_images or "[]")
    existing_images.extend([
        f"https://storage.example.com/progress/{callback.job_id}-progress-1.jpg",
        f"https://storage.example.com/progress/{callback.job_id}-progress-2.jpg",
        f"https://storage.example.com/progress/{callback.job_id}-progress-3.jpg"
    ])
    callback.completion_images = json.dumps(existing_images)
    callback.issue_faced = "Elevator door sensor malfunction. Found damaged cable connection."
    db.commit()

    # COMPLETED
    print("[5] COMPLETED - Job completed (3 completion images)")
    callback.status = CallBackStatus.COMPLETED
    callback.completed_at = datetime.now()
    callback.customer_reporting_person = "Mr. Facility Manager"
    callback.problem_solved = "Replaced damaged cable, recalibrated door sensor, tested multiple cycles"
    callback.lift_status_on_closure = LiftStatus.NORMAL_RUNNING
    callback.requires_followup = "false"

    existing_images = json.loads(callback.completion_images or "[]")
    existing_images.extend([
        f"https://storage.example.com/completed/{callback.job_id}-completed-1.jpg",
        f"https://storage.example.com/completed/{callback.job_id}-completed-2.jpg",
        f"https://storage.example.com/completed/{callback.job_id}-final.jpg"
    ])
    callback.completion_images = json.dumps(existing_images)

    callback.materials_changed = json.dumps([
        {"name": "Door Sensor Cable", "quantity": 1, "unit": "piece"},
        {"name": "Cable Connectors", "quantity": 2, "unit": "pieces"},
        {"name": "Electrical Tape", "quantity": 1, "unit": "roll"}
    ])

    db.commit()

    total_images = len(json.loads(callback.completion_images))
    print(f"\n*** Workflow completed! Total images: {total_images} ***\n")

    return callback

def generate_reports(db: Session, callbacks, repairs, services):
    print("\n" + "="*60)
    print("REPORTS")
    print("="*60)

    now = datetime.now()

    # Daily
    print("\n[DAILY REPORT]")
    daily_callbacks = [cb for cb in callbacks if cb.created_at.date() == now.date()]
    daily_repairs = [r for r in repairs if r.created_at.date() == now.date()]
    daily_services = [s for s in services if s.created_at.date() == now.date()]
    completed_today = len([cb for cb in callbacks if cb.completed_at and cb.completed_at.date() == now.date()])

    print(f"  Callbacks created: {len(daily_callbacks)}")
    print(f"  Repairs created: {len(daily_repairs)}")
    print(f"  Services scheduled: {len(daily_services)}")
    print(f"  Callbacks completed: {completed_today}")

    # Weekly
    print("\n[WEEKLY REPORT - Last 7 days]")
    week_ago = now - timedelta(days=7)
    weekly_callbacks = [cb for cb in callbacks if cb.created_at >= week_ago]
    weekly_repairs = [r for r in repairs if r.created_at >= week_ago]
    weekly_services = [s for s in services if s.created_at >= week_ago]
    completed_week = len([cb for cb in callbacks if cb.completed_at and cb.completed_at >= week_ago])

    print(f"  Callbacks: {len(weekly_callbacks)}")
    print(f"  Repairs: {len(weekly_repairs)}")
    print(f"  Services: {len(weekly_services)}")
    print(f"  Callbacks completed: {completed_week}")

    # Monthly
    print("\n[MONTHLY REPORT - Last 30 days]")
    month_ago = now - timedelta(days=30)
    monthly_callbacks = [cb for cb in callbacks if cb.created_at >= month_ago]
    monthly_repairs = [r for r in repairs if r.created_at >= month_ago]
    monthly_services = [s for s in services if s.created_at >= month_ago]
    completed_month = len([cb for cb in callbacks if cb.completed_at and cb.completed_at >= month_ago])

    print(f"  Callbacks: {len(monthly_callbacks)}")
    print(f"  Repairs: {len(monthly_repairs)}")
    print(f"  Services: {len(monthly_services)}")
    print(f"  Callbacks completed: {completed_month}")

    # Status breakdown
    print("\n[CALLBACK STATUS BREAKDOWN]")
    status_counts = {}
    for cb in callbacks:
        status = cb.status.value
        status_counts[status] = status_counts.get(status, 0) + 1

    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

def main():
    print("\n" + "="*60)
    print("LegendLift Comprehensive Test Data Creation")
    print("="*60)

    db = SessionLocal()

    try:
        admin = create_admin_user(db)
        technicians = create_technicians(db, count=10)
        customers = create_customers(db, count=10)
        services = create_services(db, customers, technicians, count=10)
        callbacks = create_callbacks(db, customers, technicians, admin, count=10)
        repairs = create_repairs(db, customers, technicians, admin, count=10)

        print("\n" + "="*60)
        print("Simulating Complete Workflow for 3 Callbacks")
        print("="*60)

        for i, callback in enumerate(callbacks[:3], 1):
            tech_ids = json.loads(callback.technicians)
            technician = db.query(User).filter(User.id == tech_ids[0]).first()
            simulate_callback_workflow(db, callback, technician)

        generate_reports(db, callbacks, repairs, services)

        print("\n" + "="*60)
        print("TEST DATA CREATION COMPLETED!")
        print("="*60)
        print("\nSummary:")
        print("  * 10 Technicians")
        print("  * 10 Customers")
        print("  * 10 Services")
        print("  * 10 Callbacks")
        print("  * 10 Repairs")
        print("  * 3 Callbacks with full workflow (PENDING -> COMPLETED)")
        print("  * Multiple images at each stage")
        print("  * Daily, Weekly, Monthly reports")
        print("\n")

    except Exception as e:
        print(f"\nError: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()

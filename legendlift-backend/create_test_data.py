#!/usr/bin/env python3
"""
Create comprehensive test data for LegendLift system
- 10 Customers
- 10 Technicians
- 10 Services
- 10 Callbacks
- 10 Repairs
All with proper relationships and realistic data
"""
import sys
from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.service import ServiceSchedule, ServiceReport
from app.models.callback import CallBack
from app.models.repair import Repair
from app.models.contract import AMCContract
from app.core.security import get_password_hash
import uuid
import json
import random

db = SessionLocal()

# Test image URLs
test_images = [
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2",
    "https://picsum.photos/800/600?random=3",
    "https://picsum.photos/800/600?random=4",
    "https://picsum.photos/800/600?random=5",
]

print("🚀 Creating comprehensive test data...\n")

# ============================================
# 1. CREATE 10 TECHNICIANS
# ============================================
print("👷 Creating 10 Technicians...")
technicians = []
technician_names = [
    "Rajesh Kumar", "Amit Singh", "Vijay Sharma", "Arun Patel",
    "Suresh Reddy", "Manoj Kumar", "Ramesh Gupta", "Karthik Rao",
    "Venkat Reddy", "Sanjay Mehta"
]

for i, name in enumerate(technician_names, 1):
    email = f"tech{i}@legendlift.com"

    # Check if technician already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        technicians.append(existing)
        print(f"  ✓ Technician {i} already exists: {name}")
        continue

    tech = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        hashed_password=get_password_hash("tech123"),
        role="technician",
        phone=f"+91 98765{43210 + i}",
        active=True
    )
    db.add(tech)
    technicians.append(tech)
    print(f"  ✓ Created: {name}")

db.commit()
print(f"✅ {len(technicians)} Technicians ready\n")

# ============================================
# 2. CREATE 10 CUSTOMERS
# ============================================
print("🏢 Creating 10 Customers...")
customers = []
customer_data = [
    {"name": "ABC Mall", "area": "T Nagar", "route": 1},
    {"name": "XYZ Apartments", "area": "Anna Nagar", "route": 2},
    {"name": "Grand Hotel", "area": "Velachery", "route": 3},
    {"name": "Tech Park Plaza", "area": "OMR", "route": 4},
    {"name": "Sunrise Towers", "area": "Adyar", "route": 5},
    {"name": "City Center Mall", "area": "Porur", "route": 1},
    {"name": "Elite Residency", "area": "Nungambakkam", "route": 2},
    {"name": "Golden Square", "area": "Mylapore", "route": 3},
    {"name": "Metro Business Hub", "area": "Guindy", "route": 4},
    {"name": "Royal Palace Hotel", "area": "Egmore", "route": 5},
]

for i, data in enumerate(customer_data, 1):
    # Check if customer exists
    existing = db.query(Customer).filter(Customer.name == data["name"]).first()
    if existing:
        customers.append(existing)
        print(f"  ✓ Customer {i} already exists: {data['name']}")
        continue

    customer = Customer(
        id=str(uuid.uuid4()),
        name=data["name"],
        email=f"contact{i}@{data['name'].lower().replace(' ', '')}.com",
        phone_number=f"+91 98765{12340 + i}",
        address=f"{i+100}, Main Street, {data['area']}, Chennai - 600{10 + i}",
        area=data["area"],
        route=data["route"],
        job_number=f"JOB{1000 + i}",
        amc_status="ACTIVE",
        amc_valid_from=datetime.now() - timedelta(days=90),
        amc_valid_to=datetime.now() + timedelta(days=275),
        no_of_lifts=random.choice([2, 3, 4, 5]),
        created_at=datetime.now() - timedelta(days=365)
    )
    db.add(customer)
    customers.append(customer)
    print(f"  ✓ Created: {data['name']} - {data['area']} - Route {data['route']}")

db.commit()
print(f"✅ {len(customers)} Customers ready\n")

# ============================================
# 3. CREATE 10 AMC CONTRACTS
# ============================================
print("📄 Creating 10 AMC Contracts...")
for i, customer in enumerate(customers, 1):
    # Check if contract exists
    existing = db.query(AMCContract).filter(AMCContract.customer_id == customer.id).first()
    if existing:
        print(f"  ✓ Contract {i} already exists for {customer.name}")
        continue

    contract = AMCContract(
        id=str(uuid.uuid4()),
        customer_id=customer.id,
        contract_number=f"AMC-2024-{1000 + i}",
        start_date=customer.amc_valid_from,
        end_date=customer.amc_valid_to,
        service_frequency="MONTHLY",
        total_amount=120000 + (i * 10000),
        payment_terms="QUARTERLY",
        status="ACTIVE",
        no_of_lifts=customer.no_of_lifts,
        created_at=customer.created_at
    )
    db.add(contract)
    print(f"  ✓ Created: Contract for {customer.name} - ₹{contract.total_amount:,}")

db.commit()
print(f"✅ 10 AMC Contracts ready\n")

# ============================================
# 4. CREATE 10 SERVICES with REPORTS
# ============================================
print("🔧 Creating 10 Services with Reports...")
services = []
for i in range(10):
    customer = customers[i]
    tech = technicians[i % len(technicians)]

    # Create service
    scheduled_date = datetime.now() - timedelta(days=random.randint(1, 30))

    service = ServiceSchedule(
        id=str(uuid.uuid4()),
        service_id=f"SRV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}",
        customer_id=customer.id,
        technician_id=tech.id,
        scheduled_date=scheduled_date,
        actual_date=scheduled_date + timedelta(hours=2),
        status="completed",
        service_type="SERVICE",
        is_adhoc="false",
        created_at=scheduled_date - timedelta(days=5)
    )
    db.add(service)
    services.append(service)

    # Create service report with images
    report = ServiceReport(
        id=str(uuid.uuid4()),
        report_id=f"RPT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}",
        service_id=service.id,
        technician_id=tech.id,
        check_in_time=service.actual_date,
        check_out_time=service.actual_date + timedelta(hours=2),
        check_in_location=json.dumps({"latitude": 13.0827, "longitude": 80.2707}),
        work_done=f"Routine maintenance: Checked motor, lubricated cables, tested safety features for all {customer.no_of_lifts} lifts",
        parts_replaced=json.dumps(["Guide rail lubricant", "Door sensor"] if i % 2 == 0 else ["Cabin lights"]),
        images=json.dumps(test_images[:3]),  # 3 images
        customer_feedback="Excellent service, very professional" if i % 3 == 0 else "Good work",
        rating=random.choice([4, 5]),
        completion_time=service.actual_date + timedelta(hours=2),
        created_at=service.actual_date
    )
    db.add(report)
    print(f"  ✓ Service {i+1}: {customer.name} - {tech.name} - 3 images")

db.commit()
print(f"✅ {len(services)} Services with Reports ready\n")

# ============================================
# 5. CREATE 10 CALLBACKS with COMPLETION IMAGES
# ============================================
print("📞 Creating 10 Callbacks with Completion Images...")
callbacks = []

# Get admin user
admin = db.query(User).filter(User.role == "admin").first()
if not admin:
    print("  ⚠️ No admin user found, creating one...")
    admin = User(
        id=str(uuid.uuid4()),
        name="Admin User",
        email="admin@legendlift.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        phone="+91 9876543210",
        active=True
    )
    db.add(admin)
    db.commit()

callback_issues = [
    "Lift stuck on 3rd floor",
    "Strange noise from motor",
    "Door not closing properly",
    "Emergency button not working",
    "Lift moving too slowly",
    "Cabin light flickering",
    "Door sensor malfunction",
    "Lift stopping between floors",
    "ARD alarm triggered",
    "Panel display showing error"
]

for i in range(10):
    customer = customers[i]
    tech = technicians[i % len(technicians)]

    created_date = datetime.now() - timedelta(days=random.randint(1, 20))

    callback = CallBack(
        id=str(uuid.uuid4()),
        job_id=f"CB-{created_date.strftime('%Y%m%d')}-{str(i+1).zfill(3)}",
        customer_id=customer.id,
        created_by_admin_id=admin.id,
        scheduled_date=created_date,
        status="COMPLETED",
        description=callback_issues[i],
        technicians=json.dumps([tech.id]),
        responded_at=created_date + timedelta(minutes=15),
        completed_at=created_date + timedelta(hours=3),

        # Completion details with images
        issue_faced=callback_issues[i],
        customer_reporting_person="Facility Manager",
        problem_solved=f"Fixed {callback_issues[i].lower()}. Replaced faulty component and tested thoroughly.",
        completion_images=json.dumps(test_images[:4]),  # 4 images
        materials_changed=json.dumps([
            {"name": "Door motor" if "door" in callback_issues[i].lower() else "Cable", "quantity": 1, "cost": 15000}
        ]),
        lift_status_on_closure="NORMAL_RUNNING",
        requires_followup="false",

        # Tracking
        picked_at=created_date + timedelta(minutes=5),
        on_the_way_at=created_date + timedelta(minutes=10),
        at_site_at=created_date + timedelta(minutes=15),

        created_at=created_date
    )
    db.add(callback)
    callbacks.append(callback)
    print(f"  ✓ Callback {i+1}: {callback.job_id} - {customer.name} - 4 images")

db.commit()
print(f"✅ {len(callbacks)} Callbacks with Completion Images ready\n")

# ============================================
# 6. CREATE 10 REPAIRS with BEFORE/AFTER IMAGES
# ============================================
print("🔨 Creating 10 Repairs with Before/After Images...")
repairs = []

repair_types = [
    "ARD Replacement",
    "Door Motor Replacement",
    "Control Panel Upgrade",
    "Cable Replacement",
    "Guide Rail Repair",
    "Brake System Overhaul",
    "Elevator Controller Replacement",
    "Door System Repair",
    "Motor Bearing Replacement",
    "Safety Sensor Installation"
]

for i in range(10):
    customer = customers[i]
    tech = technicians[i % len(technicians)]

    scheduled_date = datetime.now() - timedelta(days=random.randint(5, 40))
    started_date = scheduled_date + timedelta(hours=1)
    completed_date = started_date + timedelta(hours=6)

    repair = Repair(
        id=str(uuid.uuid4()),
        customer_id=customer.id,
        created_by_admin_id=admin.id,
        scheduled_date=scheduled_date,
        status="COMPLETED",
        description=f"Major repair required: {repair_types[i]}",
        technicians=json.dumps([tech.id]),

        # Repair details
        repair_type=repair_types[i],
        work_done=f"Completed {repair_types[i]}. Removed old component, installed new parts, calibrated system, performed safety tests.",
        materials_used=json.dumps([
            {"name": repair_types[i].split()[0], "quantity": 1, "cost": 25000 + (i * 2000)}
        ]),
        before_images=json.dumps(test_images[:2]),  # 2 before images
        after_images=json.dumps(test_images[2:5]),  # 3 after images
        customer_approved="true",

        # Cost tracking
        materials_cost=25000 + (i * 2000),
        labor_cost=5000 + (i * 500),
        total_cost=30000 + (i * 2500),
        charged_amount=30000 + (i * 2500),
        payment_status="paid" if i % 2 == 0 else "pending",

        # Timestamps
        started_at=started_date,
        completed_at=completed_date,
        created_at=scheduled_date - timedelta(days=2)
    )
    db.add(repair)
    repairs.append(repair)
    print(f"  ✓ Repair {i+1}: {repair_types[i]} - {customer.name} - 2 before + 3 after images")

db.commit()
print(f"✅ {len(repairs)} Repairs with Before/After Images ready\n")

# ============================================
# SUMMARY
# ============================================
print("="*60)
print("✅ TEST DATA CREATION COMPLETE!")
print("="*60)
print(f"""
📊 Summary:
  • Technicians: {len(technicians)}
  • Customers: {len(customers)}
  • AMC Contracts: 10
  • Services: {len(services)} (with completion images)
  • Callbacks: {len(callbacks)} (with completion images)
  • Repairs: {len(repairs)} (with before/after images)

📸 Images:
  • Service Reports: 3 images each = 30 total
  • Callbacks: 4 images each = 40 total
  • Repairs: 2 before + 3 after = 50 total
  • Grand Total: 120 image references

🎯 Next Steps:
  1. Test API endpoints with new data
  2. Test mobile app image viewing
  3. Generate reports (daily/weekly/monthly)
  4. Verify all workflows
""")

db.close()
print("✨ Database connection closed.")

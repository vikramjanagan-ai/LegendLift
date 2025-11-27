"""
Initialize database with admin user and sample data for testing
"""
import sys
from sqlalchemy.orm import Session
from app.db.session import engine, Base, get_db
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.service import ServiceSchedule, ServiceStatus
from app.core.security import get_password_hash
from app.utils.id_generator import generate_uuid, generate_sequential_service_id
from datetime import datetime, timedelta

def init_database():
    """Initialize database with tables and sample data"""
    print("🚀 Initializing LegendLift Database...")

    # Create all tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

    # Get database session
    db = next(get_db())

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@legendlift.com").first()
        if existing_admin:
            print("⚠️  Admin user already exists")
        else:
            # Create admin user
            print("👤 Creating admin user...")
            admin = User(
                id=generate_uuid(),
                name="Admin User",
                email="admin@legendlift.com",
                phone="9999999999",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                active=True
            )
            db.add(admin)
            print("✅ Admin created: admin@legendlift.com / admin123")

        # Create sample technicians
        print("\n🔧 Creating sample technicians...")
        technicians = []

        tech_data = [
            {"name": "John Doe", "email": "john@legendlift.com", "phone": "9876543210"},
            {"name": "Sarah Smith", "email": "sarah@legendlift.com", "phone": "9876543211"},
            {"name": "Mike Johnson", "email": "mike@legendlift.com", "phone": "9876543212"},
        ]

        for tech in tech_data:
            existing = db.query(User).filter(User.email == tech["email"]).first()
            if not existing:
                technician = User(
                    id=generate_uuid(),
                    name=tech["name"],
                    email=tech["email"],
                    phone=tech["phone"],
                    hashed_password=get_password_hash("tech123"),
                    role=UserRole.TECHNICIAN,
                    active=True
                )
                db.add(technician)
                technicians.append(technician)
                print(f"✅ Created technician: {tech['name']} ({tech['email']} / tech123)")
            else:
                technicians.append(existing)
                print(f"⚠️  Technician already exists: {tech['name']}")

        db.commit()

        # Refresh to get IDs
        for tech in technicians:
            db.refresh(tech)

        # Create sample customers
        print("\n🏢 Creating sample customers...")
        customers = []

        customer_data = [
            {"name": "ABC Towers", "area": "T.Nagar", "address": "123 Main St, T.Nagar, Chennai",
             "contact_person": "Ravi Kumar", "phone": "9988776655", "email": "ravi@abctowers.com"},
            {"name": "XYZ Plaza", "area": "Anna Nagar", "address": "456 Park Ave, Anna Nagar, Chennai",
             "contact_person": "Priya Sharma", "phone": "9988776656", "email": "priya@xyzplaza.com"},
            {"name": "Grand Mall", "area": "Velachery", "address": "789 Market Rd, Velachery, Chennai",
             "contact_person": "Suresh Reddy", "phone": "9988776657", "email": "suresh@grandmall.com"},
        ]

        for i, cust in enumerate(customer_data):
            existing = db.query(Customer).filter(Customer.email == cust["email"]).first()
            if not existing:
                customer = Customer(
                    id=generate_uuid(),
                    job_number=f"JB-{1000 + i}",
                    name=cust["name"],
                    area=cust["area"],
                    address=cust["address"],
                    contact_person=cust["contact_person"],
                    phone=cust["phone"],
                    email=cust["email"],
                    latitude=13.0827,
                    longitude=80.2707,
                    route=f"Route-{i+1}"
                )
                db.add(customer)
                customers.append(customer)
                print(f"✅ Created customer: {cust['name']}")
            else:
                customers.append(existing)
                print(f"⚠️  Customer already exists: {cust['name']}")

        db.commit()

        # Refresh to get IDs
        for cust in customers:
            db.refresh(cust)

        # Create sample services for testing
        print("\n📋 Creating sample services...")

        # Create services with sequential IDs
        for i in range(5):
            service_id = generate_sequential_service_id(db)

            service = ServiceSchedule(
                id=generate_uuid(),
                service_id=service_id,
                customer_id=customers[i % len(customers)].id,
                technician_id=technicians[i % len(technicians)].id,
                scheduled_date=datetime.now() + timedelta(days=i),
                status=ServiceStatus.PENDING if i < 2 else ServiceStatus.COMPLETED if i < 4 else ServiceStatus.IN_PROGRESS,
                is_adhoc=False if i < 3 else True,
                service_type="scheduled" if i < 3 else "adhoc",
                notes=f"Test service {i+1}"
            )
            db.add(service)
            print(f"✅ Created service: {service_id}")

        db.commit()

        print("\n" + "="*60)
        print("✅ DATABASE INITIALIZED SUCCESSFULLY!")
        print("="*60)
        print("\n📝 LOGIN CREDENTIALS:")
        print("-" * 60)
        print("ADMIN:")
        print("  Email:    admin@legendlift.com")
        print("  Password: admin123")
        print("  Role:     admin")
        print("\nTECHNICIAN:")
        print("  Email:    john@legendlift.com (or sarah@/mike@)")
        print("  Password: tech123")
        print("  Role:     technician")
        print("-" * 60)
        print("\n🎯 Sample Data Created:")
        print(f"  - {len(technicians)} Technicians")
        print(f"  - {len(customers)} Customers")
        print("  - 5 Services (with sequential IDs)")
        print("\n🌐 Next Steps:")
        print("  1. Start backend: python run.py")
        print("  2. Open API docs: http://localhost:8000/docs")
        print("  3. Start mobile app: cd ../legendlift-mobile && npm start")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

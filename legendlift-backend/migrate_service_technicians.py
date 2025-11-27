"""
Migration script to create service_technicians association table
This enables many-to-many relationship between services and technicians
Allows unlimited technicians to be assigned to a single ticket/service
"""
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.session import Base
from app.models.service_technician import ServiceTechnician
from app.models.service import ServiceSchedule
from app.models.user import User

# Create engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate():
    """Create service_technicians table and migrate existing data"""
    print("Starting migration for service_technicians table...")

    # Create all tables (this will create service_technicians if it doesn't exist)
    Base.metadata.create_all(bind=engine)
    print("✓ Created service_technicians table")

    db = SessionLocal()
    try:
        # Migrate existing technician assignments from technician_id, technician2_id, technician3_id
        # to the new service_technicians table
        print("\nMigrating existing technician assignments...")

        services = db.query(ServiceSchedule).all()
        migrated_count = 0

        for service in services:
            # Check if already migrated (has entries in service_technicians)
            existing = db.query(ServiceTechnician).filter(
                ServiceTechnician.service_id == service.id
            ).first()

            if existing:
                print(f"  Service {service.service_id} already migrated, skipping...")
                continue

            # Migrate technician_id (primary technician)
            if service.technician_id:
                st = ServiceTechnician(
                    id=str(uuid.uuid4()),
                    service_id=service.id,
                    technician_id=service.technician_id,
                    is_primary=True,
                    order=0
                )
                db.add(st)
                migrated_count += 1
                print(f"  ✓ Migrated primary technician for service {service.service_id}")

            # Migrate technician2_id
            if service.technician2_id:
                st = ServiceTechnician(
                    id=str(uuid.uuid4()),
                    service_id=service.id,
                    technician_id=service.technician2_id,
                    is_primary=False,
                    order=1
                )
                db.add(st)
                migrated_count += 1
                print(f"  ✓ Migrated second technician for service {service.service_id}")

            # Migrate technician3_id
            if service.technician3_id:
                st = ServiceTechnician(
                    id=str(uuid.uuid4()),
                    service_id=service.id,
                    technician_id=service.technician3_id,
                    is_primary=False,
                    order=2
                )
                db.add(st)
                migrated_count += 1
                print(f"  ✓ Migrated third technician for service {service.service_id}")

        db.commit()
        print(f"\n✓ Migration completed! Migrated {migrated_count} technician assignments")

        # Show summary
        total_services = db.query(ServiceSchedule).count()
        total_assignments = db.query(ServiceTechnician).count()
        print(f"\nSummary:")
        print(f"  Total services: {total_services}")
        print(f"  Total technician assignments: {total_assignments}")

    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()

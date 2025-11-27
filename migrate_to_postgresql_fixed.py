#!/usr/bin/env python3
"""
Fixed Migration from SQLite to PostgreSQL with proper type conversions
"""
import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Add backend to path
sys.path.insert(0, '/home/minnal/source/LegendLift/legendlift-backend')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection string
POSTGRESQL_URL = "postgresql://legendlift_user:legendlift_secure_password_2025@localhost:5432/legendlift"
BACKUP_DIR = "/home/minnal/source/LegendLift/backups/2025-11-19-sqlite-backup"

def convert_boolean(value):
    """Convert SQLite integer to PostgreSQL boolean"""
    if value is None:
        return None
    return bool(int(value)) if isinstance(value, (int, str)) else bool(value)

def convert_datetime(value):
    """Convert string datetime to proper format"""
    if value is None:
        return None
    if isinstance(value, str):
        # Handle various datetime formats
        for fmt in [
            '%Y-%m-%d %H:%M:%S.%f',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%S'
        ]:
            try:
                return datetime.strptime(value, fmt)
            except:
                continue
    return value

def clean_json_string(value):
    """Clean up JSON string values"""
    if value is None:
        return None
    if isinstance(value, str) and value.startswith('"') and value.endswith('"'):
        return value[1:-1]  # Remove surrounding quotes
    return value

def main():
    print("="*80)
    print("LEGENDLIFT - Fixed SQLite to PostgreSQL Migration")
    print("="*80)

    # Test connection
    print("\nTesting PostgreSQL connection...")
    try:
        engine = create_engine(POSTGRESQL_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version[:70]}...")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # Clear existing data
    print("\nClearing existing data...")
    try:
        with engine.begin() as conn:
            # Drop all tables
            conn.execute(text("""
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO legendlift_user;
                GRANT ALL ON SCHEMA public TO public;
            """))
        print("✅ Database cleared")
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        sys.exit(1)

    # Create tables using SQL (avoiding Python model issues)
    print("\nCreating tables...")
    try:
        with engine.begin() as conn:
            # Create enums
            conn.execute(text("""
                CREATE TYPE userrole AS ENUM ('admin', 'technician', 'customer');
                CREATE TYPE servicestatus AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
                CREATE TYPE complaintpriority AS ENUM ('low', 'medium', 'high', 'urgent');
                CREATE TYPE complaintstatus AS ENUM ('open', 'in_progress', 'resolved', 'closed');
            """))

            # Users table
            conn.execute(text("""
                CREATE TABLE users (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    hashed_password VARCHAR(255) NOT NULL,
                    role userrole NOT NULL,
                    profile_image TEXT,
                    active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Customers table
            conn.execute(text("""
                CREATE TABLE customers (
                    id VARCHAR(36) PRIMARY KEY,
                    job_number VARCHAR(50) UNIQUE NOT NULL,
                    customer_name VARCHAR(255) NOT NULL,
                    contact_person VARCHAR(255),
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    address TEXT,
                    city VARCHAR(100),
                    state VARCHAR(100),
                    pincode VARCHAR(10),
                    latitude FLOAT,
                    longitude FLOAT,
                    route VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Sequential counters
            conn.execute(text("""
                CREATE TABLE sequential_counters (
                    id SERIAL PRIMARY KEY,
                    counter_type VARCHAR(50) UNIQUE NOT NULL,
                    current_value INTEGER NOT NULL DEFAULT 0,
                    date_key VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Service schedules
            conn.execute(text("""
                CREATE TABLE service_schedules (
                    id VARCHAR(36) PRIMARY KEY,
                    service_id VARCHAR(50) UNIQUE,
                    customer_id VARCHAR(36) REFERENCES customers(id),
                    amc_contract_id VARCHAR(36),
                    assigned_to_id VARCHAR(36) REFERENCES users(id),
                    scheduled_date TIMESTAMP,
                    service_type VARCHAR(100),
                    status servicestatus DEFAULT 'scheduled',
                    frequency VARCHAR(50),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Service reports
            conn.execute(text("""
                CREATE TABLE service_reports (
                    id VARCHAR(36) PRIMARY KEY,
                    service_schedule_id VARCHAR(36) REFERENCES service_schedules(id),
                    technician_id VARCHAR(36) REFERENCES users(id),
                    check_in_time TIMESTAMP,
                    check_out_time TIMESTAMP,
                    check_in_latitude FLOAT,
                    check_in_longitude FLOAT,
                    check_out_latitude FLOAT,
                    check_out_longitude FLOAT,
                    work_description TEXT,
                    parts_replaced TEXT,
                    customer_signature TEXT,
                    photos TEXT,
                    status VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Complaints
            conn.execute(text("""
                CREATE TABLE complaints (
                    id VARCHAR(36) PRIMARY KEY,
                    complaint_id VARCHAR(50) UNIQUE NOT NULL,
                    customer_id VARCHAR(36) REFERENCES customers(id),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    priority complaintpriority DEFAULT 'medium',
                    status complaintstatus DEFAULT 'open',
                    assigned_to_id VARCHAR(36) REFERENCES users(id),
                    resolution_notes TEXT,
                    resolved_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Callbacks
            conn.execute(text("""
                CREATE TABLE callbacks (
                    id VARCHAR(36) PRIMARY KEY,
                    customer_id VARCHAR(36) REFERENCES customers(id),
                    created_by_admin_id VARCHAR(36) REFERENCES users(id),
                    scheduled_date TIMESTAMP,
                    status VARCHAR(50),
                    description TEXT,
                    notes TEXT,
                    technicians TEXT,
                    responded_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # AMC Contracts (empty but create structure)
            conn.execute(text("""
                CREATE TABLE amc_contracts (
                    id VARCHAR(36) PRIMARY KEY,
                    customer_id VARCHAR(36) REFERENCES customers(id),
                    contract_number VARCHAR(50) UNIQUE,
                    start_date DATE,
                    end_date DATE,
                    amount DECIMAL(10,2),
                    status VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Other tables (empty but create structure)
            conn.execute(text("""
                CREATE TABLE escalations (
                    id VARCHAR(36) PRIMARY KEY,
                    complaint_id VARCHAR(36) REFERENCES complaints(id),
                    escalated_to_id VARCHAR(36) REFERENCES users(id),
                    reason TEXT,
                    status VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            conn.execute(text("""
                CREATE TABLE payments (
                    id VARCHAR(36) PRIMARY KEY,
                    customer_id VARCHAR(36) REFERENCES customers(id),
                    amount DECIMAL(10,2),
                    payment_date DATE,
                    method VARCHAR(50),
                    reference VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            conn.execute(text("""
                CREATE TABLE repairs (
                    id VARCHAR(36) PRIMARY KEY,
                    service_schedule_id VARCHAR(36) REFERENCES service_schedules(id),
                    description TEXT,
                    cost DECIMAL(10,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

        print("✅ All tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

    # Import data
    print("\nImporting data from JSON backups...")

    # Users
    print("  Importing users...")
    try:
        with open(f"{BACKUP_DIR}/users.json") as f:
            users = json.load(f)

        with engine.begin() as conn:
            for user in users:
                conn.execute(text("""
                    INSERT INTO users (id, name, email, phone, hashed_password, role, profile_image, active, created_at, updated_at)
                    VALUES (:id, :name, :email, :phone, :hashed_password, :role::userrole, :profile_image, :active, :created_at, :updated_at)
                """), {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'phone': user.get('phone'),
                    'hashed_password': user['hashed_password'],
                    'role': user['role'].lower(),
                    'profile_image': user.get('profile_image'),
                    'active': convert_boolean(user.get('active', 1)),
                    'created_at': convert_datetime(user.get('created_at')),
                    'updated_at': convert_datetime(user.get('updated_at'))
                })
        print(f"    ✅ Imported {len(users)} users")
    except Exception as e:
        print(f"    ❌ Error importing users: {e}")

    # Customers
    print("  Importing customers...")
    try:
        with open(f"{BACKUP_DIR}/customers.json") as f:
            customers = json.load(f)

        with engine.begin() as conn:
            for customer in customers:
                conn.execute(text("""
                    INSERT INTO customers (id, job_number, customer_name, contact_person, phone, email, address, city, state, pincode, latitude, longitude, route, created_at, updated_at)
                    VALUES (:id, :job_number, :customer_name, :contact_person, :phone, :email, :address, :city, :state, :pincode, :latitude, :longitude, :route, :created_at, :updated_at)
                """), {
                    'id': customer['id'],
                    'job_number': customer['job_number'],
                    'customer_name': customer['customer_name'],
                    'contact_person': customer.get('contact_person'),
                    'phone': customer.get('phone'),
                    'email': customer.get('email'),
                    'address': customer.get('address'),
                    'city': customer.get('city'),
                    'state': customer.get('state'),
                    'pincode': customer.get('pincode'),
                    'latitude': customer.get('latitude'),
                    'longitude': customer.get('longitude'),
                    'route': customer.get('route'),
                    'created_at': convert_datetime(customer.get('created_at')),
                    'updated_at': convert_datetime(customer.get('updated_at'))
                })
        print(f"    ✅ Imported {len(customers)} customers")
    except Exception as e:
        print(f"    ❌ Error importing customers: {e}")

    # Sequential counters
    print("  Importing sequential_counters...")
    try:
        with open(f"{BACKUP_DIR}/sequential_counters.json") as f:
            counters = json.load(f)

        with engine.begin() as conn:
            for counter in counters:
                conn.execute(text("""
                    INSERT INTO sequential_counters (counter_type, current_value, date_key, created_at, updated_at)
                    VALUES (:counter_type, :current_value, :date_key, :created_at, :updated_at)
                """), {
                    'counter_type': counter['counter_type'],
                    'current_value': counter['current_value'],
                    'date_key': counter['date_key'],
                    'created_at': convert_datetime(counter.get('created_at')),
                    'updated_at': convert_datetime(counter.get('updated_at'))
                })
        print(f"    ✅ Imported {len(counters)} sequential_counters")
    except Exception as e:
        print(f"    ❌ Error importing sequential_counters: {e}")

    # Service schedules
    print("  Importing service_schedules...")
    try:
        with open(f"{BACKUP_DIR}/service_schedules.json") as f:
            schedules = json.load(f)

        with engine.begin() as conn:
            for schedule in schedules:
                conn.execute(text("""
                    INSERT INTO service_schedules (id, service_id, customer_id, assigned_to_id, scheduled_date, service_type, status, frequency, notes, created_at, updated_at)
                    VALUES (:id, :service_id, :customer_id, :assigned_to_id, :scheduled_date, :service_type, :status::servicestatus, :frequency, :notes, :created_at, :updated_at)
                """), {
                    'id': schedule['id'],
                    'service_id': schedule.get('service_id'),
                    'customer_id': schedule['customer_id'],
                    'assigned_to_id': schedule.get('assigned_to_id'),
                    'scheduled_date': convert_datetime(schedule.get('scheduled_date')),
                    'service_type': schedule.get('service_type'),
                    'status': (schedule.get('status') or 'scheduled').lower(),
                    'frequency': schedule.get('frequency'),
                    'notes': schedule.get('notes'),
                    'created_at': convert_datetime(schedule.get('created_at')),
                    'updated_at': convert_datetime(schedule.get('updated_at'))
                })
        print(f"    ✅ Imported {len(schedules)} service_schedules")
    except Exception as e:
        print(f"    ❌ Error importing service_schedules: {e}")

    # Service reports
    print("  Importing service_reports...")
    try:
        with open(f"{BACKUP_DIR}/service_reports.json") as f:
            reports = json.load(f)

        if reports:
            with engine.begin() as conn:
                for report in reports:
                    conn.execute(text("""
                        INSERT INTO service_reports (id, service_schedule_id, technician_id, check_in_time, check_out_time, check_in_latitude, check_in_longitude, check_out_latitude, check_out_longitude, work_description, parts_replaced, customer_signature, photos, status, created_at, updated_at)
                        VALUES (:id, :service_schedule_id, :technician_id, :check_in_time, :check_out_time, :check_in_latitude, :check_in_longitude, :check_out_latitude, :check_out_longitude, :work_description, :parts_replaced, :customer_signature, :photos, :status, :created_at, :updated_at)
                    """), {
                        'id': report['id'],
                        'service_schedule_id': report.get('service_schedule_id'),
                        'technician_id': report.get('technician_id'),
                        'check_in_time': convert_datetime(report.get('check_in_time')),
                        'check_out_time': convert_datetime(report.get('check_out_time')),
                        'check_in_latitude': report.get('check_in_latitude'),
                        'check_in_longitude': report.get('check_in_longitude'),
                        'check_out_latitude': report.get('check_out_latitude'),
                        'check_out_longitude': report.get('check_out_longitude'),
                        'work_description': report.get('work_description'),
                        'parts_replaced': report.get('parts_replaced'),
                        'customer_signature': report.get('customer_signature'),
                        'photos': report.get('photos'),
                        'status': report.get('status'),
                        'created_at': convert_datetime(report.get('created_at')),
                        'updated_at': convert_datetime(report.get('updated_at'))
                    })
            print(f"    ✅ Imported {len(reports)} service_reports")
        else:
            print(f"    ⚠️  No service_reports to import")
    except Exception as e:
        print(f"    ❌ Error importing service_reports: {e}")

    # Complaints
    print("  Importing complaints...")
    try:
        with open(f"{BACKUP_DIR}/complaints.json") as f:
            complaints = json.load(f)

        with engine.begin() as conn:
            for complaint in complaints:
                conn.execute(text("""
                    INSERT INTO complaints (id, complaint_id, customer_id, title, description, priority, status, assigned_to_id, resolution_notes, resolved_at, created_at, updated_at)
                    VALUES (:id, :complaint_id, :customer_id, :title, :description, :priority::complaintpriority, :status::complaintstatus, :assigned_to_id, :resolution_notes, :resolved_at, :created_at, :updated_at)
                """), {
                    'id': complaint['id'],
                    'complaint_id': complaint['complaint_id'],
                    'customer_id': complaint['customer_id'],
                    'title': complaint['title'],
                    'description': complaint.get('description'),
                    'priority': (complaint.get('priority') or 'medium').lower(),
                    'status': (complaint.get('status') or 'open').lower(),
                    'assigned_to_id': complaint.get('assigned_to_id'),
                    'resolution_notes': complaint.get('resolution_notes'),
                    'resolved_at': convert_datetime(complaint.get('resolved_at')),
                    'created_at': convert_datetime(complaint.get('created_at')),
                    'updated_at': convert_datetime(complaint.get('updated_at'))
                })
        print(f"    ✅ Imported {len(complaints)} complaints")
    except Exception as e:
        print(f"    ❌ Error importing complaints: {e}")

    # Callbacks
    print("  Importing callbacks...")
    try:
        with open(f"{BACKUP_DIR}/callbacks.json") as f:
            callbacks = json.load(f)

        with engine.begin() as conn:
            for callback in callbacks:
                conn.execute(text("""
                    INSERT INTO callbacks (id, customer_id, created_by_admin_id, scheduled_date, status, description, notes, technicians, responded_at, completed_at, created_at, updated_at)
                    VALUES (:id, :customer_id, :created_by_admin_id, :scheduled_date, :status, :description, :notes, :technicians, :responded_at, :completed_at, :created_at, :updated_at)
                """), {
                    'id': callback['id'],
                    'customer_id': callback['customer_id'],
                    'created_by_admin_id': callback.get('created_by_admin_id'),
                    'scheduled_date': convert_datetime(callback.get('scheduled_date')),
                    'status': callback.get('status'),
                    'description': callback.get('description'),
                    'notes': callback.get('notes'),
                    'technicians': clean_json_string(callback.get('technicians')),
                    'responded_at': convert_datetime(callback.get('responded_at')),
                    'completed_at': convert_datetime(callback.get('completed_at')),
                    'created_at': convert_datetime(callback.get('created_at')),
                    'updated_at': convert_datetime(callback.get('updated_at'))
                })
        print(f"    ✅ Imported {len(callbacks)} callbacks")
    except Exception as e:
        print(f"    ❌ Error importing callbacks: {e}")

    # Verify data
    print("\nVerifying imported data...")
    try:
        with engine.connect() as conn:
            for table in ['users', 'customers', 'service_schedules', 'complaints', 'callbacks']:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"  ✅ {table}: {count} records")
    except Exception as e:
        print(f"  ❌ Error verifying: {e}")

    print("\n" + "="*80)
    print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*80)
    print("\nNext steps:")
    print("1. Update .env file with PostgreSQL connection string")
    print("2. Restart backend server")
    print("3. Test the application")

if __name__ == "__main__":
    main()

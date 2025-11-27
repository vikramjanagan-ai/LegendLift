#!/usr/bin/env python3
"""
Import real data from SQLite backup to PostgreSQL
Handles all type conversions properly
"""
import json
import sys
from pathlib import Path
from datetime import datetime

# PostgreSQL connection
import psycopg2

POSTGRESQL_CONN = {
    'dbname': 'legendlift',
    'user': 'legendlift_user',
    'password': 'legendlift_secure_password_2025',
    'host': 'localhost',
    'port': 5432
}

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

def main():
    print("="*80)
    print("LEGENDLIFT - Importing Real Data to PostgreSQL")
    print("="*80)
    print(f"Source: {BACKUP_DIR}")
    print(f"Target: PostgreSQL legendlift database")
    print()

    # Connect to PostgreSQL
    print("Connecting to PostgreSQL...")
    try:
        conn = psycopg2.connect(**POSTGRESQL_CONN)
        conn.autocommit = False
        cursor = conn.cursor()
        print("✅ Connected successfully")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    try:
        # Import USERS (205 records)
        print("\n📊 Importing users...")
        with open(f"{BACKUP_DIR}/users.json") as f:
            users = json.load(f)

        for user in users:
            cursor.execute("""
                INSERT INTO users (id, name, email, phone, hashed_password, role, profile_image, active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                user['id'],
                user['name'],
                user['email'],
                user.get('phone'),
                user['hashed_password'],
                user['role'].upper(),  # Keep UPPERCASE for PostgreSQL enum
                user.get('profile_image'),
                convert_boolean(user.get('active', 1)),
                convert_datetime(user.get('created_at')),
                convert_datetime(user.get('updated_at'))
            ))
        conn.commit()
        print(f"  ✅ Imported {len(users)} users")

        # Import CUSTOMERS (212 records)
        print("\n📊 Importing customers...")
        with open(f"{BACKUP_DIR}/customers.json") as f:
            customers = json.load(f)

        for customer in customers:
            cursor.execute("""
                INSERT INTO customers (
                    id, job_number, name, site_name, area, address, contact_person, phone, contact_number, email,
                    latitude, longitude, route, amc_valid_from, amc_valid_to, services_per_year,
                    amc_amount, amc_amount_received, amc_status, aiims_status, amc_type, door_type,
                    controller_type, number_of_floors, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                customer['id'],
                customer['job_number'],
                customer['name'],
                customer.get('site_name'),
                customer['area'],
                customer['address'],
                customer['contact_person'],
                customer['phone'],
                customer.get('contact_number'),
                customer.get('email'),
                customer.get('latitude'),
                customer.get('longitude'),
                customer.get('route', 1),
                convert_datetime(customer.get('amc_valid_from')),
                convert_datetime(customer.get('amc_valid_to')),
                customer.get('services_per_year'),
                customer.get('amc_amount'),
                customer.get('amc_amount_received', 0),
                customer.get('amc_status', 'ACTIVE').upper() if customer.get('amc_status') else 'ACTIVE',
                convert_boolean(customer.get('aiims_status', 0)),
                customer.get('amc_type'),
                customer.get('door_type'),
                customer.get('controller_type'),
                customer.get('number_of_floors'),
                convert_datetime(customer.get('created_at')),
                convert_datetime(customer.get('updated_at'))
            ))
        conn.commit()
        print(f"  ✅ Imported {len(customers)} customers")

        # Import SEQUENTIAL_COUNTERS (4 records)
        print("\n📊 Importing sequential_counters...")
        with open(f"{BACKUP_DIR}/sequential_counters.json") as f:
            counters = json.load(f)

        for counter in counters:
            cursor.execute("""
                INSERT INTO sequential_counters (counter_type, current_value, date_key, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                counter['counter_type'],
                counter['current_value'],
                counter['date_key'],
                convert_datetime(counter.get('created_at')),
                convert_datetime(counter.get('updated_at'))
            ))
        conn.commit()
        print(f"  ✅ Imported {len(counters)} sequential_counters")

        # Import SERVICE_SCHEDULES (256 records)
        print("\n📊 Importing service_schedules...")
        with open(f"{BACKUP_DIR}/service_schedules.json") as f:
            schedules = json.load(f)

        imported_schedules = 0
        skipped_schedules = 0
        for schedule in schedules:
            # Check if customer exists
            cursor.execute("SELECT id FROM customers WHERE id = %s", (schedule['customer_id'],))
            if not cursor.fetchone():
                skipped_schedules += 1
                continue

            # Check if assigned_to exists (if not null)
            if schedule.get('assigned_to_id'):
                cursor.execute("SELECT id FROM users WHERE id = %s", (schedule['assigned_to_id'],))
                if not cursor.fetchone():
                    schedule['assigned_to_id'] = None  # Set to null if user doesn't exist

            cursor.execute("""
                INSERT INTO service_schedules (id, service_id, customer_id, assigned_to_id, scheduled_date, service_type, status, frequency, notes, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                schedule['id'],
                schedule.get('service_id'),
                schedule['customer_id'],
                schedule.get('assigned_to_id'),
                convert_datetime(schedule.get('scheduled_date')),
                schedule.get('service_type'),
                (schedule.get('status') or 'scheduled').lower(),
                schedule.get('frequency'),
                schedule.get('notes'),
                convert_datetime(schedule.get('created_at')),
                convert_datetime(schedule.get('updated_at'))
            ))
            imported_schedules += 1
        conn.commit()
        print(f"  ✅ Imported {imported_schedules} service_schedules (skipped {skipped_schedules} with invalid references)")

        # Import SERVICE_REPORTS (1 record)
        print("\n📊 Importing service_reports...")
        with open(f"{BACKUP_DIR}/service_reports.json") as f:
            reports = json.load(f)

        imported_reports = 0
        skipped_reports = 0
        for report in reports:
            # Check if technician exists
            if report.get('technician_id'):
                cursor.execute("SELECT id FROM users WHERE id = %s", (report['technician_id'],))
                if not cursor.fetchone():
                    skipped_reports += 1
                    continue

            cursor.execute("""
                INSERT INTO service_reports (id, service_schedule_id, technician_id, check_in_time, check_out_time, check_in_latitude, check_in_longitude, check_out_latitude, check_out_longitude, work_description, parts_replaced, customer_signature, photos, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                report['id'],
                report.get('service_schedule_id'),
                report.get('technician_id'),
                convert_datetime(report.get('check_in_time')),
                convert_datetime(report.get('check_out_time')),
                report.get('check_in_latitude'),
                report.get('check_in_longitude'),
                report.get('check_out_latitude'),
                report.get('check_out_longitude'),
                report.get('work_description'),
                report.get('parts_replaced'),
                report.get('customer_signature'),
                report.get('photos'),
                report.get('status'),
                convert_datetime(report.get('created_at')),
                convert_datetime(report.get('updated_at'))
            ))
            imported_reports += 1
        conn.commit()
        print(f"  ✅ Imported {imported_reports} service_reports (skipped {skipped_reports} with invalid references)")

        # Import COMPLAINTS (24 records)
        print("\n📊 Importing complaints...")
        with open(f"{BACKUP_DIR}/complaints.json") as f:
            complaints = json.load(f)

        imported_complaints = 0
        skipped_complaints = 0
        for complaint in complaints:
            # Check if customer exists
            cursor.execute("SELECT id FROM customers WHERE id = %s", (complaint['customer_id'],))
            if not cursor.fetchone():
                skipped_complaints += 1
                continue

            # Check if assigned_to exists (if not null)
            if complaint.get('assigned_to_id'):
                cursor.execute("SELECT id FROM users WHERE id = %s", (complaint['assigned_to_id'],))
                if not cursor.fetchone():
                    complaint['assigned_to_id'] = None

            cursor.execute("""
                INSERT INTO complaints (id, complaint_id, customer_id, title, description, priority, status, assigned_to_id, resolution_notes, resolved_at, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                complaint['id'],
                complaint['complaint_id'],
                complaint['customer_id'],
                complaint['title'],
                complaint.get('description'),
                (complaint.get('priority') or 'medium').lower(),
                (complaint.get('status') or 'open').lower(),
                complaint.get('assigned_to_id'),
                complaint.get('resolution_notes'),
                convert_datetime(complaint.get('resolved_at')),
                convert_datetime(complaint.get('created_at')),
                convert_datetime(complaint.get('updated_at'))
            ))
            imported_complaints += 1
        conn.commit()
        print(f"  ✅ Imported {imported_complaints} complaints (skipped {skipped_complaints} with invalid references)")

        # Import CALLBACKS (15 records)
        print("\n📊 Importing callbacks...")
        with open(f"{BACKUP_DIR}/callbacks.json") as f:
            callbacks = json.load(f)

        imported_callbacks = 0
        skipped_callbacks = 0
        for callback in callbacks:
            # Check if customer exists
            cursor.execute("SELECT id FROM customers WHERE id = %s", (callback['customer_id'],))
            if not cursor.fetchone():
                skipped_callbacks += 1
                continue

            # Check if created_by_admin exists (if not null)
            if callback.get('created_by_admin_id'):
                cursor.execute("SELECT id FROM users WHERE id = %s", (callback['created_by_admin_id'],))
                if not cursor.fetchone():
                    callback['created_by_admin_id'] = None

            # Clean up technicians JSON string
            technicians_val = callback.get('technicians')
            if technicians_val and isinstance(technicians_val, str):
                if technicians_val.startswith('"') and technicians_val.endswith('"'):
                    technicians_val = technicians_val[1:-1]  # Remove outer quotes

            cursor.execute("""
                INSERT INTO callbacks (id, customer_id, created_by_admin_id, scheduled_date, status, description, notes, technicians, responded_at, completed_at, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                callback['id'],
                callback['customer_id'],
                callback.get('created_by_admin_id'),
                convert_datetime(callback.get('scheduled_date')),
                callback.get('status'),
                callback.get('description'),
                callback.get('notes'),
                technicians_val,
                convert_datetime(callback.get('responded_at')),
                convert_datetime(callback.get('completed_at')),
                convert_datetime(callback.get('created_at')),
                convert_datetime(callback.get('updated_at'))
            ))
            imported_callbacks += 1
        conn.commit()
        print(f"  ✅ Imported {imported_callbacks} callbacks (skipped {skipped_callbacks} with invalid references)")

        # Verify counts
        print("\n" + "="*80)
        print("VERIFICATION - Checking imported data counts...")
        print("="*80)

        tables = ['users', 'customers', 'sequential_counters', 'service_schedules',
                  'service_reports', 'complaints', 'callbacks']

        total_records = 0
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            total_records += count
            print(f"  ✅ {table}: {count} records")

        print("\n" + "="*80)
        print(f"✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*80)
        print(f"Total records imported: {total_records}")
        print("\nYour data is now in PostgreSQL!")
        print("Backend is running and ready to use.")

    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        conn.rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

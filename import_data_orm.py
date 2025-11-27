#!/usr/bin/env python3
"""
Import SQLite backup data to PostgreSQL using SQLAlchemy ORM
This handles all type conversions automatically
"""
import sys
import os
import json
from pathlib import Path
from datetime import datetime, date
from decimal import Decimal

# Add backend to path
sys.path.insert(0, '/home/minnal/source/LegendLift/legendlift-backend')

# Set DATABASE_URL before importing models
os.environ['DATABASE_URL'] = 'postgresql://legendlift_user:legendlift_secure_password_2025@localhost:5432/legendlift'

from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.user import User, UserRole
from app.models.customer import Customer, AMCStatus
from app.models.service import ServiceSchedule, ServiceReport
from app.models.repair import Repair
from app.models.complaint import Complaint
from app.models.payment import Payment, PaymentStatus
from app.models.callback import CallBack
from app.models.escalation import Escalation
from app.models.counter import SequentialCounter

BACKUP_DIR = "/home/minnal/source/LegendLift/backups/2025-11-19-sqlite-backup"

def parse_datetime(dt_str):
    """Parse datetime string to datetime object"""
    if not dt_str:
        return None
    if isinstance(dt_str, datetime):
        return dt_str
    try:
        # Try multiple formats
        for fmt in ['%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']:
            try:
                return datetime.strptime(dt_str, fmt)
            except:
                continue
        return None
    except:
        return None

def parse_date(date_str):
    """Parse date string to date object"""
    if not date_str:
        return None
    if isinstance(date_str, date):
        return date_str
    if isinstance(date_str, datetime):
        return date_str.date()
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except:
        return None

def main():
    print("="*80)
    print("LEGENDLIFT - Importing Data via SQLAlchemy ORM")
    print("="*80)
    print(f"Source: {BACKUP_DIR}")
    print()

    # Create session
    db = Session(engine)

    try:
        # 1. Import Users (205 records)
        print("📊 Importing users...")
        with open(f"{BACKUP_DIR}/users.json") as f:
            users_data = json.load(f)

        for user_dict in users_data:
            user = User(
                id=user_dict['id'],
                name=user_dict['name'],
                email=user_dict['email'],
                phone=user_dict.get('phone'),
                hashed_password=user_dict['hashed_password'],
                role=UserRole[user_dict['role']],  # Convert string to enum
                profile_image=user_dict.get('profile_image'),
                active=bool(user_dict.get('active', 1)),
                created_at=parse_datetime(user_dict.get('created_at')),
                updated_at=parse_datetime(user_dict.get('updated_at'))
            )
            db.merge(user)  # merge instead of add to handle conflicts
        db.commit()
        print(f"  ✅ Imported {len(users_data)} users")

        # 2. Import Customers (212 records)
        print("\n📊 Importing customers...")
        with open(f"{BACKUP_DIR}/customers.json") as f:
            customers_data = json.load(f)

        for cust_dict in customers_data:
            customer = Customer(
                id=cust_dict['id'],
                job_number=cust_dict['job_number'],
                name=cust_dict['name'],
                site_name=cust_dict.get('site_name'),
                area=cust_dict['area'],
                address=cust_dict['address'],
                contact_person=cust_dict['contact_person'],
                phone=cust_dict['phone'],
                contact_number=cust_dict.get('contact_number'),
                email=cust_dict.get('email'),
                latitude=cust_dict.get('latitude'),
                longitude=cust_dict.get('longitude'),
                route=cust_dict.get('route', 1),
                amc_valid_from=parse_date(cust_dict.get('amc_valid_from')),
                amc_valid_to=parse_date(cust_dict.get('amc_valid_to')),
                services_per_year=cust_dict.get('services_per_year'),
                amc_amount=Decimal(str(cust_dict.get('amc_amount', 0))) if cust_dict.get('amc_amount') else None,
                amc_amount_received=Decimal(str(cust_dict.get('amc_amount_received', 0))) if cust_dict.get('amc_amount_received') else None,
                amc_status=AMCStatus[cust_dict.get('amc_status', 'ACTIVE')] if cust_dict.get('amc_status') else AMCStatus.ACTIVE,
                aiims_status=bool(cust_dict.get('aiims_status', 0)),
                amc_type=cust_dict.get('amc_type'),
                door_type=cust_dict.get('door_type'),
                controller_type=cust_dict.get('controller_type'),
                number_of_floors=cust_dict.get('number_of_floors'),
                created_at=parse_datetime(cust_dict.get('created_at')),
                updated_at=parse_datetime(cust_dict.get('updated_at'))
            )
            db.merge(customer)
        db.commit()
        print(f"  ✅ Imported {len(customers_data)} customers")

        # 3. Import Sequential Counters
        print("\n📊 Importing sequential_counters...")
        with open(f"{BACKUP_DIR}/sequential_counters.json") as f:
            counters_data = json.load(f)

        for counter_dict in counters_data:
            counter = SequentialCounter(
                id=counter_dict['id'],
                entity_type=counter_dict['entity_type'],
                date_key=counter_dict['date_key'],
                last_number=counter_dict['last_number'],
                created_at=parse_datetime(counter_dict.get('created_at')),
                updated_at=parse_datetime(counter_dict.get('updated_at'))
            )
            db.merge(counter)
        db.commit()
        print(f"  ✅ Imported {len(counters_data)} sequential_counters")

        # 4. Import Service Schedules (256 records)
        print("\n📊 Importing service_schedules...")
        with open(f"{BACKUP_DIR}/service_schedules.json") as f:
            schedules_data = json.load(f)

        for sched_dict in schedules_data:
            schedule = ServiceSchedule(
                id=sched_dict['id'],
                service_id=sched_dict.get('service_id'),
                contract_id=sched_dict.get('contract_id'),
                customer_id=sched_dict['customer_id'],
                scheduled_date=parse_datetime(sched_dict.get('scheduled_date')),
                actual_date=parse_datetime(sched_dict.get('actual_date')),
                status=sched_dict.get('status', 'PENDING'),
                technician_id=sched_dict.get('technician_id'),
                technician2_id=sched_dict.get('technician2_id'),
                technician3_id=sched_dict.get('technician3_id'),
                days_overdue=sched_dict.get('days_overdue'),
                overdue_days=sched_dict.get('overdue_days', 0),
                is_high_priority=bool(sched_dict.get('is_high_priority', 0)),
                is_adhoc=bool(int(sched_dict.get('is_adhoc', 0))) if sched_dict.get('is_adhoc') else False,
                service_type=sched_dict.get('service_type'),
                notes=sched_dict.get('notes'),
                created_at=parse_datetime(sched_dict.get('created_at')),
                updated_at=parse_datetime(sched_dict.get('updated_at'))
            )
            db.merge(schedule)
        db.commit()
        print(f"  ✅ Imported {len(schedules_data)} service_schedules")

        # 5. Import Complaints (9 records)
        print("\n📊 Importing complaints...")
        with open(f"{BACKUP_DIR}/complaints.json") as f:
            complaints_data = json.load(f)

        for complaint_dict in complaints_data:
            complaint = Complaint(
                id=complaint_dict['id'],
                complaint_number=complaint_dict['complaint_number'],
                customer_id=complaint_dict['customer_id'],
                reported_by=complaint_dict['reported_by'],
                complaint_date=parse_datetime(complaint_dict['complaint_date']),
                description=complaint_dict['description'],
                status=complaint_dict.get('status', 'OPEN'),
                priority=complaint_dict.get('priority', 'MEDIUM'),
                assigned_to=complaint_dict.get('assigned_to'),
                resolved_date=parse_datetime(complaint_dict.get('resolved_date')),
                resolution_notes=complaint_dict.get('resolution_notes'),
                created_at=parse_datetime(complaint_dict.get('created_at')),
                updated_at=parse_datetime(complaint_dict.get('updated_at'))
            )
            db.merge(complaint)
        db.commit()
        print(f"  ✅ Imported {len(complaints_data)} complaints")

        # 6. Import Callbacks (3 records)
        print("\n📊 Importing callbacks...")
        with open(f"{BACKUP_DIR}/callbacks.json") as f:
            callbacks_data = json.load(f)

        for callback_dict in callbacks_data:
            callback = CallBack(
                id=callback_dict['id'],
                callback_number=callback_dict['callback_number'],
                customer_id=callback_dict['customer_id'],
                requested_by=callback_dict['requested_by'],
                callback_date=parse_datetime(callback_dict['callback_date']),
                reason=callback_dict.get('reason'),
                status=callback_dict.get('status', 'PENDING'),
                assigned_to=callback_dict.get('assigned_to'),
                completed_date=parse_datetime(callback_dict.get('completed_date')),
                notes=callback_dict.get('notes'),
                created_at=parse_datetime(callback_dict.get('created_at')),
                updated_at=parse_datetime(callback_dict.get('updated_at'))
            )
            db.merge(callback)
        db.commit()
        print(f"  ✅ Imported {len(callbacks_data)} callbacks")

        # 7. Import Escalations (2 records)
        print("\n📊 Importing escalations...")
        with open(f"{BACKUP_DIR}/escalations.json") as f:
            escalations_data = json.load(f)

        for esc_dict in escalations_data:
            escalation = Escalation(
                id=esc_dict['id'],
                escalation_number=esc_dict['escalation_number'],
                customer_id=esc_dict['customer_id'],
                related_complaint_id=esc_dict.get('related_complaint_id'),
                escalated_by=esc_dict['escalated_by'],
                escalation_date=parse_datetime(esc_dict['escalation_date']),
                reason=esc_dict.get('reason'),
                status=esc_dict.get('status', 'OPEN'),
                priority=esc_dict.get('priority', 'HIGH'),
                assigned_to=esc_dict.get('assigned_to'),
                resolved_date=parse_datetime(esc_dict.get('resolved_date')),
                resolution_notes=esc_dict.get('resolution_notes'),
                created_at=parse_datetime(esc_dict.get('created_at')),
                updated_at=parse_datetime(esc_dict.get('updated_at'))
            )
            db.merge(escalation)
        db.commit()
        print(f"  ✅ Imported {len(escalations_data)} escalations")

        # 8. Import Payments (18 records)
        print("\n📊 Importing payments...")
        with open(f"{BACKUP_DIR}/payments.json") as f:
            payments_data = json.load(f)

        for payment_dict in payments_data:
            payment = Payment(
                id=payment_dict['id'],
                payment_number=payment_dict['payment_number'],
                customer_id=payment_dict['customer_id'],
                amount=Decimal(str(payment_dict['amount'])),
                payment_date=parse_datetime(payment_dict['payment_date']),
                payment_method=payment_dict.get('payment_method', 'CASH'),
                status=PaymentStatus[payment_dict.get('status', 'COMPLETED')] if payment_dict.get('status') else PaymentStatus.COMPLETED,
                reference_number=payment_dict.get('reference_number'),
                notes=payment_dict.get('notes'),
                created_at=parse_datetime(payment_dict.get('created_at')),
                updated_at=parse_datetime(payment_dict.get('updated_at'))
            )
            db.merge(payment)
        db.commit()
        print(f"  ✅ Imported {len(payments_data)} payments")

        # 9. Import Service Reports (10 records)
        print("\n📊 Importing service_reports...")
        with open(f"{BACKUP_DIR}/service_reports.json") as f:
            reports_data = json.load(f)

        for report_dict in reports_data:
            report = ServiceReport(
                id=report_dict['id'],
                report_number=report_dict['report_number'],
                schedule_id=report_dict.get('schedule_id'),
                customer_id=report_dict['customer_id'],
                technician_id=report_dict.get('technician_id'),
                service_date=parse_datetime(report_dict['service_date']),
                service_type=report_dict.get('service_type'),
                findings=report_dict.get('findings'),
                work_done=report_dict.get('work_done'),
                parts_replaced=report_dict.get('parts_replaced'),
                remarks=report_dict.get('remarks'),
                customer_signature=report_dict.get('customer_signature'),
                technician_signature=report_dict.get('technician_signature'),
                created_at=parse_datetime(report_dict.get('created_at')),
                updated_at=parse_datetime(report_dict.get('updated_at'))
            )
            db.merge(report)
        db.commit()
        print(f"  ✅ Imported {len(reports_data)} service_reports")

        # 10. Import Repairs (2 records)
        print("\n📊 Importing repairs...")
        with open(f"{BACKUP_DIR}/repairs.json") as f:
            repairs_data = json.load(f)

        for repair_dict in repairs_data:
            repair = Repair(
                id=repair_dict['id'],
                repair_number=repair_dict['repair_number'],
                customer_id=repair_dict['customer_id'],
                technician_id=repair_dict.get('technician_id'),
                reported_date=parse_datetime(repair_dict['reported_date']),
                scheduled_date=parse_datetime(repair_dict.get('scheduled_date')),
                completed_date=parse_datetime(repair_dict.get('completed_date')),
                issue_description=repair_dict.get('issue_description'),
                work_done=repair_dict.get('work_done'),
                parts_used=repair_dict.get('parts_used'),
                cost=Decimal(str(repair_dict.get('cost', 0))) if repair_dict.get('cost') else None,
                status=repair_dict.get('status', 'PENDING'),
                created_at=parse_datetime(repair_dict.get('created_at')),
                updated_at=parse_datetime(repair_dict.get('updated_at'))
            )
            db.merge(repair)
        db.commit()
        print(f"  ✅ Imported {len(repairs_data)} repairs")

        print("\n" + "="*80)
        print("✅ MIGRATION COMPLETE!")
        print("="*80)

        # Print summary
        total_records = (
            len(users_data) + len(customers_data) + len(counters_data) +
            len(schedules_data) + len(complaints_data) + len(callbacks_data) +
            len(escalations_data) + len(payments_data) + len(reports_data) +
            len(repairs_data)
        )

        print(f"\nTotal records migrated: {total_records}")
        print("\nBreakdown:")
        print(f"  - Users: {len(users_data)}")
        print(f"  - Customers: {len(customers_data)}")
        print(f"  - Sequential Counters: {len(counters_data)}")
        print(f"  - Service Schedules: {len(schedules_data)}")
        print(f"  - Complaints: {len(complaints_data)}")
        print(f"  - Callbacks: {len(callbacks_data)}")
        print(f"  - Escalations: {len(escalations_data)}")
        print(f"  - Payments: {len(payments_data)}")
        print(f"  - Service Reports: {len(reports_data)}")
        print(f"  - Repairs: {len(repairs_data)}")

    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

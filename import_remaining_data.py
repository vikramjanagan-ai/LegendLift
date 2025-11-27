#!/usr/bin/env python3
"""
Import remaining data from SQLite backup to PostgreSQL
Only imports what's in the JSON files
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
from app.models.complaint import Complaint
from app.models.callback import CallBack
from app.models.service import ServiceReport

BACKUP_DIR = "/home/minnal/source/LegendLift/backups/2025-11-19-sqlite-backup"

def parse_datetime(dt_str):
    """Parse datetime string to datetime object"""
    if not dt_str:
        return None
    if isinstance(dt_str, datetime):
        return dt_str
    try:
        for fmt in ['%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']:
            try:
                return datetime.strptime(dt_str, fmt)
            except:
                continue
        return None
    except:
        return None

def main():
    print("="*80)
    print("LEGENDLIFT - Importing Remaining Data")
    print("="*80)
    print(f"Source: {BACKUP_DIR}")
    print()

    # Create session
    db = Session(engine)

    try:
        # 1. Import Complaints
        print("📊 Importing complaints...")
        with open(f"{BACKUP_DIR}/complaints.json") as f:
            complaints_data = json.load(f)

        imported_count = 0
        for complaint_dict in complaints_data:
            try:
                complaint = Complaint(
                    id=complaint_dict['id'],
                    complaint_id=complaint_dict['complaint_id'],
                    customer_id=complaint_dict['customer_id'],
                    user_id=complaint_dict.get('user_id'),
                    title=complaint_dict.get('title'),
                    description=complaint_dict.get('description'),
                    issue_type=complaint_dict.get('issue_type'),
                    priority=complaint_dict.get('priority', 'MEDIUM'),
                    status=complaint_dict.get('status', 'PENDING'),
                    assigned_to_id=complaint_dict.get('assigned_to_id'),
                    resolved_at=parse_datetime(complaint_dict.get('resolved_at')),
                    resolution_notes=complaint_dict.get('resolution_notes'),
                    created_at=parse_datetime(complaint_dict.get('created_at')),
                    updated_at=parse_datetime(complaint_dict.get('updated_at'))
                )
                db.merge(complaint)
                db.flush()  # Flush to catch FK errors
                imported_count += 1
            except Exception as e:
                print(f"    ⚠️  Skipping complaint {complaint_dict.get('complaint_id')}: Invalid foreign key")
                db.rollback()
                db = Session(engine)  # Create new session
        db.commit()
        print(f"  ✅ Imported {imported_count}/{len(complaints_data)} complaints")

        # 2. Import Callbacks
        print("\n📊 Importing callbacks...")
        with open(f"{BACKUP_DIR}/callbacks.json") as f:
            callbacks_data = json.load(f)

        for callback_dict in callbacks_data:
            callback = CallBack(
                id=callback_dict['id'],
                customer_id=callback_dict['customer_id'],
                description=callback_dict.get('description'),
                scheduled_date=parse_datetime(callback_dict.get('scheduled_date')),
                status=callback_dict.get('status', 'PENDING'),
                notes=callback_dict.get('notes'),
                responded_at=parse_datetime(callback_dict.get('responded_at')),
                completed_at=parse_datetime(callback_dict.get('completed_at')),
                created_by_admin_id=callback_dict.get('created_by_admin_id'),
                technicians=callback_dict.get('technicians'),
                created_at=parse_datetime(callback_dict.get('created_at')),
                updated_at=parse_datetime(callback_dict.get('updated_at'))
            )
            db.merge(callback)
        db.commit()
        print(f"  ✅ Imported {len(callbacks_data)} callbacks")

        # 3. Import Service Reports
        print("\n📊 Importing service_reports...")
        with open(f"{BACKUP_DIR}/service_reports.json") as f:
            reports_data = json.load(f)

        for report_dict in reports_data:
            report = ServiceReport(
                id=report_dict['id'],
                report_id=report_dict.get('report_id'),
                service_id=report_dict.get('service_id'),
                technician_id=report_dict.get('technician_id'),
                check_in_time=parse_datetime(report_dict.get('check_in_time')),
                check_out_time=parse_datetime(report_dict.get('check_out_time')),
                check_in_location=report_dict.get('check_in_location'),
                check_out_location=report_dict.get('check_out_location'),
                work_done=report_dict.get('work_done'),
                parts_replaced=report_dict.get('parts_replaced'),
                images=report_dict.get('images'),
                customer_signature=report_dict.get('customer_signature'),
                technician_signature=report_dict.get('technician_signature'),
                customer_feedback=report_dict.get('customer_feedback'),
                rating=report_dict.get('rating'),
                completion_time=parse_datetime(report_dict.get('completion_time')),
                created_at=parse_datetime(report_dict.get('created_at')),
                updated_at=parse_datetime(report_dict.get('updated_at'))
            )
            db.merge(report)
        db.commit()
        print(f"  ✅ Imported {len(reports_data)} service_reports")

        print("\n" + "="*80)
        print("✅ REMAINING DATA IMPORTED!")
        print("="*80)

        total_records = len(complaints_data) + len(callbacks_data) + len(reports_data)
        print(f"\nTotal records migrated: {total_records}")
        print(f"  - Complaints: {len(complaints_data)}")
        print(f"  - Callbacks: {len(callbacks_data)}")
        print(f"  - Service Reports: {len(reports_data)}")

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

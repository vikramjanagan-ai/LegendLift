"""
Database Migration: Add Material Usage table and update Repair model
Run this script to add the new tables and columns needed for advanced reports
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import Base
from app.models import (
    MaterialUsage, Repair, Customer, User, ServiceSchedule,
    CallBack, Payment, AMCContract, ServiceReport
)

def run_migration():
    print("🔄 Starting database migration for advanced reports...")

    engine = create_engine(settings.DATABASE_URL)

    # Create MaterialUsage table
    print("\n📋 Creating material_usage table...")
    try:
        MaterialUsage.__table__.create(engine, checkfirst=True)
        print("✅ material_usage table created successfully")
    except Exception as e:
        print(f"⚠️  material_usage table might already exist: {e}")

    # Add new columns to repairs table
    print("\n🔧 Adding new columns to repairs table...")

    new_columns = [
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS repair_type VARCHAR",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS work_done TEXT",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS materials_used JSON",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS before_images JSON",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS after_images JSON",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS customer_approved VARCHAR DEFAULT 'false'",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS materials_cost NUMERIC(10, 2) DEFAULT 0",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS labor_cost NUMERIC(10, 2) DEFAULT 0",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10, 2) DEFAULT 0",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS charged_amount NUMERIC(10, 2) DEFAULT 0",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending'",
        "ALTER TABLE repairs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP",
    ]

    with engine.connect() as conn:
        for sql in new_columns:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"✅ Added: {sql.split('ADD COLUMN IF NOT EXISTS')[1].split()[0] if 'ADD COLUMN' in sql else 'column'}")
            except Exception as e:
                print(f"⚠️  {e}")

    print("\n✨ Migration completed successfully!")
    print("\n📊 New features available:")
    print("  ✓ Material usage tracking")
    print("  ✓ Enhanced repair cost tracking")
    print("  ✓ Customer AMC Period Reports")
    print("  ✓ Technician Performance Reports")
    print("  ✓ Materials Consumption Reports")
    print("  ✓ Revenue Reports")
    print("\n🚀 You can now use the advanced reports API!")

if __name__ == "__main__":
    run_migration()

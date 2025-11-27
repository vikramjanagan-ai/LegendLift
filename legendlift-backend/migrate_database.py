"""
Database Migration Script
Migrates the database to add new AMC fields, CallBack and Repair models
"""

import sqlite3
from datetime import datetime

# Database path
DB_PATH = "legendlift.db"

def migrate_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Starting database migration...")

    try:
        # 1. Add new columns to customers table
        print("\n1. Adding new columns to customers table...")

        new_customer_columns = [
            ("site_name", "TEXT"),
            ("contact_number", "TEXT"),
            ("amc_valid_from", "DATE"),
            ("amc_valid_to", "DATE"),
            ("services_per_year", "INTEGER"),
            ("amc_amount", "DECIMAL(10, 2)"),
            ("amc_amount_received", "DECIMAL(10, 2) DEFAULT 0"),
            ("amc_status", "TEXT DEFAULT 'ACTIVE'"),
            ("aiims_status", "INTEGER DEFAULT 0"),
            ("amc_type", "TEXT"),
            ("door_type", "TEXT"),
            ("controller_type", "TEXT"),
            ("number_of_floors", "INTEGER"),
        ]

        for column_name, column_type in new_customer_columns:
            try:
                cursor.execute(f"ALTER TABLE customers ADD COLUMN {column_name} {column_type}")
                print(f"   ✓ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"   - Column already exists: {column_name}")
                else:
                    raise

        # 2. Add new columns to service_schedules table
        print("\n2. Adding new columns to service_schedules table...")

        new_service_columns = [
            ("technician3_id", "TEXT"),
            ("overdue_days", "INTEGER DEFAULT 0"),
            ("is_high_priority", "INTEGER DEFAULT 0"),
        ]

        for column_name, column_type in new_service_columns:
            try:
                cursor.execute(f"ALTER TABLE service_schedules ADD COLUMN {column_name} {column_type}")
                print(f"   ✓ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"   - Column already exists: {column_name}")
                else:
                    raise

        # 3. Create callbacks table
        print("\n3. Creating callbacks table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS callbacks (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                created_by_admin_id TEXT NOT NULL,
                scheduled_date DATETIME NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                description TEXT,
                notes TEXT,
                technicians TEXT,
                responded_at DATETIME,
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
            )
        """)
        print("   ✓ Created callbacks table")

        # Create indexes for callbacks
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_callbacks_customer ON callbacks(customer_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_callbacks_status ON callbacks(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_callbacks_scheduled_date ON callbacks(scheduled_date)")
        print("   ✓ Created indexes for callbacks table")

        # 4. Create repairs table
        print("\n4. Creating repairs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS repairs (
                id TEXT PRIMARY KEY,
                customer_id TEXT,
                created_by_admin_id TEXT NOT NULL,
                customer_name TEXT,
                contact_number TEXT,
                scheduled_date DATETIME NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                description TEXT,
                notes TEXT,
                technicians TEXT,
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
            )
        """)
        print("   ✓ Created repairs table")

        # Create indexes for repairs
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_repairs_customer ON repairs(customer_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_repairs_scheduled_date ON repairs(scheduled_date)")
        print("   ✓ Created indexes for repairs table")

        conn.commit()
        print("\n✅ Database migration completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()

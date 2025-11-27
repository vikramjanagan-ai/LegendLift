"""
Migration script for callback enhancements
Adds new fields to callbacks table and creates minor_points table
"""
import sqlite3
from datetime import datetime

def migrate_database():
    conn = sqlite3.connect('legendlift.db')
    cursor = conn.cursor()

    print("Starting database migration...")

    try:
        # Add new columns to callbacks table
        print("Adding new columns to callbacks table...")

        # Enhanced closure fields
        cursor.execute("ALTER TABLE callbacks ADD COLUMN issue_faced TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN customer_reporting_person TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN problem_solved TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN report_attachment_url TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN materials_changed TEXT")  # JSON stored as TEXT
        cursor.execute("ALTER TABLE callbacks ADD COLUMN lift_status_on_closure TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN requires_followup TEXT DEFAULT 'false'")

        # On-site tracking fields
        cursor.execute("ALTER TABLE callbacks ADD COLUMN picked_at TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN on_the_way_at TEXT")
        cursor.execute("ALTER TABLE callbacks ADD COLUMN at_site_at TEXT")

        print("✓ New columns added to callbacks table")

        # Create minor_points table
        print("Creating minor_points table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS minor_points (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                technician_id TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN',
                reported_date TEXT NOT NULL,
                closed_date TEXT,
                closure_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers (id),
                FOREIGN KEY (technician_id) REFERENCES users (id)
            )
        """)

        # Create indices for minor_points
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_customer_id ON minor_points(customer_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_technician_id ON minor_points(technician_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_status ON minor_points(status)")

        print("✓ minor_points table created with indices")

        conn.commit()
        print("\n✅ Migration completed successfully!")

    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"⚠️  Column already exists: {e}")
            print("Skipping this column and continuing...")
            conn.commit()
        else:
            print(f"❌ Migration failed: {e}")
            conn.rollback()
            raise
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()

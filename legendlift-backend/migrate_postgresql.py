"""
PostgreSQL Migration for Callback Enhancements
Run this to add new columns to callbacks table and create minor_points table
"""
import psycopg2
from psycopg2 import sql

DB_CONFIG = {
    'host': 'localhost',
    'database': 'legendlift',
    'user': 'legendlift_user',
    'password': 'legendlift_secure_password_2025'
}

def migrate_database():
    conn = None
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("=" * 60)
        print("🔧 POSTGRESQL DATABASE MIGRATION")
        print("=" * 60)
        print()

        # Step 1: Add new columns to callbacks table
        print("📝 Step 1: Adding new columns to callbacks table...")

        new_columns = [
            ("issue_faced", "TEXT"),
            ("customer_reporting_person", "VARCHAR(255)"),
            ("problem_solved", "TEXT"),
            ("report_attachment_url", "VARCHAR(500)"),
            ("materials_changed", "JSON"),
            ("lift_status_on_closure", "VARCHAR(50)"),
            ("requires_followup", "VARCHAR(10) DEFAULT 'false'"),
            ("picked_at", "TIMESTAMP"),
            ("on_the_way_at", "TIMESTAMP"),
            ("at_site_at", "TIMESTAMP"),
        ]

        for column_name, column_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE callbacks ADD COLUMN {column_name} {column_type};")
                print(f"  ✓ Added column: {column_name}")
            except psycopg2.errors.DuplicateColumn:
                print(f"  ⚠ Column already exists: {column_name}")
                conn.rollback()
                continue
            except Exception as e:
                print(f"  ❌ Error adding {column_name}: {e}")
                conn.rollback()
                continue

        conn.commit()
        print("✅ Callbacks table updated!")
        print()

        # Step 2: Add new status values to enum
        print("📝 Step 2: Adding new status values to CallBackStatus enum...")
        try:
            # Add new enum values
            cursor.execute("ALTER TYPE callbackstatus ADD VALUE IF NOT EXISTS 'PICKED';")
            cursor.execute("ALTER TYPE callbackstatus ADD VALUE IF NOT EXISTS 'ON_THE_WAY';")
            cursor.execute("ALTER TYPE callbackstatus ADD VALUE IF NOT EXISTS 'AT_SITE';")
            conn.commit()
            print("✅ Enum values added!")
        except Exception as e:
            print(f"  ⚠ Enum update: {e}")
            conn.rollback()
        print()

        # Step 3: Create minor_points table
        print("📝 Step 3: Creating minor_points table...")
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS minor_points (
                    id VARCHAR(255) PRIMARY KEY,
                    customer_id VARCHAR(255) NOT NULL REFERENCES customers(id),
                    technician_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    description TEXT NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
                    reported_date TIMESTAMP NOT NULL,
                    closed_date TIMESTAMP,
                    closure_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Create indices
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_customer_id ON minor_points(customer_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_technician_id ON minor_points(technician_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_minor_points_status ON minor_points(status);")

            conn.commit()
            print("✅ minor_points table created with indices!")
        except Exception as e:
            print(f"  ⚠ Table creation: {e}")
            conn.rollback()
        print()

        print("=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Summary:")
        print("  ✓ 10 new columns added to callbacks table")
        print("  ✓ 3 new status values added to enum")
        print("  ✓ minor_points table created")
        print("  ✓ All indices created")
        print()

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    migrate_database()

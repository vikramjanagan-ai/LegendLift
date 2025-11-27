"""
Fix service_type enum values in database
"""

import sqlite3

# Database path
DB_PATH = "legendlift.db"

def fix_service_types():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Fixing service_type enum values...")

    try:
        # Update all old service_type values to 'SERVICE'
        cursor.execute("""
            UPDATE service_schedules
            SET service_type = 'SERVICE'
            WHERE service_type IN ('scheduled', 'adhoc', 'emergency')
            OR service_type IS NULL
        """)

        rows_updated = cursor.rowcount
        print(f"   ✓ Updated {rows_updated} service records to SERVICE type")

        conn.commit()
        print("\n✅ Service types fixed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Fix failed: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    fix_service_types()

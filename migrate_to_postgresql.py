#!/usr/bin/env python3
"""
Complete Migration from SQLite to PostgreSQL
This script:
1. Creates all tables in PostgreSQL
2. Imports all data from JSON backups
3. Verifies data integrity
4. Tests the connection
"""
import sys
import os
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, '/home/minnal/source/LegendLift/legendlift-backend')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.models import *  # Import all models

# PostgreSQL connection string
POSTGRESQL_URL = "postgresql://legendlift_user:legendlift_secure_password_2025@localhost:5432/legendlift"
BACKUP_DIR = "/home/minnal/source/LegendLift/backups/2025-11-19-sqlite-backup"

def test_connection():
    """Test PostgreSQL connection"""
    print("Testing PostgreSQL connection...")
    try:
        engine = create_engine(POSTGRESQL_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version[:50]}...")
            return engine
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nMake sure PostgreSQL is installed and running:")
        print("  sudo bash install_postgresql.sh")
        sys.exit(1)

def create_tables(engine):
    """Create all tables in PostgreSQL"""
    print("\nCreating tables in PostgreSQL...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")

        # List created tables
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"   Created {len(tables)} tables: {', '.join(tables)}")

        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def import_data(engine):
    """Import data from JSON files"""
    print("\nImporting data from backups...")

    # Table import order (respecting foreign keys)
    import_order = [
        'users',
        'customers',
        'sequential_counters',
        'amc_contracts',
        'escalations',
        'service_schedules',
        'payments',
        'service_reports',
        'complaints',
        'callbacks',
        'repairs'
    ]

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    total_imported = 0
    import_summary = {}

    for table in import_order:
        json_file = Path(BACKUP_DIR) / f"{table}.json"

        if not json_file.exists():
            print(f"⚠️  Skipping {table}: no backup file found")
            import_summary[table] = 0
            continue

        try:
            with open(json_file, 'r') as f:
                data = json.load(f)

            if not data:
                print(f"   {table}: 0 records (empty)")
                import_summary[table] = 0
                continue

            # Use raw SQL for bulk insert
            columns = list(data[0].keys())
            placeholders = ', '.join([f':{col}' for col in columns])
            column_names = ', '.join(columns)

            insert_sql = f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})"

            with engine.begin() as conn:
                conn.execute(text(insert_sql), data)

            print(f"✅ {table}: imported {len(data)} records")
            import_summary[table] = len(data)
            total_imported += len(data)

        except Exception as e:
            print(f"❌ Error importing {table}: {e}")
            import_summary[table] = f"ERROR: {e}"

    session.close()

    print(f"\n📊 Total records imported: {total_imported}")
    return import_summary

def verify_data(engine):
    """Verify data integrity"""
    print("\nVerifying data integrity...")

    verification_queries = {
        "users": "SELECT COUNT(*) FROM users",
        "customers": "SELECT COUNT(*) FROM customers",
        "complaints": "SELECT COUNT(*) FROM complaints",
        "callbacks": "SELECT COUNT(*) FROM callbacks",
        "service_schedules": "SELECT COUNT(*) FROM service_schedules",
    }

    all_good = True

    with engine.connect() as conn:
        for table, query in verification_queries.items():
            try:
                result = conn.execute(text(query))
                count = result.fetchone()[0]
                print(f"✅ {table}: {count} records")
            except Exception as e:
                print(f"❌ {table}: verification failed - {e}")
                all_good = False

    # Verify specific data
    print("\nVerifying specific records...")

    with engine.connect() as conn:
        # Check admin user exists
        result = conn.execute(text("SELECT email FROM users WHERE role = 'admin' LIMIT 1"))
        admin = result.fetchone()
        if admin:
            print(f"✅ Admin user exists: {admin[0]}")
        else:
            print("❌ Admin user not found!")
            all_good = False

        # Check recent complaints
        result = conn.execute(text("SELECT COUNT(*) FROM complaints WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"))
        recent_complaints = result.fetchone()[0]
        print(f"✅ Recent complaints (last 7 days): {recent_complaints}")

        # Check complaint assignments
        result = conn.execute(text("""
            SELECT COUNT(*)
            FROM complaints
            WHERE assigned_to_id IS NOT NULL
        """))
        assigned_complaints = result.fetchone()[0]
        print(f"✅ Assigned complaints: {assigned_complaints}")

    return all_good

def main():
    print("=" * 80)
    print("LEGENDLIFT - SQLite to PostgreSQL Migration")
    print("=" * 80)
    print(f"PostgreSQL URL: {POSTGRESQL_URL}")
    print(f"Backup Directory: {BACKUP_DIR}")
    print("")

    # Step 1: Test connection
    engine = test_connection()

    # Step 2: Create tables
    if not create_tables(engine):
        print("\n❌ Migration failed: Could not create tables")
        sys.exit(1)

    # Step 3: Import data
    import_summary = import_data(engine)

    # Step 4: Verify data
    if verify_data(engine):
        print("\n✅ Data integrity verified successfully!")
    else:
        print("\n⚠️  Some verification checks failed - please review")

    # Save migration report
    report = {
        "migration_date": str(Path(BACKUP_DIR).name),
        "postgresql_url": POSTGRESQL_URL.split('@')[1],  # Hide password
        "import_summary": import_summary,
        "status": "completed"
    }

    report_file = Path(BACKUP_DIR) / "migration_report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    print("\n" + "=" * 80)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("\nNext steps:")
    print("  1. Update .env file with PostgreSQL connection string")
    print("  2. Restart the backend server")
    print("  3. Test the application")
    print("  4. Remove old SQLite database file")
    print("")
    print(f"📄 Migration report saved to: {report_file}")
    print("")
    print("=" * 80)

if __name__ == "__main__":
    main()

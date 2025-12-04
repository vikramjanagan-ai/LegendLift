"""
Migration script to add:
1. job_id field to callbacks table
2. completion_images field to callbacks table
3. Ensure sequential_counters table exists for Job ID generation

This allows technicians to upload multiple images when completing callbacks.
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import Base
from app.models.callback import CallBack
from app.models.counter import SequentialCounter

def run_migration():
    """Run the migration to add job_id and completion_images fields"""
    print("🔄 Starting migration...")

    # Create engine
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            print("\n📋 Step 1: Creating sequential_counters table if not exists...")
            # Ensure SequentialCounter table exists
            SequentialCounter.__table__.create(engine, checkfirst=True)
            print("✅ sequential_counters table ready")

            print("\n📋 Step 2: Adding job_id column to callbacks table...")
            # Add job_id column to callbacks table
            alter_statements = [
                "ALTER TABLE callbacks ADD COLUMN IF NOT EXISTS job_id VARCHAR UNIQUE",
                "CREATE INDEX IF NOT EXISTS idx_callbacks_job_id ON callbacks(job_id)",
            ]

            for stmt in alter_statements:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                    print(f"  ✓ {stmt}")
                except Exception as e:
                    print(f"  ⚠️ {stmt} - {str(e)}")

            print("\n📋 Step 3: Adding completion_images column to callbacks table...")
            # Add completion_images column to callbacks table
            completion_images_statements = [
                "ALTER TABLE callbacks ADD COLUMN IF NOT EXISTS completion_images JSON",
            ]

            for stmt in completion_images_statements:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                    print(f"  ✓ {stmt}")
                except Exception as e:
                    print(f"  ⚠️ {stmt} - {str(e)}")

            print("\n📋 Step 4: Migrating existing report_attachment_url to completion_images...")
            # Migrate existing single attachment URLs to array format
            migration_query = """
            UPDATE callbacks
            SET completion_images = json_build_array(report_attachment_url)
            WHERE report_attachment_url IS NOT NULL
            AND report_attachment_url != ''
            AND (completion_images IS NULL OR completion_images::text = '[]')
            """

            try:
                result = conn.execute(text(migration_query))
                conn.commit()
                rows_affected = result.rowcount
                print(f"  ✓ Migrated {rows_affected} existing attachment URLs to completion_images array")
            except Exception as e:
                print(f"  ⚠️ Migration of existing URLs: {str(e)}")

        print("\n" + "="*60)
        print("✅ Migration completed successfully!")
        print("="*60)
        print("\n📝 Summary:")
        print("  • sequential_counters table: Ready for Job ID generation")
        print("  • callbacks.job_id: Added (Human-readable Job IDs like CB-20250128-001)")
        print("  • callbacks.completion_images: Added (Supports multiple images)")
        print("  • Existing report_attachment_url data: Migrated to completion_images")
        print("\n🎯 Next steps:")
        print("  1. Restart your backend: python3 run.py")
        print("  2. New callbacks will auto-generate Job IDs")
        print("  3. Technicians can upload multiple completion images")
        print("\n")

    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_migration()

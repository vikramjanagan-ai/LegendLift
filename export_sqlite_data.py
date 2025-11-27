#!/usr/bin/env python3
"""
Export all data from SQLite database to JSON files for migration to PostgreSQL
"""
import sqlite3
import json
from datetime import datetime

DB_PATH = '/home/minnal/source/LegendLift/legendlift-backend/legendlift.db'
BACKUP_DIR = '/home/minnal/source/LegendLift/backups/2025-11-19-sqlite-backup'

def dict_factory(cursor, row):
    """Convert row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def export_table(conn, table_name):
    """Export a table to JSON"""
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    # Save to JSON file
    output_file = f"{BACKUP_DIR}/{table_name}.json"
    with open(output_file, 'w') as f:
        json.dump(rows, f, indent=2, default=str)

    print(f"✅ Exported {table_name}: {len(rows)} records")
    return len(rows)

def get_all_tables(conn):
    """Get list of all tables"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    return [row[0] for row in cursor.fetchall()]

def main():
    print("=" * 80)
    print("EXPORTING SQLITE DATABASE TO JSON")
    print("=" * 80)
    print(f"Database: {DB_PATH}")
    print(f"Backup Dir: {BACKUP_DIR}")
    print("")

    # Connect to SQLite
    conn = sqlite3.connect(DB_PATH)

    # Get all tables
    tables = get_all_tables(conn)
    print(f"Found {len(tables)} tables: {', '.join(tables)}")
    print("")

    # Export each table
    total_records = 0
    export_summary = {}

    for table in tables:
        try:
            count = export_table(conn, table)
            export_summary[table] = count
            total_records += count
        except Exception as e:
            print(f"❌ Error exporting {table}: {e}")
            export_summary[table] = f"ERROR: {e}"

    # Save export summary
    summary = {
        "export_date": datetime.now().isoformat(),
        "database": DB_PATH,
        "total_tables": len(tables),
        "total_records": total_records,
        "tables": export_summary
    }

    with open(f"{BACKUP_DIR}/export_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)

    print("")
    print("=" * 80)
    print("EXPORT SUMMARY")
    print("=" * 80)
    print(f"Total Tables: {len(tables)}")
    print(f"Total Records: {total_records}")
    print("")
    print("Records by Table:")
    for table, count in export_summary.items():
        print(f"  {table}: {count}")
    print("")
    print("✅ Export completed successfully!")
    print(f"📁 Backup location: {BACKUP_DIR}")

    conn.close()

if __name__ == "__main__":
    main()

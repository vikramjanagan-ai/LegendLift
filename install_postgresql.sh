#!/bin/bash
#
# PostgreSQL Installation Script for LegendLift
# This script must be run with sudo privileges
#
# Usage: sudo bash install_postgresql.sh
#

echo "================================================================================"
echo "LEGENDLIFT - PostgreSQL Installation"
echo "================================================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run as root (use sudo)"
  echo "Usage: sudo bash install_postgresql.sh"
  exit 1
fi

echo "Step 1: Updating package list..."
apt update

echo ""
echo "Step 2: Installing PostgreSQL and dependencies..."
apt install -y postgresql postgresql-contrib libpq-dev

echo ""
echo "Step 3: Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql

echo ""
echo "Step 4: Checking PostgreSQL status..."
systemctl status postgresql --no-pager

echo ""
echo "Step 5: Creating database and user..."

# Switch to postgres user and create database
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE legendlift;

-- Create user
CREATE USER legendlift_user WITH ENCRYPTED PASSWORD 'legendlift_secure_password_2025';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE legendlift TO legendlift_user;

-- Connect to database and grant schema privileges
\c legendlift
GRANT ALL ON SCHEMA public TO legendlift_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO legendlift_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO legendlift_user;

-- Show databases
\l
EOF

echo ""
echo "================================================================================"
echo "✅ PostgreSQL Installation Complete!"
echo "================================================================================"
echo ""
echo "Database Details:"
echo "  Database Name: legendlift"
echo "  Username: legendlift_user"
echo "  Password: legendlift_secure_password_2025"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""
echo "Connection String:"
echo "  postgresql://legendlift_user:legendlift_secure_password_2025@localhost:5432/legendlift"
echo ""
echo "Next Steps:"
echo "  1. Update .env file with PostgreSQL connection string"
echo "  2. Run migration script to create tables and import data"
echo "  3. Test the application"
echo ""
echo "================================================================================"

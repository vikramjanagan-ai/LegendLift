"""
Script to create 20 test services without assigned technicians
- For active customers only
- Mix of missed dates (high priority) and future dates
- No technician assignment so admin can assign them manually
"""

import requests
from datetime import datetime, timedelta
import random

# API Configuration
BASE_URL = "http://localhost:9000/api/v1"
ADMIN_EMAIL = "admin@legendlift.com"
ADMIN_PASSWORD = "admin123"

def login():
    """Login and get admin token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "role": "admin"
        }
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Logged in as {ADMIN_EMAIL}")
        return data["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def get_active_customers(token):
    """Get list of active customers with AMC contracts"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/customers/active-amc/", headers=headers)

    if response.status_code == 200:
        customers = response.json()
        print(f"✅ Found {len(customers)} active customers with AMC")
        return customers
    else:
        print(f"❌ Failed to fetch customers: {response.status_code}")
        return []

def create_service(token, customer, scheduled_date, service_type, priority="MEDIUM"):
    """Create a service schedule without technician assignment"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Format date for API (ISO format)
    formatted_date = scheduled_date.strftime("%Y-%m-%dT10:00:00")

    payload = {
        "customer_id": customer["id"],
        "contract_id": customer.get("active_contract_id"),  # Link to active contract if available
        "scheduled_date": formatted_date,
        "service_type": service_type,
        "status": "pending",
        "priority": priority.lower(),
        "notes": f"Test service created for {customer['name']} - {service_type}",
        # NO technician_id - admin will assign manually
    }

    response = requests.post(
        f"{BASE_URL}/services/schedules",
        headers=headers,
        json=payload
    )

    if response.status_code == 201:
        service = response.json()
        status_icon = "🔴" if priority == "HIGH" else "🟡" if priority == "MEDIUM" else "🟢"
        date_str = scheduled_date.strftime("%Y-%m-%d")
        print(f"  {status_icon} Created: {service.get('service_id')} | {customer['name'][:20]:20} | {date_str} | {service_type:15} | {priority}")
        return service
    else:
        print(f"  ❌ Failed to create service for {customer['name']}: {response.status_code}")
        print(f"     {response.text}")
        return None

def main():
    print("=" * 80)
    print("CREATING 20 TEST SERVICES FOR TECHNICIAN ASSIGNMENT")
    print("=" * 80)

    # Login
    token = login()
    if not token:
        return

    # Get active customers
    customers = get_active_customers(token)
    if len(customers) < 5:
        print("❌ Need at least 5 active customers. Please create more customers first.")
        return

    print(f"\nCreating services from {len(customers)} active customers...")
    print("-" * 80)

    # Service types to use
    service_types = ["installation", "maintenance", "repair", "inspection", "emergency"]

    # Current date
    today = datetime.now()

    # Create 20 services
    created_count = 0
    services_config = [
        # MISSED DATES (HIGH PRIORITY) - 8 services
        {"days_offset": -7, "priority": "HIGH", "type": "maintenance"},
        {"days_offset": -6, "priority": "HIGH", "type": "inspection"},
        {"days_offset": -5, "priority": "HIGH", "type": "repair"},
        {"days_offset": -4, "priority": "HIGH", "type": "maintenance"},
        {"days_offset": -3, "priority": "HIGH", "type": "emergency"},
        {"days_offset": -2, "priority": "HIGH", "type": "repair"},
        {"days_offset": -1, "priority": "HIGH", "type": "maintenance"},
        {"days_offset": -8, "priority": "HIGH", "type": "inspection"},

        # TODAY (MEDIUM PRIORITY) - 4 services
        {"days_offset": 0, "priority": "MEDIUM", "type": "maintenance"},
        {"days_offset": 0, "priority": "MEDIUM", "type": "inspection"},
        {"days_offset": 0, "priority": "MEDIUM", "type": "installation"},
        {"days_offset": 0, "priority": "HIGH", "type": "emergency"},

        # FUTURE DATES (MEDIUM/LOW PRIORITY) - 8 services
        {"days_offset": 1, "priority": "MEDIUM", "type": "maintenance"},
        {"days_offset": 2, "priority": "MEDIUM", "type": "inspection"},
        {"days_offset": 3, "priority": "LOW", "type": "maintenance"},
        {"days_offset": 5, "priority": "MEDIUM", "type": "installation"},
        {"days_offset": 7, "priority": "LOW", "type": "maintenance"},
        {"days_offset": 10, "priority": "MEDIUM", "type": "inspection"},
        {"days_offset": 14, "priority": "LOW", "type": "maintenance"},
        {"days_offset": 21, "priority": "LOW", "type": "inspection"},
    ]

    # Create services
    for i, config in enumerate(services_config):
        # Rotate through customers
        customer = customers[i % len(customers)]

        # Calculate scheduled date
        scheduled_date = today + timedelta(days=config["days_offset"])

        # Create service
        service = create_service(
            token,
            customer,
            scheduled_date,
            config["type"],
            config["priority"]
        )

        if service:
            created_count += 1

    print("-" * 80)
    print(f"\n✅ Successfully created {created_count}/20 test services")
    print(f"\nBreakdown:")
    print(f"  🔴 HIGH Priority (Missed): 8 services")
    print(f"  🟡 MEDIUM Priority (Today): 3 services")
    print(f"  🟡 MEDIUM Priority (Future): 4 services")
    print(f"  🟢 LOW Priority (Future): 4 services")
    print(f"  🔴 HIGH Priority (Today Emergency): 1 service")
    print(f"\n📋 All services are PENDING and have NO technician assigned")
    print(f"👉 You can now login to admin portal and assign technicians")
    print("=" * 80)

if __name__ == "__main__":
    main()

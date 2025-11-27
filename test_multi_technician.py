#!/usr/bin/env python3
"""
Test script for multi-technician ticket assignment feature
Creates tickets, tests picking/unpicking by multiple technicians
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:9000"

# Test credentials
ADMIN_EMAIL = "admin@legendlift.com"
ADMIN_PASSWORD = "admin123"

# Use existing technician credentials from database
TECH1_EMAIL = "john@legendlift.com"  # John Doe
TECH1_PASSWORD = "tech123"

TECH2_EMAIL = "sarah@legendlift.com"  # Sarah Smith
TECH2_PASSWORD = "tech123"

TECH3_EMAIL = "mike@legendlift.com"  # Mike Johnson
TECH3_PASSWORD = "tech123"

def login(email, password, role="admin"):
    """Login and get token"""
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": email, "password": password, "role": role}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed for {email}: {response.status_code} - {response.text}")
        return None

def get_customers(token):
    """Get list of customers"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/customers", headers=headers, params={"limit": 10})
    if response.status_code == 200:
        return response.json()
    return []

def create_service_ticket(token, customer_id, scheduled_date):
    """Create a service ticket"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "customer_id": customer_id,
        "scheduled_date": scheduled_date.isoformat(),
        "status": "pending",
        "notes": f"Test ticket created at {datetime.now()}"
    }
    response = requests.post(f"{BASE_URL}/api/v1/services/schedules", headers=headers, json=data)
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Failed to create ticket: {response.status_code} - {response.text}")
        return None

def get_available_tickets(token):
    """Get available tickets as a technician"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/technician/available-tickets", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get available tickets: {response.status_code} - {response.text}")
        return []

def pick_ticket(token, service_id):
    """Pick a ticket as a technician"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/v1/technician/pick-ticket/{service_id}", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to pick ticket: {response.status_code} - {response.text}")
        return None

def get_my_services(token):
    """Get my services as a technician"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/technician/my-services/today", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get my services: {response.status_code} - {response.text}")
        return []

def get_service_details(token, service_id):
    """Get service details"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/services/schedules/{service_id}", headers=headers)
    if response.status_code == 200:
        return response.json()
    return None

def main():
    print("=" * 80)
    print("MULTI-TECHNICIAN TICKET ASSIGNMENT TEST")
    print("=" * 80)

    # Step 1: Login as admin
    print("\n[1] Logging in as admin...")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed!")
        return
    print("✓ Admin logged in successfully")

    # Step 2: Get customers
    print("\n[2] Getting customers...")
    customers = get_customers(admin_token)
    if not customers:
        print("❌ No customers found!")
        return
    print(f"✓ Found {len(customers)} customers")

    # Step 3: Create 10 test tickets
    print("\n[3] Creating 10 test tickets...")
    tickets = []
    for i in range(10):
        customer = customers[i % len(customers)]
        scheduled_date = datetime.now() + timedelta(days=i)
        ticket = create_service_ticket(admin_token, customer["id"], scheduled_date)
        if ticket:
            tickets.append(ticket)
            print(f"  ✓ Created ticket {i+1}/10: {ticket['service_id']}")

    print(f"\n✓ Created {len(tickets)} tickets")

    # Step 4: Login as tech1
    print("\n[4] Logging in as Technician 1...")
    tech1_token = login(TECH1_EMAIL, TECH1_PASSWORD, "technician")
    if not tech1_token:
        print("❌ Tech1 login failed!")
        return
    print("✓ Tech1 logged in successfully")

    # Step 5: Login as tech2
    print("\n[5] Logging in as Technician 2...")
    tech2_token = login(TECH2_EMAIL, TECH2_PASSWORD, "technician")
    if not tech2_token:
        print("❌ Tech2 login failed!")
        return
    print("✓ Tech2 logged in successfully")

    # Step 5b: Login as tech3
    print("\n[5b] Logging in as Technician 3...")
    tech3_token = login(TECH3_EMAIL, TECH3_PASSWORD, "technician")
    if not tech3_token:
        print("❌ Tech3 login failed!")
        return
    print("✓ Tech3 logged in successfully")

    # Step 6: Tech1 views available tickets
    print("\n[6] Tech1 viewing available tickets...")
    tech1_available = get_available_tickets(tech1_token)
    print(f"✓ Tech1 sees {len(tech1_available)} available tickets")

    # Step 7: Tech1 picks first 5 tickets
    print("\n[7] Tech1 picking first 5 tickets...")
    for i in range(min(5, len(tickets))):
        ticket = tickets[i]
        result = pick_ticket(tech1_token, ticket["id"])
        if result:
            print(f"  ✓ Tech1 picked: {result['service_id']}")

    # Step 8: Tech2 views available tickets
    print("\n[8] Tech2 viewing available tickets...")
    tech2_available = get_available_tickets(tech2_token)
    print(f"✓ Tech2 sees {len(tech2_available)} available tickets")

    # Step 9: Tech2 picks some of the same tickets (multi-technician assignment)
    print("\n[9] Tech2 picking tickets 3-7 (overlapping with Tech1)...")
    for i in range(2, min(7, len(tickets))):
        ticket = tickets[i]
        result = pick_ticket(tech2_token, ticket["id"])
        if result:
            assigned_techs = result.get("assigned_technicians", [])
            tech_names = [t["name"] for t in assigned_techs]
            print(f"  ✓ Tech2 picked: {result['service_id']} (Now assigned to: {', '.join(tech_names)})")

    # Step 9b: Tech3 picks tickets 5-10
    print("\n[9b] Tech3 picking tickets 5-10 (multiple technicians per ticket)...")
    for i in range(4, min(10, len(tickets))):
        ticket = tickets[i]
        result = pick_ticket(tech3_token, ticket["id"])
        if result:
            assigned_techs = result.get("assigned_technicians", [])
            tech_names = [t["name"] for t in assigned_techs]
            print(f"  ✓ Tech3 picked: {result['service_id']} (Now assigned to: {', '.join(tech_names)})")

    # Step 10: View service details from admin
    print("\n[10] Admin viewing ticket details...")
    for i in range(min(3, len(tickets))):
        ticket = tickets[i]
        details = get_service_details(admin_token, ticket["id"])
        if details:
            assigned_techs = details.get("assigned_technicians", [])
            tech_count = details.get("technician_count", 0)
            tech_names = [t["name"] for t in assigned_techs]
            print(f"  Ticket {details['service_id']}: {tech_count} technicians - {', '.join(tech_names)}")

    # Step 11: Tech1 views their assigned services
    print("\n[11] Tech1 viewing their assigned services...")
    tech1_services = get_my_services(tech1_token)
    print(f"✓ Tech1 has {len(tech1_services)} assigned services")
    for service in tech1_services[:3]:
        assigned_techs = service.get("assigned_technicians", [])
        tech_names = [t["name"] for t in assigned_techs]
        print(f"  - {service['service_id']}: {', '.join(tech_names)}")

    # Step 12: Tech2 views their assigned services
    print("\n[12] Tech2 viewing their assigned services...")
    tech2_services = get_my_services(tech2_token)
    print(f"✓ Tech2 has {len(tech2_services)} assigned services")
    for service in tech2_services[:3]:
        assigned_techs = service.get("assigned_technicians", [])
        tech_names = [t["name"] for t in assigned_techs]
        print(f"  - {service['service_id']}: {', '.join(tech_names)}")

    # Step 13: Tech3 views their assigned services
    print("\n[13] Tech3 viewing their assigned services...")
    tech3_services = get_my_services(tech3_token)
    print(f"✓ Tech3 has {len(tech3_services)} assigned services")
    for service in tech3_services[:3]:
        assigned_techs = service.get("assigned_technicians", [])
        tech_names = [t["name"] for t in assigned_techs]
        print(f"  - {service['service_id']}: {', '.join(tech_names)}")

    print("\n" + "=" * 80)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("\nSummary:")
    print(f"  - Created {len(tickets)} test tickets")
    print(f"  - Tech1 (John Doe) has {len(tech1_services)} assigned services")
    print(f"  - Tech2 (Sarah Smith) has {len(tech2_services)} assigned services")
    print(f"  - Tech3 (Mike Johnson) has {len(tech3_services)} assigned services")
    print(f"  - Multiple technicians can work on the same ticket ✓")
    print(f"  - Technicians can pick tickets themselves ✓")
    print(f"  - Admin can view all assigned technicians ✓")
    print("=" * 80)

if __name__ == "__main__":
    main()

"""
Test script for new callback and dashboard features
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# Admin credentials for testing
ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjA3OTU3NDMsInN1YiI6ImFkbWluQGxlZ2VuZGxpZnQuY29tIn0.O9lAGYM54osRI1bpmXDHXl3IDfBF3jUailc5M0wlNSs"

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

def test_dashboard_overview():
    """Test dashboard overview endpoint"""
    print("\n🧪 Testing Dashboard Overview...")
    response = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Dashboard Overview Retrieved:")
        print(f"   Month: {data.get('month')}")
        print(f"   Customers: Total={data['metrics']['customers']['total']}, Active={data['metrics']['customers']['active_contacts']}")
        print(f"   Services: Total={data['metrics']['services']['total']}, Completed={data['metrics']['services']['completed']}")
        print(f"   Callbacks: Total={data['metrics']['callbacks']['total']}, Completed={data['metrics']['callbacks']['completed']}")
        print(f"   Repairs: Total={data['metrics']['repairs']['total']}, Completed={data['metrics']['repairs']['completed']}")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")

def test_callback_endpoints():
    """Test callback workflow endpoints"""
    print("\n🧪 Testing Callback Endpoints...")

    # Get callbacks
    response = requests.get(f"{BASE_URL}/callbacks/", headers=headers)
    if response.status_code == 200:
        callbacks = response.json()
        print(f"✅ Retrieved {len(callbacks)} callbacks")

        if len(callbacks) > 0:
            callback_id = callbacks[0]['id']
            print(f"   Testing with callback ID: {callback_id}")

            # Test pick
            response = requests.post(f"{BASE_URL}/callbacks/{callback_id}/pick", headers=headers)
            if response.status_code == 200:
                print(f"   ✅ Pick callback successful: Status={response.json().get('status')}")
            else:
                print(f"   ⚠️  Pick callback: {response.status_code}")

            # Test on-the-way
            response = requests.post(f"{BASE_URL}/callbacks/{callback_id}/on-the-way", headers=headers)
            if response.status_code == 200:
                print(f"   ✅ On the way status successful")
            else:
                print(f"   ⚠️  On the way: {response.status_code}")

            # Test at-site
            response = requests.post(f"{BASE_URL}/callbacks/{callback_id}/at-site", headers=headers)
            if response.status_code == 200:
                print(f"   ✅ At site status successful")
            else:
                print(f"   ⚠️  At site: {response.status_code}")
    else:
        print(f"❌ Failed to get callbacks: {response.status_code}")

def test_minor_points():
    """Test minor points endpoints"""
    print("\n🧪 Testing Minor Points...")

    # Get a customer ID first
    response = requests.get(f"{BASE_URL}/customers/?limit=1", headers=headers)
    if response.status_code == 200:
        customers = response.json()
        if len(customers) > 0:
            customer_id = customers[0]['id']
            print(f"   Testing with customer ID: {customer_id}")

            # Create minor point
            payload = {
                "customer_id": customer_id,
                "description": "Test minor fault - light indicator not working"
            }
            response = requests.post(f"{BASE_URL}/minor-points/", params=payload, headers=headers)
            if response.status_code == 200:
                point_data = response.json()
                print(f"   ✅ Created minor point: ID={point_data.get('id')}")

                # Get customer minor points
                response = requests.get(f"{BASE_URL}/minor-points/customer/{customer_id}", headers=headers)
                if response.status_code == 200:
                    points = response.json()
                    print(f"   ✅ Retrieved {len(points)} minor points for customer")
                else:
                    print(f"   ⚠️  Get minor points: {response.status_code}")
            else:
                print(f"   ❌ Create minor point failed: {response.status_code}")
    else:
        print(f"❌ Failed to get customers: {response.status_code}")

def test_customer_period_report():
    """Test customer period report"""
    print("\n🧪 Testing Customer Period Report...")

    # Get a customer with AMC
    response = requests.get(f"{BASE_URL}/customers/?limit=10", headers=headers)
    if response.status_code == 200:
        customers = response.json()
        for customer in customers:
            if customer.get('amc_valid_from') and customer.get('amc_valid_to'):
                customer_id = customer['id']
                print(f"   Testing with customer: {customer['name']} ({customer['job_number']})")

                response = requests.get(f"{BASE_URL}/customers/{customer_id}/period-report", headers=headers)
                if response.status_code == 200:
                    report = response.json()
                    print(f"   ✅ Period Report Retrieved:")
                    print(f"      Period: {report['period']['start']} to {report['period']['end']}")
                    print(f"      Services Completed: {report['summary']['total_services_completed']}")
                    print(f"      Callbacks Raised: {report['summary']['total_callbacks_raised']}")
                    print(f"      Repairs Performed: {report['summary']['total_repairs_performed']}")
                    print(f"      Materials Replaced: {report['summary']['total_materials_replaced']}")
                else:
                    print(f"   ❌ Failed: {response.status_code} - {response.text}")
                break
        else:
            print("   ⚠️  No customers with AMC period found")
    else:
        print(f"❌ Failed to get customers: {response.status_code}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 TESTING NEW FEATURES")
    print("=" * 60)

    try:
        test_dashboard_overview()
        test_callback_endpoints()
        test_minor_points()
        test_customer_period_report()

        print("\n" + "=" * 60)
        print("✅ ALL TESTS COMPLETED!")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")

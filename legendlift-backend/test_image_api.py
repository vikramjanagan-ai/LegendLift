#!/usr/bin/env python3
"""
Test script to verify image viewing API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:9000/api/v1"

# Login
print("=== LOGGING IN ===")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "admin@legendlift.com", "password": "admin123", "role": "admin"}
)
token = login_response.json()["access_token"]
print(f"✅ Login successful. Token: {token[:50]}...")

headers = {"Authorization": f"Bearer {token}"}

# Test Callback with images
print("\n=== TESTING CALLBACK WITH IMAGES ===")
callback_id = "fe52d589-23b0-45c0-a704-08239b06c032"
callback_response = requests.get(f"{BASE_URL}/callbacks/{callback_id}", headers=headers)
callback_data = callback_response.json()

print(f"Callback ID: {callback_data.get('id', 'N/A')[:20]}...")
completion_images = callback_data.get('completion_images')
if completion_images:
    if isinstance(completion_images, str):
        completion_images = json.loads(completion_images)
    print(f"✅ Completion Images Found: {len(completion_images)} images")
    for i, img in enumerate(completion_images, 1):
        print(f"   {i}. {img}")
else:
    print("❌ No completion images found")

# Test Service Report with images
print("\n=== TESTING SERVICE WITH IMAGES ===")
service_id = "b9c3a06b-0fa7-43bd-aa6e-628a175815a7"

# First get service details
service_response = requests.get(f"{BASE_URL}/services/schedules/{service_id}", headers=headers)
service_data = service_response.json()
print(f"Service ID: {service_data.get('id', 'N/A')[:20]}...")

# Then get service reports
reports_response = requests.get(f"{BASE_URL}/services/reports?service_id={service_id}", headers=headers)
reports_data = reports_response.json()

if reports_data:
    print(f"✅ Service Reports Found: {len(reports_data)} reports")
    for idx, report in enumerate(reports_data, 1):
        images = report.get('images', [])
        if isinstance(images, str):
            images = json.loads(images)
        print(f"   Report {idx}: {len(images)} images")
        for i, img in enumerate(images, 1):
            print(f"      {i}. {img}")
else:
    print("❌ No service reports found")

print("\n✅ ALL TESTS COMPLETED!")
print("\nNOTE: The mobile app will display these images as thumbnails.")
print("Tapping a thumbnail will open fullscreen view with navigation controls.")

#!/bin/bash

echo "Testing Callbacks API with Fix..."

# Get token
TOKEN=$(curl -s -X POST https://eight-apples-eat.loca.lt/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Bypass-Tunnel-Reminder: true" \
  -d '{"email":"admin@legendlift.com","password":"admin123","role":"admin"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token obtained: ${TOKEN:0:50}..."
echo ""

# Test callbacks endpoint
echo "Testing callbacks endpoint..."
curl -s https://eight-apples-eat.loca.lt/api/v1/callbacks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Bypass-Tunnel-Reminder: true" | python3 -m json.tool | head -100

echo ""
echo "✅ Test complete!"

#!/bin/bash
# Test LegendLift Backend API

echo "================================"
echo "LEGENDLIFT API TESTING"
echo "================================"
echo ""

# 1. Test Health Endpoint
echo "1. Testing Health Endpoint..."
curl -s http://localhost:9000/ | python3 -m json.tool
echo ""

# 2. Test Admin Login
echo "2. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legendlift.com","password":"admin123","role":"admin"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed!"
  echo $ADMIN_RESPONSE
  exit 1
else
  echo "✅ Admin login successful"
  echo "Token: ${ADMIN_TOKEN:0:50}..."
fi
echo ""

# 3. Test Technician Login
echo "3. Testing Technician Login..."
TECH_RESPONSE=$(curl -s -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@legendlift.com","password":"tech123","role":"technician"}')

TECH_TOKEN=$(echo $TECH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$TECH_TOKEN" ]; then
  echo "⚠️  Technician login failed (user might not exist)"
else
  echo "✅ Technician login successful"
fi
echo ""

# 4. Test Customer Stats
echo "4. Testing Customer Stats..."
curl -s http://localhost:9000/api/v1/customers/stats/count \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""

# 5. Test Get Customers
echo "5. Testing Get Customers (limit 3)..."
curl -s "http://localhost:9000/api/v1/customers/?limit=3" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool | head -50
echo ""

# 6. Test Service Stats
echo "6. Testing Service Stats..."
curl -s http://localhost:9000/api/v1/services/stats/count \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""

# 7. Test Services List
echo "7. Testing Services List (limit 3)..."
curl -s "http://localhost:9000/api/v1/services/?limit=3" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool | head -50
echo ""

echo "================================"
echo "API TESTING COMPLETE!"
echo "================================"

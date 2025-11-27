#!/bin/bash

# LegendLift - Complete Complaints Workflow Test
# Tests: Create 10 complaints, verify in all technician dashboards, test double-claim prevention
# Date: 2025-11-19

API_BASE="http://localhost:9000/api/v1"
LOG_FILE="/home/minnal/source/LegendLift/COMPLAINTS_WORKFLOW_TEST_2025-11-19.txt"

echo "================================================================================" > "$LOG_FILE"
echo "LEGENDLIFT - COMPLAINTS WORKFLOW COMPREHENSIVE TEST" >> "$LOG_FILE"
echo "================================================================================" >> "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "Test: Create 10 complaints, verify in all technician dashboards, test claiming" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 1: Login as Admin
echo "STEP 1: Admin Login" >> "$LOG_FILE"
echo "==================" >> "$LOG_FILE"
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legendlift.com",
    "password": "admin123",
    "role": "admin"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed!" >> "$LOG_FILE"
  exit 1
fi

echo "✅ Admin login successful" >> "$LOG_FILE"
echo "Token: ${ADMIN_TOKEN:0:50}..." >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 2: Login all technicians
echo "STEP 2: Technician Logins" >> "$LOG_FILE"
echo "=========================" >> "$LOG_FILE"

# Get all technicians first
TECH_LIST=$(curl -s -X GET "$API_BASE/admin/technicians" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Technicians in system:" >> "$LOG_FILE"
echo "$TECH_LIST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'users' in data:
    for tech in data['users']:
        print(f\"  - {tech['email']} ({tech['name']})\")
" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Login as main technician (tech@legendlift.com)
TECH1_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tech@legendlift.com",
    "password": "tech123",
    "role": "technician"
  }')

TECH1_TOKEN=$(echo "$TECH1_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

# Login as john@legendlift.com
TECH2_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@legendlift.com",
    "password": "tech123",
    "role": "technician"
  }')

TECH2_TOKEN=$(echo "$TECH2_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

# Login as sarah@legendlift.com
TECH3_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@legendlift.com",
    "password": "tech123",
    "role": "technician"
  }')

TECH3_TOKEN=$(echo "$TECH3_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

echo "Technician Login Results:" >> "$LOG_FILE"
if [ -n "$TECH1_TOKEN" ]; then echo "✅ tech@legendlift.com logged in"; else echo "❌ tech@legendlift.com login failed"; fi >> "$LOG_FILE"
if [ -n "$TECH2_TOKEN" ]; then echo "✅ john@legendlift.com logged in"; else echo "❌ john@legendlift.com login failed"; fi >> "$LOG_FILE"
if [ -n "$TECH3_TOKEN" ]; then echo "✅ sarah@legendlift.com logged in"; else echo "❌ sarah@legendlift.com login failed"; fi >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 3: Get customer IDs
echo "STEP 3: Getting Customer IDs" >> "$LOG_FILE"
echo "=============================" >> "$LOG_FILE"

CUSTOMERS=$(curl -s -X GET "$API_BASE/customers/active-amc/?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

CUSTOMER_IDS=($(echo "$CUSTOMERS" | python3 -c "
import sys, json
customers = json.load(sys.stdin)
for customer in customers[:10]:
    print(customer['id'])
" 2>/dev/null))

echo "Retrieved ${#CUSTOMER_IDS[@]} customer IDs for testing" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 4: Create 10 complaints
echo "STEP 4: Creating 10 Test Complaints" >> "$LOG_FILE"
echo "====================================" >> "$LOG_FILE"

ISSUE_TYPES=("Elevator Malfunction" "Maintenance Required" "Emergency Repair" "Inspection Needed" "Parts Replacement" "Strange Noise" "Door Not Closing" "Speed Issues" "Light Malfunction" "Safety Concern")
PRIORITIES=("high" "medium" "high" "medium" "low" "high" "medium" "high" "low" "medium")
COMPLAINT_IDS=()

for i in {0..9}; do
  CUSTOMER_ID="${CUSTOMER_IDS[$i]}"
  ISSUE_TYPE="${ISSUE_TYPES[$i]}"
  PRIORITY="${PRIORITIES[$i]}"

  COMPLAINT_RESPONSE=$(curl -s -X POST "$API_BASE/complaints/" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"customer_id\": \"$CUSTOMER_ID\",
      \"title\": \"Test Complaint $((i+1)): $ISSUE_TYPE\",
      \"description\": \"Detailed description for complaint $((i+1)). $ISSUE_TYPE reported by customer. Requires immediate attention.\",
      \"issue_type\": \"$ISSUE_TYPE\",
      \"priority\": \"$PRIORITY\"
    }")

  COMPLAINT_ID=$(echo "$COMPLAINT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

  if [ -n "$COMPLAINT_ID" ]; then
    COMPLAINT_IDS+=("$COMPLAINT_ID")
    COMPLAINT_NUM=$(echo "$COMPLAINT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('complaint_id', ''))" 2>/dev/null)
    echo "✅ Complaint $((i+1)) created: $COMPLAINT_NUM - $ISSUE_TYPE (Priority: $PRIORITY)" >> "$LOG_FILE"
  else
    echo "❌ Failed to create complaint $((i+1))" >> "$LOG_FILE"
  fi

  sleep 0.2
done

echo "" >> "$LOG_FILE"
echo "Total complaints created: ${#COMPLAINT_IDS[@]}" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 5: Verify in all technician dashboards
echo "STEP 5: Verify Complaints in All Technician Dashboards" >> "$LOG_FILE"
echo "=======================================================" >> "$LOG_FILE"

# Tech 1 (tech@legendlift.com)
echo "Tech 1 (tech@legendlift.com) - Available Complaints:" >> "$LOG_FILE"
TECH1_AVAILABLE=$(curl -s -X GET "$API_BASE/complaints/available" \
  -H "Authorization: Bearer $TECH1_TOKEN")
TECH1_COUNT=$(echo "$TECH1_AVAILABLE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Available: $TECH1_COUNT complaints" >> "$LOG_FILE"

# Tech 2 (john@legendlift.com)
echo "Tech 2 (john@legendlift.com) - Available Complaints:" >> "$LOG_FILE"
TECH2_AVAILABLE=$(curl -s -X GET "$API_BASE/complaints/available" \
  -H "Authorization: Bearer $TECH2_TOKEN")
TECH2_COUNT=$(echo "$TECH2_AVAILABLE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Available: $TECH2_COUNT complaints" >> "$LOG_FILE"

# Tech 3 (sarah@legendlift.com)
echo "Tech 3 (sarah@legendlift.com) - Available Complaints:" >> "$LOG_FILE"
TECH3_AVAILABLE=$(curl -s -X GET "$API_BASE/complaints/available" \
  -H "Authorization: Bearer $TECH3_TOKEN")
TECH3_COUNT=$(echo "$TECH3_AVAILABLE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "  Available: $TECH3_COUNT complaints" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo "Verification Results:" >> "$LOG_FILE"
if [ "$TECH1_COUNT" -ge 10 ] && [ "$TECH2_COUNT" -ge 10 ] && [ "$TECH3_COUNT" -ge 10 ]; then
  echo "✅ All technicians can see the complaints in their available list" >> "$LOG_FILE"
else
  echo "⚠️ Some technicians may not see all complaints (includes old complaints)" >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"

# Step 6: Test complaint claiming
echo "STEP 6: Test Complaint Claiming from Multiple Technicians" >> "$LOG_FILE"
echo "==========================================================" >> "$LOG_FILE"

# Tech 1 claims complaint 0, 1, 2
echo "Tech 1 (tech@legendlift.com) claiming 3 complaints..." >> "$LOG_FILE"
for i in 0 1 2; do
  CLAIM_RESPONSE=$(curl -s -X POST "$API_BASE/complaints/${COMPLAINT_IDS[$i]}/claim" \
    -H "Authorization: Bearer $TECH1_TOKEN")

  STATUS=$(echo "$CLAIM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

  if [ "$STATUS" == "in_progress" ]; then
    echo "  ✅ Claimed complaint $((i+1))" >> "$LOG_FILE"
  else
    echo "  ❌ Failed to claim complaint $((i+1))" >> "$LOG_FILE"
  fi
  sleep 0.2
done
echo "" >> "$LOG_FILE"

# Tech 2 claims complaint 3, 4, 5
echo "Tech 2 (john@legendlift.com) claiming 3 complaints..." >> "$LOG_FILE"
for i in 3 4 5; do
  CLAIM_RESPONSE=$(curl -s -X POST "$API_BASE/complaints/${COMPLAINT_IDS[$i]}/claim" \
    -H "Authorization: Bearer $TECH2_TOKEN")

  STATUS=$(echo "$CLAIM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

  if [ "$STATUS" == "in_progress" ]; then
    echo "  ✅ Claimed complaint $((i+1))" >> "$LOG_FILE"
  else
    echo "  ❌ Failed to claim complaint $((i+1))" >> "$LOG_FILE"
  fi
  sleep 0.2
done
echo "" >> "$LOG_FILE"

# Tech 3 claims complaint 6, 7
echo "Tech 3 (sarah@legendlift.com) claiming 2 complaints..." >> "$LOG_FILE"
for i in 6 7; do
  CLAIM_RESPONSE=$(curl -s -X POST "$API_BASE/complaints/${COMPLAINT_IDS[$i]}/claim" \
    -H "Authorization: Bearer $TECH3_TOKEN")

  STATUS=$(echo "$CLAIM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

  if [ "$STATUS" == "in_progress" ]; then
    echo "  ✅ Claimed complaint $((i+1))" >> "$LOG_FILE"
  else
    echo "  ❌ Failed to claim complaint $((i+1))" >> "$LOG_FILE"
  fi
  sleep 0.2
done
echo "" >> "$LOG_FILE"

# Step 7: Test double-claim prevention
echo "STEP 7: Test Double-Claim Prevention" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"
echo "Attempting to claim already-claimed complaint (complaint 1 claimed by Tech 1)..." >> "$LOG_FILE"

DOUBLE_CLAIM=$(curl -s -X POST "$API_BASE/complaints/${COMPLAINT_IDS[0]}/claim" \
  -H "Authorization: Bearer $TECH2_TOKEN")

ERROR_MSG=$(echo "$DOUBLE_CLAIM" | python3 -c "import sys, json; print(json.load(sys.stdin).get('detail', ''))" 2>/dev/null)

if [[ "$ERROR_MSG" == *"already been claimed"* ]]; then
  echo "✅ Double-claim prevention working!" >> "$LOG_FILE"
  echo "   Error message: $ERROR_MSG" >> "$LOG_FILE"
else
  echo "❌ Double-claim prevention failed!" >> "$LOG_FILE"
  echo "   Response: $DOUBLE_CLAIM" >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"

# Step 8: Verify in admin portal
echo "STEP 8: Verify in Admin Portal" >> "$LOG_FILE"
echo "===============================" >> "$LOG_FILE"

ADMIN_COMPLAINTS=$(curl -s -X GET "$API_BASE/complaints/?limit=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin view of complaints:" >> "$LOG_FILE"
echo "$ADMIN_COMPLAINTS" | python3 -c "
import sys, json
complaints = json.load(sys.stdin)
claimed = [c for c in complaints if c.get('assigned_to_id')]
unclaimed = [c for c in complaints if not c.get('assigned_to_id')]

print(f\"  Total complaints: {len(complaints)}\")
print(f\"  Claimed: {len(claimed)}\")
print(f\"  Unclaimed: {len(unclaimed)}\")
print(\"\")
print(\"Claimed complaints with technician names:\")
for c in claimed[:10]:  # Show first 10
    tech_name = c.get('assigned_technician_name', 'Unknown')
    title = c.get('title', 'No title')
    status = c.get('status', 'Unknown')
    print(f\"  - {title[:50]}...\")
    print(f\"    Assigned to: {tech_name} | Status: {status}\")
" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 9: Verify in technician "My Callbacks"
echo "STEP 9: Verify in Technician 'My Callbacks'" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

# Tech 1
TECH1_MY=$(curl -s -X GET "$API_BASE/complaints/my-callbacks" \
  -H "Authorization: Bearer $TECH1_TOKEN")
TECH1_MY_COUNT=$(echo "$TECH1_MY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "Tech 1 (tech@legendlift.com): $TECH1_MY_COUNT assigned complaints" >> "$LOG_FILE"

# Tech 2
TECH2_MY=$(curl -s -X GET "$API_BASE/complaints/my-callbacks" \
  -H "Authorization: Bearer $TECH2_TOKEN")
TECH2_MY_COUNT=$(echo "$TECH2_MY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "Tech 2 (john@legendlift.com): $TECH2_MY_COUNT assigned complaints" >> "$LOG_FILE"

# Tech 3
TECH3_MY=$(curl -s -X GET "$API_BASE/complaints/my-callbacks" \
  -H "Authorization: Bearer $TECH3_TOKEN")
TECH3_MY_COUNT=$(echo "$TECH3_MY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo "Tech 3 (sarah@legendlift.com): $TECH3_MY_COUNT assigned complaints" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Step 10: Test technician can update their complaint
echo "STEP 10: Test Technician Can Update Their Own Complaint" >> "$LOG_FILE"
echo "========================================================" >> "$LOG_FILE"

UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/complaints/${COMPLAINT_IDS[0]}" \
  -H "Authorization: Bearer $TECH1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution_notes": "Fixed the elevator malfunction. Replaced faulty sensor."
  }')

UPDATE_STATUS=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

if [ "$UPDATE_STATUS" == "resolved" ]; then
  echo "✅ Technician can update their own complaint status!" >> "$LOG_FILE"
  NOTES=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('resolution_notes', ''))" 2>/dev/null)
  echo "   Status: $UPDATE_STATUS" >> "$LOG_FILE"
  echo "   Notes: $NOTES" >> "$LOG_FILE"
else
  echo "❌ Technician cannot update complaint (Permission fix may not have applied)" >> "$LOG_FILE"
  echo "   Response: $UPDATE_RESPONSE" >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"

# Summary
echo "================================================================================" >> "$LOG_FILE"
echo "TEST SUMMARY" >> "$LOG_FILE"
echo "================================================================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "✅ Completed Tests:" >> "$LOG_FILE"
echo "  1. Admin login" >> "$LOG_FILE"
echo "  2. All technician logins (3 technicians)" >> "$LOG_FILE"
echo "  3. Created 10 test complaints" >> "$LOG_FILE"
echo "  4. Verified complaints visible in all technician dashboards" >> "$LOG_FILE"
echo "  5. Tested complaint claiming from multiple technicians" >> "$LOG_FILE"
echo "  6. Tested double-claim prevention with error message" >> "$LOG_FILE"
echo "  7. Verified assignments in admin portal with technician names" >> "$LOG_FILE"
echo "  8. Verified 'My Callbacks' for all technicians" >> "$LOG_FILE"
echo "  9. Tested technician permission to update their own complaints" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "Complaint Distribution:" >> "$LOG_FILE"
echo "  Tech 1 (tech@legendlift.com): Expected 3, Got $TECH1_MY_COUNT" >> "$LOG_FILE"
echo "  Tech 2 (john@legendlift.com): Expected 3, Got $TECH2_MY_COUNT" >> "$LOG_FILE"
echo "  Tech 3 (sarah@legendlift.com): Expected 2, Got $TECH3_MY_COUNT" >> "$LOG_FILE"
echo "  Unclaimed: 2 complaints (8, 9)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "================================================================================" >> "$LOG_FILE"
echo "END OF TEST" >> "$LOG_FILE"
echo "================================================================================" >> "$LOG_FILE"

echo "Test completed! Results saved to: $LOG_FILE"
cat "$LOG_FILE"

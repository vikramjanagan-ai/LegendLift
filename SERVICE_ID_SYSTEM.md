# 🔢 LegendLift - Service ID System Documentation

## Overview

Every service visit in LegendLift gets a **unique, human-readable ID** that helps track and reference services throughout their lifecycle.

---

## 📝 ID Format Specification

### Service ID Format
```
SRV-YYYYMMDD-XXXXX
```

**Example:** `SRV-20241009-A3F8K`

- `SRV` - Service prefix
- `YYYYMMDD` - Date (20241009 = October 9, 2024)
- `XXXXX` - 5-character random alphanumeric code

### Report ID Format
```
RPT-YYYYMMDD-XXXXX
```

**Example:** `RPT-20241009-D2L7Q`

- `RPT` - Report prefix
- `YYYYMMDD` - Date
- `XXXXX` - 5-character random code

### Other IDs

| Type | Format | Example |
|------|--------|---------|
| Job Number | `JB-XXXX` | `JB-1234` |
| Contract ID | `AMC-YYYYMMDD-XXXXX` | `AMC-20241009-C9N4P` |
| Payment ID | `PAY-YYYYMMDD-XXXXX` | `PAY-20241009-B7K2M` |

---

## 🔄 Service Creation Workflows

### Workflow 1: Admin Creates Scheduled Service

```mermaid
Admin → Create Service Schedule → Assign Technician → Service ID Generated
→ Technician Receives Assignment → Goes to Location → Checks In
→ Performs Work → Creates Report → Report ID Generated
```

**API Flow:**
1. Admin: `POST /api/v1/services/schedules` → Creates scheduled service
2. System: Generates `service_id` (e.g., `SRV-20241009-A3F8K`)
3. Technician: `POST /api/v1/technician/check-in` → Starts service
4. System: Creates report with `report_id` (e.g., `RPT-20241009-D2L7Q`)

### Workflow 2: Technician Creates Ad-Hoc Service

```mermaid
Technician → Arrives at Location → Registers Service → Service ID Generated
→ Performs Work → Creates Report → Report ID Generated
```

**API Flow:**
1. Technician: `POST /api/v1/technician/register-service` → Creates ad-hoc service
2. System: Generates `service_id` (e.g., `SRV-20241009-K8M2N`)
3. Technician: Performs work and submits report
4. System: Generates `report_id` (e.g., `RPT-20241009-F5P9T`)

### Workflow 3: Technician Check-In (Smart)

```mermaid
Technician → Arrives at Location → Checks In → System Checks
→ If Scheduled: Use Existing Service ID
→ If Not Scheduled: Create New Service ID
→ Generate Report ID → Start Work
```

**API Flow:**
1. Technician: `POST /api/v1/technician/check-in`
2. System checks:
   - Is there a scheduled service? → Use that service, update status
   - No scheduled service? → Create new ad-hoc service with new ID
3. System: Creates report with `report_id`

---

## 🎯 Service Types

| Type | Description | Created By | Example Use Case |
|------|-------------|------------|------------------|
| **scheduled** | Regular AMC service | Admin | Monthly maintenance |
| **adhoc** | Unscheduled visit | Technician | Extra check requested by customer |
| **emergency** | Urgent repair | Technician | Elevator breakdown |
| **callback** | Follow-up visit | Technician | Verify previous repair |

---

## 💾 Database Schema

### service_schedules Table

```sql
CREATE TABLE service_schedules (
    id VARCHAR(36) PRIMARY KEY,                    -- UUID
    service_id VARCHAR(50) UNIQUE NOT NULL,        -- SRV-20241009-A3F8K
    contract_id VARCHAR(36),                       -- Can be NULL for ad-hoc
    customer_id VARCHAR(36) NOT NULL,
    scheduled_date TIMESTAMP,                      -- Can be NULL for ad-hoc
    actual_date TIMESTAMP,
    status VARCHAR(20),                            -- pending, in_progress, completed
    technician_id VARCHAR(36),
    technician2_id VARCHAR(36),
    is_adhoc BOOLEAN DEFAULT FALSE,
    service_type VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, adhoc, emergency
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### service_reports Table

```sql
CREATE TABLE service_reports (
    id VARCHAR(36) PRIMARY KEY,                    -- UUID
    report_id VARCHAR(50) UNIQUE NOT NULL,         -- RPT-20241009-D2L7Q
    service_id VARCHAR(36) NOT NULL,               -- FK to service_schedules.id
    technician_id VARCHAR(36) NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    check_in_location JSON,
    check_out_location JSON,
    work_done TEXT,
    parts_replaced JSON,
    images JSON,
    customer_signature VARCHAR(255),
    technician_signature VARCHAR(255),
    customer_feedback TEXT,
    rating INTEGER,
    completion_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### For Technicians

#### 1. Register Ad-Hoc Service
```http
POST /api/v1/technician/register-service
Authorization: Bearer {token}

Request:
{
  "customer_id": "uuid",
  "service_type": "adhoc",  // adhoc, emergency, callback
  "notes": "Customer requested extra check",
  "location": {"latitude": 13.0827, "longitude": 80.2707}
}

Response:
{
  "id": "uuid",
  "service_id": "SRV-20241009-A3F8K",
  "customer_id": "uuid",
  "status": "in_progress",
  "service_type": "adhoc",
  "is_adhoc": true
}
```

#### 2. Check-In to Service
```http
POST /api/v1/technician/check-in
Authorization: Bearer {token}

Request:
{
  "customer_id": "uuid",
  "location": {"latitude": 13.0827, "longitude": 80.2707},
  "service_type": "adhoc",
  "notes": "Arrived on site"
}

Response:
{
  "message": "Successfully checked in",
  "service_id": "SRV-20241009-A3F8K",
  "service_db_id": "uuid",
  "report_id": "RPT-20241009-D2L7Q",
  "report_db_id": "uuid",
  "customer_name": "ABC Company",
  "customer_location": "T.Nagar",
  "check_in_time": "2024-10-09T10:30:00"
}
```

#### 3. Get My Today's Services
```http
GET /api/v1/technician/my-services/today
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "service_id": "SRV-20241009-A3F8K",
    "customer_name": "ABC Company",
    "customer_location": "T.Nagar",
    "scheduled_date": "2024-10-09T10:00:00",
    "status": "pending",
    "service_type": "scheduled",
    "is_adhoc": false
  },
  {
    "service_id": "SRV-20241009-K8M2N",
    "customer_name": "XYZ Ltd",
    "customer_location": "Adyar",
    "status": "in_progress",
    "service_type": "adhoc",
    "is_adhoc": true
  }
]
```

#### 4. Get Service History
```http
GET /api/v1/technician/service-history?skip=0&limit=50
Authorization: Bearer {token}

Response:
[
  {
    "service_id": "SRV-20241008-P5L2M",
    "customer_name": "ABC Company",
    "actual_date": "2024-10-08T15:30:00",
    "service_type": "scheduled",
    "report_id": "RPT-20241008-Q9K3N",
    "rating": 5,
    "work_done": "Completed monthly maintenance"
  }
]
```

---

## 📱 Mobile App Flow

### Technician Check-In Screen

```javascript
// User arrives at customer location
// Taps "Check-In" button

1. Get GPS location
2. Call POST /api/v1/technician/check-in
3. Receive service_id and report_id
4. Show confirmation with IDs
5. Navigate to service execution screen
```

### Service Execution Screen

```javascript
// Shows service details with IDs prominently displayed

Service ID: SRV-20241009-A3F8K
Report ID: RPT-20241009-D2L7Q

[Work Done Input]
[Parts Replaced]
[Take Photos]
[Customer Signature]
[Submit Report]
```

---

## 🔍 ID Benefits

### 1. **Easy Reference**
- Customer can quote service ID: "My service ID was SRV-20241009-A3F8K"
- Support can quickly look up service by ID

### 2. **Date Tracking**
- ID contains date: easy to identify when service was created
- Sorting by ID roughly sorts by date

### 3. **Uniqueness**
- Combination of date + random code ensures uniqueness
- 5-character code = 60,466,176 possible combinations per day

### 4. **Human Readable**
- Can be communicated over phone
- Can be written down
- Easy to read from printed receipts

### 5. **Searchable**
- Can search by full ID or partial match
- Date prefix allows date-range searches

---

## 🎨 UI Display Examples

### Service Card
```
┌─────────────────────────────────────┐
│ 🔧 Service Details                  │
├─────────────────────────────────────┤
│ Service ID: SRV-20241009-A3F8K     │
│ Report ID:  RPT-20241009-D2L7Q     │
│                                     │
│ Customer: ABC Company               │
│ Location: T.Nagar, Chennai          │
│ Type: Emergency                     │
│ Status: ● In Progress               │
└─────────────────────────────────────┘
```

### Service History
```
SRV-20241009-A3F8K  ✓ Completed
ABC Company • T.Nagar
Oct 9, 2024 • Rating: ⭐⭐⭐⭐⭐

SRV-20241008-P5L2M  ✓ Completed
XYZ Ltd • Adyar
Oct 8, 2024 • Rating: ⭐⭐⭐⭐

SRV-20241007-M9K3N  ● In Progress
DEF Corp • Velachery
Oct 7, 2024
```

---

## 🧪 Testing Examples

### Generate Test IDs
```python
from app.utils.id_generator import *

# Generate various IDs
service_id = generate_service_id()
print(service_id)  # SRV-20241009-A3F8K

report_id = generate_report_id()
print(report_id)   # RPT-20241009-D2L7Q

job_number = generate_job_number()
print(job_number)  # JB-1234
```

### Create Test Service
```bash
# As Technician
curl -X POST http://localhost:8000/api/v1/technician/check-in \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer-uuid",
    "location": {"latitude": 13.0827, "longitude": 80.2707},
    "service_type": "adhoc"
  }'
```

---

## 📊 Reporting & Analytics

### Services by Type
```sql
SELECT
  service_type,
  COUNT(*) as count,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completion_rate
FROM service_schedules
GROUP BY service_type;
```

### Daily Service Count
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_services,
  SUM(CASE WHEN is_adhoc THEN 1 ELSE 0 END) as adhoc_count,
  SUM(CASE WHEN NOT is_adhoc THEN 1 ELSE 0 END) as scheduled_count
FROM service_schedules
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Services by ID Pattern
```sql
SELECT service_id, customer_name, status, created_at
FROM service_schedules
WHERE service_id LIKE 'SRV-20241009-%'
ORDER BY created_at DESC;
```

---

## 🔐 Security Considerations

1. **IDs are NOT secret** - They're for reference, not authentication
2. **Always verify user permissions** before showing service details
3. **Log all ID generations** for audit trail
4. **Rate limit ID generation** to prevent abuse
5. **Validate ID format** on input to prevent injection

---

## ✅ Summary

- ✅ Every service gets unique human-readable ID
- ✅ Technicians can create services on-site
- ✅ IDs are generated automatically by system
- ✅ IDs contain date for easy reference
- ✅ Both scheduled and ad-hoc services supported
- ✅ Complete audit trail with service and report IDs
- ✅ Easy to search, sort, and reference
- ✅ Mobile-friendly workflow for technicians

---

**The Service ID system ensures every service visit is properly tracked, documented, and easily referenceable! 🎉**

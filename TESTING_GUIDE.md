# 🧪 LegendLift Testing Guide

## ✅ Backend Server is RUNNING!

**Status:** Backend API is now running on `http://localhost:8000`

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Login Credentials](#login-credentials)
3. [Test API with Browser](#test-api-with-browser)
4. [Test API with cURL](#test-api-with-curl)
5. [Test Mobile App](#test-mobile-app)
6. [Feature Testing](#feature-testing)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Backend is Already Running!

The backend server is running at: **http://localhost:8000**

✅ Database initialized with sample data
✅ Admin and technician accounts created
✅ Sequential service IDs working
✅ All new features active

---

## 🔑 Login Credentials

### Admin Account
```
Email:    admin@legendlift.com
Password: admin123
Role:     admin
```

### Technician Accounts
```
Email:    john@legendlift.com
Password: tech123
Role:     technician

Email:    sarah@legendlift.com
Password: tech123
Role:     technician

Email:    mike@legendlift.com
Password: tech123
Role:     technician
```

### Sample Customers
- ABC Towers (Job: JB-1000)
- XYZ Plaza (Job: JB-1001)
- Grand Mall (Job: JB-1002)

---

## 🌐 Test API with Browser

### 1. Open Interactive API Documentation

Open your browser and navigate to:

```
http://localhost:8000/docs
```

You'll see **Swagger UI** with all API endpoints organized by tags.

### 2. Test Authentication

1. Find the **authentication** section
2. Click on `POST /api/v1/auth/login`
3. Click "Try it out"
4. Use these credentials:
   ```json
   {
     "email": "admin@legendlift.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
5. Click "Execute"
6. Copy the `access_token` from the response

### 3. Authorize Requests

1. Click the green **"Authorize"** button at the top right
2. Enter: `Bearer <your_access_token>`
3. Click "Authorize"
4. Click "Close"

Now all your API requests will be authenticated!

### 4. Test New Features

#### A) Test Daily Report
1. Go to **reports** section
2. Click `GET /api/v1/reports/daily`
3. Click "Try it out"
4. Leave date empty (defaults to today)
5. Click "Execute"
6. See today's service statistics!

#### B) Test Monthly Report
1. Click `GET /api/v1/reports/monthly`
2. Click "Try it out"
3. Enter:
   - month: `10`
   - year: `2025`
4. Click "Execute"
5. See monthly summary with completion rates!

#### C) Test Yearly Report
1. Click `GET /api/v1/reports/yearly`
2. Click "Try it out"
3. Enter year: `2025`
4. Click "Execute"
5. See annual statistics with monthly breakdown!

#### D) Test Add Technician
1. Go to **admin-users** section
2. Click `POST /api/v1/admin/technicians`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "name": "Test Technician",
     "email": "test@legendlift.com",
     "phone": "9999999998",
     "password": "test123"
   }
   ```
5. Click "Execute"
6. New technician created!

#### E) Test List Technicians
1. Click `GET /api/v1/admin/technicians`
2. Click "Try it out"
3. Click "Execute"
4. See list of all technicians!

---

## 💻 Test API with cURL

### 1. Login as Admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legendlift.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

Copy the `access_token` for use in subsequent requests.

### 2. Get Daily Report

```bash
TOKEN="<paste_your_token_here>"

curl http://localhost:8000/api/v1/reports/daily \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Monthly Report

```bash
curl "http://localhost:8000/api/v1/reports/monthly?month=10&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Yearly Report

```bash
curl "http://localhost:8000/api/v1/reports/yearly?year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Add New Technician

```bash
curl -X POST http://localhost:8000/api/v1/admin/technicians \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Technician",
    "email": "newtech@legendlift.com",
    "phone": "9999999997",
    "password": "tech123"
  }'
```

### 6. List All Technicians

```bash
curl http://localhost:8000/api/v1/admin/technicians \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Test Sequential Service ID (Login as Technician)

```bash
# Login as technician
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@legendlift.com",
    "password": "tech123",
    "role": "technician"
  }'

# Copy the technician token, then create service
TECH_TOKEN="<paste_technician_token>"

curl -X POST http://localhost:8000/api/v1/technician/check-in \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "<get_from_customers_list>",
    "location": {"latitude": 13.0827, "longitude": 80.2707},
    "service_type": "adhoc",
    "notes": "Testing sequential ID"
  }'
```

**Expected:** Service ID like `SRV-20251009-0006` (sequential number)

---

## 📱 Test Mobile App

### 1. Navigate to Mobile Directory

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start the Mobile App

```bash
npm start
```

This will start the Expo development server.

### 4. Choose Platform

You'll see options:
- **Press `w`** - Open in web browser (easiest for testing)
- **Press `a`** - Open in Android emulator
- **Press `i`** - Open in iOS simulator

### 5. Test Login

1. Enter email: `admin@legendlift.com`
2. Enter password: `admin123`
3. Select role: `Admin`
4. Click Login

### 6. Test Reports Screen

1. Navigate to "Reports" tab
2. Test Daily tab
3. Test Monthly tab
4. Test Yearly tab
5. Verify data displays correctly

### 7. Test Technician Management

1. Navigate to "Technician Management"
2. View existing technicians
3. Click "+ Add Technician"
4. Fill form:
   - Name: Test User
   - Email: testuser@example.com
   - Phone: 9876543200
   - Password: test123
5. Submit
6. Verify technician added to list

### 8. Test as Technician

1. Logout
2. Login as technician:
   - Email: john@legendlift.com
   - Password: tech123
   - Role: Technician
3. Test service check-in
4. Verify sequential service ID generated

---

## 🧪 Feature Testing

### Feature 1: Sequential Service ID Generation

**What to Test:**
- Service IDs are generated in sequence
- Format is `SRV-YYYYMMDD-NNNN`
- Numbers increment: 0001, 0002, 0003...

**How to Test:**
1. Login as technician
2. Create 3 services via check-in
3. Verify IDs:
   - First: SRV-20251009-0006
   - Second: SRV-20251009-0007
   - Third: SRV-20251009-0008

**API Endpoint:**
```
POST /api/v1/technician/check-in
```

---

### Feature 2: Admin Reporting System

**What to Test:**
- Daily reports show today's statistics
- Monthly reports show breakdown by day
- Yearly reports show breakdown by month
- Technician performance displayed
- Completion rates calculated

**How to Test:**
1. Login as admin
2. Call daily report endpoint
3. Verify data matches database
4. Call monthly report
5. Check completion rate formula
6. Call yearly report
7. Verify monthly breakdown

**API Endpoints:**
```
GET /api/v1/reports/daily
GET /api/v1/reports/monthly?month=10&year=2025
GET /api/v1/reports/yearly?year=2025
GET /api/v1/reports/services/detailed
```

---

### Feature 3: Technician Management

**What to Test:**
- Admin can add technician
- Email validation works
- Phone validation works (10 digits)
- Duplicate email/phone rejected
- Can list all technicians
- Can activate/deactivate
- Can search technicians

**How to Test:**
1. Login as admin
2. Add technician with valid data ✅
3. Try duplicate email (should fail) ❌
4. Try duplicate phone (should fail) ❌
5. Try invalid email format (should fail) ❌
6. Try 9-digit phone (should fail) ❌
7. List all technicians ✅
8. Deactivate a technician ✅
9. Reactivate technician ✅
10. Search by name/email/phone ✅

**API Endpoints:**
```
POST   /api/v1/admin/technicians
GET    /api/v1/admin/technicians
GET    /api/v1/admin/technicians/{id}
PUT    /api/v1/admin/technicians/{id}
DELETE /api/v1/admin/technicians/{id}
POST   /api/v1/admin/technicians/{id}/activate
GET    /api/v1/admin/users/search?query=...
```

---

## 🔍 Troubleshooting

### Backend Not Starting

**Problem:** Server fails to start

**Solutions:**
1. Check if port 8000 is already in use:
   ```bash
   lsof -i :8000
   kill -9 <PID>
   ```
2. Check database file exists:
   ```bash
   ls -la legendlift.db
   ```
3. Reinitialize database:
   ```bash
   rm legendlift.db
   python init_db.py
   ```

### Login Not Working

**Problem:** Authentication fails

**Solutions:**
1. Verify credentials are correct
2. Check role matches (admin/technician)
3. Reinitialize database to reset passwords:
   ```bash
   rm legendlift.db
   python init_db.py
   ```

### Sequential IDs Not Working

**Problem:** Service IDs are not sequential

**Solutions:**
1. Check sequential_counters table exists
2. Verify counter model imported in `app/models/__init__.py`
3. Check database has write permissions

### Reports Show No Data

**Problem:** Reports endpoint returns empty data

**Solutions:**
1. Check if services exist in database
2. Verify date filters are correct
3. Try with broader date range
4. Check if admin token is valid

### Cannot Add Technician

**Problem:** Add technician fails

**Solutions:**
1. Check email format is valid
2. Verify phone is exactly 10 digits
3. Ensure email/phone not already used
4. Check admin authentication token
5. Verify all required fields provided

---

## 📊 Expected Test Results

### After Testing, You Should See:

✅ Backend server running on port 8000
✅ API documentation accessible at /docs
✅ Admin login successful
✅ Technician login successful
✅ Sequential service IDs generated
✅ Daily reports displaying data
✅ Monthly reports with completion rates
✅ Yearly reports with monthly breakdown
✅ New technicians can be added
✅ Technician list displays
✅ Activate/deactivate works
✅ Mobile app connects to backend
✅ Mobile reports screen displays data
✅ Mobile technician management works

---

## 🎯 Complete Test Checklist

### Backend API Tests

- [ ] Server starts successfully
- [ ] Health check returns {"status": "healthy"}
- [ ] Admin login works
- [ ] Technician login works
- [ ] Invalid credentials rejected
- [ ] Token authentication works
- [ ] Daily report returns data
- [ ] Monthly report returns data
- [ ] Yearly report returns data
- [ ] Add technician succeeds
- [ ] Duplicate email rejected
- [ ] Duplicate phone rejected
- [ ] Invalid email rejected
- [ ] Invalid phone rejected
- [ ] List technicians works
- [ ] Deactivate technician works
- [ ] Activate technician works
- [ ] Search technicians works
- [ ] Sequential service IDs generated
- [ ] Service check-in works
- [ ] Service IDs increment correctly

### Mobile App Tests

- [ ] App starts successfully
- [ ] Login screen displays
- [ ] Admin login works
- [ ] Technician login works
- [ ] Reports screen displays
- [ ] Daily tab shows data
- [ ] Monthly tab shows data
- [ ] Yearly tab shows data
- [ ] Technician management screen displays
- [ ] Add technician form works
- [ ] Validation messages show
- [ ] Technician list updates
- [ ] Activate/deactivate buttons work
- [ ] Service check-in screen works
- [ ] Sequential ID displays

---

## 📞 Support

If you encounter any issues:

1. Check the logs:
   ```bash
   # Backend logs
   tail -f /home/minnal/source/LegendLift/legendlift-backend/log.txt
   ```

2. Restart backend:
   ```bash
   cd /home/minnal/source/LegendLift/legendlift-backend
   source venv/bin/activate
   python run.py
   ```

3. Reset database:
   ```bash
   rm legendlift.db
   python init_db.py
   ```

4. Check API documentation:
   ```
   http://localhost:8000/docs
   ```

---

## 🎉 Success!

If all tests pass, your LegendLift system is fully functional with:

✅ Sequential service ID generation
✅ Comprehensive admin reporting
✅ Complete technician management
✅ Mobile app integration
✅ Secure authentication
✅ Production-ready code

**You're ready to deploy!** 🚀

---

**Last Updated:** October 9, 2025
**Project:** LegendLift - Elevator AMC Management System
**Version:** 1.0.0 (with all new features)

# 🚀 LegendLift - Complete Testing Commands Reference

## Quick Copy-Paste Commands for Testing

---

## 📋 Prerequisites Check

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version

# Check Python version (should be 3.8+)
python3 --version
```

---

## 🔧 Backend Testing

### 1. Start Backend Server

```bash
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
python run.py
```

**Expected:** Server starts on http://localhost:8000

### 2. Test Backend Health

```bash
curl http://localhost:8000/health
```

**Expected:** `{"status":"healthy"}`

### 3. Test Admin Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legendlift.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Expected:** Returns access token

### 4. Test Reports API (Copy token from step 3)

```bash
# Replace YOUR_TOKEN with actual token from login
TOKEN="YOUR_TOKEN_HERE"

# Test Daily Report
curl http://localhost:8000/api/v1/reports/daily \
  -H "Authorization: Bearer $TOKEN"

# Test Monthly Report
curl "http://localhost:8000/api/v1/reports/monthly?month=10&year=2025" \
  -H "Authorization: Bearer $TOKEN"

# Test Yearly Report
curl "http://localhost:8000/api/v1/reports/yearly?year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test Add Technician

```bash
curl -X POST http://localhost:8000/api/v1/admin/technicians \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Technician",
    "email": "testtech@example.com",
    "phone": "9876543299",
    "password": "test123"
  }'
```

### 6. Test List Technicians

```bash
curl http://localhost:8000/api/v1/admin/technicians \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Mobile App Testing

### 1. Navigate to Mobile Directory

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
```

### 2. Install Dependencies (first time only)

```bash
npm install
```

### 3. Start Mobile App

```bash
npm start
```

### 4. Open in Web Browser

When you see the Expo menu, press **`w`** key

**Or** manually open: http://localhost:19006 or http://localhost:8081

### 5. Clear Cache (if issues)

```bash
npx expo start -c
```

---

## 🔄 Reset/Restart Commands

### Reset Backend Database

```bash
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
rm legendlift.db
python init_db.py
```

### Restart Backend

```bash
# Kill existing process
pkill -f "python run.py"

# Start again
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
python run.py
```

### Reset Mobile App

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
rm -rf node_modules
npm install
npm start
```

---

## 🧪 Complete Testing Workflow

### Full Test (Backend + Mobile)

**Terminal 1 - Backend:**
```bash
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
python run.py
```

**Terminal 2 - Mobile App:**
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
npm start
# Press 'w' when Expo starts
```

**Browser - API Testing:**
```
Open: http://localhost:8000/docs
Login with admin credentials
Test all endpoints
```

---

## 📊 Test Credentials

### Admin
```
Email:    admin@legendlift.com
Password: admin123
Role:     admin
```

### Technician
```
Email:    john@legendlift.com
Password: tech123
Role:     technician
```

---

## 🌐 Important URLs

```
Backend API:           http://localhost:8000
API Documentation:     http://localhost:8000/docs
API Health Check:      http://localhost:8000/health
Mobile Web:            http://localhost:19006
                  or:  http://localhost:8081
Expo DevTools:         http://localhost:19000
```

---

## 🔍 Debugging Commands

### Check if Backend is Running

```bash
curl http://localhost:8000/health
# or
ps aux | grep "python run.py"
```

### Check Backend Logs

```bash
# If running in terminal, logs appear automatically
# To run in background and check logs:
cd /home/minnal/source/LegendLift/legendlift-backend
python run.py > backend.log 2>&1 &
tail -f backend.log
```

### Check Mobile App Logs

```bash
# Logs appear in the terminal where you ran 'npm start'
# Also check browser console (F12)
```

### Check Database Contents

```bash
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
python
```

Then in Python:
```python
from app.db.session import get_db
from app.models import User, ServiceSchedule

db = next(get_db())

# List all users
users = db.query(User).all()
for user in users:
    print(f"{user.name} - {user.email} - {user.role}")

# List all services
services = db.query(ServiceSchedule).all()
for service in services:
    print(f"{service.service_id} - {service.status}")
```

---

## 🎯 Testing Checklist Commands

### Backend Checklist

```bash
# 1. Health Check
curl http://localhost:8000/health

# 2. Admin Login
curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@legendlift.com","password":"admin123","role":"admin"}'

# 3. Get Daily Report (use token from step 2)
curl http://localhost:8000/api/v1/reports/daily -H "Authorization: Bearer TOKEN"

# 4. Add Technician
curl -X POST http://localhost:8000/api/v1/admin/technicians -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","phone":"9999999999","password":"test123"}'

# 5. List Technicians
curl http://localhost:8000/api/v1/admin/technicians -H "Authorization: Bearer TOKEN"
```

### Mobile Checklist

```bash
# 1. Check dependencies installed
cd /home/minnal/source/LegendLift/legendlift-mobile
npm list react react-native

# 2. Start app
npm start

# 3. Open in browser (press 'w')
# Then manually test in browser:
#   - Login
#   - Navigate tabs
#   - Test reports
#   - Add technician
```

---

## 💾 Backup Commands

### Backup Database

```bash
cd /home/minnal/source/LegendLift/legendlift-backend
cp legendlift.db legendlift.db.backup
```

### Restore Database

```bash
cd /home/minnal/source/LegendLift/legendlift-backend
cp legendlift.db.backup legendlift.db
```

---

## 🚨 Emergency Commands

### Kill All Processes

```bash
# Kill backend
pkill -f "python run.py"

# Kill Expo/Metro
pkill -f "expo"
pkill -f "metro"
```

### Start Fresh

```bash
# Backend
cd /home/minnal/source/LegendLift/legendlift-backend
pkill -f "python run.py"
rm legendlift.db
source venv/bin/activate
python init_db.py
python run.py

# Mobile
cd /home/minnal/source/LegendLift/legendlift-mobile
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📞 Quick Reference

### Single Command Testing

**Test everything in one go:**

```bash
# Terminal 1: Backend
cd /home/minnal/source/LegendLift/legendlift-backend && source venv/bin/activate && python run.py

# Terminal 2: Test API
curl http://localhost:8000/health && echo "\n✅ Backend is running!"

# Terminal 3: Mobile
npm start
```

---

## ✅ Success Indicators

### Backend Running Successfully:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Mobile App Running Successfully:
```
› Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
```

### API Test Successful:
```json
{"status":"healthy"}
```

### Login Successful:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

---

**All commands tested and verified! Copy-paste as needed.** 🚀

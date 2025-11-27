# 📱 LegendLift Mobile App - Complete Testing Guide

## 🎯 Current Status

✅ **Mobile app is READY for testing!**
✅ **Backend API is RUNNING at http://localhost:8000**
✅ **API URL configured correctly**
✅ **New screens integrated (Reports & Technician Management)**

---

## 🚀 How to Run Mobile App on Your Laptop

### Prerequisites Check

First, verify you have the required software:

```bash
node --version   # Should be v16+ (You have v22.19.0 ✅)
npm --version    # Should be v8+ (You have 10.9.3 ✅)
```

---

## 📋 Step-by-Step Testing Instructions

### **Option 1: Test in Web Browser (EASIEST - Recommended for Quick Testing)**

This is the fastest way to test the app without any emulators!

#### Step 1: Open Terminal and Navigate to Mobile App

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
```

#### Step 2: Start the Mobile App

```bash
npm start
```

**What happens:**
- Expo development server starts
- You'll see a QR code in terminal
- A browser window may open automatically

#### Step 3: Open in Web Browser

After running `npm start`, you'll see options:

```
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

**Press `w` on your keyboard** to open in web browser.

**OR** if browser doesn't auto-open:
1. Wait for the terminal to show: "Metro waiting on exp://..."
2. Open your browser manually
3. Go to: `http://localhost:19006` or `http://localhost:8081`

#### Step 4: Test the App

Once the app loads in browser:

1. **You'll see the Login Screen**
   - Email field
   - Password field
   - Role selector

2. **Login as Admin:**
   - Email: `admin@legendlift.com`
   - Password: `admin123`
   - Role: Select "Admin"
   - Click "Login"

3. **Test Navigation:**
   You'll see bottom tabs:
   - 🏠 Dashboard
   - 📊 Reports (NEW!)
   - 👥 Technicians (NEW!)
   - 🏢 Customers
   - ☰ More

4. **Test Reports Screen:**
   - Click on "Reports" tab
   - You'll see three tabs: Daily, Monthly, Yearly
   - Test each tab
   - Data will be fetched from backend API

5. **Test Technician Management:**
   - Click on "Technicians" tab
   - See list of existing technicians
   - Click "+ Add Technician"
   - Fill the form:
     - Name: Test Technician
     - Email: testtech@example.com
     - Phone: 9876543299
     - Password: test123
   - Submit
   - Verify technician appears in list

---

### **Option 2: Test on Android Emulator**

If you have Android Studio installed:

#### Step 1: Start Android Emulator

```bash
# Open Android Studio
# Go to: Tools → Device Manager
# Click "Play" on any emulator
```

#### Step 2: Run App on Android

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
npm start
# Press 'a' to open on Android
```

---

### **Option 3: Test on iOS Simulator (Mac Only)**

If you're on a Mac with Xcode:

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
npm start
# Press 'i' to open on iOS
```

---

### **Option 4: Test on Physical Device**

#### Using Expo Go App:

1. **Install Expo Go on your phone:**
   - Android: Download from Play Store
   - iOS: Download from App Store

2. **Start the app:**
   ```bash
   cd /home/minnal/source/LegendLift/legendlift-mobile
   npm start
   ```

3. **Scan QR Code:**
   - Android: Use Expo Go app to scan QR code
   - iOS: Use Camera app to scan QR code

**⚠️ Important for Physical Device:**
You need to update the API URL to use your laptop's IP address instead of localhost:

```bash
# Find your laptop's IP address
ip addr show | grep "inet " | grep -v 127.0.0.1
# Example output: 192.168.1.100

# Then update the API URL in:
# /home/minnal/source/LegendLift/legendlift-mobile/src/constants/index.js
# Change: http://localhost:8000/api/v1
# To: http://192.168.1.100:8000/api/v1
```

---

## 🧪 What to Test

### 1. Admin Features

#### Test Login
- [ ] Login with admin credentials works
- [ ] Invalid credentials show error
- [ ] Token is stored

#### Test Reports Screen
- [ ] Daily tab loads data
- [ ] Shows today's service statistics
- [ ] Monthly tab loads data
- [ ] Shows completion rates
- [ ] Yearly tab loads data
- [ ] Shows monthly breakdown
- [ ] Charts render correctly
- [ ] Technician performance displays

#### Test Technician Management
- [ ] List of technicians loads
- [ ] Statistics show (Total/Active/Inactive)
- [ ] "+ Add Technician" button works
- [ ] Form validation works:
  - [ ] Email format checked
  - [ ] Phone must be 10 digits
  - [ ] All fields required
- [ ] Duplicate email rejected
- [ ] Duplicate phone rejected
- [ ] New technician appears in list
- [ ] Active/Inactive badge shows correctly
- [ ] Edit button works (if implemented)
- [ ] Deactivate button works

#### Test Dashboard
- [ ] Stats cards display correctly
- [ ] Shows pending services
- [ ] Shows completed services
- [ ] Shows total customers

### 2. Technician Features

#### Login as Technician
- Email: `john@legendlift.com`
- Password: `tech123`
- Role: Technician

#### Test Features
- [ ] Dashboard shows today's services
- [ ] Can view service details
- [ ] Can check-in to service
- [ ] Sequential service ID generated
- [ ] Service history displays

---

## 🐛 Troubleshooting

### Issue: App Won't Start

**Solution:**
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
rm -rf node_modules
npm install
npm start
```

### Issue: "Network Error" or "Cannot connect to API"

**Check:**
1. Backend server is running:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

2. API URL is correct in `src/constants/index.js`:
   ```javascript
   BASE_URL: 'http://localhost:8000/api/v1'
   ```

3. If using physical device, use your laptop's IP address

### Issue: "Module not found" errors

**Solution:**
```bash
npm install
# Clear cache
npx expo start -c
```

### Issue: Web version blank screen

**Solution:**
1. Check browser console (F12) for errors
2. Try clearing cache: `npx expo start -c`
3. Try different browser (Chrome recommended)

### Issue: Reports screen shows no data

**Check:**
1. You're logged in as admin
2. Backend has sample data:
   ```bash
   cd /home/minnal/source/LegendLift/legendlift-backend
   source venv/bin/activate
   python init_db.py
   ```
3. Check network tab in browser for API errors

### Issue: Add technician fails

**Check:**
1. Email format is valid (xxx@xxx.com)
2. Phone is exactly 10 digits
3. Email/phone not already in use
4. All fields filled
5. You're logged in as admin

---

## 📊 Expected Results

### When App Loads Successfully:

**Web Browser:**
- Clean login screen
- Light blue theme
- Email, password, role fields visible

**After Admin Login:**
- Bottom navigation with 5 tabs
- Dashboard showing statistics
- Smooth navigation between tabs

**Reports Screen:**
- Three tabs: Daily, Monthly, Yearly
- Data loads from API
- Statistics display correctly
- Charts render (for yearly view)
- Technician performance rankings

**Technician Management:**
- List of 3 sample technicians
- Statistics: Total 3, Active 3, Inactive 0
- "+ Add Technician" button prominent
- Cards show technician details
- Active/Inactive badges colored
- Edit and Deactivate buttons visible

---

## 🔧 Backend Connection Test

Before testing mobile app, verify backend is working:

### Test 1: Check Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Test 2: Test Login API
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legendlift.com",
    "password": "admin123",
    "role": "admin"
  }'
# Expected: {"access_token":"...", "token_type":"bearer"}
```

### Test 3: Test Reports API
```bash
# Get admin token first (from Test 2)
TOKEN="<paste_token_here>"

curl http://localhost:8000/api/v1/reports/daily \
  -H "Authorization: Bearer $TOKEN"
# Expected: JSON with daily statistics
```

If all three tests pass, backend is ready for mobile app!

---

## 📱 Mobile App Testing Workflow

### Complete Test Flow (15 minutes)

1. **Start Backend** (if not already running)
   ```bash
   cd /home/minnal/source/LegendLift/legendlift-backend
   source venv/bin/activate
   python run.py
   ```

2. **Start Mobile App**
   ```bash
   cd /home/minnal/source/LegendLift/legendlift-mobile
   npm start
   # Press 'w' for web
   ```

3. **Test Admin Flow**
   - Login as admin
   - Check Dashboard
   - Open Reports → Test Daily tab
   - Open Reports → Test Monthly tab
   - Open Reports → Test Yearly tab
   - Open Technicians tab
   - Add new technician
   - Verify in list

4. **Test Technician Flow**
   - Logout
   - Login as technician (john@legendlift.com)
   - Check Dashboard
   - View services
   - Test check-in (if customer data available)

5. **Verify Backend Data**
   - Open http://localhost:8000/docs
   - Check if new technician exists
   - Verify service IDs are sequential

---

## 🎯 Key Features to Demonstrate

### 1. Sequential Service IDs
- When technician creates service
- Shows format: SRV-20251009-NNNN
- Numbers increment: 0001, 0002, 0003...

### 2. Reports Dashboard
- Daily: Today's statistics
- Monthly: Last 30 days with completion %
- Yearly: 12 months breakdown
- Visual charts and graphs

### 3. Technician Management
- Add by email/phone
- Real-time validation
- List view with status
- Activate/deactivate controls

---

## 💡 Pro Tips

### For Best Testing Experience:

1. **Use Web Browser First**
   - Fastest to start
   - Easy to debug (F12 console)
   - No emulator needed
   - Hot reload works

2. **Keep Backend Terminal Open**
   - See API requests in real-time
   - Monitor for errors
   - Check database queries

3. **Use Browser DevTools**
   - F12 to open console
   - Check Network tab for API calls
   - See request/response data
   - Debug errors quickly

4. **Test in Order**
   - Backend first
   - Mobile web second
   - Emulator/device third

5. **Clear Data If Issues**
   - Close app completely
   - Clear browser cache
   - Restart metro bundler: `npx expo start -c`

---

## 📞 Quick Reference

### URLs:
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Mobile Web: http://localhost:19006 or http://localhost:8081
- Metro Bundler: http://localhost:19000

### Credentials:
- Admin: admin@legendlift.com / admin123
- Tech: john@legendlift.com / tech123

### Commands:
```bash
# Start backend
cd legendlift-backend && source venv/bin/activate && python run.py

# Start mobile
cd legendlift-mobile && npm start

# Reset mobile cache
npx expo start -c

# Reset database
cd legendlift-backend && rm legendlift.db && python init_db.py
```

---

## ✅ Testing Checklist

Before marking as complete, verify:

**Backend:**
- [ ] Server running on port 8000
- [ ] Health check passes
- [ ] Login API works
- [ ] Reports API works
- [ ] Technician management API works

**Mobile:**
- [ ] App starts successfully
- [ ] Login screen displays
- [ ] Admin login works
- [ ] Navigation works
- [ ] Reports tab displays
- [ ] Daily reports load
- [ ] Monthly reports load
- [ ] Yearly reports load
- [ ] Technician tab displays
- [ ] Add technician form works
- [ ] Validation works
- [ ] New technician appears in list

---

## 🎉 Success Criteria

Your mobile app is working correctly when:

✅ App loads without errors
✅ Login works for both admin and technician
✅ Navigation between tabs is smooth
✅ Reports load data from backend
✅ Can add new technicians
✅ Data updates in real-time
✅ No console errors
✅ UI is responsive and looks professional

---

**Ready to test! Start with: `cd legendlift-mobile && npm start` then press `w`** 🚀

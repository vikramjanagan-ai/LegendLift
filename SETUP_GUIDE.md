# 🚀 LegendLift - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Running the Application](#running-the-application)
5. [Testing the Application](#testing-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **Python**: v3.8 or higher ([Download](https://www.python.org/))
- **PostgreSQL**: v12 or higher ([Download](https://www.postgresql.org/))
- **Git**: Latest version
- **Expo CLI**: `npm install -g expo-cli`

### Development Tools (Optional but Recommended)
- **VS Code** with extensions:
  - Python
  - React Native Tools
  - Prettier
  - ESLint
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management

### Mobile Development
- **iOS Development**: macOS with Xcode installed
- **Android Development**: Android Studio with Android SDK
- **Alternative**: Use Expo Go app on physical device for testing

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd /home/minnal/source/LegendLift/legendlift-backend
```

### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Setup PostgreSQL Database

#### Option A: Using Command Line
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE legendlift;

# Create user (optional)
CREATE USER legendlift_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE legendlift TO legendlift_user;

# Exit
\q
```

#### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `legendlift`
4. Click "Save"

### Step 5: Configure Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

Update the following variables:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/legendlift
SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Step 6: Create Initial Admin User
```bash
python3 << EOF
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.db.session import SessionLocal
import uuid

db = SessionLocal()

# Create Admin
admin = User(
    id=str(uuid.uuid4()),
    name="Admin User",
    email="admin@legendlift.com",
    phone="9876543210",
    role=UserRole.ADMIN,
    hashed_password=get_password_hash("admin123"),
    active=True
)

# Create Technician
technician = User(
    id=str(uuid.uuid4()),
    name="Test Technician",
    email="tech@legendlift.com",
    phone="9876543211",
    role=UserRole.TECHNICIAN,
    hashed_password=get_password_hash("tech123"),
    active=True
)

db.add(admin)
db.add(technician)
db.commit()
db.close()

print("✅ Users created successfully!")
EOF
```

### Step 7: Run Backend Server
```bash
python run.py
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## Mobile App Setup

### Step 1: Navigate to Mobile Directory
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure API Endpoint

Edit `src/constants/index.js` if your backend is running on a different URL:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP_ADDRESS:8000/api/v1',  // Change if needed
  TIMEOUT: 30000,
};
```

**Important**:
- For **Android Emulator**: Use `http://10.0.2.2:8000/api/v1`
- For **iOS Simulator**: Use `http://localhost:8000/api/v1`
- For **Physical Device**: Use `http://YOUR_COMPUTER_IP:8000/api/v1`

To find your computer's IP:
```bash
# Linux/macOS
ifconfig | grep "inet "

# Windows
ipconfig
```

### Step 4: Install iOS Dependencies (macOS only)
```bash
cd ios
pod install
cd ..
```

---

## Running the Application

### Backend (Terminal 1)
```bash
cd /home/minnal/source/LegendLift/legendlift-backend
source venv/bin/activate
python run.py
```

### Mobile App (Terminal 2)

#### Start Expo Development Server
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
npm start
```

#### Run on iOS (macOS only)
```bash
npm run ios
```

#### Run on Android
```bash
npm run android
```

#### Run on Web (for testing)
```bash
npm run web
```

#### Using Expo Go App
1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan QR code from terminal

---

## Testing the Application

### Test Login Credentials

#### Admin Account
- **Email**: `admin@legendlift.com`
- **Password**: `admin123`
- **Role**: Admin

#### Technician Account
- **Email**: `tech@legendlift.com`
- **Password**: `tech123`
- **Role**: Technician

### Test Workflow

1. **Login as Admin**
   - Open app
   - Select "Admin" role
   - Enter admin credentials
   - Verify Dashboard loads

2. **Login as Technician**
   - Logout
   - Select "Technician" role
   - Enter technician credentials
   - Verify Technician Dashboard loads

3. **Test API Endpoints** (using Postman)
   - Import API collection from `http://localhost:8000/docs`
   - Test authentication
   - Test customer CRUD operations
   - Test service management

---

## Troubleshooting

### Backend Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -U postgres -c "\l" | grep legendlift
```

#### Module Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Mobile App Issues

#### Metro Bundler Issues
```bash
# Clear cache
npm start -- --clear

# Or
expo start -c
```

#### iOS Build Issues
```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Android Build Issues
```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..
```

#### Network Request Failed
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify API_CONFIG.BASE_URL in `src/constants/index.js`
3. For Android emulator, use `http://10.0.2.2:8000/api/v1`
4. For physical device, use your computer's IP address

#### Redux State Issues
```bash
# Clear app storage
# iOS Simulator: Device → Erase All Content and Settings
# Android Emulator: Settings → Apps → [App] → Clear Storage

# Or uninstall and reinstall app
```

---

## Development Tips

### Hot Reload
- Backend: Auto-reloads on file changes (uvicorn --reload)
- Mobile: Shake device or press `r` in terminal

### Debugging

#### Backend
```python
# Add breakpoints
import pdb; pdb.set_trace()

# Or use logging
import logging
logging.info("Debug message")
```

#### Mobile App
```javascript
// Console logging
console.log('Debug:', value);

// React DevTools
// Install: npm install -g react-devtools
// Run: react-devtools
```

### Database Management
```bash
# Access PostgreSQL
psql -U postgres -d legendlift

# Useful commands
\dt          # List tables
\d+ users    # Describe users table
SELECT * FROM users;  # Query users
```

### API Testing
Visit http://localhost:8000/docs for interactive API documentation (Swagger UI)

---

## Quick Start Commands

### Start Everything (3 Terminals)

**Terminal 1 - Backend:**
```bash
cd legendlift-backend && source venv/bin/activate && python run.py
```

**Terminal 2 - Mobile App:**
```bash
cd legendlift-mobile && npm start
```

**Terminal 3 - iOS/Android:**
```bash
cd legendlift-mobile && npm run ios  # or npm run android
```

---

## Next Steps

1. ✅ **Verify Setup**: Test login with both admin and technician accounts
2. ✅ **Explore API**: Check out interactive docs at http://localhost:8000/docs
3. ✅ **Test Features**: Navigate through dashboards and screens
4. 📊 **Import Data**: Run Excel migration script (coming soon)
5. 🎨 **Customize**: Modify theme colors in `src/constants/theme.js`
6. 🚀 **Deploy**: Prepare for production deployment

---

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Review PROJECT_SUMMARY.md
- Check backend README: `legendlift-backend/README.md`

---

**Happy Coding! 🎉**

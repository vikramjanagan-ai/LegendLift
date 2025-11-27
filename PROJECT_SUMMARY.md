# 🏗️ LegendLift - Elevator AMC Management System

## 📱 Project Overview

**LegendLift** is a comprehensive mobile and web application for managing Elevator Annual Maintenance Contracts (AMC). The system includes:

- **Mobile App** (iOS & Android) - React Native with Expo
- **Backend API** - Python FastAPI with PostgreSQL
- **Two User Roles** - Admin and Technician

---

## 🎨 Design Theme

**Light Blue Color Palette:**
- Primary: `#4FC3F7` (Light Blue 300)
- Primary Dark: `#0288D1` (Light Blue 700)
- Primary Light: `#B3E5FC` (Light Blue 100)
- Accent: `#29B6F6` (Light Blue 400)

---

## 📂 Project Structure

```
LegendLift/
├── legendlift-mobile/          # React Native Mobile App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/          # Login, Role Selection
│   │   │   ├── admin/         # Admin screens
│   │   │   ├── technician/    # Technician screens
│   │   │   └── common/        # Shared screens
│   │   ├── components/
│   │   │   ├── common/        # Reusable components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   └── technician/    # Technician components
│   │   ├── navigation/        # Navigation setup
│   │   ├── store/            # Redux store
│   │   │   └── slices/       # Auth, Customer, Service, etc.
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # Theme, constants
│   │   │   ├── theme.js      # ✅ Light blue theme
│   │   │   └── index.js      # ✅ App constants
│   │   ├── types/            # TypeScript definitions
│   │   ├── hooks/            # Custom React hooks
│   │   └── assets/           # Images, icons
│   ├── App.js
│   └── package.json
│
├── legendlift-backend/         # Python FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py           # ✅ Authentication
│   │   │   │   ├── customers.py      # ✅ Customer CRUD
│   │   │   │   └── services.py       # ✅ Service management
│   │   │   └── deps.py               # ✅ Dependencies
│   │   ├── core/
│   │   │   ├── config.py             # ✅ Settings
│   │   │   └── security.py           # ✅ JWT & password
│   │   ├── db/
│   │   │   └── session.py            # ✅ Database session
│   │   ├── models/                   # ✅ SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── contract.py
│   │   │   ├── service.py
│   │   │   ├── payment.py
│   │   │   └── escalation.py
│   │   ├── schemas/                  # ✅ Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── contract.py
│   │   │   ├── service.py
│   │   │   └── payment.py
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   └── main.py           # ✅ FastAPI app
│   ├── tests/
│   ├── requirements.txt      # ✅ Python dependencies
│   ├── .env                  # ✅ Environment variables
│   ├── run.py                # ✅ Run script
│   └── README.md             # ✅ Backend documentation
│
├── Route chart APP Sample.xlsx
├── Legend Maintenance Master APP Sample.xlsx
└── PROJECT_SUMMARY.md (this file)
```

---

## ✅ Completed Components

### Backend (Python FastAPI)
- [x] Project structure setup
- [x] PostgreSQL database models (SQLAlchemy)
  - Users (Admin/Technician)
  - Customers
  - AMC Contracts
  - Service Schedules
  - Service Reports
  - Payments
  - Escalations
- [x] Pydantic schemas for validation
- [x] JWT authentication
- [x] Role-based access control
- [x] Authentication API endpoints
- [x] Customer management API endpoints
- [x] Service scheduling API endpoints
- [x] Service report API endpoints
- [x] Main FastAPI application with CORS
- [x] Environment configuration
- [x] Documentation (README)

### Mobile App (React Native)
- [x] Expo project initialization
- [x] Folder structure setup
- [x] Light blue theme configuration
- [x] Constants and configuration
- [x] TypeScript type definitions
- [x] Redux store setup
- [x] Redux slices:
  - Auth slice (login, logout, token management)
  - Customer slice (CRUD operations)
  - Service slice (scheduling, reports)
  - Contract slice (placeholder)
  - Payment slice (placeholder)
  - Notification slice
- [x] Essential dependencies installed

---

## 🎯 Key Features

### 👨‍💼 Admin Features
1. **Dashboard**
   - Overview of contracts, services, payments
   - Performance metrics
   - Pending services count

2. **Customer Management**
   - Add/Edit/View customers
   - Job number assignment
   - Route allocation
   - Location tracking (GPS)

3. **Contract Management**
   - Create AMC contracts
   - Track contract status (Active/Warranty/Renewal/Closed)
   - Set service frequency
   - Monitor expiry dates

4. **Service Scheduling**
   - Assign technicians to services
   - Calendar view
   - Track overdue services
   - Route-based planning

5. **Payment Tracking**
   - Payment due dates
   - Follow-up reminders
   - Payment status tracking

6. **Reports & Analytics**
   - Service completion reports
   - Technician performance
   - Revenue reports

7. **Technician Management**
   - Add/manage technicians
   - Track assignments
   - Performance monitoring

### 🔧 Technician Features
1. **Dashboard**
   - Today's service schedule
   - Pending services
   - Completion stats

2. **Service Execution**
   - Check-in/check-out with GPS
   - Service checklist
   - Photo capture (before/after)
   - Parts replacement tracking
   - Customer signature
   - Work notes

3. **Navigation**
   - Route map view
   - Customer location navigation
   - Google Maps integration

4. **Service History**
   - View past services
   - Access service reports

5. **Offline Mode**
   - Work offline
   - Auto-sync when online

---

## 🛠️ Technology Stack

### Mobile App
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack, Tab, Drawer)
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **UI**: Custom components with light blue theme
- **Date Handling**: Moment.js
- **Location**: Expo Location
- **Image Picker**: Expo Image Picker

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt
- **Server**: Uvicorn
- **Data Processing**: Pandas, OpenPyXL (for Excel)

---

## 🗄️ Database Schema

### Tables
1. **users**
   - id, name, email, phone, role (admin/technician)
   - hashed_password, profile_image, active

2. **customers**
   - id, job_number, name, area, address
   - contact_person, phone, email
   - latitude, longitude, route

3. **amc_contracts**
   - id, customer_id, contract_type
   - start_date, end_date, service_frequency
   - total_services, completed_services, pending_services
   - amount, terms, notes

4. **service_schedules**
   - id, contract_id, customer_id
   - scheduled_date, actual_date, status
   - technician_id, technician2_id
   - days_overdue, notes

5. **service_reports**
   - id, service_id, technician_id
   - check_in_time, check_out_time
   - check_in_location, check_out_location
   - work_done, parts_replaced, images
   - customer_signature, technician_signature
   - customer_feedback, rating

6. **payments**
   - id, customer_id, contract_id
   - amount, due_date, paid_date, status
   - payment_method, transaction_id
   - follow_up_date, follow_up_notes

7. **escalations**
   - id, customer_id, issue_type
   - description, priority, status
   - assigned_to_id, resolved_date, resolution

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- PostgreSQL 12+
- Expo CLI (for mobile development)
- iOS Simulator or Android Emulator (or physical device)

### Backend Setup

1. Navigate to backend directory:
```bash
cd legendlift-backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create PostgreSQL database:
```bash
createdb legendlift
```

5. Update `.env` file with your database credentials

6. Run the server:
```bash
python run.py
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd legendlift-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

---

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (email, password, role)
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Customers
- `GET /api/v1/customers` - List customers (with filters)
- `GET /api/v1/customers/{id}` - Get customer by ID
- `POST /api/v1/customers` - Create customer (Admin)
- `PUT /api/v1/customers/{id}` - Update customer (Admin)
- `DELETE /api/v1/customers/{id}` - Delete customer (Admin)

### Services
- `GET /api/v1/services/schedules` - List services (with filters)
- `GET /api/v1/services/schedules/today` - Today's services
- `GET /api/v1/services/schedules/{id}` - Get service by ID
- `POST /api/v1/services/schedules` - Create service (Admin)
- `PUT /api/v1/services/schedules/{id}` - Update service
- `GET /api/v1/services/reports` - List service reports
- `POST /api/v1/services/reports` - Create report (Check-in)
- `PUT /api/v1/services/reports/{id}` - Update report (Complete)

---

## 📊 Excel Data Migration

The project includes two Excel files with customer and service data:
1. **Route Chart APP Sample.xlsx** - 588 customer records with service schedules
2. **Legend Maintenance Master APP Sample.xlsx** - AMC contract details (partially corrupted)

**Next Steps for Data Migration:**
- Create Python script to parse Excel files
- Map Excel data to database models
- Import customers, contracts, and service history
- Validate and clean data

---

## 🔐 Default Credentials

**Admin:**
- Email: `admin@legendlift.com`
- Password: `admin123`
- Role: `admin`

**Technician:** (To be created)
- Email: `technician@legendlift.com`
- Password: `tech123`
- Role: `technician`

---

## 🎨 UI/UX Design Notes

### Color Usage
- **Primary Actions**: Light Blue (#4FC3F7)
- **Success/Complete**: Green (#66BB6A)
- **Warning/Pending**: Orange (#FFB74D)
- **Error/Overdue**: Red (#EF5350)
- **Background**: Light grey (#F5F5F5)
- **Cards**: White with subtle shadow

### Navigation Structure
- **Admin**: Bottom Tab Navigation (Dashboard, Services, Customers, Payments, More)
- **Technician**: Bottom Tab Navigation (Dashboard, Services, History, Profile)
- **Auth**: Stack Navigation (Login → Main App)

---

## 📋 Next Steps (To Complete)

### High Priority
1. ✅ Create navigation structure (Auth, Admin, Technician stacks)
2. ✅ Build Login screen with role selection
3. ✅ Create Admin Dashboard with stats
4. ✅ Build Technician Dashboard
5. ✅ Create reusable UI components (Button, Card, Input, etc.)
6. ✅ Build Customer List and Detail screens
7. ✅ Build Service List and Execution screens
8. ✅ Implement image upload for service reports
9. ✅ Add signature capture functionality
10. ✅ Create Excel data migration script

### Medium Priority
11. ⬜ Build Contract management screens
12. ⬜ Build Payment tracking screens
13. ⬜ Add push notifications
14. ⬜ Implement offline mode with sync
15. ⬜ Add Google Maps integration
16. ⬜ Create Reports and Analytics screens

### Low Priority
17. ⬜ Add profile management
18. ⬜ Implement settings screen
19. ⬜ Add dark mode support
20. ⬜ Write unit tests
21. ⬜ Prepare for App Store/Play Store deployment

---

## 📄 License

Proprietary - LegendLift

---

## 👨‍💻 Development Status

**Project Status**: 🟡 **IN PROGRESS**

**Completion**: ~40%

### Completed:
- ✅ Backend API (FastAPI with PostgreSQL)
- ✅ Database models and schemas
- ✅ Authentication with JWT
- ✅ Core API endpoints (Auth, Customers, Services)
- ✅ Mobile app project structure
- ✅ Light blue theme configuration
- ✅ Redux state management setup
- ✅ Type definitions

### In Progress:
- 🟡 Mobile app screens (UI components)
- 🟡 Navigation setup
- 🟡 API integration in mobile app

### Pending:
- ⬜ Excel data migration
- ⬜ Image upload and storage
- ⬜ Push notifications
- ⬜ Offline mode
- ⬜ Testing and deployment

---

**Created**: October 2024
**Last Updated**: October 2024

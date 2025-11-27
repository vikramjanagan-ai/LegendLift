# 🏢 LegendLift - Elevator AMC Management System

<div align="center">

![LegendLift](https://img.shields.io/badge/LegendLift-v1.0-4FC3F7?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**A comprehensive mobile and backend solution for managing Elevator Annual Maintenance Contracts**

[Features](#-features) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

**LegendLift** is a full-stack mobile application designed to streamline the management of elevator Annual Maintenance Contracts (AMC). The system provides separate interfaces for Administrators and Technicians, enabling efficient service scheduling, customer management, payment tracking, and real-time service reporting.

### 🎯 Key Highlights

- ✨ **Beautiful Light Blue Theme** - Professional, modern UI with carefully crafted color scheme
- 🔐 **Role-Based Access** - Separate workflows for Admin and Technician users
- 📱 **Cross-Platform** - iOS and Android support with React Native
- 🚀 **Fast Backend** - Python FastAPI with PostgreSQL for high performance
- 📊 **Real-Time Dashboard** - Live statistics and performance metrics
- 🗺️ **Route Management** - Organize services by geographical routes
- 📸 **Service Reports** - Capture photos, signatures, and detailed work logs
- 💰 **Payment Tracking** - Monitor payments and follow-ups
- 🔔 **Notifications** - Real-time alerts for services and updates
- 📱 **Offline Mode** - Work without internet, sync when connected

---

## ✨ Features

### 👨‍💼 Admin Features

#### Dashboard & Analytics
- Overview of all contracts, services, and payments
- Performance metrics and completion rates
- Revenue tracking and reporting
- Technician performance monitoring

#### Customer Management
- Add, edit, and manage customers
- Job number assignment and tracking
- GPS location tagging
- Route allocation

#### AMC Contract Management
- Create and manage contracts
- Track contract status (Active, Warranty, Renewal, Closed)
- Set service frequency (Monthly, Bi-monthly, Quarterly, etc.)
- Monitor contract expiry dates

#### Service Scheduling
- Calendar view of all services
- Assign technicians to services
- Track overdue services
- Route-based service planning

#### Payment Management
- Payment due tracking
- Send payment reminders
- Record payments and transactions
- Follow-up management

#### Reports & Analytics
- Service completion reports
- Revenue reports
- Technician performance analysis
- Export to Excel/PDF

### 🔧 Technician Features

#### Dashboard
- Today's service schedule
- Pending services count
- Completion statistics
- Average rating display

#### Service Execution
- GPS check-in/check-out
- Service checklists
- Before/after photo capture
- Parts replacement tracking
- Customer signature capture
- Work notes and feedback

#### Navigation
- Route map view
- Customer location navigation
- Google Maps integration

#### Service History
- View past services
- Access service reports
- Track personal performance

#### Offline Mode
- Work without internet connection
- Automatic sync when connected
- Store data locally

---

## 🎨 Screenshots

### Login & Authentication
- Role selection (Admin/Technician)
- Light blue themed login screen
- Demo credentials display

### Admin Dashboard
- Stats cards with icons
- Alert notifications
- Performance metrics
- Quick action buttons

### Technician Dashboard
- Today's services overview
- Service cards with status badges
- Rating display
- Quick navigation buttons

---

## 🛠️ Tech Stack

### Mobile App (Frontend)
```
📱 Framework: React Native with Expo
🎨 UI Library: Custom components with light blue theme
🔄 State Management: Redux Toolkit
🧭 Navigation: React Navigation (Stack, Tab)
💾 Storage: AsyncStorage
🌐 API Client: Axios
📍 Location: Expo Location
📷 Image: Expo Image Picker
```

### Backend (API)
```
🐍 Framework: FastAPI (Python)
🗄️ Database: PostgreSQL
🔗 ORM: SQLAlchemy
✅ Validation: Pydantic
🔐 Auth: JWT (python-jose)
🔒 Password: Passlib with bcrypt
🚀 Server: Uvicorn
📊 Data Processing: Pandas, OpenPyXL
```

### Development Tools
```
📝 Version Control: Git
🧪 Testing: Pytest (Backend), Jest (Frontend)
📚 API Docs: Swagger UI / ReDoc
🔧 Linting: Flake8, ESLint
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- PostgreSQL 12+
- Expo CLI
- Git

### Quick Start

1. **Clone the Repository**
```bash
git clone <repository-url>
cd LegendLift
```

2. **Setup Backend**
```bash
cd legendlift-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create database
createdb legendlift

# Configure .env
cp .env.example .env
# Edit .env with your database credentials

# Run server
python run.py
```

3. **Setup Mobile App**
```bash
cd legendlift-mobile
npm install
npm start
```

4. **Run on Device**
- iOS: `npm run ios`
- Android: `npm run android`
- Or scan QR code with Expo Go app

### 📚 Detailed Setup

For complete setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📱 Usage

### Default Credentials

**Admin Account:**
- Email: `admin@legendlift.com`
- Password: `admin123`

**Technician Account:**
- Email: `tech@legendlift.com`
- Password: `tech123`

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📂 Project Structure

```
LegendLift/
├── legendlift-mobile/          # React Native Mobile App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Button, Card, Input, etc.
│   │   ├── screens/            # App screens
│   │   │   ├── auth/           # Login screens
│   │   │   ├── admin/          # Admin screens
│   │   │   └── technician/     # Technician screens
│   │   ├── navigation/         # Navigation setup
│   │   ├── store/              # Redux store & slices
│   │   ├── constants/          # Theme, constants
│   │   │   └── theme.js        # Light blue theme
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Utility functions
│   ├── App.js                  # Root component
│   └── package.json
│
├── legendlift-backend/         # Python FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/      # API routes
│   │   ├── core/               # Config, security
│   │   ├── db/                 # Database session
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   └── run.py                  # Run script
│
├── Route chart APP Sample.xlsx     # Sample data
├── Legend Maintenance Master...    # Sample data
├── PROJECT_SUMMARY.md          # Project overview
├── SETUP_GUIDE.md              # Detailed setup guide
└── README.md                   # This file
```

---

## 🎨 Theme & Design

### Color Palette (Light Blue)
```
Primary: #4FC3F7 (Light Blue 300)
Primary Dark: #0288D1 (Light Blue 700)
Primary Light: #B3E5FC (Light Blue 100)
Accent: #29B6F6 (Light Blue 400)

Success: #66BB6A (Green)
Warning: #FFA726 (Orange)
Error: #EF5350 (Red)
```

### Design System
- **Buttons**: Primary, Secondary, Outline, Danger variants
- **Cards**: With shadow, padding, and custom borders
- **Inputs**: With icons, validation, and error states
- **Badges**: Status indicators with color variants
- **Headers**: Gradient backgrounds with icons

---

## 📊 Database Schema

### Main Tables
1. **users** - Admin and technician accounts
2. **customers** - Customer information with GPS
3. **amc_contracts** - AMC contract details
4. **service_schedules** - Scheduled services
5. **service_reports** - Completed service reports
6. **payments** - Payment tracking
7. **escalations** - Customer complaints

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- API rate limiting
- Input validation with Pydantic
- SQL injection protection (SQLAlchemy ORM)
- CORS configuration
- Environment variable management

---

## 🧪 Testing

### Backend Tests
```bash
cd legendlift-backend
pytest
```

### Mobile App Tests
```bash
cd legendlift-mobile
npm test
```

---

## 📈 Performance

- **Backend**: FastAPI async support for high concurrency
- **Mobile**: Redux for optimized state management
- **Database**: Indexed queries for fast lookups
- **Caching**: Implemented for frequently accessed data
- **Lazy Loading**: Images and lists load on demand

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Backend API with authentication
- [x] Database models and schemas
- [x] Mobile app structure
- [x] Light blue theme
- [x] Navigation setup
- [x] Login screen
- [x] Admin & Technician dashboards

### Phase 2: Core Features (In Progress)
- [ ] Customer management screens
- [ ] Service scheduling screens
- [ ] Service execution workflow
- [ ] Payment tracking screens
- [ ] Excel data migration

### Phase 3: Advanced Features
- [ ] Push notifications
- [ ] Offline mode with sync
- [ ] Google Maps integration
- [ ] Reports and analytics
- [ ] Image upload to cloud storage

### Phase 4: Polish & Deployment
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] App Store submission
- [ ] Play Store submission
- [ ] User documentation

---

## 🤝 Contributing

This is a proprietary project. For internal development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Request code review

---

## 📄 License

Proprietary - LegendLift © 2024

---

## 👥 Team

- **Project Owner**: LegendLift
- **Development**: Custom Solution
- **Design**: Light Blue Theme
- **Technology**: React Native + Python FastAPI

---

## 📞 Support

For technical support or questions:
- Review documentation in `SETUP_GUIDE.md`
- Check API docs at http://localhost:8000/docs
- Review `PROJECT_SUMMARY.md` for project overview

---

## 🎉 Acknowledgments

- React Native & Expo community
- FastAPI framework
- PostgreSQL database
- Open source contributors

---

<div align="center">

**Built with ❤️ using React Native and Python FastAPI**

**Theme: Light Blue (#4FC3F7)** 🎨

</div>

# LegendLift Backend API

FastAPI backend for LegendLift Elevator AMC Management System

## Features

- **Authentication**: JWT-based authentication with role-based access control (Admin/Technician)
- **Customer Management**: CRUD operations for customers
- **AMC Contract Management**: Manage elevator maintenance contracts
- **Service Scheduling**: Schedule and track service visits
- **Service Reports**: Create detailed service reports with photos and signatures
- **Payment Tracking**: Monitor payments and follow-ups
- **Escalation Management**: Handle customer complaints and issues

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation
- **JWT**: Authentication tokens
- **Uvicorn**: ASGI server

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create PostgreSQL database:
```bash
createdb legendlift
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout

### Customers
- `GET /api/v1/customers` - List all customers
- `GET /api/v1/customers/{id}` - Get customer by ID
- `POST /api/v1/customers` - Create new customer (Admin only)
- `PUT /api/v1/customers/{id}` - Update customer (Admin only)
- `DELETE /api/v1/customers/{id}` - Delete customer (Admin only)

### Services
- `GET /api/v1/services/schedules` - List service schedules
- `GET /api/v1/services/schedules/today` - Get today's services
- `GET /api/v1/services/schedules/{id}` - Get service by ID
- `POST /api/v1/services/schedules` - Create service schedule (Admin only)
- `PUT /api/v1/services/schedules/{id}` - Update service schedule
- `GET /api/v1/services/reports` - List service reports
- `POST /api/v1/services/reports` - Create service report (Check-in)
- `PUT /api/v1/services/reports/{id}` - Update service report (Complete)

## Database Schema

The database consists of the following main tables:
- **users**: Admin and technician users
- **customers**: Customer information
- **amc_contracts**: AMC contract details
- **service_schedules**: Scheduled services
- **service_reports**: Completed service reports
- **payments**: Payment tracking
- **escalations**: Customer complaints

## Creating Initial Admin User

You can create an initial admin user by running:

```python
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.db.session import SessionLocal
import uuid

db = SessionLocal()
admin = User(
    id=str(uuid.uuid4()),
    name="Admin User",
    email="admin@legendlift.com",
    phone="1234567890",
    role=UserRole.ADMIN,
    hashed_password=get_password_hash("admin123"),
    active=True
)
db.add(admin)
db.commit()
db.close()
```

## Development

### Running Tests
```bash
pytest
```

### Code Style
```bash
black .
flake8 .
```

## License

Proprietary - LegendLift

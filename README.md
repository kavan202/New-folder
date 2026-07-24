# AutoVault - Car Dealership Inventory System

AutoVault is a state-of-the-art, full-stack Car Dealership Inventory Management Application. Built with modern software architecture principles (SOLID, TDD, Clean Architecture), it features a **FastAPI** RESTful backend powered by **PostgreSQL** and **SQLAlchemy ORM**, paired with a dark-mode glassmorphic **React SPA** built with **Vite** and **Tailwind CSS**.

---

## 🚀 Key Features & System Capabilities

1. **Login as Entry Point & Protected Routes**:
   - `/` automatically redirects unauthenticated visitors to `/login`.
   - React Router protected route guards enforce authentication for `/dashboard`, `/admin`, and `/analytics`.
   - Secure JWT access tokens stored in `localStorage`. Redirects to `/dashboard` upon login and returns to `/login` after logout.

2. **Indian Rupees (₹) Currency & Proper Formatting**:
   - Displays all prices in Indian Rupees (`₹`) formatted using the standard Indian numbering format (e.g. `₹1,65,00,000`, `₹7,29,000`).
   - Color text formatted in **Proper Case** (e.g. *Iconic Silver*, *Black Sapphire*, *Guards Red*, *Kemora Grey*).

3. **Out-of-Stock Protection**:
   - When vehicle quantity reaches `0`, both **Purchase Vehicle** (`Out of Stock`) and **Book Test Drive** (`Book Test Drive (Disabled)`) buttons are automatically disabled with clear visual feedback and backend API guards.

4. **Customer Purchases & Test Drive Bookings**:
   - Integrated customer purchase flow ([CustomerModal.jsx](file:///e:/project/car_dealership_inventory/frontend/src/components/CustomerModal.jsx)) capturing full name, mobile number, and email.
   - Test Drive booking modal ([TestDriveModal.jsx](file:///e:/project/car_dealership_inventory/frontend/src/components/TestDriveModal.jsx)) scheduling drives without leaving the Dashboard.

5. **Dedicated Business Analytics (`/analytics`)**:
   - Real-time analytics dashboard powered by **Recharts** reading directly from database `sales` and `test_drives` tables.
   - **4 Summary Cards**: Total Purchases, Total Test Drives, Most Purchased Vehicle, Most Test Driven Vehicle (with fallback text when empty).
   - **Vehicle-wise Lists**: Itemized vehicle purchase count and test drive count breakdowns.
   - **2 Bar Charts**: Vehicle Purchase Count Bar Chart and Vehicle Test Drive Count Bar Chart.

6. **Vehicle Inventory & Multi-Criteria Filtering**:
   - Search by Make, Model, Category (*Sedan, SUV, Truck, Electric, Coupe, Luxury, Sports, Convertible, Hatchback, Performance*), Color, Fuel Type (*Petrol, Power Petrol, Diesel, EV, Hybrid*), and Price Range simultaneously.

7. **Synchronized 12-Vehicle Photo Catalog**:
   - Default catalog seeded with 12 exact models and realistic high-resolution images: *Ford F-150 Lightning*, *Chevrolet Corvette Z06*, *Toyota Camry XSE*, *BMW M5 Competition*, *Porsche 911 GT3 RS*, *Audi RS e-tron GT*, *Tata Harrier*, *Tesla Model S Plaid*, *Mercedes-Benz G 63 AMG*, *Hyundai Creta SX*, *Maruti Suzuki Swift VXi*, *Kia Seltos HTX*.

---

## 🛠 Repository & Tech Stack

- **GitHub Repository**: [https://github.com/kavan202/car_dealership_inventory.git](https://github.com/kavan202/car_dealership_inventory.git)

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Database**: PostgreSQL 18 (SQLAlchemy ORM + SQLite in-memory for testing)
- **ORM & Migrations**: SQLAlchemy 2.0 + Alembic
- **Authentication**: OAuth2 + PyJWT + Passlib (bcrypt)
- **Validation**: Pydantic v2 + email-validator
- **Testing**: Pytest + HTTPX

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Custom Glassmorphism System
- **Routing & Networking**: React Router DOM v6 + Axios (with JWT interceptors)
- **Data Visualization**: Recharts

---

## 📁 Project Architecture Overview

```
car-dealership-inventory/
├── backend/
│   ├── alembic/              # Alembic database migration scripts
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models (User, Vehicle, Customer, Sale, TestDrive)
│   │   ├── schemas/          # Pydantic v2 data validation schemas (Auth, Vehicle, Analytics)
│   │   ├── services/         # Business logic layer (UserService, VehicleService, AnalyticsService)
│   │   ├── routers/          # RESTful endpoint handlers (auth_router, vehicle_router, analytics_router)
│   │   ├── auth.py           # JWT generation, verification & RBAC dependencies
│   │   ├── config.py         # Environment configuration settings
│   │   ├── database.py       # SQLAlchemy engine & session dependency
│   │   ├── seed.py           # Database seeder script with 12 photo vehicles
│   │   └── main.py           # FastAPI application entrypoint
│   ├── tests/                # 20 Pytest unit & integration test cases
│   ├── requirements.txt      # Python dependencies
│   └── alembic.ini           # Migration configuration
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, VehicleCard, SearchFilters, CustomerModal, TestDriveModal)
│   │   ├── context/          # AuthContext provider & hooks
│   │   ├── pages/            # View pages (Login, Register, Dashboard, AdminPanel, AnalyticsPanel)
│   │   ├── services/         # Axios API service handlers
│   │   ├── utils/            # formatters.js (formatINR, toProperCase, image mappings)
│   │   ├── App.jsx           # App component with router & protected routes
│   │   ├── index.css         # Tailwind & custom glassmorphism styles
│   │   └── main.jsx          # React DOM entrypoint
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md                 # Complete project documentation
├── PROMPTS.md                # AI transparency & prompt history log
└── .gitignore
```

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- Python 3.12+
- Node.js v18+ & npm
- PostgreSQL 18 (Running locally with user `postgres` and password `admin123`)

### 1. Database Setup
Ensure PostgreSQL is running, then create the `car_inventory` database:
```sql
CREATE DATABASE car_inventory;
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial database with test users & 12 photo vehicles
python app/seed.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
FastAPI interactive Swagger documentation is available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The React SPA will open at `http://localhost:3000`.

---

## 🔑 Default Test Credentials

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | `admin@autovault.com` |
| **Standard User** | `user` | `user123` | `buyer@autovault.com` |

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register a new user account (`UserCreate` body)
- `POST /api/auth/register-admin` - Register an admin account (**Admin Only**)
- `POST /api/auth/login` - Authenticate user & return JWT token (`LoginRequest` body)

### Vehicles (Protected)
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create a new vehicle record
- `GET /api/vehicles/search` - Multi-criteria search (`make`, `model`, `category`, `color`, `fuel_type`, `min_price`, `max_price`)
- `GET /api/vehicles/{id}` - Fetch details of a single vehicle
- `PUT /api/vehicles/{id}` - Update vehicle details
- `DELETE /api/vehicles/{id}` - Delete a vehicle (**Admin Only**)
- `POST /api/vehicles/upload-image` - Upload custom vehicle image file (**Admin Only**)

### Inventory & Test Drive Actions (Protected)
- `POST /api/vehicles/{id}/purchase` - Purchase 1 unit of a vehicle (requires customer details body)
- `POST /api/vehicles/{id}/restock` - Restock vehicle inventory (**Admin Only**)
- `POST /api/test-drives` - Schedule a vehicle test drive booking

### Business Analytics (Protected)
- `GET /api/analytics` - Fetch DB metrics (total purchases, test drives, top vehicles, vehicle purchase/test drive count lists)

---

## 🧪 Backend Test Report (Pytest)

Run the full Pytest suite from the `backend/` directory:
```bash
pytest -v
```

### Test Suite Execution Summary (20 Passed)
```
============================= test session starts =============================
platform win32 -- Python 3.12.2, pytest-8.1.1, pluggy-1.6.0
collected 20 items

tests/test_auth.py::test_register_user_success PASSED                    [  5%]
tests/test_auth.py::test_register_duplicate_username PASSED              [ 10%]
tests/test_auth.py::test_login_success PASSED                            [ 15%]
tests/test_auth.py::test_login_invalid_credentials PASSED                [ 20%]
tests/test_auth.py::test_register_admin_unauthorized PASSED              [ 25%]
tests/test_auth.py::test_register_admin_by_existing_admin PASSED         [ 30%]
tests/test_user_model.py::test_user_creation PASSED                      [ 35%]
tests/test_user_model.py::test_admin_user_role PASSED                    [ 40%]
tests/test_user_model.py::test_user_schema_validation PASSED             [ 45%]
tests/test_vehicles.py::test_create_vehicle PASSED                       [ 50%]
tests/test_vehicles.py::test_list_vehicles PASSED                        [ 55%]
tests/test_vehicles.py::test_update_vehicle PASSED                       [ 60%]
tests/test_vehicles.py::test_delete_vehicle_forbidden_for_normal_user PASSED [ 65%]
tests/test_vehicles.py::test_delete_vehicle_success_for_admin PASSED     [ 70%]
tests/test_vehicles.py::test_search_vehicles_filtering PASSED            [ 75%]
tests/test_vehicles.py::test_purchase_vehicle_success PASSED             [ 80%]
tests/test_vehicles.py::test_purchase_vehicle_out_of_stock PASSED        [ 85%]
tests/test_vehicles.py::test_book_test_drive PASSED                      [ 90%]
tests/test_vehicles.py::test_upload_vehicle_image PASSED                 [ 95%]
tests/test_vehicles.py::test_analytics_dashboard_admin_only PASSED       [100%]

================------- 20 passed in 3.41s =======================
```

---

## 🤖 My AI Usage

### 1. Tools Used
- **Antigravity AI (Google DeepMind)**: Leveraged as pair-programming agentic AI for software architecture, TDD test authoring, database migrations, React components, Recharts visualizations, and documentation.

### 2. How AI Was Leveraged
- **Architecture & System Refinement**: Structured clean database models (`User`, `Vehicle`, `Customer`, `Sale`, `TestDrive`), schemas, and services.
- **TDD Test Expansion**: Wrote 20 Pytest unit and integration test cases ensuring 100% test passing before deployment.
- **UI & Visualization Excellence**: Built responsive dark glassmorphism layouts, Recharts bar graphs, proper case text utilities, and INR currency formatting.

---

## 📄 License
MIT License - AutoVault Car Dealership Inventory System

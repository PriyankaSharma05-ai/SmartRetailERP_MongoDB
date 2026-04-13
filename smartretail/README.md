# 🏪 SmartRetail ERP System

A production-grade, full-stack Retail ERP system combining **RetailTech + FinTech** with AI-powered insights.

**Stack:** Spring Boot 3.2 · React 18 · MySQL 8 · JWT · WebSocket · Claude AI

---

## 📁 Project Structure

```
smartretail/
├── backend/                    ← Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/smartretail/
│       ├── SmartRetailApplication.java
│       ├── config/             ← Security, WebSocket, CORS
│       ├── controller/         ← REST API controllers
│       ├── dto/                ← Request/Response DTOs
│       ├── entity/             ← JPA Entities
│       ├── exception/          ← Global exception handling
│       ├── repository/         ← Spring Data JPA repositories
│       ├── security/           ← JWT auth, filters
│       └── service/            ← Business logic
├── frontend/                   ← React + Tailwind application
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx             ← Routes
│       ├── main.jsx            ← Entry point
│       ├── components/
│       │   ├── common/UI.jsx   ← Reusable components
│       │   ├── layout/AppLayout.jsx
│       │   └── pages/          ← All page components
│       ├── services/api.js     ← Axios API calls
│       ├── store/authStore.js  ← Zustand auth state
│       └── utils/helpers.js    ← Utility functions
└── database/
    └── schema.sql              ← MySQL schema + seed data
```

---

## ⚙️ Prerequisites

| Tool         | Version  | Download |
|--------------|----------|----------|
| Java JDK     | 17+      | https://adoptium.net |
| Maven        | 3.9+     | https://maven.apache.org |
| Node.js      | 18+      | https://nodejs.org |
| MySQL        | 8.0+     | https://dev.mysql.com/downloads |
| IntelliJ IDEA| Any      | https://www.jetbrains.com/idea |

---

## 🚀 STEP-BY-STEP SETUP

### Step 1 — Database Setup

1. Open MySQL Workbench or any MySQL client
2. Run the database script:

```sql
source /path/to/smartretail/database/schema.sql
```

Or copy-paste the contents of `database/schema.sql` into MySQL Workbench and execute.

This creates the database, all tables, and seeds sample data automatically.

---

### Step 2 — Backend Setup (Spring Boot)

1. **Open IntelliJ IDEA**
2. Click `File → Open` → select the `smartretail/backend` folder
3. IntelliJ will detect the Maven project and import dependencies automatically (wait for indexing)

4. **Configure database connection** in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartretail_db?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
spring.datasource.username=root          ← change to your MySQL username
spring.datasource.password=root          ← change to your MySQL password
```

5. **Run the application:**
   - Open `SmartRetailApplication.java`
   - Click the green ▶ Run button (or press `Shift+F10`)
   - Backend starts on **http://localhost:8080**

6. **Verify it's running:**
   - Open browser: http://localhost:8080/swagger-ui.html
   - You should see the Swagger API documentation

---

### Step 3 — Frontend Setup (React)

Open a terminal and run:

```bash
# Navigate to frontend directory
cd smartretail/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend starts on **http://localhost:3000**

---

### Step 4 — Open the Application

Open your browser and go to: **http://localhost:3000**

**Demo Login Credentials:**

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123`|
| Owner | `owner`  | `admin123`|
| Staff | `staff1` | `admin123`|

---

## 🌐 API Endpoints

| Module      | Endpoint              | Description |
|-------------|----------------------|-------------|
| Auth        | POST /api/auth/login | Login, get JWT |
| Auth        | POST /api/auth/register | Register user |
| Products    | GET /api/products    | Get all products |
| Products    | POST /api/products   | Create product |
| Products    | GET /api/products/low-stock | Low stock alerts |
| Orders      | POST /api/orders     | Create POS order |
| Orders      | GET /api/orders      | Get all orders |
| Customers   | GET /api/customers   | Get all customers |
| Suppliers   | GET /api/suppliers   | Get all suppliers |
| Dashboard   | GET /api/dashboard   | KPIs & analytics |
| Reports     | GET /api/reports     | Date-range reports |

Full API docs: http://localhost:8080/swagger-ui.html

---

## ✨ Features

### 🛒 POS Billing System
- Click-to-add product cart
- Barcode scanning support
- GST calculation per product
- Flat & percentage discounts
- Multi-payment modes (Cash, UPI, Card, Part Payment)
- Due tracking & partial payment
- Invoice generation with print/PDF

### 📦 Inventory Management
- Full CRUD with loss detection (SP < CP warning)
- Category filtering & barcode search
- Low stock & out-of-stock alerts
- Stock movement history

### 📊 Dashboard & Reports
- Live KPI cards (Revenue, Profit, Orders, Stock)
- Weekly sales bar chart
- Category donut chart
- Top products analysis
- Export to Excel/PDF

### 🤖 AI Assistant (Claude-powered)
- Real-time business Q&A
- Auto daily business summary
- Smart basket analysis (Market basket)
- Why did sales drop? analyzer
- Auto-restock suggestions

### 👥 CRM & Suppliers
- Customer loyalty points system
- Purchase history tracking
- Supplier payment due tracking
- Purchase order management

### 🔒 Security
- JWT authentication
- Role-based access (Admin/Owner/Staff)
- Password BCrypt encryption
- Global exception handling

---

## 🛠 Troubleshooting

**Backend won't start:**
- Check MySQL is running: `sudo service mysql start` (Linux) or start MySQL from Services (Windows)
- Verify credentials in `application.properties`
- Check port 8080 is not already in use

**Frontend API calls failing:**
- Ensure backend is running on port 8080
- Check `frontend/.env` has correct `VITE_API_URL=http://localhost:8080`
- The frontend works with mock data even without the backend

**MySQL connection refused:**
- Make sure `allowPublicKeyRetrieval=true` is in the JDBC URL
- Try: `spring.datasource.url=jdbc:mysql://127.0.0.1:3306/smartretail_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`

---

## 📦 Build for Production

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/smartretail-backend-1.0.0.jar

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or any static server
```

---

## 🏗 Technology Stack

| Layer       | Technology |
|-------------|------------|
| Backend     | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database    | MySQL 8.0 |
| Auth        | JWT (jjwt 0.11.5) |
| Real-time   | WebSocket + STOMP |
| Frontend    | React 18, React Router 6 |
| Styling     | Tailwind CSS 3.4 |
| Charts      | Recharts |
| State       | Zustand |
| API Client  | Axios |
| AI          | Claude claude-sonnet-4-20250514 API |
| PDF Export  | jsPDF + AutoTable |
| Excel       | SheetJS (xlsx) |

---

## 📝 Notes

- The **frontend works standalone** with mock data even if the backend is not running
- All mock data mirrors the database seed data for consistency
- The AI Assistant requires an internet connection to reach the Claude API
- WebSocket real-time updates work when both backend and frontend are running

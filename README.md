# 🛒 SmartRetail ERP

A complete ERP system for modern retail businesses, built with **Spring Boot + React + MongoDB Atlas**.

🔗 **Live Demo:** [https://grand-cajeta-4fa1fe.netlify.app](https://grand-cajeta-4fa1fe.netlify.app)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login with role-based access (Admin, Owner, Staff)
- 📦 **Inventory Management** — Add, edit, track products with stock alerts
- 🧾 **POS Billing** — Point of sale with GST calculation and receipt printing
- 📋 **Orders Management** — Create and track customer orders
- 👥 **Customer Management** — Manage customer profiles and purchase history
- 🏭 **Supplier Management** — Track suppliers and purchase orders
- 📊 **Reports & Analytics** — Daily sales, revenue charts, top products
- 🤖 **AI Assistant** — Gemini AI powered retail assistant
- 🔔 **Real-time Notifications** — WebSocket-based live updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Spring Boot 3.2, Java 17 |
| Database | MongoDB Atlas |
| Auth | JWT (HS512) |
| Deployment | Netlify (frontend) + Render (backend) |
| AI | Google Gemini API |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB Atlas account

### Backend Setup

```bash
cd smartretail/backend
```

Update `src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

Run the backend:
```bash
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd smartretail/frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
VITE_GEMINI_KEY=your_gemini_api_key
```

Run the frontend:
```bash
npm run dev
```

---

## 🌐 Deployment

### Backend — Render
| Setting | Value |
|---------|-------|
| Root Directory | `smartretail/backend` |
| Dockerfile Path | `smartretail/backend/Dockerfile` |

**Environment Variables:**
```
SPRING_DATA_MONGODB_URI = mongodb+srv://...
APP_JWT_SECRET = your_jwt_secret
CORS_ALLOWED_ORIGINS = https://your-frontend.netlify.app
JAVA_OPTS = -Xmx256m -Xms128m
```

### Frontend — Netlify
| Setting | Value |
|---------|-------|
| Base Directory | `smartretail/frontend` |
| Build Command | `npm run build` |
| Publish Directory | `smartretail/frontend/dist` |

**Environment Variables:**
```
VITE_API_URL = https://your-backend.onrender.com
VITE_GEMINI_KEY = your_gemini_api_key
```

---

## 🔑 Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Owner | `owner` | `admin123` |
| Staff | `staff1` | `admin123` |

---

## 📁 Project Structure

```
SmartRetailERP_MongoDB/
├── smartretail/
│   ├── backend/          # Spring Boot application
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   ├── frontend/         # React application
│   │   ├── src/
│   │   ├── .env
│   │   └── package.json
│   └── database/
│       └── schema.sql
└── .gitignore
```

---

## 📝 API Documentation

Once the backend is running, visit:
```
http://localhost:8080/swagger-ui.html
```

---

## 👩‍💻 Author

**Priyanka Sharma** — [@PriyankaSharma05-ai](https://github.com/PriyankaSharma05-ai)

# ⚡ WorkBridge — Full-Stack Job Portal

A role-based job listing platform built with the **MERN stack** (MongoDB, Express, React, Node.js) and **JWT authentication**.

---

## 📁 Project Structure

```
workbridge/
├── backend/                  # Express REST API
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── seed.js           # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js           # JWT protect + authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── JobCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── JobDetail.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx    # Routes to seeker/employer
    │   │   ├── SeekerDashboard.jsx
    │   │   └── EmployerDashboard.jsx
    │   ├── utils/
    │   │   └── api.js           # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))

---

### 1. Clone & install

```bash
# Backend
cd workbridge/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
```

```bash
# Frontend
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api  (default)
```

---

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates demo users:
| Email | Password | Role |
|---|---|---|
| alice@email.com | pass123 | Job Seeker |
| bob@email.com   | pass123 | Employer |
| sara@email.com  | pass123 | Job Seeker |

---

### 4. Run the app

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open **http://localhost:3000**

---

## 🔐 API Endpoints

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login`    | Public |
| GET  | `/api/auth/me`       | Private |
| PUT  | `/api/auth/update-password` | Private |

### Jobs
| Method | Route | Access |
|--------|-------|--------|
| GET    | `/api/jobs`            | Public |
| GET    | `/api/jobs/:id`        | Public |
| POST   | `/api/jobs`            | Employer |
| PUT    | `/api/jobs/:id`        | Employer (owner) |
| DELETE | `/api/jobs/:id`        | Employer (owner) |
| GET    | `/api/jobs/employer/my`| Employer |

### Applications
| Method | Route | Access |
|--------|-------|--------|
| POST   | `/api/applications/:jobId`    | Seeker |
| GET    | `/api/applications/my`        | Seeker |
| GET    | `/api/applications/job/:jobId`| Employer |
| PUT    | `/api/applications/:id/status`| Employer |
| DELETE | `/api/applications/:id`       | Seeker |

### Users
| Method | Route | Access |
|--------|-------|--------|
| GET    | `/api/users/profile`   | Private |
| PUT    | `/api/users/profile`   | Private |
| POST   | `/api/users/save/:jobId`| Seeker |

---

## 🌟 Features

### Job Seekers
- Browse and search jobs with smart filters (type, category, remote, keyword)
- Apply with cover letter and portfolio URL
- Save/bookmark jobs
- Dashboard: application pipeline, status tracking, profile editor

### Employers
- Post job listings with full details
- View all applicants per listing
- Update candidate status (applied → review → interview → offered/rejected)
- Dashboard: metrics, listing management

### Auth & Security
- JWT tokens stored in localStorage
- Bcrypt password hashing (salt rounds: 10)
- Role-based route protection (seeker / employer / admin)
- Auto-logout on token expiry (401 interceptor)

---

## 🚢 Deployment

### Backend — Railway / Render / Heroku
```bash
# Set environment variables:
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
NODE_ENV=production
```

### Frontend — Vercel / Netlify
```bash
npm run build
# Set REACT_APP_API_URL to your deployed backend URL
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State | Context API + useState/useEffect |
| HTTP | Axios with interceptors |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcryptjs |
| Validation | express-validator |
| Notifications | react-toastify |

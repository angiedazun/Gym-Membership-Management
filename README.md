# 🏋️ Gym Membership Management System

A full-stack web application for managing gym memberships, members, trainers, attendance, payments, and more — built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 📸 Features

- **Authentication** — JWT-based login, forgot/reset password with email OTP
- **Dashboard** — Real-time KPIs: active members, revenue, attendance stats
- **Member Management** — Add, edit, view, and deactivate members with profile photo uploads
- **Trainer Management** — Manage trainers with assigned specializations
- **Attendance Tracking** — QR code check-in/check-out with daily logs
- **Membership Plans** — Create and manage flexible membership plans
- **Payments** — Record and track member payments with status history
- **Reports** — Export reports to PDF/Excel
- **Notifications** — In-app alerts for expiring memberships and payments
- **Settings** — User profile & gym configuration

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible component primitives |
| Recharts | Dashboard charts & analytics |
| Framer Motion | Animations |
| Axios | HTTP client |
| jsPDF + AutoTable | PDF export |
| XLSX | Excel export |
| html5-qrcode / qrcode.react | QR code scanning & generation |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| Bcryptjs | Password hashing |
| Multer | File uploads |
| Nodemailer | Email notifications |
| Node-cron | Scheduled tasks |
| QRCode | QR code generation |
| Express Validator | Input validation |

---

## 📁 Project Structure

```
Gym-Membership-Management/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Auth & upload middleware
│   ├── models/             # Mongoose data models
│   ├── routes/             # Express API routes
│   ├── services/           # Email service
│   ├── uploads/            # Member photo uploads
│   ├── seedData.js         # Database seed script
│   └── server.js           # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios configuration
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context (Auth)
    │   └── pages/          # Application pages/views
    ├── index.html
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm or yarn

---

### 1. Clone the Repository

```bash
git clone https://github.com/angiedazun/Gym-Membership-Management.git
cd Gym-Membership-Management
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gym_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Nodemailer (e.g. Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Optionally seed the database with sample data:

```bash
npm run seed
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📡 API Endpoints

| Resource | Base Route |
|---|---|
| Auth | `/api/auth` |
| Members | `/api/members` |
| Trainers | `/api/trainers` |
| Plans | `/api/plans` |
| Attendance | `/api/attendance` |
| Payments | `/api/payments` |
| Dashboard | `/api/dashboard` |
| Users | `/api/users` |

---

## 🔐 Environment Variables Summary

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | backend/.env | MongoDB connection string |
| `JWT_SECRET` | backend/.env | JWT signing secret |
| `JWT_EXPIRE` | backend/.env | JWT expiry duration |
| `EMAIL_*` | backend/.env | SMTP email credentials |
| `CLIENT_URL` | backend/.env | Frontend origin URL |
| `VITE_API_URL` | frontend/.env | Backend API base URL |

---

## 📜 Scripts

### Backend
| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm run seed` | Seed database with sample data |

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ for gym management efficiency.

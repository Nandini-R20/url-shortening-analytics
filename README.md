# 🔗 lnk.sh — URL Shortener & Analytics

A full-stack URL shortener with real-time click analytics, QR code generation, and a sleek dashboard.

![Tech Stack](https://img.shields.io/badge/Frontend-TanStack%20Start-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen)

---

## ✨ Features

- 🔗 **Shorten URLs** — Generate short links instantly
- 🎯 **Custom Aliases** — Choose your own short code
- 📊 **Click Analytics** — Track total clicks, browsers, devices, OS
- 📈 **Daily Trend Chart** — 14-day click timeline
- 📱 **QR Code Generation** — Auto-generated for every link
- 🔐 **Auth System** — JWT-based register & login
- 🌍 **Instant Redirect** — Sub-millisecond redirect on short link visit

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TanStack Start (React + SSR), TypeScript |
| Styling | Tailwind CSS, custom glassmorphism design |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| QR Codes | `qrcode` npm package |

---

## 📁 Project Structure

```
url-shortener-analytics/
├── backend/
│   ├── controllers/       # authController, urlController, analyticsController
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # User, Url, Click, Visit schemas
│   ├── routes/            # authRoutes, urlRoutes, analyticsRoutes
│   ├── config/            # MongoDB connection
│   └── server.js          # Express app entry point
├── frontend/
│   └── src/
│       ├── routes/        # signup, login, dashboard, analytics pages
│       ├── components/    # AppShell, Charts, UI components
│       └── lib/           # api client, stores, hooks
├── package.json           # Monorepo scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/url-shortener-analytics.git
cd url-shortener-analytics
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
BASE_URL=http://localhost:5000
```

### 4. Run the app
```bash
npm run dev
```

- Frontend: `http://localhost:8082`
- Backend API: `http://localhost:5000`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### URLs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/url/create` | Shorten a URL |
| GET | `/api/url/myurls` | Get all my URLs |
| DELETE | `/api/url/:id` | Delete a URL |
| GET | `/api/url/:id/analytics` | Get analytics for URL |
| GET | `/:shortCode` | Redirect to original URL |

---

## 📸 Pages

- `/` — Landing page
- `/signup` — Create account
- `/login` — Sign in
- `/dashboard` — Manage links
- `/analytics` — View click analytics

---

## 📄 License

MIT — free to use and modify.

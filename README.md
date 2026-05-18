# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack, TypeScript, and Docker.

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, TypeScript, TailwindCSS, Zustand, React Query |
| Backend   | Node.js, Express, TypeScript                      |
| Database  | MongoDB + Mongoose                                |
| Auth      | JWT + bcrypt                                      |
| DevOps    | Docker, Docker Compose, Nginx                     |

## Features

- **JWT Authentication** — Register, Login, protected routes, bcrypt password hashing
- **Lead CRUD** — Create, Read, Update, Delete leads with full validation
- **Advanced Filtering** — Filter by status, source, search (name/email), sort by date; all filters combine
- **Debounced Search** — 400ms debounce to avoid excessive API calls
- **Backend Pagination** — `skip`/`limit` with full metadata (total, pages, hasNext, hasPrev)
- **CSV Export** — Export filtered leads as a downloadable `.csv` file
- **Role-Based Access Control** — `admin` (full access) vs `sales` (own leads only; no delete)
- **Docker Setup** — Full containerised stack with `docker-compose`

## Project Structure

```
smart-leads/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # auth.controller, lead.controller
│   │   ├── middleware/     # auth, errorHandler
│   │   ├── models/         # User, Lead (Mongoose)
│   │   ├── routes/         # auth.routes, lead.routes
│   │   ├── types/          # Shared TypeScript interfaces
│   │   ├── utils/          # jwt, response helpers
│   │   ├── validators/     # express-validator rules
│   │   └── index.ts        # Express app entry
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + API functions
│   │   ├── components/
│   │   │   ├── auth/       # ProtectedRoute
│   │   │   ├── layout/     # Navbar, Layout
│   │   │   ├── leads/      # LeadTable, LeadForm, FiltersBar, Pagination
│   │   │   └── ui/         # Button, Badge, Input, Select, Modal, Spinner, EmptyState
│   │   ├── hooks/          # useLeads, useDebounce
│   │   ├── pages/          # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── store/          # Zustand authStore
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Router setup
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.ts
│   └── package.json
└── docker-compose.yml
```

## Setup Instructions

### Option 1 — Docker (Recommended)

```bash
git clone <your-repo-url>
cd smart-leads

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set a strong JWT_SECRET

docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api  
- MongoDB: localhost:27017

### Option 2 — Local Development

**Prerequisites:** Node.js 20+, MongoDB running locally

```bash
# Backend
cd backend
cp .env.example .env         # fill in your values
npm install
npm run dev                  # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint          | Auth | Description        |
|--------|-------------------|------|--------------------|
| POST   | `/auth/register`  | ❌   | Register new user  |
| POST   | `/auth/login`     | ❌   | Login              |
| GET    | `/auth/me`        | ✅   | Get current user   |

**Register / Login body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Secret123",
  "role": "sales"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "sales" }
  }
}
```

### Leads

All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint         | Role        | Description               |
|--------|------------------|-------------|---------------------------|
| GET    | `/leads`         | admin+sales | List leads (filtered)     |
| GET    | `/leads/export`  | admin+sales | Export filtered CSV       |
| GET    | `/leads/:id`     | admin+sales | Get single lead           |
| POST   | `/leads`         | admin+sales | Create lead               |
| PUT    | `/leads/:id`     | admin+sales | Update lead               |
| DELETE | `/leads/:id`     | admin only  | Delete lead               |

**GET /leads — Query Parameters:**

| Param    | Type                              | Default  |
|----------|-----------------------------------|----------|
| `status` | `New\|Contacted\|Qualified\|Lost` | —        |
| `source` | `Website\|Instagram\|Referral`    | —        |
| `search` | string                            | —        |
| `sort`   | `latest\|oldest`                  | `latest` |
| `page`   | number                            | `1`      |
| `limit`  | number                            | `10`     |

**Paginated Response:**
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Lead object:**
```json
{
  "_id": "...",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in premium plan",
  "createdBy": { "_id": "...", "name": "...", "email": "..." },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                        | Default         |
|----------------|------------------------------------|-----------------|
| `PORT`         | Server port                        | `5000`          |
| `NODE_ENV`     | Environment                        | `development`   |
| `MONGODB_URI`  | MongoDB connection string          | —               |
| `JWT_SECRET`   | Secret for signing JWTs            | —               |
| `JWT_EXPIRES_IN` | Token expiry                     | `7d`            |
| `CLIENT_URL`   | Frontend URL (CORS)                | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable        | Description       | Default                     |
|-----------------|-------------------|-----------------------------|
| `VITE_API_URL`  | Backend API URL   | `http://localhost:5000/api` |

## RBAC Summary

| Action           | Admin | Sales (own leads) |
|------------------|-------|-------------------|
| Create lead      | ✅    | ✅                |
| View all leads   | ✅    | ❌ (own only)     |
| Update lead      | ✅    | ✅ (own only)     |
| Delete lead      | ✅    | ❌                |
| Export CSV       | ✅    | ✅ (own only)     |

## Git Commit Conventions

```
feat: add lead CSV export
fix: debounce search not resetting page
chore: add Docker setup
refactor: extract pagination component
```

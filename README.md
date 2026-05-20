# 🎓 InternHub

> A full-stack internship management platform connecting **Students**, **Companies**, and **Administrators** — built with Laravel + React.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
  - [Student Dashboard](#-student-dashboard)
  - [Company Dashboard](#-company-dashboard)
  - [Admin Dashboard](#-admin-dashboard)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Laravel)](#backend-setup-laravel)
  - [Frontend Setup (React)](#frontend-setup-react)
- [Environment Variables](#-environment-variables)
- [Authentication & Security](#-authentication--security)
- [Role-Based Access Control](#-role-based-access-control)
- [Contributing](#-contributing)

---

## 🌐 Overview

**InternHub** is a comprehensive internship management platform designed to streamline the entire internship lifecycle — from job posting and application to verification, analytics, and administrative oversight.

| Role | Description |
|---|---|
| 🎓 **Student** | Browse internships, apply, track applications, manage profile & resume |
| 🏢 **Company** | Post internships, manage listings, review applicants, get verified |
| 🛡️ **Admin** | Oversee all platform activity, manage users, verify companies, configure system |

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | **Laravel 11** |
| Authentication | **Laravel Sanctum** (token-based) |
| Database | **MySQL** |
| File Storage | **Laravel Storage** (local / S3-compatible) |
| API Style | **RESTful JSON API** |

### Frontend
| Layer | Technology |
|---|---|
| Framework | **React 18** |
| Routing | **React Router DOM v6** |
| HTTP Client | **Axios** |
| Styling | **Tailwind CSS** |
| Icons | Custom inline SVG (`Ico` component) |
| Font | **DM Sans** + **Outfit** (Google Fonts) |

---

## ✨ Features

### 🎓 Student Dashboard

| Feature | Description |
|---|---|
| **Browse Jobs** | Search and filter internship listings by keyword, location, type |
| **Apply** | One-click application with resume upload |
| **My Applications** | Track application statuses (pending, reviewed, accepted, rejected) |
| **Profile** | Manage personal info, skills, education, work experience, projects, LinkedIn, GitHub, portfolio |
| **Resume** | Upload / replace / delete PDF resume |
| **Avatar** | Upload profile picture |
| **Notifications** | Real-time in-app notifications for application updates |
| **Support** | Submit support tickets and chat with admin |
| **Session Timeout** | Auto-logout warning with "Stay Logged In" option |

### 🏢 Company Dashboard

| Feature | Description |
|---|---|
| **Dashboard Home** | Live stats — active listings, total applicants, pending reviews |
| **Post Internship** | Create listings with title, description, requirements, deadline, type |
| **Manage Jobs** | Edit and delete existing listings |
| **Applicants** | View and filter applicants, update application statuses |
| **Company Profile** | Set company name, industry, description, website, location, logo |
| **Verification** | Submit verification documents (business cert, tax docs, HR letter) |
| **Notifications** | Alerts for verification decisions and application activity |
| **Support** | Submit and track support tickets |
| **Session Timeout** | Auto-logout with session warning modal |

### 🛡️ Admin Dashboard

| Feature | Description |
|---|---|
| **Dashboard Overview** | Platform-wide KPIs — total students, companies, listings, applications |
| **Student Management** | View, search, filter, suspend, restore, and delete student accounts |
| **Company Management** | View, search, filter, suspend, restore, and delete company accounts |
| **Company Verification** | Review submitted documents, approve / reject / request resubmission |
| **Internship Management** | Oversee all listings, change status, remove inappropriate content |
| **Applications** | View all applications across the platform, flag suspicious ones |
| **Content Moderation** | Monitor flagged content and listings requiring review |
| **Announcements** | Create, edit, delete platform-wide or targeted announcements |
| **Support Center** | View all support tickets, reply to users, update ticket status |
| **Reports & Analytics** | Charts for registrations, applications, verification trends |
| **Login Logs** | Track every login, logout, and session timeout across all user roles |
| **Audit Logs** | Tamper-evident trail of every admin action (approve, reject, delete, suspend, etc.) |
| **Roles & Permissions** | View and manage role-based permission matrix |
| **System Settings** | Control platform settings: maintenance mode, max applications, auto-approve listings, registration gates |
| **Admin Profile** | Update name, email, bio, avatar, and change password |
| **Notifications** | Admin-specific in-app notifications |
| **Session Timeout** | Auto-logout protection with session warning modal |

---

## 📁 Project Structure

```
InternHub project/
├── internhub-backend/          # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # 27 API controllers
│   │   │   └── Middleware/     # role, maintenance
│   │   ├── Models/             # Eloquent models
│   │   └── Providers/
│   ├── database/
│   │   └── migrations/         # 20 migration files
│   └── routes/
│       └── api.php             # All API routes
│
└── internhub-frontend/         # React 18 SPA
    └── src/
        ├── App.js              # Root router
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── hooks/
        │   └── useSessionTimeout.js
        ├── services/
        │   └── api.js          # Axios instance
        ├── components/         # Shared UI components
        └── pages/
            ├── auth/           # Login, Register
            ├── student/        # Student dashboard + pages
            ├── company/        # Company dashboard + pages
            ├── admin/          # Admin dashboard + pages
            └── shared/         # SupportPage, ChatWidget
```

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `users` | All platform users (role: student / company / admin) |
| `student_profiles` | Extended student profile data, resume, avatar |
| `company_profiles` | Company details, logo, verification status |
| `company_verifications` | Verification document submissions & review history |
| `internship_listings` | Internship postings by companies |
| `applications` | Student applications to internship listings |
| `notifications` | In-app notifications for all user roles |
| `announcements` | Admin-created platform-wide announcements |
| `login_logs` | Login, logout, and session timeout events |
| `audit_logs` | Admin action audit trail |
| `support_tickets` | User-submitted support tickets |
| `support_messages` | Messages within support ticket threads |
| `role_permissions` | Permission matrix per role |
| `system_settings` | Platform configuration values |
| `admin_notifications` | Notifications specific to admin accounts |
| `personal_access_tokens` | Laravel Sanctum tokens |

---

## 📡 API Reference

All API routes are prefixed with `/api`. Protected routes require a `Bearer` token header:

```
Authorization: Bearer <sanctum_token>
```

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Authenticate and get token |
| POST | `/api/logout` | Revoke token |
| POST | `/api/timeout` | Record session timeout event |
| GET | `/api/me` | Get current authenticated user |

### Student Routes (`/api/student/*`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/student/dashboard` | Dashboard stats |
| GET | `/student/internships` | Browse listings |
| POST | `/student/apply` | Apply for internship |
| GET | `/student/applications` | My applications |
| GET/PUT | `/profile` | View / update student profile |
| POST | `/profile/resume` | Upload resume |
| DELETE | `/profile/resume` | Delete resume |
| POST | `/profile/avatar` | Upload avatar |
| GET/PATCH | `/student/notifications` | Notifications |
| GET/POST | `/student/support-tickets` | Support tickets |

### Company Routes (`/api/company/*`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/company/dashboard` | Dashboard stats |
| GET/POST/PATCH | `/company/profile` | Company profile |
| GET/POST/PUT/DELETE | `/company/internships` | Manage listings |
| GET | `/company/applications` | Received applications |
| PATCH | `/company/applications/{id}/status` | Update application status |
| GET/PATCH | `/company/notifications` | Notifications |
| GET/POST | `/company/support-tickets` | Support tickets |

### Admin Routes (`/api/admin/*`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Platform overview stats |
| GET/PATCH/DELETE | `/admin/students/{id}` | Manage students |
| GET/PATCH/DELETE | `/admin/companies/{id}` | Manage companies |
| GET/POST | `/admin/verifications/{id}/review` | Company verification |
| GET/PATCH/DELETE | `/admin/internships` | Internship oversight |
| GET/PATCH | `/admin/applications` | All applications |
| GET/POST/PUT/DELETE | `/admin/announcements` | Announcements |
| GET | `/admin/login-logs` | Login logs |
| GET | `/admin/audit-logs` | Audit logs |
| GET/PATCH | `/admin/role-permissions` | Permissions |
| GET/PATCH/POST | `/admin/settings` | System settings |
| GET/POST | `/admin/support-tickets` | Support center |
| GET/PATCH | `/admin/notifications` | Admin notifications |
| GET/PATCH | `/admin/profile` | Admin profile |

---

## 🚀 Getting Started

### Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x & **npm** >= 9.x
- **MySQL** >= 8.0
- **Git**

---

### Backend Setup (Laravel)

```bash
# 1. Navigate to the backend directory
cd internhub-backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure your database in .env (see below)

# 6. Run all migrations
php artisan migrate

# 7. (Optional) Seed initial data
php artisan db:seed

# 8. Create storage symlink for file uploads
php artisan storage:link

# 9. Start the development server
php artisan serve
```

The backend API will be available at: **`http://127.0.0.1:8000`**

---

### Frontend Setup (React)

```bash
# 1. Navigate to the frontend directory
cd internhub-frontend

# 2. Install Node dependencies
npm install

# 3. Start the development server
npm start
```

The frontend will be available at: **`http://localhost:3000`**

---

## 🔐 Environment Variables

Create a `.env` file in `internhub-backend/` with the following:

```env
APP_NAME=InternHub
APP_ENV=local
APP_KEY=                        # Generated by php artisan key:generate
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=internhub           # Your MySQL database name
DB_USERNAME=root                # Your MySQL username
DB_PASSWORD=                    # Your MySQL password

FILESYSTEM_DISK=public          # For file uploads (resume, avatar, company docs)

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=cookie
```

> **Frontend API Base URL**: The frontend is hardcoded to `http://127.0.0.1:8000/api`. Change the `API_BASE` constant in `src/services/api.js` if your backend runs on a different port.

---

## 🔑 Authentication & Security

InternHub uses **Laravel Sanctum** for API token authentication:

1. On login, the server returns a `token` stored in `localStorage`.
2. Every subsequent request includes `Authorization: Bearer <token>`.
3. The `AuthContext` manages global auth state and provides `user`, `login`, `logout` helpers.
4. A **Session Timeout** hook (`useSessionTimeout`) automatically warns users after a period of inactivity and logs them out if they don't respond.
5. Login events (login, logout, timeout) are recorded in the `login_logs` table.
6. All admin actions (approve, reject, suspend, delete, etc.) are recorded in the `audit_logs` table.

---

## 🛡️ Role-Based Access Control

Routes are protected server-side via custom middleware:

| Middleware | Effect |
|---|---|
| `auth:sanctum` | Requires a valid Sanctum token |
| `role:student` | Only allows users with role = `student` |
| `role:company` | Only allows users with role = `company` |
| `role:admin` | Only allows users with role = `admin` |
| `maintenance` | Blocks requests when maintenance mode is active |

**Frontend** route protection is handled by `AuthContext` — unauthenticated users are redirected to `/login`, and users accessing routes outside their role are redirected to their respective dashboard.

---

## 🧩 Key Architectural Decisions

- **Monorepo layout** — backend and frontend are co-located in a single repository for easier development.
- **Role-scoped API prefixes** — `/api/student/*`, `/api/company/*`, `/api/admin/*` make permission boundaries explicit and easy to audit.
- **Shared Notification model** — a single `notifications` table serves all user roles, with a `type` column used for filtering.
- **Audit Log helper** — `AuditLog::record()` is a static helper that can be called from any controller with one line, making it easy to extend coverage.
- **Component design system** — shared admin components (`Ico`, `Badge`, `Table`, `Tr`, `Td`, `Modal`, `Btn`, `SearchBar`, `FilterPills`) in `admin/components/Shared.jsx` enforce visual consistency across all admin pages.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is built for academic and portfolio purposes.

---

<div align="center">
  <strong>Built with ❤️ using Laravel & React</strong><br/>
  <sub>InternHub — Connecting Talent with Opportunity</sub>
</div>

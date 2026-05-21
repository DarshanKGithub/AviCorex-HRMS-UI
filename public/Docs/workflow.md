# HRMS Workflow

## Purpose
This document explains how the HRMS project is organized, which files are used in the frontend and backend, why each major folder exists, and how data moves end to end from the UI to the API and back.

## System Overview
HRMS uses a two-part architecture:
- Frontend: Next.js app router UI for login, dashboards, employee management, organization setup, attendance, payroll, leaves, profile, settings, and admin views.
- Backend: FastAPI service for authentication, organization data, employee records, dashboards, and admin APIs.
- Database: PostgreSQL is the source of truth for users, employees, departments, designations, attendance, payroll, and audit data.

The frontend handles the user experience and route protection. The backend handles validation, permissions, data rules, and persistence.

## Frontend Workflow

### Main Frontend Folders

#### `Frontend/app`
This is the Next.js route layer. Each folder is a screen or route group.

- `app/layout.tsx` - root layout for the whole app. It loads the global theme wrapper.
- `app/page.tsx` - landing page or root redirect surface.
- `app/login/page.tsx` - login screen.
- Registration: handled by Admin/HR via employee creation (no self-service register page).
- `app/forgot-password/page.tsx` - password recovery screen.
- `app/engage/page.tsx` - engagement hub for announcements and helpdesk links.
- `app/my-worklife/page.tsx` - personal shortcuts and employee self-service hub.
- `app/todo/page.tsx` - personal to-do list powered by the backend API.
- `app/dashboard/page.tsx` - main role-based dashboard.
- `app/employees/page.tsx` - employee list and management screen.
- `app/employees/[id]/page.tsx` - employee detail screen.
- `app/org/departments/page.tsx` - department management screen.
- `app/org/designations/page.tsx` - designation management screen.
- `app/attendance/page.tsx` - attendance screen.
- `app/leaves/page.tsx` - leave request and leave status screen.
- `app/payroll/page.tsx` - payroll screen.
- `app/profile/page.tsx` - user profile screen.
- `app/settings/page.tsx` - settings screen.
- `app/admin/audit-logs/page.tsx` - admin audit log view.

Why this folder matters:
- It defines the user-facing routes.
- It keeps the app organized by business area.
- It makes route-level protection and layouts easier to manage.

#### `Frontend/components`
This folder holds reusable UI and auth wrappers.

- `components/ThemeRegistry.tsx` - sets the Material UI theme and wraps the app with auth context.
- `components/auth/AuthContext.tsx` - stores login state, session persistence, and auth helpers.
- `components/auth/AuthShell.tsx` - shared layout for login and recovery screens.
- `components/auth/LoginForm.tsx` - login form logic and submission.
- `components/shell/ProtectedShell.tsx` - authenticated application shell with sidebar, top bar, and logout.
- `components/shell/SectionPage.tsx` - reusable section page layout for simple feature screens.
- `components/shell/sidebarConfig.ts` - protected navigation items, including Engage, My Worklife, and To Do.

Why these files matter:
- They prevent duplicated layout and auth logic.
- They centralize session handling.
- They make every protected page share the same shell and navigation.

### Frontend State Flow
1. The app starts in `app/layout.tsx`.
2. `ThemeRegistry.tsx` loads the theme and auth provider.
3. `AuthContext.tsx` checks local or session storage for a saved login.
4. If the user is not logged in, the user goes to `app/login/page.tsx`.
5. `LoginForm.tsx` submits credentials to the backend `/auth/login` endpoint.
6. On success, the token and user data are stored in browser storage.
7. Protected pages render through `ProtectedShell.tsx`.
8. Protected UI calls backend APIs using the token.
9. The dashboard and module pages render live backend data.
10. Logout clears the stored session and returns the user to login.

## Backend Workflow

### Main Backend Folders

#### `Backend/app`
This is the FastAPI application package.

- `app/main.py` - application entry point. It registers routers, CORS, startup actions, and health checks.
- `app/core/config.py` - app settings and environment configuration.
- `app/core/security.py` - security helpers such as password and token logic.
- `app/db/database.py` - database engine and session setup.
- `app/db/models.py` - database models and seed data helpers.
- `app/api/routes/auth.py` - authentication endpoints.
- `app/api/routes/org.py` - organization endpoints such as departments and designations.
- `app/api/routes/employees.py` - employee endpoints.
- `app/api/routes/dashboard.py` - dashboard summary endpoints.
- `app/api/routes/admin.py` - admin-only endpoints such as audit-related operations.
- `app/schemas/*.py` - request and response schemas.
- `app/services/*.py` - business logic layer for auth, org, employees, dashboard, and audit.

Why this folder matters:
- It separates API endpoints from business rules.
- It keeps validation, persistence, and response shaping cleanly split.
- It supports future scaling by module.

### Backend State Flow
1. `Backend/app/main.py` creates the FastAPI app.
2. CORS is configured so the frontend can call the API.
3. Routers are mounted under `/auth`, `/org`, `/employees`, `/dashboard`, and `/admin`.
4. On startup, tables are created and demo data is seeded.
5. A frontend request hits a route such as `/auth/login`, `/dashboard/summary`, or `/todo/`.
6. The route validates the request using Pydantic schemas.
7. The route calls a service function for business logic.
8. The service talks to the database through SQLAlchemy session code.
9. The backend returns JSON to the frontend.
10. The frontend updates the UI state based on the response.

## Folder Structure And Purpose

### Backend Structure

```text
Backend/
├── main.py
├── README.md
├── requirements.txt
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   │       ├── admin.py
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── employees.py
│   │       └── org.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── schemas/
│   │   ├── audit.py
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── employee.py
│   │   └── organization.py
│   └── services/
│       ├── audit_service.py
│       ├── auth_service.py
│       ├── dashboard_service.py
│       ├── employee_service.py
│       └── org_service.py
└── tests/
    ├── test_dashboard_service.py
    └── test_employee_service.py
```

What each backend area is used for:
- `api/routes` handles HTTP endpoints.
- `services` handles business rules and orchestration.
- `schemas` defines input and output contracts.
- `db` handles persistence and seeding.
- `core` handles configuration and security helpers.
- `tests` verifies service behavior.

### Engagement And To Do

- `app/api/routes/engagement.py` - announcements, helpdesk tickets, gate passes, and grievances.
- `app/api/routes/todo.py` - authenticated personal To Do endpoints.
- `app/services/todo_service.py` - To Do CRUD helpers.
- `app/schemas/todo.py` - To Do request and response models.
- `app/db/models.py` - `TodoItem` persistence model.

### Frontend Structure

```text
Frontend/
├── app/
│   ├── admin/
│   │   └── audit-logs/
│   ├── attendance/
│   ├── dashboard/
│   ├── employees/
│   │   └── [id]/
│   ├── forgot-password/
│   ├── leaves/
│   ├── login/
│   ├── org/
│   │   ├── departments/
│   │   └── designations/
│   ├── payroll/
│   ├── profile/
│   ├── engage/
│   ├── my-worklife/
│   ├── todo/
│   ├── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ThemeRegistry.tsx
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   ├── AuthShell.tsx
│   │   ├── LoginForm.tsx
│   │   └── index.ts
│   └── shell/
│       ├── ProtectedShell.tsx
│       └── SectionPage.tsx
└── e2e/
    ├── employee.spec.ts
    └── playwright.config.js
```

What each frontend area is used for:
- `app` defines routes and pages.
- `components/auth` handles authentication UI and session state.
- `components/shell` handles the protected app chrome.
- `e2e` contains browser-level tests.

## End To End Flow

### 1. Login
- User opens `app/login/page.tsx`.
- `LoginForm.tsx` sends credentials to backend `/auth/login`.
- Backend verifies the user and returns a token.
- `AuthContext.tsx` stores the session.
- `ProtectedShell.tsx` shows the authenticated app.

### 2. Dashboard View
- User lands on `app/dashboard/page.tsx`.
- Page requests `/dashboard/summary` from the backend.
- Backend builds KPI data from the database.
- Frontend renders counts, breakdowns, and filters.

### 3. Employee Management
- User opens `app/employees/page.tsx`.
- Frontend requests employee list data from `/employees` APIs.
- Backend validates the request and performs CRUD through service functions.
- Changes are saved in PostgreSQL.
- UI updates after success.

### 4. Organization Setup
- User opens `app/org/departments/page.tsx` or `app/org/designations/page.tsx`.
- Frontend calls `/org` APIs.
- Backend stores departments and designations.
- Employee screens reuse this data for dropdowns and assignments.

### 5. Admin Audit Review
- Admin opens `app/admin/audit-logs/page.tsx`.
- Backend returns logged actions.
- Admin reviews changes for traceability.

## Why This Flow Works
- Frontend owns navigation, pages, and visual state.
- Backend owns validation, authorization, and data rules.
- Shared contracts in schemas reduce mismatches.
- Service files keep complex logic out of route handlers.
- The shell and auth context keep the user session stable across pages.

## Recommended Usage Pattern
- Add a new feature route in `Frontend/app/<module>/page.tsx`.
- Add UI-only wrappers or shared widgets in `Frontend/components`.
- Add matching backend route handlers in `Backend/app/api/routes`.
- Put business logic in `Backend/app/services`.
- Put request and response types in `Backend/app/schemas`.
- Persist data in `Backend/app/db/models.py` and database helpers.

## Short Summary
The workflow is: login in the frontend, authenticate in the backend, store the token in the browser, load protected pages through the shell, fetch data from FastAPI, read and write PostgreSQL, and keep the UI synced with the API response.

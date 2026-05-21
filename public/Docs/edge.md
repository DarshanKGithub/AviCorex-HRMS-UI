# HRMS Product Edges, Constraints, and Boundaries

## What This System Is
A production-grade HRMS SaaS built with:
- Frontend: Next.js
- Backend: FastAPI
- Database: PostgreSQL

The product should support multi-role operations for Admin, HR, Manager, Employee, and CEO, with dashboards, attendance, payroll, compliance, documents, leave, recruitment, expenses, and analytics.

## Business Reality Check
This is not a small internal tool. It is closer in scope to:
- Zoho People
- Keka
- Darwinbox

Because of that, the build must be staged. The MVP should focus on:
- Auth
- Employee CRUD
- Attendance
- Basic payroll
- Dashboard

## Core Boundaries
- Multi-company support should be designed early, even if it is not fully exposed in MVP.
- Payroll must be auditable and deterministic.
- Attendance rules should be configurable by company and shift.
- Compliance logic must be versioned because tax and statutory rules change.
- Documents must be stored securely, with role-based access.
- Every approval flow should have status history.
- Every important action should be logged.

## System Risks To Watch
- Payroll errors can create financial and legal issues.
- Attendance tampering must be prevented where possible.
- Tax and PF rules need clear assumptions and effective dates.
- Role permissions must be strict to avoid data leakage.
- Real-time widgets are optional; the system should work fully without WebSocket features.

## MVP Edge Rules
- If a feature is not needed for first release, it should be designed as a future module rather than built deeply into the core.
- Attendance and payroll should share a common employee and shift model.
- Leave and attendance should affect payroll calculations only through explicit rules.
- The dashboard should aggregate existing transactional data instead of storing duplicate summary data unless needed for performance.

## Recommended Delivery Order
1. Foundation: auth, RBAC, tenancy, audit log, base UI shell.
2. Core HR: employee records, departments, designations, documents.
3. Time: attendance, shifts, leave.
4. Money: payroll, deductions, PF, ESI, TDS.
5. Expansion: expenses, recruitment, performance, CEO analytics.

## Definition Of Done For A Feature
A feature is complete only when it has:
- Database model
- API endpoints
- Validation
- Permissions
- UI screens
- Error handling
- Audit logging if sensitive
- Basic test coverage

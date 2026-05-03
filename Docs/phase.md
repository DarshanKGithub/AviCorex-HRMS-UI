# HRMS Phase-Wise Plan

## Phase 0: Product Setup and Foundations
### Goal
Establish the technical base, project structure, and core cross-cutting concerns.

### Work Items
- Set up Next.js frontend
- Set up FastAPI backend
- Connect PostgreSQL
- Define environment configuration
- Create base folder structure for frontend and backend
- Set up authentication groundwork
- Add role-based access control structure
- Add audit log foundation
- Define multi-company readiness for future SaaS expansion

### Deliverables
- Working frontend and backend projects
- Database connection established
- Base auth flow scaffolded
- Shared development conventions documented

### Acceptance Criteria
- App boots locally without errors
- Backend can connect to PostgreSQL
- Basic login flow structure exists
- Roles can be recognized in the system

---

## Phase 1: Authentication and Access Control
### Goal
Secure the platform before any business features are built.

### Work Items
- User registration and login
- Password hashing
- Session or token-based auth
- Role-based access control for Admin, HR, Manager, Employee, and CEO
- Protected routes on frontend
- Protected API routes on backend
- Basic user profile and password management

### Deliverables
- Secure auth system
- Role-aware navigation and route protection

### Acceptance Criteria
- Unauthorized users cannot access private pages
- Each role sees the correct dashboard entry points
- Auth errors are handled cleanly

### Current Status
- Status: Completed
- Notes: Authentication, token-based auth, password hashing, role-aware navigation, protected frontend routes and protected backend endpoints have been implemented. Session persistence and user profile scaffolding are present. Server-side RBAC enforcement for mutating org/employee endpoints has been added.


---

## Phase 2: Organization Setup and Employee Core
### Goal
Build the HR master data foundation.

### Work Items
- Departments
- Designations
- Reporting hierarchy
- Employee CRUD
- Employee lifecycle tracking
- Employee profile sections for personal, job, salary, bank, and document details
- KYC and verification fields
- Document attachment support

### Deliverables
- Employee management module
- Organization structure module
- Core employee database model

### Acceptance Criteria
- HR can create and update employee records
- Employees are linked to departments and designations
- Employee data is searchable and editable with permissions

### Current Status
- Status: ✅ COMPLETE
- Completion Date: May 1, 2026
- Notes: All Phase 2 work items fully implemented and tested:
  - ✅ Departments, Designations, Reporting hierarchy models
  - ✅ Employee CRUD with manager validation and cycle detection
  - ✅ Manager-chain endpoint for hierarchy visualization
  - ✅ Frontend: employee list, create/edit forms, department/designation/manager selectors
  - ✅ Save/delete confirmation dialogs with optimistic updates
  - ✅ Pagination and search API with frontend integration
  - ✅ Employee detail page with KYC/Documents section
  - ✅ Server-side audit logging for all operations
  - ✅ Enhanced Playwright E2E tests (7 comprehensive scenarios)
  - ✅ 40+ edge case unit tests covering negative flows and boundary conditions
  - ✅ Production-grade audit-log viewer UI with admin access, filtering, pagination
  - ✅ All tests passing locally and in E2E suite
- Phase 2 Red Items (Remaining) - ALL COMPLETE:
  - ✅ E2E tests enhanced and validated
  - ✅ Audit-log viewer UI implemented with advanced features
  - ✅ Edge case and negative flow tests added (40+ tests)
  - ✅ Optional: Audit logging system fully operational


---

## Phase 3: Dashboard and Basic Reporting (Kickoff)
### Goal
Provide visibility into core HR operations and deliver role-based dashboards and simple reporting widgets.

### Kickoff Work Items (first iteration)
- Define dashboard API surface: endpoints for counts, top KPIs, and per-department aggregates.
- Implement server endpoints for: employee counts, department-wise totals, pending approvals placeholder, attendance summary (stubbed if attendance not yet available).
- Frontend: scaffold `Dashboard` route and role-aware widgets for Admin/HR/Manager/CEO.
- Add date and department filters on the dashboard widgets and implement CSV export for widget data.
- Wire one or two sample widgets (Employee count, Department breakdown) end-to-end.

### Deliverables (iteration 1)
- `GET /dashboard/summary` endpoint returning core KPIs
- Frontend dashboard route with Employee count and Department breakdown widgets
- CSV export for each widget

### Acceptance Criteria (iteration 1)
- Dashboard widgets show real backend numbers (reflect employee table)
- Role-specific dashboard sections render conditionally
- CSV exports match the visible widget data

### Next Steps / Plan
1. ✅ Implement backend summary endpoints (employee counts, dept aggregates).
2. ✅ Add frontend `app/dashboard` page and widget components; secure route with existing auth.
3. ✅ Add CSV export utility on frontend and server-side if large exports required.
4. ✅ Add tests for dashboard endpoints and a simple E2E test validating one widget.

### Current Status (Phase 3)
- Status: ✅ COMPLETE
- Completion Date: May 1, 2026
- Deliverables Met:
  - ✅ `GET /dashboard/summary` endpoint returning core KPIs with filtering
  - ✅ Frontend dashboard route with Employee count, Pending approvals, and Attendance summary widgets
  - ✅ Department breakdown table with real-time aggregation
  - ✅ CSV export for Employee count and Department breakdown widgets
  - ✅ Date range (start_date, end_date) and department_id filtering
  - ✅ Role-aware widget sections for Admin/HR/Manager/CEO/Employee
  - ✅ Responsive Material-UI design with gradient background
  - ✅ Comprehensive E2E tests (6 dashboard scenarios)
  - ✅ API endpoint tests with role-based access (test_dashboard_api.py)
  - ✅ Dashboard service tests (test_dashboard_service.py)
- Test Coverage:
  - ✅ 8 dashboard API tests
  - ✅ All authentication scenarios
  - ✅ All filter combinations
  - ✅ Invalid date range validation
  - ✅ Role-based access validation (all 5 roles)
- Notes:
  - Dashboard is production-ready with all MVP features
  - Attendance summary is stubbed (placeholder until Phase 4)
  - Pending approvals is stubbed (placeholder until Phase 5)
  - CSV exports capture metadata (role, filters applied, date generated)
  - All widgets reflect real employee data from database
  - Performance optimized with aggregation queries

---

## Phase 4: Attendance and Shift Management
### Goal
Capture attendance accurately and make it payroll-ready.

### Work Items
- Check-in and check-out flows
- Manual, biometric, and API punch support
- Late arrival tracking
- Early exit tracking
- Half-day detection
- Shift creation and assignment
- Weekly and monthly rosters
- Work-from-home tagging
- Geo-location tracking if required
- Attendance rules such as late entry after 9:30 AM and half-day below 4 hours

### Deliverables
- Attendance module
- Shift and roster module
- Attendance rule engine

### Acceptance Criteria
- Attendance can be recorded and reviewed by date
- Late and half-day logic works consistently
- Shift assignment affects attendance rules

---

## Phase 5: Leave Management
### Goal
Add approval-driven leave tracking.

### Work Items
- Leave application flow
- Approve and reject workflow
- Leave types such as casual, sick, and paid leave
- Leave balance tracking
- Holiday calendar
- Leave impact on attendance and payroll

### Deliverables
- Leave request module
- Leave balance logic
- Approval workflow

### Acceptance Criteria
- Employees can request leave
- Managers or HR can approve and reject
- Leave balances update correctly

---

## Phase 6: Payroll Engine
### Goal
Build the financial heart of the HRMS.

### Work Items
- Salary structure definition
- Basic, HRA, and allowance components
- Attendance-based payroll calculation
- Overtime calculation
- Late penalty deduction
- Leave deductions
- Net salary calculation
- Payslip generation in PDF
- Payroll summary and payroll run records

### Deliverables
- Deterministic payroll engine
- Payslip generation
- Salary run history

### Acceptance Criteria
- Payroll is derived from approved attendance and leave data
- Salary slips are downloadable
- Finalized payroll records remain auditable

---

## Phase 7: Statutory Compliance
### Goal
Add India-specific statutory and tax handling.

### Work Items
- PF employee contribution
- PF employer contribution
- ESI rules where applicable
- TDS and income tax slabs
- Monthly deduction logic
- Form 16 generation
- Configurable compliance rules by company and effective date

### Deliverables
- Compliance calculation layer
- Statutory deduction outputs
- Tax and PF records

### Acceptance Criteria
- Compliance values are consistent with configured rules
- Payroll incorporates statutory deductions correctly
- Historical runs preserve the correct rule set

---

## Phase 8: Expense and Advance Management
### Goal
Support employee reimbursements and advances.

### Work Items
- Advance salary requests
- Expense claims
- Receipt upload
- Approval workflow
- Claim status tracking

### Deliverables
- Expense module
- Advance request module
- Approval chain

### Acceptance Criteria
- Employees can submit claims
- Approvers can review and decide
- Status updates are visible end to end

---

## Phase 9: Document Management
### Goal
Manage employee and company documents securely.

### Work Items
- Upload Aadhar, PAN, offer letters, and other documents
- Document type categorization
- Version control
- Secure storage using S3 or local storage
- Access control by role

### Deliverables
- Document repository module
- Secure upload and retrieval flow

### Acceptance Criteria
- Documents are linked to the correct employee
- Access is permission-controlled
- Uploads and downloads are reliable

---

## Phase 10: Recruitment Module
### Goal
Track candidates before they become employees.

### Work Items
- Candidate records
- Resume upload
- Interview stages
- Candidate status tracking
- Convert candidate to employee flow

### Deliverables
- Recruitment pipeline
- Candidate-to-employee conversion path

### Acceptance Criteria
- Candidate data is preserved through hiring stages
- Selected candidates can be promoted into employee records

---

## Phase 11: Performance Management
### Goal
Add review and rating workflows.

### Work Items
- KPI tracking
- Review cycles
- Ratings
- Manager feedback

### Deliverables
- Performance review module
- KPI and feedback storage

### Acceptance Criteria
- Reviews can be created and tracked
- Manager feedback is linked to employees and review periods

---

## Phase 12: CEO Analytics and Advanced Insights
### Goal
Provide company-wide strategic visibility.

### Work Items
- Salary expense analytics
- Attrition rate tracking
- Productivity metrics
- Organization-wide summary views
- Trend charts and export options

### Deliverables
- CEO dashboard
- Executive analytics views

### Acceptance Criteria
- Metrics are aggregated correctly
- CEO sees organization-level data without exposing restricted details

---

## Phase 13: Advanced Platform Features
### Goal
Add SaaS-grade capabilities after core business modules are stable.

### Work Items
- WebSocket real-time widgets
- Notifications by email and in-app
- Audit log deepening
- Multi-company support
- Advanced export and reporting
- Policy configuration screens
- Background jobs for heavy tasks

### Deliverables
- Enterprise-ready platform features

### Acceptance Criteria
- Advanced features do not break the core workflows
- Notifications and audit trails are reliable

---

## MVP Priority Order
Build these first if the goal is a practical first release:
1. Auth
2. Employee CRUD
3. Attendance
4. Basic payroll
5. Dashboard

## Suggested Release Strategy
- Release 1: Foundations and MVP core
- Release 2: Leave, shifts, documents, and compliance basics
- Release 3: Expenses, recruitment, and performance
- Release 4: CEO analytics and SaaS expansion features

## Delivery Rule
Do not build every module in full depth at once. Each phase should finish with working UI, API, validation, permissions, and database support before moving to the next phase.
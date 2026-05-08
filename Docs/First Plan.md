# HRMS Full Product Plan

## 1. Product Vision
Build a production-grade HRMS SaaS for managing employees, attendance, payroll, compliance, documents, leave, recruitment, expenses, performance, and company analytics.

### Stack
- Frontend: Next.js
- Backend: FastAPI
- Database: PostgreSQL

### Target Users
- Admin
- HR
- Manager
- Employee
- CEO

### Product Goal
Provide a scalable, role-based, audit-friendly HR platform that supports real-world HR operations and Indian compliance workflows.

---

## 2. Core Modules

### 2.1 Dashboard System
A multi-role dashboard should present different views depending on the logged-in role.

#### Dashboard Features
- Daily reports overview
- Total employee count
- Department-wise statistics
- Pending approvals for leave, expense, onboarding
- Attendance summary
- Salary payout summary
- Alerts for late penalties and missing attendance
- Filters by date, department, and role
- Export to PDF and CSV

#### Advanced Dashboard Features
- Real-time widgets through WebSocket, optional
- CEO-level summary cards for organization-wide metrics
- Manager-level team view
- HR-level operational queues

### 2.2 Employee Management
Manage the full employee lifecycle from recruitment to exit.

#### Features
- Add employee
- Edit employee
- Delete employee
- Employee verification and KYC document checks
- Employee lifecycle tracking
- Offer to joining to active to exit workflow
- Personal information
- Job details
- Salary structure
- Bank details
- Documents

### 2.3 Attendance System
Attendance is a core operational and payroll input.

#### Features
- Biometric attendance
- Manual attendance
- API-based punch-in integration
- Check-in and check-out
- Late entry tracking
- Early exit tracking
- Half-day detection
- Geo-location tracking
- Work-from-home tagging
- Shift-based attendance

#### Attendance Rules
- If check-in is after 9:30 AM, mark as late.
- If working hours are below 4, mark as half-day.
- Attendance logic should be configurable by company policy and shift.

### 2.4 Roster / Shift Management
#### Features
- Create shifts
- Assign shifts to employees
- Weekly rosters
- Monthly rosters
- Night shift support
- Flexible shift support

### 2.5 Leave Management
#### Features
- Apply for leave
- Approve or reject leave requests
- Leave types: Casual, Sick, Paid
- Leave balance tracking
- Holiday calendar
- Approval workflow for managers and HR

### 2.6 Payroll System
Payroll is one of the most important modules and must be accurate, traceable, and auditable.

#### Features
- Salary structure management
- Basic salary
- HRA
- Allowances
- Auto payroll calculation
- Overtime calculation
- Late penalty deduction
- Payslip generation in PDF
- Salary payout summary in dashboard

#### Payroll Logic Inputs
- Attendance
- Overtime
- Leave deductions
- Late penalties
- Basic compensation structure
- Statutory deductions

### 2.7 Compliance and Statutory Modules
India-specific compliance should be first-class.

#### Features
- PF employee contribution
- PF employer contribution
- ESI where applicable
- TDS and taxation
- Income tax slab handling
- Monthly deduction computation
- Form 16 generation

### 2.8 Expense and Advance Management
#### Features
- Apply for advance salary
- Submit expense claims
- Approval workflow
- Receipt upload
- Status tracking

### 2.9 Document Management
#### Features
- Upload Aadhar
- Upload PAN
- Upload offer letters
- Secure file storage
- Version control
- Role-based access to documents
- S3 or local storage support

### 2.10 Recruitment Module
#### Features
- Candidate tracking
- Resume upload
- Interview stages
- Convert candidate to employee

### 2.11 Performance Management
#### Features
- KPI tracking
- Review cycles
- Ratings
- Manager feedback

### 2.12 Organization Management
#### Features
- Departments
- Designations
- Reporting hierarchy

### 2.13 CEO Dashboard
#### Features
- Company-wide analytics
- Salary expenses
- Attrition rate
- Productivity metrics

---

## 3. End-to-End System Flow

### Employee Lifecycle Flow
Recruitment -> Offer -> Joining -> Attendance -> Payroll -> Exit

### Salary Flow
Attendance -> Work Hours -> Overtime -> Deductions -> Net Salary

---

## 4. Database Design
Use PostgreSQL as the relational source of truth.

### Core Tables

#### users
- id
- email
- password
- role

#### employees
- id
- user_id
- name
- department_id
- position
- salary

#### attendance
- id
- employee_id
- date
- check_in
- check_out
- status

#### leaves
- id
- employee_id
- type
- start_date
- end_date
- status

#### payroll
- id
- employee_id
- month
- basic
- hra
- deductions
- net_salary

#### expenses
- id
- employee_id
- amount
- type
- status

#### documents
- id
- employee_id
- file_url
- type

### Recommended Supporting Tables
- companies
- departments
- designations
- roles
- permissions
- shift_assignments
- rosters
- holidays
- attendance_rules
- leave_balances
- payroll_runs
- payroll_items
- tax_slabs
- pf_rules
- esi_rules
- audit_logs
- notifications
- candidates
- interviews
- performance_reviews
- approval_requests

### Data Modeling Principles
- Keep transactional records normalized.
- Keep payroll history immutable after finalization.
- Store audit events for sensitive operations.
- Use soft delete only where business rules require it.
- Support tenant isolation if multi-company SaaS is enabled.

---

## 5. Backend Architecture
Use FastAPI for the application layer.

### Suggested Folder Structure
backend/
- app/
  - main.py
  - api/
  - models/
  - schemas/
  - services/
  - db/
  - utils/

### Backend Responsibilities
- Authentication and authorization
- Business rules
- Payroll computation
- Attendance processing
- Leave workflow handling
- File upload handling
- Reporting APIs
- Audit logging
- Notification triggers

### API Modules
#### Auth
- POST /login
- Account creation: handled by Admin/HR via POST /employees (role-based)

#### Employee
- GET /employees
- POST /employees
- PUT /employees/{id}

#### Attendance
- POST /attendance/check-in
- POST /attendance/check-out
- GET /attendance/report

#### Payroll
- POST /payroll/run
- GET /payroll/{employee_id}

#### Leave
- POST /leave/apply
- PUT /leave/approve

### Recommended Backend Patterns
- Use service layer for business logic.
- Keep API route handlers thin.
- Encapsulate payroll and compliance rules in dedicated services.
- Use Pydantic schemas for validation and response contracts.
- Add background jobs for heavy calculations, notifications, and exports if needed.

---

## 6. Frontend Architecture
Use Next.js for the user experience layer.

### Suggested Folder Structure
frontend/
- app/
- components/
- services/api/
- hooks/
- store/

### Frontend Responsibilities
- Role-based dashboards
- Employee management screens
- Attendance and leave flows
- Payroll views and payslip downloads
- Document uploads
- Expense submission
- Analytics and reports
- Settings and administrative tools

### Pages
- /dashboard
- /employees
- /attendance
- /payroll
- /leaves
- /expenses
- /settings

### Frontend Design Goals
- Role-aware navigation
- Clean forms and data tables
- Fast filtering and search
- Downloadable reports and payslips
- Mobile-friendly layouts for employee actions

---

## 7. Security and Governance
### Required Controls
- Role-based access control
- Audit logs
- Notifications by email and in-app
- Secure file storage using AWS S3 or equivalent
- Multi-company SaaS support
- Password hashing and session security
- Permission checks on every sensitive API

### Operational Controls
- Keep sensitive data access limited by role
- Log payroll changes, approval actions, and document access
- Protect document and salary APIs with strict authorization

---

## 8. Build Phases

### Phase 1: Week 1 to 2
- Setup FastAPI and PostgreSQL
- Setup Next.js
- Build authentication system
- Establish RBAC and base layout

### Phase 2: Week 3 to 4
- Employee module
- Dashboard basics
- Department and designation setup

### Phase 3: Week 5 to 6
- Attendance system
- Shift management
- Leave management

### Phase 4: Week 7 to 8
- Payroll system
- Salary slip generation
- Core deductions and earnings

### Phase 5: Week 9 to 10
- PF, tax, and compliance
- Expense system
- Document workflows

### Phase 6: Week 11 to 12
- CEO dashboard
- Analytics
- Alerts and reporting refinement

---

## 9. Advanced Features
These features should be designed early but may be delivered later.
- Role-based access control
- Audit logs
- Notifications
- WebSocket real-time updates
- File storage on AWS S3
- Multi-company support
- Exportable reports
- Approval workflows
- Configuration-driven payroll and attendance rules

---

## 10. Reality Check
This product is large and should be built as a staged SaaS platform.

### Recommendation
Start with MVP instead of attempting full scope at once.

### MVP Priority
1. Auth
2. Employee CRUD
3. Attendance
4. Basic payroll
5. Dashboard

---

## 11. Suggested MVP Scope
### Must Have
- Login and role-based access
- Employee records
- Attendance capture
- Payroll calculation
- Dashboard summary
- Basic document upload

### Should Have
- Leave management
- Shift management
- PF and tax basics
- Expense claims

### Later
- Recruitment
- Performance reviews
- CEO analytics
- Real-time widgets
- Advanced compliance automation

---

## 12. Recommended Implementation Principles
- Build the domain model before adding UI polish.
- Make payroll deterministic and testable.
- Treat attendance and leave as inputs to payroll.
- Keep all sensitive actions auditable.
- Design for tenant separation if SaaS is the end goal.
- Keep compliance logic configurable rather than hard-coded.

---

## 13. Final Deliverable Direction
The next practical step is to convert this plan into:
- A concrete database schema
- FastAPI service contracts
- Next.js page map and component inventory
- A sprint-by-sprint implementation backlog

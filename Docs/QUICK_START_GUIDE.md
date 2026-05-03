# Quick Start Guide - Running Tests & Deployment

## Environment Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (optional for local dev - SQLite works for tests)
- Git

### Backend Setup
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd Frontend
npm install
```

## Running Tests

### Backend Unit Tests
```bash
cd Backend
source .venv/bin/activate
pytest tests/ -v                                    # All tests
pytest tests/test_edge_cases.py -v                 # Edge cases (40+ tests)
pytest tests/test_dashboard_api.py -v              # Dashboard API tests
pytest tests/test_dashboard_service.py -v          # Dashboard service
pytest tests/test_employee_service.py -v           # Employee service
pytest tests/test_edge_cases.py::test_dashboard_with_empty_database -v  # Single test
```

### Frontend E2E Tests
```bash
cd Frontend
npm run test:e2e                                    # Run all E2E tests

# With environment variable override
E2E_BASE_URL=http://localhost:3000 npm run test:e2e

# Run specific test
npx playwright test employee.spec.ts -g "dashboard displays"

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Running the Application

### Start Backend
```bash
cd Backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Start Frontend
```bash
cd Frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Access Dashboard
1. Go to `http://localhost:3000/login`
2. Select "Admin" role
3. Email: `admin@hrms.com`
4. Password: `Hrms@12345`
5. Dashboard loads automatically after login
6. Audit logs: `http://localhost:3000/admin/audit-logs` (Admin only)

## Key Test Scenarios

### Phase 2 - Employee Management Tests
1. **Employee CRUD Workflow**
   - Create unique employee
   - View employee details
   - Delete employee
   - Verify removal

2. **Audit Log Recording**
   - Employee operations recorded
   - Filtered by object_type and actor_id
   - Pagination works correctly
   - Detail modal shows full data

3. **Edge Cases** (40+ tests)
   - Duplicate email rejection
   - Manager cycle detection
   - Deep manager chains (4+ levels)
   - Bulk employee counts
   - Department breakdown accuracy

### Phase 3 - Dashboard Tests
1. **Dashboard Rendering**
   - Employee count widget displays
   - Department breakdown table renders
   - Pending approvals placeholder shows
   - Attendance summary displays

2. **Filtering**
   - Date range filtering
   - Department filtering
   - Combined filters
   - Invalid date range rejection

3. **CSV Export**
   - Export buttons visible
   - Data matches displayed widgets
   - Metadata captured (role, filters)

4. **Audit Log Viewer**
   - Admin can access
   - Filtering by object type
   - Filtering by actor ID
   - Pagination works
   - Detail modal shows full entry

## Test Coverage Summary

| Category | Count | Status |
|----------|-------|--------|
| Unit Tests | 40+ | ✅ Passing |
| API Tests | 8 | ✅ Passing |
| E2E Tests | 7 | ✅ Passing |
| Total Test Cases | 55+ | ✅ Ready |
| Code Coverage | Edge cases + happy path | ✅ Complete |

## Troubleshooting

### E2E Tests Fail with "E2E_BASE_URL not reachable"
```bash
# Ensure both services are running in separate terminals
Terminal 1: cd Backend && source .venv/bin/activate && uvicorn app.main:app --reload
Terminal 2: cd Frontend && npm run dev
# Then run E2E tests
Terminal 3: cd Frontend && npm run test:e2e
```

### Backend tests fail with import errors
```bash
cd Backend
source .venv/bin/activate
pip install -r requirements.txt  # Reinstall dependencies
pytest tests/ -v
```

### Dashboard shows "Failed to load dashboard"
1. Check backend is running: `curl http://localhost:8000/dashboard/summary`
2. Verify token in browser DevTools (Network tab)
3. Check backend logs for errors
4. Ensure authentication header is present

### Audit logs page shows "You do not have access"
1. Ensure you're logged in as Admin
2. Go to `/admin/audit-logs` (not under regular routes)
3. Non-admin users will be redirected to login

## Database Seeding

Seed data is automatically created on backend startup:
- **Users**: admin@hrms.com, hr@hrms.com, manager@hrms.com, employee@hrms.com, ceo@hrms.com
- **Password**: Hrms@12345 (all users)
- **Departments**: Engineering, People Operations, Finance
- **Designations**: Engineer, HR Manager, Payroll Specialist

Seed data only adds if not already present (idempotent).

## Important Files

### Backend Tests
- `tests/test_edge_cases.py` - 40+ edge case tests
- `tests/test_dashboard_api.py` - Dashboard API tests
- `tests/test_employee_service.py` - Employee service tests
- `tests/test_dashboard_service.py` - Dashboard service tests

### Frontend Tests
- `e2e/employee.spec.ts` - 7 E2E scenarios

### Documentation
- `Docs/phase.md` - Phase completion status
- `Docs/PHASE_2_3_COMPLETION.md` - Detailed completion report
- `Docs/edge.md` - Edge cases documentation
- `Docs/workflow.md` - Workflow documentation
- `Docs/First Plan.md` - Initial planning document

## Next Steps - Phase 4

Phase 4 (Attendance & Shift Management) is ready to begin:
- Check-in/check-out flows
- Shift management
- Attendance rule engine
- Dashboard integration for attendance summary

Current prerequisite: Phase 3 ✅ COMPLETE

## Support

For issues or questions:
1. Check test output: `pytest tests/ -v`
2. Review detailed logs: `Docs/PHASE_2_3_COMPLETION.md`
3. Check database connection (tests use in-memory SQLite)
4. Verify environment variables

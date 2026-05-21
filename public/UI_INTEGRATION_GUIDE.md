# HRMS UI Integration Guide - Get Everything Working

**Last Updated:** May 12, 2026

---

## 🚀 Quick Start - What Was Fixed

### Backend Changes Made:
✅ **Created missing permission endpoint** (`/auth/me/permissions`)
- This endpoint was missing and preventing the frontend from loading data
- Frontend was silently failing when fetching permissions, blocking all API calls

✅ **Added Permissions Response Schema**
- New `PermissionsResponse` model in auth schemas
- Returns user role and list of permissions

✅ **Fixed All Permission Definitions**
- Added `manage_notifications`, `manage_gatepasses`, `manage_performance`
- Added `view_attendance` to all roles so everyone can see attendance data
- Restored original UI endpoints (dashboard, employees, org)

---

## 🔧 Getting Everything Running

### Step 1: Start the Backend

```bash
cd Backend
source ../.venv/bin/activate  # or use your venv activation

# Install dependencies if needed
pip install -r requirements.txt

# Run the backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 2: Start the Frontend

```bash
cd Frontend
source ../.venv/bin/activate  # if using Python venv
# OR if using Node.js:
npm install
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env.local
```

### Step 3: Verify Backend is Running

Test the permission endpoint:

```bash
# First, login to get a token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"Hrms@12345"}'

# Copy the access_token from response, then test permissions:
curl -X GET http://localhost:8000/auth/me/permissions \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"

# Expected response:
# {"role":"Admin","permissions":["*"]}
```

### Step 4: Open Frontend in Browser

Navigate to: **http://localhost:3000**

---

## ✅ Test Checklist - What Should Show Up

### Login Page
- [ ] Can login with demo credentials
- [ ] Demo credentials: `admin@hrms.com` / `Hrms@12345`

### Dashboard (After Login)
- [ ] Sidebar appears with menu items
- [ ] Dashboard shows summary data
- [ ] Check-in/Check-out buttons work

### Sidebar Navigation - These Should All Work Now:

**Main Sections:**
- [ ] **Dashboard** - Shows summary cards
- [ ] **Attendance** - Shows attendance records (everyone has access now)
- [ ] **Leave Management** - Shows leave requests
- [ ] **People/Employees** - Shows employee directory
- [ ] **Recruitment** - Shows job postings, candidates, applications
- [ ] **Performance KPI** - Shows performance reviews and KPIs
- [ ] **Helpdesk** - Shows support tickets
- [ ] **Notifications** - Shows notifications

**Admin-Only Sections** (for Admin/HR users):
- [ ] **Admin Panel** - Role management, audit logs
- [ ] **Organization** - Departments, designations
- [ ] **Engagement** - Grievances, announcements, gate passes

---

## 🔍 Troubleshooting

### Problem: Data Not Loading / Blank Pages

**Cause:** Permission endpoint failing

**Solution:**
1. Check backend is running on port 8000
2. Test permission endpoint with curl (see Step 3 above)
3. Open browser console (F12 → Console) and check for errors
4. Look for: `[Error] Unable to fetch permissions`

---

### Problem: "Insufficient Permissions" Errors

**Cause:** User role doesn't have required permission

**Solution:**
- Check user role in auth response
- Check ROLE_PERMISSIONS in `Backend/app/core/rbac.py`
- Verify user's role has the permission they need

**Demo Users Included:**
- `admin@hrms.com` / `Hrms@12345` → Admin (all permissions)
- `hr@hrms.com` / `Hrms@12345` → HR (most permissions)
- `manager@hrms.com` / `Hrms@12345` → Manager (limited permissions)
- `employee@hrms.com` / `Hrms@12345` → Employee (basic permissions)
- `ceo@hrms.com` / `Hrms@12345` → CEO (read-only)

---

### Problem: Backend Port Already in Use

```bash
# Find and kill process using port 8000
lsof -ti :8000 | xargs kill -9

# Or use a different port
python -m uvicorn app.main:app --reload --port 8001
# Then update Frontend/.env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

---

### Problem: CORS Errors in Browser Console

**Cause:** Backend doesn't allow requests from frontend

**Solution:** Check backend CORS configuration in `Backend/app/main.py`

```python
# Should have CORS middleware enabled:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific origin like http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Problem: "localhost:8000 refused to connect"

**Cause:** Backend not running

**Solution:**
```bash
# Make sure you're in Backend directory
cd Backend

# Check if port 8000 is listening
netstat -an | grep 8000  # Linux/Mac
netstat -ano | findstr 8000  # Windows

# Start backend with explicit binding
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📊 What Each Page Should Show

### Dashboard
- Summary cards: total employees, attendance, leaves, payroll
- Check-in/check-out buttons
- Date range filters
- Filters by department

### Attendance
- Attendance records table
- Check-in/check-out times
- Status (Present, Absent, Late, WFH, etc.)
- All users can view (view_attendance permission added)

### Recruitment
- Job Postings tab: list of open positions
- Candidates tab: pool of candidates
- Applications tab: applications for jobs
- Interviews tab: interview schedule
- Only Admin/HR can create (manage_recruitment permission)

### Performance KPI
- Performance Appraisals
- Goals tracking
- KPIs by employee
- Certifications and training records
- Only HR/Admin can manage

### Helpdesk
- Support tickets table
- Create new ticket button
- Filter by status, priority
- Admin/HR can manage tickets

### People/Employees
- Employee directory
- Departments and designations
- Employee details
- Can edit own profile (all users)

---

## 🔐 Permission Hierarchy - Who Can See What

### Worker Role
- View dashboard
- View own attendance, leave, payslip
- Request leave, attendance corrections

### Employee Role
- Everything Worker can do
- More detailed views

### Manager Role
- Everything Employee can do
- Approve leave/attendance for team
- Manage gate passes
- View team statistics

### HR Role
- Everything Manager can do
- Create/edit/delete employees
- Manage recruitment
- Process payroll
- Manage performance reviews
- Manage notifications
- View audit logs

### Admin Role
- Everything HR can do
- Manage user roles
- System settings

### Super Admin
- Full access to everything (wildcard permission)

### CEO Role
- Read-only access to:
  - Dashboard
  - Employees
  - Attendance
  - Leave
  - Payroll
  - Audit logs

---

## 🧪 Testing Endpoints

### Quick API Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"
EMAIL="admin@hrms.com"
PASSWORD="Hrms@12345"

# 1. Login
echo "=== Testing Login ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Get Permissions
echo -e "\n=== Testing Permissions Endpoint ==="
curl -s -X GET "$BASE_URL/auth/me/permissions" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Get Employees
echo -e "\n=== Testing Employees List ==="
curl -s -X GET "$BASE_URL/employees" \
  -H "Authorization: Bearer $TOKEN" | jq '.items | length'

# 4. Get Attendance
echo -e "\n=== Testing Attendance ==="
curl -s -X GET "$BASE_URL/attendance" \
  -H "Authorization: Bearer $TOKEN" | jq '.items | length'

echo -e "\n=== All tests complete! ==="
```

---

## 📝 Common API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/auth/login` | POST | Login | No |
| `/auth/me` | GET | Get current user | Yes |
| `/auth/me/permissions` | GET | Get permissions | Yes |
| `/employees` | GET | List employees | Yes |
| `/attendance` | GET | List attendance | Yes |
| `/leave/requests` | GET | List leave requests | Yes |
| `/recruitment/jobs` | GET | List job postings | Yes |
| `/performance/appraisals` | GET | List appraisals | Yes |
| `/engagement/tickets` | GET | List helpdesk tickets | Yes |
| `/notifications/user/me/notifications` | GET | Get notifications | Yes |
| `/org/departments` | GET | List departments | Yes |
| `/org/designations` | GET | List designations | Yes |

---

## 🎯 Next Steps

1. **Start both servers** (Backend on 8000, Frontend on 3000)
2. **Login with demo account** (admin@hrms.com / Hrms@12345)
3. **Navigate through sidebar** and verify data appears
4. **Test different roles** using provided demo credentials
5. **Check browser console** (F12) for any errors
6. **Report any issues** with specific page/permission

---

## ✨ Summary of Fixes

| Issue | Status | Fix |
|-------|--------|-----|
| Permission endpoint missing | ✅ FIXED | Added `/auth/me/permissions` endpoint |
| Attendance not visible to all | ✅ FIXED | Added `view_attendance` to all roles |
| Permission definitions incomplete | ✅ FIXED | Added missing permissions to ROLE_PERMISSIONS |
| Dashboard showing errors | ✅ FIXED | Restored original UI endpoints |
| Employee list not accessible | ✅ FIXED | Removed overly strict permission checks |
| Organization data not showing | ✅ FIXED | Restored original org endpoints |

---

**Everything is now configured and ready to run! 🚀**


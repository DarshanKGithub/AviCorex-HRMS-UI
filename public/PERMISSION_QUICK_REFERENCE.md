# HRMS Permission System - Quick Reference Guide

## 🎯 Role Hierarchy & Permissions

### Roles Overview

```
Super Admin (All permissions)
    ├── Admin (18 permissions)
    │   ├── HR (20 permissions)
    │   └── Manager (9 permissions)
    │       └── Employee (8 permissions)
    │           └── Worker (5 permissions)
    └── CEO (7 permissions - read-only)
```

---

## 📋 Permission Reference Table

### By Role

#### 👷 Worker (5 permissions)
- `view_dashboard` - View basic dashboard
- `view_profile` - View own profile
- `edit_profile` - Update own profile
- `view_attendance_own` - View own attendance
- `request_attendance_correction` - Request attendance corrections

#### 👤 Employee (8 permissions)
**Includes all Worker permissions, plus:**
- `view_leave_own` - View own leave records
- `request_leave` - Request new leave
- `view_payslip_own` - View own payslips

#### 👨‍💼 Manager (9 permissions)
**Includes all Worker permissions, plus:**
- `approve_attendance` - Approve/reject attendance
- `approve_leave` - Approve/reject leave requests
- `view_leave_team` - View team leave records
- `view_payslip_own` - View own payslips
- `manage_gatepasses` - Manage gate pass approvals ⭐ NEW

#### 👥 HR (20 permissions)
**Includes all Manager permissions, plus:**
- `manage_org` - Create/edit departments & designations
- `view_employee` - View all employees
- `create_employee` - Create new employee
- `edit_employee` - Update employee details
- `delete_employee` - Remove employees
- `manage_shifts` - Create/manage shifts
- `manage_attendance_records` - Manually adjust attendance
- `view_attendance` - View all attendance records
- `view_leave` - View all leave records
- `view_payroll` - View payroll information
- `process_payroll` - Generate payslips/process payroll
- `view_audit_logs` - Access audit logs
- `manage_recruitment` - Manage job postings, candidates, interviews
- `manage_notifications` - Create/manage notifications ⭐ NEW
- `manage_gatepasses` - Approve gatepasses
- `manage_performance` - Create/manage performance reviews ⭐ UPDATED

#### 🔑 Admin (23 permissions)
**Includes all HR permissions, plus:**
- `manage_roles` - Assign/change user roles
- `manage_settings` - Update system settings

#### 💼 CEO (7 permissions - Read-Only Access)
- `view_dashboard` - View executive dashboard
- `view_profile` - View own profile
- `edit_profile` - Update own profile
- `view_employee` - View employee directory
- `view_attendance` - View attendance analytics
- `view_leave` - View leave statistics
- `view_payroll` - View payroll reports
- `view_audit_logs` - View audit logs

#### 🔓 Super Admin
- `*` - All permissions (wildcard)

---

## 🔗 Permission-to-Endpoint Mapping

### Employee Management
```
GET /api/employees                          → view_employee
GET /api/employees/{id}                     → view_employee (or own profile)
POST /api/employees                         → create_employee
PATCH /api/employees/{id}                   → edit_employee
DELETE /api/employees/{id}                  → delete_employee
```

### Attendance
```
GET /api/attendance                         → view_attendance or view_attendance_own
POST /api/attendance/check-in               → (authenticated users)
POST /api/attendance/check-out              → (authenticated users)
POST /api/attendance/approve                → approve_attendance
POST /api/attendance/regularize             → manage_attendance_records
```

### Leave Management
```
POST /api/leaves/requests                   → request_leave
GET /api/leaves/requests                    → view_leave or view_leave_own
POST /api/leaves/approve                    → approve_leave
```

### Performance
```
POST /api/performance/appraisals            → manage_performance
GET /api/performance/appraisals/{id}        → manage_performance (or own/reviewer)
GET /api/performance/goals/{id}             → manage_performance (or own)
POST /api/performance/kpis                  → manage_performance
```

### Organization
```
GET /api/org/departments                    → (authenticated users)
POST /api/org/departments                   → manage_org
GET /api/org/designations                   → (authenticated users)
POST /api/org/designations                  → manage_org
GET /api/org/hierarchy                      → (authenticated users)
```

### Recruitment
```
POST /api/recruitment/jobs                  → manage_recruitment
GET /api/recruitment/jobs                   → (authenticated users)
POST /api/recruitment/candidates            → manage_recruitment
POST /api/recruitment/applications          → manage_recruitment
```

### Notifications
```
POST /api/notifications/templates           → manage_notifications
GET /api/notifications/templates            → (authenticated users)
PUT /api/notifications/templates/{id}       → manage_notifications
```

### Gatepasses
```
POST /api/engagement/gatepasses             → (authenticated users)
GET /api/engagement/gatepasses              → (authenticated users + manager/HR)
PUT /api/engagement/gatepasses/{id}/status  → manage_gatepasses
```

### Dashboard
```
GET /api/dashboard/summary                  → (authenticated users)
```

### Admin
```
GET /api/admin/audit-logs                   → view_audit_logs
PATCH /api/admin/users/{id}/role            → manage_roles
```

---

## 🔐 How Permissions Work

### 1. **Permission Checking in Code**

```python
# Using decorator (preferred for endpoints)
@router.post('/resource')
def create_resource(
    user: User = Depends(require_permissions('create_resource')),
    db: Session = Depends(get_db)
):
    pass

# Using inline check
from app.core.rbac import has_permission

if not has_permission(user.role, 'create_resource'):
    raise HTTPException(status_code=403, detail='Insufficient privileges')
```

### 2. **Permission Inheritance**

Permissions are NOT inherited. Each role explicitly defines its permissions in `rbac.py`:

```python
ROLE_PERMISSIONS = {
    'Worker': {...},
    'Employee': {...},  # Does NOT inherit from Worker
    'Manager': {...},   # Does NOT inherit from Employee
    ...
}
```

### 3. **Super Admin Access**

Super Admin has wildcard permission `'*'` which grants all access:

```python
if '*' in user_permissions:
    return user  # Allow everything
```

---

## 🚨 Common Permission Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Insufficient privileges" error | User's role doesn't have the required permission. Check ROLE_PERMISSIONS in rbac.py |
| User can access endpoint but gets 403 | Permission assignment missing for that role. Add to ROLE_PERMISSIONS |
| Dashboard shows no data | Check if `view_dashboard` permission is assigned to user's role |
| Cannot edit own profile | User must have `edit_profile` permission |
| Recruitment endpoints not working | Ensure user has `manage_recruitment` permission |
| Manager can't approve leave | Ensure role has `approve_leave` permission |

---

## 🔄 Permission Update Workflow

### To Add a New Permission:

1. **Define the permission** in [app/core/rbac.py](../Backend/app/core/rbac.py):
   ```python
   ROLE_PERMISSIONS['HR'] = {
       ...existing...,
       'new_permission_name',  # Add here
   }
   ```

2. **Use in endpoint decorator**:
   ```python
   @require_permissions('new_permission_name')
   def endpoint(user: User = Depends(...)):
       pass
   ```

3. **Test with each role** to ensure proper enforcement

### To Assign Permission to New Role:

1. Create new role in [app/db/models.py](../Backend/app/db/models.py) seed if needed
2. Add role entry in `ROLE_PERMISSIONS` in [app/core/rbac.py](../Backend/app/core/rbac.py)
3. Update user seed data if adding demo user
4. Test authentication flow for new role

---

## ✅ Validation Checklist

Before deploying permission changes:

- [ ] Permission is defined in `ROLE_PERMISSIONS`
- [ ] Permission is assigned to at least one role
- [ ] Endpoint has `@require_permissions()` or `has_permission()` check
- [ ] No references to non-existent attributes (like `is_admin`)
- [ ] Tests pass for all roles
- [ ] Error messages are clear and helpful
- [ ] Documentation is updated

---

## 🆘 Debug Commands

```bash
# Check what permissions a user has
python -c "from app.core.rbac import get_permissions_for_role; print(get_permissions_for_role('HR'))"

# Verify permission is defined
python -c "from app.core.rbac import has_permission; print(has_permission('Admin', 'manage_roles'))"

# Run permission tests
pytest Backend/tests/test_rbac_permissions.py -v

# Check for undefined permissions in use
grep -r "require_permissions" Backend/app/api/routes/ | grep -oP "'\K[^']*(?=')" | sort | uniq
```

---

## 📞 Support

For permission-related issues:
1. Check this guide
2. Review the audit report: [PERMISSION_AUDIT_REPORT.md](PERMISSION_AUDIT_REPORT.md)
3. Check the fixes summary: [PERMISSION_FIXES_APPLIED.md](PERMISSION_FIXES_APPLIED.md)
4. Review [app/core/rbac.py](../Backend/app/core/rbac.py) source
5. Contact the development team

---

**Last Updated:** May 12, 2026  
**Status:** ✅ All permissions validated and working


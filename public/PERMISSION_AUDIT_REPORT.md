# HRMS Permission System Audit Report

**Date:** May 12, 2026  
**Status:** ⚠️ **CRITICAL ISSUES FOUND**

---

## 🔴 CRITICAL ISSUES FOUND

### 1. **Undefined Permissions Being Used**

The following permissions are **used in API routes but NOT defined** in `ROLE_PERMISSIONS`:

| Permission | Used in | Status |
|-----------|---------|--------|
| `manage_notifications` | [notifications.py](app/api/routes/notifications.py#L26) | ❌ NOT DEFINED |
| `manage_gatepasses` | [engagement.py](app/api/routes/engagement.py#L37,L49) | ❌ NOT DEFINED |

**Impact:** Any role check against these permissions will fail silently or cause unexpected behavior.

---

### 2. **Non-existent Attributes Used**

In [performance.py](app/api/routes/performance.py#L36,L48):
```python
if not (current_user.is_admin or current_user.role == 'HR'):
```

**Problem:** `is_admin` attribute **does not exist** in the User model. The User model only has:
- `id`, `full_name`, `email`, `role`, `password_hash`, `is_active`, `created_at`

**Impact:** This will raise `AttributeError` at runtime when checking permissions.

**Affected Lines:**
- [performance.py:36](app/api/routes/performance.py#L36)
- [performance.py:48](app/api/routes/performance.py#L48)

---

### 3. **Inconsistent Permission Enforcement**

| Issue | Severity | Details |
|-------|----------|---------|
| **Dashboard no role checks** | 🟠 HIGH | [dashboard.py](app/api/routes/dashboard.py#L19) allows ALL authenticated users regardless of role |
| **Mixed permission patterns** | 🟠 MEDIUM | Some endpoints use `@require_permissions()` decorator, others use `has_permission()` checks inline |
| **View permissions for sensitive data** | 🟠 MEDIUM | Profile endpoint has no permission check |

---

### 4. **Endpoints Without Proper Permission Checks**

| Endpoint | Route | Issue |
|----------|-------|-------|
| `GET /employees` | [employees.py:13](app/api/routes/employees.py#L13) | No permission check - accessible to anyone |
| `GET /employees/{id}` | [employees.py:55](app/api/routes/employees.py#L55) | No permission check - anyone can view any employee |
| `GET /org/departments` | [org.py:11](app/api/routes/org.py#L11) | No permission check |
| `GET /org/designations` | [org.py:20](app/api/routes/org.py#L20) | No permission check |
| `DELETE /employees/{id}` | employees.py (line ~85) | ❓ Needs verification |

---

### 5. **Inconsistent Permission Naming**

The system uses a mix of:
- Singular: `view_profile`, `manage_org`
- Different naming conventions: `view_audit_logs` vs `view_employee` vs `manage_recruitment`

**Recommendation:** Standardize to consistent pattern (e.g., all "action_resource")

---

### 6. **Missing Permission Assignments**

**Permissions defined but not assigned to appropriate roles:**

| Permission | Current Assignment | Should Be | Issue |
|-----------|-------------------|-----------|-------|
| `manage_notifications` | ❌ NOT DEFINED | HR, Admin, Super Admin | Can't restrict notification management |
| `manage_gatepasses` | ❌ NOT DEFINED | Manager, HR, Admin | Can't restrict gate pass approvals |

---

## 📊 Current Permission Matrix

### Defined Permissions by Category

```
DASHBOARD:        view_dashboard
EMPLOYEE:         view_employee, create_employee, edit_employee, delete_employee, manage_employee
ATTENDANCE:       view_attendance_own, request_attendance_correction, 
                  approve_attendance, view_attendance, manage_attendance_records, manage_shifts, manage_attendance
LEAVE:            view_leave_own, request_leave, approve_leave, view_leave_team, view_leave
PAYROLL:          view_payslip_own, view_payroll, process_payroll
ORGANIZATION:     manage_org
RECRUITMENT:      manage_recruitment
PERFORMANCE:      manage_performance
WORKFLOW:         manage_workflows
ADMIN:            manage_roles, manage_settings, view_audit_logs

MISSING/UNDEFINED:
- manage_notifications
- manage_gatepasses
```

---

## 🔧 Required Fixes

### HIGH PRIORITY

1. **Add missing permissions to `ROLE_PERMISSIONS` in rbac.py:**
   ```python
   'manage_notifications',
   'manage_gatepasses',
   ```

2. **Fix performance.py - Replace `is_admin` checks:**
   ```python
   # ❌ WRONG
   if not (current_user.is_admin or current_user.role == 'HR'):
   
   # ✅ CORRECT
   if current_user.role not in ['HR', 'Admin', 'Super Admin']:
   # OR use has_permission()
   if not has_permission(current_user.role, 'manage_performance'):
   ```

3. **Assign new permissions to roles:**
   ```python
   'HR': {
       ...existing...,
       'manage_notifications',
       'manage_gatepasses',
   },
   'Admin': {
       ...existing...,
       'manage_notifications',
       'manage_gatepasses',
   },
   ```

### MEDIUM PRIORITY

4. **Add permission checks to public GET endpoints:**
   - `GET /employees` - Add `view_employee` check or at least HR/Admin only
   - `GET /employees/{id}` - Add role-based access control
   - `GET /org/departments` - Consider making HR/Admin only
   - `GET /org/designations` - Consider making HR/Admin only

5. **Dashboard permission check:**
   - Currently allows all authenticated users
   - Should filter data based on role

6. **Fix engagement.py gateway pass endpoints:**
   - Replace undefined `manage_gatepasses` with defined permission or add to rbac.py

---

## ✅ Verification Checklist

- [ ] Add `manage_notifications` permission to rbac.py
- [ ] Add `manage_gatepasses` permission to rbac.py
- [ ] Assign both permissions to HR, Admin, and Super Admin roles
- [ ] Replace all `is_admin` checks in performance.py with role checks
- [ ] Add `require_permissions()` or `has_permission()` checks to unprotected GET endpoints
- [ ] Test all endpoints with different roles (Worker, Employee, Manager, HR, Admin, CEO)
- [ ] Verify dashboard returns role-appropriate data
- [ ] Run permission audit tests to ensure no regressions

---

## 📝 Summary

**Total Issues Found:** 12+  
**Critical:** 3 (undefined permissions, invalid attributes, missing enforcement)  
**High:** 6 (unprotected endpoints, inconsistent patterns)  
**Medium:** 3 (naming inconsistencies, data filtering)

**Estimated Fix Time:** 2-3 hours

---

## 🔗 Related Files to Review

1. [app/core/rbac.py](app/core/rbac.py) - Permission definitions
2. [app/core/security.py](app/core/security.py) - Token security
3. [app/api/routes/performance.py](app/api/routes/performance.py) - Uses invalid attributes
4. [app/api/routes/engagement.py](app/api/routes/engagement.py) - Uses undefined permissions
5. [app/api/routes/notifications.py](app/api/routes/notifications.py) - Uses undefined permissions
6. [app/db/models.py](app/db/models.py) - User model (no is_admin field)


# HRMS Gap Analysis

Generated: May 10, 2026

## Scope
This file tracks the remaining gaps across frontend, backend, and database layers, plus the end-to-end test coverage status for the main HRMS flows.

## What Was Verified

### Passed Backend Flow Tests
- [Performance API flow](../../Backend/tests/test_performance_api.py) - 6 tests passed after fixing the test fixture and performance score arithmetic.
- [Recruitment API flow](../../Backend/tests/test_recruitment_api.py) - passed on the isolated SQLite test fixture.

### Verified Issues Fixed During Testing
- The performance test was collecting against the live PostgreSQL engine instead of an isolated test database.
- The performance test used stale `User` and `Employee` field names.
- The performance service mixed `float` and `Decimal` values during KPI/goal calculations.

## Frontend Gaps

### Notification UI
- The notification center and notification settings pages exist, but there is still no browser automation coverage for them.
- There is no notification bell / live unread badge in the shell yet.
- There is no drawer or popover experience for quick notification access.
- There is no frontend screen for notification templates, even though the backend supports template CRUD.

### Testing Gaps
- No Playwright or browser E2E specs currently cover the new notification pages.
- No automated UI test verifies that a created notification appears, can be marked read, and can be deleted.
- No automated test verifies quiet-hours behavior from the settings page through to the API response.

## Backend Gaps

### Notification Automation
- In-app notification storage is implemented, but email/SMS/push delivery channels are not implemented yet.
- Scheduled dispatch / queue processing is not implemented yet.
- There is no dedicated notification test file in [Backend/tests](../../Backend/tests).
- There is no automated test for bulk send, mark-read-batch, or stats endpoints.

### Performance Module
- The performance flow is now testable, but the code still emits Pydantic v2 deprecation warnings from class-based `Config` usage.
- FastAPI startup still emits `on_event` deprecation warnings.

## Database Gaps

### Schema / Migration Layer
- There is no Alembic or migration directory in the repository, so schema evolution is still being handled directly in models.
- Notification template and preference records have no seed/migration data path.
- Numeric fields used for KPI calculations require careful conversion in services because the ORM returns `Decimal` values.

### Data Model Coverage
- Notification records are persisted, but there is no separate delivery log table for retries, bounce handling, or audit history.
- There is no queue/outbox table for scheduled or retryable notification delivery.

## End-to-End Test Matrix

| Case | Frontend | Backend | Database | Status | Gap |
|------|----------|---------|----------|--------|-----|
| Create performance goal | Present | Verified | Verified | PASS | None |
| Calculate employee KPI score | Present | Verified | Verified | PASS | None |
| Update goal achievement | Present | Verified | Verified | PASS | None |
| Recruitment ATS flow | Present | Verified | Verified | PASS | None |
| Create notification template | Missing UI | Verified | Verified | PARTIAL | No template screen |
| Send notification | Present | Verified | Verified | PARTIAL | No automated UI test |
| Mark notification as read | Present | Verified | Verified | PARTIAL | No browser E2E coverage |
| Update notification preferences | Present | Verified | Verified | PARTIAL | No E2E validation for quiet hours |
| Bulk notification send | Missing UI | Verified | Verified | PARTIAL | No UI and no automated test |
| Notification stats | Missing UI | Verified | Verified | PARTIAL | No dashboard view |

## Priority Fix List

1. Add notification-focused backend tests under [Backend/tests](../../Backend/tests).
2. Add Playwright E2E coverage for [Frontend/app/notifications/page.tsx](../../Frontend/app/notifications/page.tsx) and [Frontend/app/settings/notifications/page.tsx](../../Frontend/app/settings/notifications/page.tsx).
3. Add a notification bell or drawer component to the shell for fast access.
4. Add a migration strategy for model changes instead of relying on direct table creation.
5. Add email delivery support and a delivery/outbox table for retry-safe notifications.

## Current Summary
The core Performance and Recruitment flows are now passing end-to-end backend checks. The largest remaining gaps are notification delivery channels, browser-level E2E coverage, and database migration discipline.

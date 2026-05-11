# HRMS Engagement & Document Features Implementation Plan

This document outlines the end-to-end implementation roadmap for the remaining features in the "Partially Done / Scaffolded" section of your project status report. 

I have already implemented the **Org Hierarchy Visualization** as the first step (which you can view at `/organization/hierarchy`). 

Please review the remaining modules below and let me know which one you would like me to build out next!

## 1. File Upload & Document Handling Improvements
*Goal: Allow employees and HR to upload, manage, and view important documents.*
- **Database**: Add `EmployeeDocument` model (id, employee_id, document_type, s3_key/file_path, uploaded_by, uploaded_at).
- **Backend API**: 
  - `POST /api/v1/employees/{id}/documents` (using `FastAPI.UploadFile` and local storage/S3 integration).
  - `GET /api/v1/employees/{id}/documents` (list documents).
  - `GET /api/v1/employees/documents/{doc_id}/download` (serve file).
- **Frontend**: Create a new tab or section `app/employees/[id]/documents/page.tsx` with a drag-and-drop file uploader and a data table for viewing uploaded files.

## 2. Performance & KPIs
*Goal: Allow managers to set KPIs and conduct performance appraisals.*
- **Backend API**:
  - `POST /api/v1/engagement/kpi` and `GET /api/v1/engagement/kpi`.
  - `POST /api/v1/engagement/appraisal` and `PUT` for updates.
- **Frontend**: 
  - Create `app/performance/page.tsx`.
  - Build two tabs: "My KPIs" and "My Appraisals".
  - If Manager/HR: Show a table of direct reports to assign KPIs and conduct appraisals.

## 3. Training & Certifications
*Goal: Manage the Learning Management System (LMS) aspect.*
- **Backend API**:
  - CRUD for `TrainingCourse` (Admin only).
  - `POST /api/v1/engagement/training/enroll` (Enroll employees).
  - `POST /api/v1/engagement/certifications` (Upload and track certs).
- **Frontend**:
  - Create `app/training/page.tsx`.
  - "Course Catalog" view for employees to see available/assigned training.
  - "My Certifications" view to track achievements and expiry dates.

## 4. Surveys
*Goal: Gather employee feedback and engagement scores.*
- **Database**: We currently do *not* have models for this. We need to create `Survey`, `SurveyQuestion`, and `SurveyResponse` in `models.py`.
- **Backend API**:
  - `POST /api/v1/engagement/surveys` (Create survey with questions).
  - `POST /api/v1/engagement/surveys/{id}/submit` (Submit answers).
- **Frontend**:
  - Create `app/surveys/page.tsx` with a list of active surveys.
  - Create `app/surveys/[id]/take/page.tsx` with dynamic form generation based on the question type (radio, text, scale).

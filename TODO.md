# College ERP Delivery Tracker

Status legend: `[ ]` open, `[-]` in progress, `[x]` implemented and verified with evidence.

## 1. Runnable architecture and security foundation

- [-] Create a modular Node.js/Express JavaScript backend and semantic HTML5/CSS3/Vanilla JavaScript frontend. Keep routes, controllers, services, models, middleware, validators, utilities, jobs, scripts, docs and frontend modules separated; do not use React, Vue, Angular, Svelte, TypeScript, Bootstrap, Tailwind or frontend component frameworks.
- [-] Add environment validation, separate development/test/production configuration, MongoDB connection handling, safe startup failure, health/readiness endpoints, structured logs, request IDs, graceful shutdown, `.env.example`, Docker support and required npm scripts.
- [ ] Add OpenAPI documentation, CI lint/test/dependency-audit workflow, deployment, reverse-proxy HTTPS, backup and restore instructions.

## 2. Authentication, OTP, sessions and RBAC

- [-] Implement login by email, phone, username or assigned college ID with rate limiting, generic account responses, password verification and configurable password-plus-OTP or passwordless OTP flow.
- [-] Generate cryptographically secure six-digit OTPs, store only hashes, expire after five minutes by default, cap verification attempts at five, enforce resend cooldowns and per-account/per-IP/provider limits, bind challenges to purpose, invalidate prior challenges by policy, prevent replay and concurrent verification races, and never log OTPs, passwords, tokens or secrets.
- [-] Implement development-only email/SMS adapters and guarded demo OTP behavior; never expose production OTPs through APIs or frontend code.
- [-] Implement short-lived access tokens, rotating hashed refresh tokens, refresh-token reuse detection and family revocation, secure HttpOnly cookies with public Preview-compatible `SameSite=None; Secure`, CSRF protection for cookie-authenticated state changes, logout, logout-all, session revocation and password-change invalidation.
- [ ] Implement purpose-bound password reset OTP and short-lived single-use reset authorization with generic responses and session invalidation.
- [-] Implement explicit server-side roles and permissions for Super Admin, Principal, HOD, Teacher, Student, Office Staff, Accountant/Fee Clerk, Librarian, Examination Controller and HR/Staff Manager. Do not trust role, user ID, department ID or permissions from the browser.
- [ ] Add sensitive-action reauthentication, security logs and audit trails for authentication, permissions and account status.

## 3. People, academic structure and enrollment

- [-] Student foundation slice: implement validated student records, unique enrollment numbers, contact/guardian details, department/course/batch/semester/session, admission/status fields, server-filtered search/status pagination, safe development records, role-gated list/create APIs and a responsive directory page. Remaining admissions documents, promotion/transfer/graduation workflows, CSV import, ID cards, certificates, history and audit expansion remain open.
- [ ] Implement teacher/staff employee IDs, departments, designations, qualifications, employment details/status, subjects/classes, staff attendance, leave, workload, assignments, directory/search and secure documents.
- [ ] Implement departments, degree programs/courses, academic years/sessions, batches/sections, semesters/progression, subjects/codes/credits/theory-practical classification, teacher assignments, class enrollment, grading schemes and prerequisites with relationship validation.
- [ ] Enforce cross-department, cross-student and unauthorized sensitive-record protection on every endpoint.

## 4. Attendance and scheduling

- [ ] Implement daily and optional period-wise student attendance, teacher/staff attendance, present/absent/late/approved-leave statuses, bulk entry, duplicate prevention, correction requests/approvals, history and audit trails, monthly/semester reports, backend percentage calculations, configurable thresholds and authorized guardian notifications.
- [ ] Implement class/teacher timetables, rooms/labs, subjects/periods, breaks/holidays/calendar, teacher/room/class conflict detection, HOD approval, publishing/version history and exam timetables; prevent double booking.

## 5. Finance

- [ ] Implement fee categories/structures, course/semester fees, invoices, tuition/exam/library/hostel/transport/miscellaneous fees, scholarships/concessions/waivers, installments, due dates/late fees, outstanding balances, payment history, unique receipts, approved payment methods, gateway adapter, verified idempotent webhooks, refunds/reversals, reconciliation, audit logs and collection/dues reports.
- [ ] Store money in integer minor units such as paise; never use floating-point arithmetic. Never treat a frontend payment result as success without backend provider signature and transaction verification. Never store card numbers, CVVs or prohibited credentials.

## 6. Examinations and results

- [ ] Implement exam types/schedules, maximum/passing marks, internal/practical/external assessment, validated marks entry, teacher submission, HOD/controller approval, publication workflow, configurable grading, SGPA/CGPA, result history, marksheets/reports, failed/backlog tracking, revaluation and authorized corrections.
- [ ] Prevent unauthorized publication or post-publication edits except through an approved correction workflow; preserve historical versions and audit changes.

## 7. Library, communication and leave

- [ ] Implement books, ISBN/title/author/publisher/category/edition, multiple copies, search/filter, issue/return, due dates, reservation queues, overdue/fines, lost/damaged records, borrower history, inventory and reports; prevent issuing unavailable copies and duplicate returns.
- [ ] Implement institution/department/class/role notices, read/unread tracking, in-app notifications, email/SMS adapters, validated private attachments, scheduling/expiry, approvals, preferences and delivery status; authorize listing and downloads.
- [ ] Implement student/teacher/staff leave, leave types/balances, supporting documents, configurable multi-level approvals, reasons, status history, notifications, cancellation/resubmission and self-approval prevention.

## 8. Additional college modules

- [ ] Implement admissions/applications/document verification/status/enrollment conversion.
- [ ] Implement hostels/buildings/rooms/beds/allocations/availability/fees/check-in/out.
- [ ] Implement transport routes/stops/vehicles/drivers/allocations/fees/reports.
- [ ] Implement placement companies/drives/eligibility/applications/interviews/outcomes/reports.
- [ ] Implement assets/inventory/stock/consumables/purchases/issues/assignments.
- [ ] Implement certificate requests/verification/approval/unique references/printable certificates/verification codes.
- [ ] Implement feedback/complaints with assignment, resolution state and confidentiality controls.
- [ ] Implement security audit logs, sensitive access logs, export controls, retention/deletion workflows, encrypted backups and restore procedures.

## 9. Data model, uploads and reporting

- [ ] Create validated Mongoose models and indexes for User, Role, Permission, Session, RefreshToken, OTPChallenge, PasswordReset, Student, Teacher, Staff, Department, Course, AcademicSession, Semester, Batch, Section, Subject, Enrollment, TeacherAssignment, Timetable, Attendance, AttendanceCorrectionRequest, FeeStructure, Invoice, Payment, PaymentWebhookEvent, Scholarship, Exam, ExamSchedule, Assessment, Result, ResultCorrectionRequest, Book, BookCopy, BookIssue, Notice, Notification, LeaveApplication, Approval, Hostel, Room, HostelAllocation, TransportRoute, Vehicle, Certificate, Document, AuditLog and SystemSetting, plus required supporting models.
- [ ] Add required fields/enums/relationship validation, unique indexes for identity/enrollment/employee/receipt/certificate data, compound query indexes, duplicate prevention, soft deletion and explicit retention policies. Prevent mass assignment and client changes to roles, verification, payment or approval state.
- [ ] Add secure private uploads for photos, admission/identity/enrollment documents, certificates, staff documents and authorized assignments with size/type/signature allowlists, random IDs, private storage, authorized/signed downloads, audit trails and retention/deletion. Never expose private uploads from a public static directory.
- [ ] Add authorized enrollment/department/attendance/staff attendance/fees/scholarship/exam/library/admission/leave/hostel/transport reports, CSV exports with escaping and formula-injection protection, printable HTML and optional backend PDFs.

## 10. Frontend and API integration

- [-] Build Civic Editorial Console visual language: light university administration UI with navy, warm white, slate and restrained cobalt, responsive rail/mobile navigation, accessible forms/tables/dialogs, loading/empty/error/success states, skeletons, destructive confirmations, search/filter/pagination, notifications, keyboard focus and optional dark mode.
- [-] Build centralized Vanilla JS API client, auth state, safe DOM rendering, validation, notifications and permission-aware navigation. Dashboard figures must come from real APIs; do not hardcode live statistics or use frontend authorization as the security boundary.
- [ ] Implement and document versioned `/api/v1` authentication, users/roles/permissions, students, academic, attendance, finance, examinations/results, library, notices, leave, staff and reports routes. Every endpoint validates input, authenticates where required, enforces resource permissions, returns correct status, paginates large collections, prevents cross-record access, is OpenAPI-documented and has relevant tests. Sensitive actions must not use GET.

## 11. Seed data and test evidence

- [-] Create an idempotent development-only seed script with departments, courses, sessions, semesters, subjects, batches, role-specific permissions, all requested demo accounts, linked profiles and clearly marked demo records. Hash passwords, use upserts, refuse production by default, support disposable-dev reset only, and document example.com credentials and guarded OTP behavior.
- [ ] Add automated authentication tests for valid/invalid login, OTP expiry/replay/attempt limits/resend throttling, refresh rotation/reuse, logout/session revocation, password reset and suspension.
- [ ] Add authorization/business tests proving student isolation, teacher assignment scope, HOD department scope, accountant cannot publish results, teacher cannot grant admin, private-document protection, duplicate attendance prevention, percentage calculation, fee reconciliation, duplicate webhook prevention, timetable conflicts, mark validation/publication, library consistency and approval restrictions.
- [ ] Add model validation, API integration, error-handling, seed idempotency, accessibility and frontend smoke tests. Run and record actual results; never claim unverified success.

## 12. Phase evidence

- [-] Phase 1: architecture, design, requirements mapping, project scaffold and security foundation.
- [ ] Phase 2: authentication, OTP, session management, authorization and security hardening.
- [ ] Phase 3: core models, academic structure, seed data and demo accounts.
- [ ] Phase 4: people, student, teacher, staff, department and enrollment workflows.
- [ ] Phase 5: attendance, timetable, fees, payments, examinations and results.
- [ ] Phase 6: library, notices, leave, admission, hostel, transport and additional modules.
- [ ] Phase 7: complete responsive Vanilla JS frontend and API integration.
- [ ] Phase 8: automated tests, security review notes, OpenAPI and bug fixes.
- [ ] Phase 9: deployment, setup guide, backup strategy and production-readiness checklist.

## Acceptance evidence to preserve

The final project is acceptable only when all seeded roles can use the documented development login/OTP flow; OTP expiry and attempt limits work; unauthorized cross-role and cross-record access is blocked; the frontend uses real backend APIs; core records persist in MongoDB; demo data is consistently linked; attendance, fees, results and library workflows enforce business rules; the UI is responsive and usable; critical automated tests pass; setup/deployment docs are complete; and real secrets, email/SMS delivery, HTTPS, backups and payment credentials are configured separately before live deployment.

# College ERP Management System — Phase 1 Plan

## Product scope

This project is a production-oriented College ERP, not a static UI demo. It will support Super Admin, Principal, HOD, Teacher, Student, Office Staff, Accountant/Fee Clerk, Librarian, Examination Controller and HR/Staff Manager through a server-enforced permission model. The implementation will proceed incrementally and will explicitly track what is complete, tested and still open.

## Implementation approach

The application will use a modular Node.js/Express backend and a semantic HTML/CSS/Vanilla JavaScript frontend. MongoDB is the system of record through Mongoose; all database access is isolated behind models/services and configured through environment variables. Authentication uses short-lived access credentials plus rotating, hashed refresh sessions, purpose-bound hashed OTP challenges, development-only delivery adapters and secure cookies. Every privileged workflow is validated server-side and produces an audit trail.

The first implementation slice establishes a runnable system with:

- Safe environment loading and startup failure behavior.
- Express security middleware, request IDs, structured logging and centralized errors.
- MongoDB connection adapter with health/readiness endpoints.
- User/role/permission/session/OTP model foundations.
- Login, OTP request/verify, refresh, logout, current-user and session endpoints.
- Server-side RBAC and resource-scope middleware.
- A polished Vanilla JS shell with login, OTP verification and dashboard screens driven by API responses.
- Idempotent development seed data for all requested demo roles.

Subsequent slices add academic records, student/staff operations, attendance, timetable, finance, exams/results, library, communication, leave and additional modules. Each slice must add validation, authorization, persistence, API documentation and relevant tests together rather than leaving fake buttons behind.

## Backend structure

- `backend/src/app.js`: Express application composition, security headers, parsers, routes and error handling.
- `backend/src/server.js`: startup, database readiness, graceful shutdown and listener.
- `backend/src/config/`: environment validation, MongoDB connection, security/cookie policy.
- `backend/src/models/`: Mongoose schemas, indexes, enums and relationship constraints.
- `backend/src/routes/`: versioned `/api/v1` route declarations.
- `backend/src/controllers/`: HTTP orchestration only; no duplicated business rules.
- `backend/src/services/`: authentication, OTP delivery, sessions, permissions, audit and domain workflows.
- `backend/src/middleware/`: auth, RBAC, validation, rate limiting, request IDs, uploads and errors.
- `backend/src/validators/`: request schemas and normalization.
- `backend/src/utils/`: crypto, pagination, response helpers, logging and safe serialization.
- `backend/scripts/`: idempotent seed, index initialization, admin and disposable demo reset tools.
- `backend/tests/`: unit and integration coverage for authentication, authorization and business invariants.
- `backend/src/docs/`: OpenAPI source and API notes.

## Frontend structure

- `frontend/index.html`: public entry and authentication shell.
- `frontend/login.html`, `frontend/verify-otp.html`: accessible auth screens.
- `frontend/dashboard.html`: permission-aware administration workspace.
- `frontend/assets/css/`: tokens, layout, components, responsive rules and optional dark mode.
- `frontend/assets/js/`: API client, auth state, safe DOM rendering, navigation, notifications and page controllers.
- Additional module pages will be added only when backed by real API flows.
- `public/manus-routes.json`: complete page route manifest required by Webdev Preview.

## Data and security decisions

- Monetary values use integer minor units (paise for INR), never floating-point arithmetic.
- OTPs, passwords, refresh tokens and reset authorizations are never stored or logged in plaintext.
- Browser sessions prefer HttpOnly, Secure and `SameSite=None` cookies in public HTTPS Preview, with CSRF protection for cookie-authenticated state changes.
- Role, user, department, approval, payment and publication fields are server-owned; client payloads cannot mass-assign them.
- Private documents are not served from a public static folder and use authorization plus short-lived download authorization.
- Sensitive actions create audit events; logs redact credentials, tokens, OTPs and personal secrets.
- Demo authentication is strictly development-only and cannot be enabled when publicly exposed.

## API conventions

All APIs use `/api/v1`, consistent envelopes (`{ ok, data, meta }` or `{ ok: false, error }`), HTTP-appropriate status codes, pagination/filtering/sorting where collections can grow, normalized validation errors and generic authentication responses that do not disclose account existence. OpenAPI documentation is kept beside the implementation.

## Design direction

### Candidate styles

1. **Civic Editorial Console** — restrained institutional navy, paper-white surfaces and strong typographic hierarchy. Probability: 0.07.
2. **Quiet Swiss Operations** — disciplined grids, slate surfaces, precise blue accents and dense but calm information design. Probability: 0.06.
3. **Modern Campus Ledger** — warm white workspace, ink navy, muted cobalt and ledger-inspired dividers. Probability: 0.05.

### Chosen style: Civic Editorial Console

- **Design Movement:** Contemporary civic-service editorial design with university registrar precision.
- **Core Principles:** calm authority, visible system status, progressive disclosure, and human-readable records.
- **Color Philosophy:** navy conveys institutional trust; warm white keeps long sessions comfortable; slate supports hierarchy; one restrained cobalt marks action and focus without looking like a consumer SaaS toy.
- **Layout Paradigm:** a persistent narrow rail paired with an offset working canvas and a top status strip; important approvals and exceptions sit in a readable activity column instead of a generic centered card grid.
- **Signature Elements:** thin registrar-rule dividers, compact uppercase section labels, and cobalt “active record” markers.
- **Interaction Philosophy:** every mutation gives clear state feedback, destructive actions require context-aware confirmation, and empty states explain the next useful action.
- **Animation:** subtle 150–220ms opacity/translate transitions for panels and notifications; no distracting looping motion; respect reduced-motion preferences.
- **Typography System:** system UI stack for dependable rendering, with a high-contrast serif display treatment only for page titles and institutional identity; body text stays highly legible at 14–16px.
- **Brand Essence:** a dependable academic operations desk for institutions that need clarity across people, records and approvals. Personality: composed, accountable, practical.
- **Brand Voice:** direct, calm and operational. Example lines: “Three approvals need your review.” “This record is saved and audit-tracked.”
- **Wordmark & Logo:** a simple open-book monogram formed from two vertical registrar rules and a cobalt registration dot, paired with a compact wordmark.
- **Signature Brand Color:** Registrar Cobalt `#3E63DD`, used sparingly for focus, active navigation and primary actions.

## Delivery sequence

1. Architecture, security foundations, schema foundations and runnable scaffold.
2. Authentication, OTP, sessions, RBAC and seed accounts.
3. Academic structure, students, teachers, staff and enrollment.
4. Attendance, timetable and scheduling conflict rules.
5. Fees, payments, examinations and results.
6. Library, notices, notifications and leave workflows.
7. Admission, hostel, transport, placement, inventory, certificates and feedback/compliance.
8. Reporting, uploads, OpenAPI, automated tests, CI and deployment hardening.

No phase will be described as complete without implementation evidence. The README and TODO file will show completed, tested and remaining areas.

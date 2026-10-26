# College ERP Management System

A production-oriented College ERP foundation built with Node.js, Express, MongoDB/Mongoose, and a semantic HTML/CSS/Vanilla JavaScript frontend. This repository deliberately tracks delivered and remaining modules in [`TODO.md`](./TODO.md); Phase 1 is implemented, while the academic, finance, library and additional workflows remain open.

## Current delivery

The working foundation includes a secure Express shell, Helmet/CORS/rate limits, structured redacted logging, environment validation, health/readiness endpoints, Mongoose authentication models, development memory fallback for Preview, password plus OTP login, hashed purpose-bound OTP challenges, attempt/expiry/cooldown controls, rotating refresh sessions, logout/session revocation, server-side role permissions, a real API-driven dashboard, searchable student registry APIs and page, OpenAPI foundation, seed/index scripts and responsive Vanilla JS screens.

The first domain slice exposes `GET /api/v1/students` with validated search, status filters and pagination, plus `POST /api/v1/students` for roles explicitly granted `students:manage`. Student counts on the dashboard are computed by the backend; demo fallback data is clearly marked and MongoDB persistence is used when `MONGODB_URI` is configured. The responsive page is available at `/students.html` after sign-in.

The development memory fallback exists only so the Preview can demonstrate the first slice without a MongoDB daemon. For real persistence, set `MONGODB_URI` and run the seed script against a disposable development database. Production refuses to start without MongoDB and non-development secrets.

## Run locally

```bash
pnpm install
cp .env.example .env
# Start MongoDB: docker compose up -d mongo
pnpm run seed
pnpm run dev
```

Open `http://localhost:3000`. If MongoDB is not running, the server uses an explicit development-only in-memory adapter; it does not claim that data persisted to MongoDB. To demonstrate the seeded demo accounts without a local MongoDB, start with `DEMO_AUTH_ENABLED=true` and `MONGODB_URI=` in development.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@example.com | DemoAdmin@2026! |
| Principal | principal@example.com | DemoPrincipal@2026! |
| HOD | hod@example.com | DemoHOD@2026! |
| Teacher | teacher@example.com | DemoTeacher@2026! |
| Student | student@example.com | DemoStudent@2026! |
| Office Staff | office@example.com | DemoOffice@2026! |
| Accountant | accountant@example.com | DemoAccount@2026! |
| Librarian | librarian@example.com | DemoLibrary@2026! |
| Exam Controller | exams@example.com | DemoExam@2026! |
| HR Staff | hr@example.com | DemoHR@2026! |

These are non-sensitive example.com development credentials and must never be used in production. With `DEMO_AUTH_ENABLED=true` in development, the OTP is shown only in the verification screen and server log. Production API responses never contain OTPs.

## Commands

`pnpm run dev` starts the API and frontend, `pnpm start` starts production mode, `pnpm run seed` performs guarded idempotent development seeding, `pnpm run indexes` initializes MongoDB indexes, `pnpm test` runs automated tests, and `pnpm run lint` runs the current JavaScript smoke check.

## Security boundary

Roles, permissions, status, sessions, OTP validity and dashboard values are determined by the server. Access and refresh cookies are HttpOnly; access tokens are not placed in localStorage. In public HTTPS Preview, set `COOKIE_SECURE=true` so cookies use `SameSite=None; Secure`. Configure real SMTP/SMS adapters, strong production secrets, HTTPS, encrypted backups, malware scanning and a professional security review before handling real student or financial data.

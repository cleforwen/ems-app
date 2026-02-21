# EMR (Electronic Medical Records System)

## Overview
EMR is a hospital management system MVP that supports dialysis services. It uses a monorepo structure with separate backend and frontend applications.

## Tech Stack

### Backend (`/backend`)
- **Language**: Java 21
- **Framework**: Quarkus 3.17
- **Build Tool**: Gradle
- **Database**: PostgreSQL
- **Migrations**: Liquibase
- **Auth**: JWT (SmallRye JWT)

### Frontend (`/frontend`)
- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)

## Project Structure
```
ems/
├── backend/          # Quarkus REST API
├── frontend/         # React SPA
├── docker-compose.yml
└── README.md
```

## Architecture

### Multi-Tenancy
- Row-level tenancy with `hospital_id` discriminator
- All tenant-scoped entities extend `TenantEntity`
- JWT tokens include `hospitalId` claim

### Code Organization
- **Package by feature** pattern in backend
- Feature modules: `auth`, `hospital`, `user`, `patient`

### API Design
- REST APIs with `/api/v1/` prefix
- JSON request/response format
- Role-based access control (ADMIN, DOCTOR, NURSE, STAFF)

## Development

### Local Setup
```bash
# Start PostgreSQL
docker-compose up -d db

# Backend (dev mode)
cd backend && ./gradlew quarkusDev

# Frontend (dev mode)
cd frontend && npm run dev
```

### Environment Profiles
- `dev` - Local development with PostgreSQL
- `prod` - Production configuration

## Database

### Key Tables
- `hospitals` - Tenant/workspace
- `users` / `user_roles` - Authentication & authorization
- `patients` - Patient demographics
- `vitals`, `allergies`, `medications`, `diagnoses`, `lab_results` - Medical records

### Migrations
Located in `backend/src/main/resources/db/changelog/`

## Future Extensions
- Dialysis treatment tracking
- Billing system
- Audit logs
- HIPAA compliance

## Missing Features (To-Do)

### 1. Dialysis Treatment Tracking
- Pre-dialysis assessments (weight, BP)
- Intra-dialysis monitoring at intervals
- Post-dialysis assessments
- Machine & Station Management (assigning patients to machines/beds)
- Treatment Prescriptions (dialysate type, duration, UF targets, needle sizes)
- Scheduling (recurring dialysis shifts, e.g., MWF or TTS)

### 2. Clinical Operations
- Appointments & Scheduling (calendar interface for doctor consultations)
- Doctor's Dashboard (My Patients, Pending Lab Results, Upcoming Appointments)

### 3. Billing & Invoicing System
- Invoices (generation for treatments, medications, and room usage)
- Insurance Management (tracking coverage, claims, approvals)
- Payments (recording partial/full payments and outstanding balances)

### 4. Security & Compliance (HIPAA)
- Audit Logs (tracking who viewed/modified which medical record and when)
- Session Management (automatic logout after inactivity, strict password policies)
- Access Control Policies (restricting doctor access to only assigned patients)

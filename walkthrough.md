# Walkthrough: Patient Medical Records System

## Overview
This update implements the core medical record functionalities and administrative modules.

## Features Implemented

### 1. Patient Medical Records
A comprehensive patient details view with tabbed interface for:
- **Vitals**: Track temperature, blood pressure, heart rate, etc.
- **Allergies**: Record patient allergies and severity.
- **Medications**: Manage prescriptions and active medications.
- **Diagnoses**: Record medical diagnoses with ICD codes.
- **Lab Results**: Track lab test results and status.

**Key Components:**
- `PatientDetailsPage`: Main container with tabs.
- `VitalsList`, `AllergiesList`, `MedicationsList`, `DiagnosesList`, `LabResultsList`: Specialized components with "Add" dialogs.

### 2. User Management (Admin)
Manage hospital staff including Doctors, Nurses, and Staff.
- **List View**: Searchable list of users.
- **Create User**: Dialog to add new staff members with role assignment.

**Key Components:**
- `UsersPage`
- `CreateUserDialog`

### 3. Hospital Settings (Admin)
Manage hospital profile information.
- **Form**: Update hospital name, address, and contact details.

**Key Components:**
- `HospitalSettingsPage`

## Backend APIs
New REST endpoints implemented in Quarkus for complete CRUD operations:
- `/api/v1/patients/{id}/allergies`
- `/api/v1/patients/{id}/medications`
- `/api/v1/patients/{id}/diagnoses`
- `/api/v1/patients/{id}/lab-results`

## Use Cases Verified

### Adding a Patient Record
1. Navigate to **Patients**.
2. Select a patient to view details.
3. Switch to the **Vitals** tab.
4. Click **Add Vitals**.
5. Fill in the form (BP, Heart Rate, etc.) and save.
6. Verify the new record appears in the list.

### Managing Staff
1. Navigate to **Staff** (Admin only).
2. Click **Add User**.
3. Enter user details and select role (e.g., DOCTOR).
4. Save.

## Running the Application

### Backend
```bash
cd backend
./gradlew quarkusDev
```

### Frontend
```bash
cd frontend
npm run dev
```
(Requires Node.js 24+)

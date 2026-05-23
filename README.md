# Clinic Appointment Booking API

REST API for a clinic appointment booking system built with **Node.js**, **Express.js**, **PostgreSQL**, **JWT**, and **Zod**.

## Features

- Role-based access: `ADMIN`, `DOCTOR`, `PATIENT`
- JWT authentication
- 30-minute appointment slots (on the hour or half-hour only)
- Business rules: working hours, no double booking, future-only booking, 2-hour cancellation window
- Layered architecture: routes → controllers → services → validations → middlewares

## Tech Stack

- Node.js (ES Modules)
- Express.js 5
- PostgreSQL (`pg`)
- bcryptjs
- jsonwebtoken
- Zod

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/clinic_booking
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. Create the database

```sql
CREATE DATABASE clinic_booking;
```

### 4. Run migrations and seed

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start the server

Development (with nodemon):

```bash
npm run dev
```

Production:

```bash
npm start
```

API base URL: `http://localhost:3000`

## Seed Accounts

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@clinic.com   | Admin@123   |
| Doctor  | doctor@clinic.com  | Doctor@123  |
| Patient | patient@clinic.com | Patient@123 |

Sample doctor working hours: **08:00 – 14:00**

## API Endpoints

### Auth

| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/api/auth/register`  | Public  | Register as patient      |
| POST   | `/api/auth/login`     | Public  | Login and receive JWT    |

### Doctors

| Method | Endpoint         | Access              | Description        |
|--------|------------------|---------------------|--------------------|
| GET    | `/api/doctors`   | Authenticated       | List all doctors     |
| POST   | `/api/doctors`   | Admin               | Create doctor        |

### Appointments

| Method | Endpoint                            | Access              | Description                          |
|--------|-------------------------------------|---------------------|--------------------------------------|
| POST   | `/api/appointments`                 | Patient, Admin      | Book appointment                     |
| GET    | `/api/appointments/my`              | Patient, Doctor, Admin | View own (or all for admin) appointments |
| PATCH  | `/api/appointments/:id/cancel`      | Patient, Admin      | Cancel appointment                   |
| PATCH  | `/api/appointments/:id/complete`    | Doctor, Admin       | Mark appointment as completed        |

### Users (Admin)

| Method | Endpoint       | Access | Description    |
|--------|----------------|--------|----------------|
| GET    | `/api/users`   | Admin  | List all users |

### Health

| Method | Endpoint  | Description   |
|--------|-----------|---------------|
| GET    | `/health` | Health check  |

## Authentication

Send the JWT in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Booking Rules

1. Appointments are exactly **30 minutes**
2. Valid start minutes: **:00** or **:30** (e.g. 08:00, 08:30 — not 08:15)
3. `endTime` is calculated automatically as `startTime + 30 minutes`
4. Must be inside the doctor's working hours
5. Must be in the future
6. One active slot per doctor per `startTime` (unique constraint)
7. Patients can cancel only if the appointment starts in more than **2 hours**

## Example: Book an Appointment

```http
POST /api/appointments
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "doctorId": 1,
  "startTime": "2026-05-24T09:00:00.000Z"
}
```

Use a future datetime aligned to `:00` or `:30` within the doctor's working hours.

## Project Structure

```
src/
├── config/           # env & database pool
├── db/               # migrate & seed scripts
├── middlewares/      # auth, role, error, validate
├── modules/
│   ├── auth/
│   ├── doctors/
│   ├── appointments/
│   └── users/
├── utils/            # JWT, password, time helpers
├── app.js
└── server.js
```

## Postman

Import `postman/Clinic-Booking-API.postman_collection.json` into Postman.

1. Run **Login (Patient)** or another login request
2. The collection script saves `token` automatically
3. Use protected endpoints

## Scripts

| Command            | Description              |
|--------------------|--------------------------|
| `npm run dev`      | Start with nodemon       |
| `npm start`        | Start production server  |
| `npm run db:migrate` | Create tables          |
| `npm run db:seed`  | Seed sample users        |

## License

ISC

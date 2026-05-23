# Clinic Appointment Booking API

REST API for a clinic appointment booking system built with **Node.js**, **Express.js**, **PostgreSQL**, **JWT**, and **Zod**.

معرفی پروژه

این پروژه یک RESTful API برای مدیریت و رزرو نوبت کلینیک است که با معماری ماژولار طراحی شده و شامل:
احراز هویت کاربران با JWT
ثبت‌نام و ورود بیماران
مدیریت نقش‌ها (Admin / Doctor / Patient)
رزرو نوبت پزشک
مشاهده نوبت‌ها
لغو نوبت
تکمیل نوبت توسط پزشک
اعتبارسنجی درخواست‌ها
مدیریت خطاها
PostgreSQL Database
Middleware Architecture
می‌باشد.

## Tech Stack

- Node.js (ES Modules)
- Express.js 5
- PostgreSQL (`pg`)
- bcryptjs
- jsonwebtoken
- Zod

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
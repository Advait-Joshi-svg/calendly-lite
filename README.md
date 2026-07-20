# Calendly Lite

A full-stack scheduling application that allows hosts to define availability, share a public booking page, and manage bookings without double-booking conflicts.

## Features

- Email and password authentication
- JWT-protected host routes
- Weekly availability management
- Public time-slot discovery
- Public booking creation
- Database-level double-booking prevention
- Booking cancellation
- Booking rescheduling
- Email notifications through Resend
- PostgreSQL migrations
- Centralized validation and error handling

## Tech Stack

### Backend

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Zod
- JWT
- bcrypt
- Luxon
- Resend

### Frontend

The React frontend is currently under development.

## Backend Architecture

The backend separates responsibilities across:

- `routes` — HTTP request handling
- `schemas` — Zod request validation
- `models` — database queries
- `services` — booking logic, scheduling logic, and email delivery
- `middleware` — authentication and centralized error handling
- `emails` — reusable email templates
- `migrations` — ordered database schema changes

## Core API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Availability

- `POST /api/availability`
- `GET /api/availability`
- `PATCH /api/availability/:id`
- `DELETE /api/availability/:id`

### Public booking

- `GET /api/public/users/:slug/slots`
- `POST /api/public/:slug/bookings`

### Booking management

- `GET /api/bookings`
- `PATCH /api/bookings/:bookingId/cancel`
- `PATCH /api/bookings/:bookingId/reschedule`

## Database Integrity

Confirmed bookings are protected by a PostgreSQL exclusion constraint using `tstzrange`.

This prevents overlapping confirmed bookings for the same host, including requests that arrive concurrently.

Cancelled bookings are excluded from the overlap constraint.

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd calendly-lite/server
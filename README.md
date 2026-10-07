# Tasko

> A full-stack project and task management application with responsive web and mobile clients connected to one shared REST API and PostgreSQL database.

Tasko was developed as a Full Stack Developer internship technical assessment. It provides authentication, project management, task management, dashboard statistics, filtering, and real-time cross-platform data synchronization between the web and Android applications.

---

## Live Deployment

| Service | URL |
| --- | --- |
| Web Application | https://tasko-murex.vercel.app |
| Backend API | https://tasko-api-bnko.onrender.com |
| Health Check | https://tasko-api-bnko.onrender.com/health |
| Android APK / EAS Build | https://expo.dev/accounts/yuvarajadithyareddy/projects/taskflow-mobile/builds/deb86518-2dad-40b0-881c-9cbea0daf7bd |
| GitHub Repository | https://github.com/YuvarajAdithya/Project-management-system |

> Note: The backend is hosted on Render's free tier, so the first API request after a period of inactivity may take a few seconds while the service wakes up.

---

## Features

### Authentication

- User registration
- User login
- Secure logout
- JWT-based authentication
- Persistent authenticated sessions
- Password hashing with bcrypt
- Protected backend routes
- Automatic handling of unauthorized or expired sessions

### Project Management

Users can:

- Create projects
- View projects
- Edit projects
- Delete projects
- Search projects
- Filter projects by status
- Set project start and end dates

Supported project statuses:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

### Task Management

Users can:

- Create tasks
- View tasks
- Edit tasks
- Delete tasks
- Search tasks
- Filter tasks
- Move tasks between projects
- Update task status
- Update task priority
- Set task due dates

Supported task statuses:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

Supported priorities:

- `LOW`
- `MEDIUM`
- `HIGH`

### Dashboard

The dashboard displays:

- Total Projects
- Projects In Progress
- Total Tasks
- Completed Tasks
- Pending Tasks

### Cross-Platform Synchronization

The web and mobile applications use the same:

- Backend API
- PostgreSQL database
- User accounts
- Projects
- Tasks

Changes made from one platform become available on the other after refresh or pull-to-refresh.

For example:

1. Create a task from the Android application.
2. Refresh the deployed web application.
3. The new task appears on the web.
4. Update or complete the task from the web.
5. Pull-to-refresh on Android.
6. The updated task appears on mobile.

### Mobile Features

The Android application includes:

- Login and registration
- Dashboard
- Projects
- Project details
- Project create/edit/delete
- Tasks
- Task create/edit/delete
- Task completion
- Status and priority controls
- Search and filtering
- Pull-to-refresh
- Secure authentication token storage using Expo SecureStore
- Network error handling
- Session expiry handling

---

## Architecture

Tasko follows a monorepo architecture:

```text
taskflow/
|
|-- server/          Express + TypeScript REST API
|   |-- prisma/      Prisma schema and migrations
|   `-- src/         Controllers, routes, services and middleware
|
|-- apps/
|   |-- web/         React + Vite web application
|   `-- mobile/      Expo + React Native mobile application
|
|-- docs/
|   |-- API.md
|   `-- ER-DIAGRAM.md
|
`-- README.md
```

### System Architecture

```text
+--------------------------+
|                          |
|     React Web App        |
|   Vite + TypeScript      |
|                          |
+------------+-------------+
             |
             |
             | HTTPS / JSON
             |
             v
+------------+-------------+
|                          |
|     Express REST API     |
|   Node.js + TypeScript   |
|                          |
| JWT / Zod / Helmet       |
| Authorization / CORS     |
|                          |
+------------+-------------+
             |
             | Prisma ORM
             |
             v
+------------+-------------+
|                          |
|   Neon PostgreSQL DB     |
|                          |
+------------+-------------+
             ^
             |
             | HTTPS / JSON
             |
+------------+-------------+
|                          |
|   React Native Mobile    |
|    Expo + Expo Router    |
|                          |
+--------------------------+
```

Both clients communicate with the same backend and therefore operate on the same user data.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web | React, TypeScript, Vite |
| Web Routing | React Router |
| Web HTTP Client | Axios |
| Styling | Tailwind CSS / CSS |
| Mobile | React Native |
| Mobile Framework | Expo SDK 52 |
| Mobile Navigation | Expo Router |
| Secure Mobile Storage | Expo SecureStore |
| Backend | Node.js, Express.js |
| Backend Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Production Database | Neon |
| Authentication | JWT |
| Password Security | bcrypt |
| Validation | Zod |
| Security Headers | Helmet |
| Rate Limiting | express-rate-limit |
| Logging | Morgan |
| Web Hosting | Vercel |
| Backend Hosting | Render |
| Android Build | Expo EAS Build |

---

## Repository Structure

```text
server/
  prisma/
    migrations/
    schema.prisma
  src/
    config/
    controllers/
    middleware/
    routes/
    schemas/
    services/
    utils/
    app.ts
    server.ts

apps/
  web/
    src/
      components/
      contexts/
      lib/
      pages/
      types/

  mobile/
    app/
      (auth)/
      (tabs)/
      projects/
    src/
      components/
      contexts/
      lib/
      types/

docs/
  API.md
  ER-DIAGRAM.md
```

---

## Prerequisites

To run Tasko locally, install:

- Node.js 18+
- npm
- PostgreSQL, or access to a hosted PostgreSQL database
- Expo Go or an Android emulator for mobile development

---

## Clone the Repository

```bash
git clone https://github.com/YuvarajAdithya/Project-management-system.git
cd Project-management-system
```

---

## Environment Configuration

Real environment files are excluded from Git.

Use the provided `.env.example` files as templates.

### Backend

Create:

```text
server/.env
```

Example:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=replace-with-a-secure-production-secret
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
TRUST_PROXY=false
```

Never commit real database credentials or JWT secrets.

### Web

Create:

```text
apps/web/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Production:

```env
VITE_API_URL=https://tasko-api-bnko.onrender.com/api
```

### Mobile

Create:

```text
apps/mobile/.env
```

For the production backend:

```env
EXPO_PUBLIC_API_URL=https://tasko-api-bnko.onrender.com/api
```

For an Android emulator using a locally running backend:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

For a physical device using the development backend:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

---

## Database Setup

Navigate to the backend:

```bash
cd server
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

The initial Prisma migration is stored in:

```text
server/prisma/migrations/
```

Tasko's production PostgreSQL database is hosted using Neon.

---

## Backend Setup

```bash
cd server
npm install
npx prisma generate
npm run dev
```

Local backend:

```text
http://localhost:5000
```

API base:

```text
http://localhost:5000/api
```

Health endpoint:

```text
GET /health
```

---

## Web Application Setup

Open another terminal:

```bash
cd apps/web
npm install
npm run dev
```

The web application runs locally at:

```text
http://localhost:5173
```

---

## Mobile Application Setup

```bash
cd apps/mobile
npm install
npx expo start
```

For Expo Go, scan the generated QR code using your Android device.

The physical device and local development machine should normally be on the same network when using a local backend.

---

## Android APK

A standalone Android APK has been built using Expo EAS Build.

Build / installation page:

https://expo.dev/accounts/yuvarajadithyareddy/projects/taskflow-mobile/builds/deb86518-2dad-40b0-881c-9cbea0daf7bd

The APK connects directly to the production backend:

```text
https://tasko-api-bnko.onrender.com/api
```

### Building Another APK

The repository contains an EAS `preview` build profile configured for an installable APK.

Run:

```bash
cd apps/mobile
npx eas-cli@latest build -p android --profile preview
```

---

## Production Deployment

### Database - Neon PostgreSQL

The production database is hosted on Neon.

The database connection string is stored only as a protected backend environment variable.

### Backend - Render

Production API:

```text
https://tasko-api-bnko.onrender.com
```

Render configuration:

```text
Root Directory:
server

Build Command:
npm ci --include=dev && npx prisma generate && npm run build

Start Command:
npm start

Health Check:
 /health
```

Important production environment variables include:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
NODE_ENV
CORS_ORIGIN
```

Secrets are configured directly in Render and are not stored in Git.

### Web - Vercel

Production application:

```text
https://tasko-murex.vercel.app
```

Vercel configuration:

```text
Root Directory:
apps/web

Framework:
Vite
```

Production environment variable:

```env
VITE_API_URL=https://tasko-api-bnko.onrender.com/api
```

### Mobile - Expo EAS

The Android application is built using Expo EAS Build.

The preview profile creates an APK using the production backend.

Android application ID:

```text
com.yuvarajadithya.tasko
```

---

## API Documentation

Complete REST API documentation is available here:

[docs/API.md](docs/API.md)

It documents authentication, projects, tasks, dashboard endpoints, validation rules, request bodies, and responses.

---

## Database / ER Diagram

Database entity relationships are documented here:

[docs/ER-DIAGRAM.md](docs/ER-DIAGRAM.md)

The primary relationship structure is:

```text
User
 |
 | 1:N
 v
Project
 |
 | 1:N
 v
Task
```

A user owns multiple projects, and each project contains multiple tasks.

Ownership checks ensure authenticated users can only access their own resources.

---

## Security

Tasko implements multiple backend and client security measures.

### Password Security

Passwords are hashed with bcrypt before being stored.

Plain-text passwords are never saved in the database.

### JWT Authentication

Protected routes require a valid JWT bearer token.

Expired, missing, or invalid tokens return an authentication error.

### Authorization

Every project and task operation verifies ownership against the authenticated user.

Users cannot access another user's projects or tasks.

### Input Validation

Zod schemas validate:

- Authentication requests
- Project data
- Task data
- UUID parameters
- Query filters

Unknown or invalid values are rejected before database operations.

### Rate Limiting

Authentication endpoints use request rate limiting to reduce brute-force login and registration attempts.

### HTTP Security

Helmet provides security-related HTTP response headers.

### CORS

Production CORS access is restricted to the deployed Tasko web application.

### Secret Management

Files such as:

```text
server/.env
apps/web/.env
apps/mobile/.env
```

are excluded from version control.

Production database credentials and JWT secrets are stored using deployment-platform environment variables.

---

## Demo Credentials

A seeded demo account is available:

```text
Email: demo@taskflow.com
Password: demo123456
```

The same account can be used on the web and mobile applications to demonstrate cross-platform synchronization.

---

## Cross-Platform Demonstration

A typical synchronization demonstration:

1. Sign in to Tasko on the deployed web application.
2. Sign in to the Android application using the same account.
3. Create a new task on mobile.
4. Refresh the web application.
5. Verify that the task appears.
6. Change its status or mark it completed on the web.
7. Pull-to-refresh the Android application.
8. Verify that the same change appears on mobile.

This demonstrates that both clients use the same backend and PostgreSQL database.

---

## Production URLs

```text
Web:
https://tasko-murex.vercel.app

Backend:
https://tasko-api-bnko.onrender.com

Backend Health:
https://tasko-api-bnko.onrender.com/health

Android APK / EAS:
https://expo.dev/accounts/yuvarajadithyareddy/projects/taskflow-mobile/builds/deb86518-2dad-40b0-881c-9cbea0daf7bd

GitHub:
https://github.com/YuvarajAdithya/Project-management-system
```

---

## Assessment Deliverables

- [x] Responsive web application
- [x] Android mobile application
- [x] Shared REST backend
- [x] Shared PostgreSQL database
- [x] Authentication
- [x] Project CRUD
- [x] Task CRUD
- [x] Dashboard statistics
- [x] Search and filtering
- [x] Cross-platform synchronization
- [x] Secure token storage
- [x] REST API documentation
- [x] ER diagram
- [x] Deployed web application
- [x] Deployed backend
- [x] Android APK build
- [ ] Public GitHub repository
- [ ] Demo recording

---

## License

This project is intended primarily as an internship technical assessment and portfolio project.
# TaskFlow

> A full-stack project and task management application built as a technical assessment for a Full Stack Developer internship. It features a responsive web dashboard, native mobile app, and a shared Express + TypeScript REST API.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Web App Setup](#web-app-setup)
- [Mobile App Setup](#mobile-app-setup)
- [Deployment](#deployment)
- [Mobile + Deployed Backend](#mobile--deployed-backend)
- [Security Implementation](#security-implementation)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)
- [Screenshots](#screenshots)
- [Deployment URLs](#deployment-urls)
- [License](#license)

---

## Project Overview

**TaskFlow** is a modern, production-grade task and project management solution engineered with end-to-end type safety, modular monorepo structure, and clean architecture principles. 

Designed for individuals and teams needing efficient project tracking, TaskFlow provides seamless synchronization across desktop and mobile devices via a unified RESTful backend API powered by PostgreSQL.

---

## Features

- **User Authentication & Authorization**: Secure registration and login using JWT (JSON Web Tokens) with password hashing and protected API routes.
- **Project CRUD with Status Tracking**: Create, read, update, and delete projects with status tags (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`) and date ranges.
- **Task Management**: Granular task creation associated with projects, supporting priority levels (`LOW`, `MEDIUM`, `HIGH`), statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and due dates.
- **Dashboard with Statistics**: Real-time analytical counters for total projects, active projects, total tasks, pending tasks, and completion metrics.
- **Search & Filtering**: Search projects and tasks by name, filter by status, priority, or project association.
- **Responsive Web UI**: Modern, responsive user interface built with React, Vite, and Tailwind CSS.
- **Native Mobile App**: Cross-platform mobile client built with Expo / React Native and Expo Router, featuring persistent secure storage.
- **Shared Backend and Database**: Centralized Express + TypeScript backend using Prisma ORM with PostgreSQL.

---

## Architecture

TaskFlow is organized as a monorepo consisting of:
- `server/` — Express + TypeScript + Prisma backend REST API
- `apps/web/` — React + Vite + Tailwind CSS web application
- `apps/mobile/` — Expo React Native mobile application
- `docs/` — API specifications and database documentation

### Architecture Diagram

```
+---------------------------+             +---------------------------+
|                           |             |                           |
|   React Web Application   |             |   Expo Mobile App (RN)    |
|   (Vite + Tailwind CSS)   |             |   (Expo Router + Storage) |
|                           |             |                           |
+-------------+-------------+             +-------------+-------------+
              |                                         |
              |               HTTP / JSON               |
              +------------------>   <------------------+
                                     |
                                     v
                      +-----------------------------+
                      |                             |
                      |     Express API Server      |
                      |   (Node.js + TypeScript)    |
                      |    JWT Auth, Zod, Helmet    |
                      |                             |
                      +--------------+--------------+
                                     |
                                     | Prisma ORM
                                     v
                      +-----------------------------+
                      |                             |
                      |     PostgreSQL Database     |
                      |    (Relational Storage)     |
                      |                             |
                      +-----------------------------+
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend Runtime & Framework** | Node.js, Express.js |
| **Backend Language** | TypeScript |
| **ORM & Database** | Prisma ORM, PostgreSQL |
| **Authentication & Security** | JWT (`jsonwebtoken`), `bcrypt`, Zod, Helmet, `cors`, `express-rate-limit` |
| **Logging & Utility** | Morgan, dotenv, tsx |
| **Web Frontend** | React 19, Vite, TypeScript |
| **Web Styling & Routing** | Tailwind CSS, PostCSS, React Router v7 |
| **Web HTTP Client** | Axios |
| **Mobile Framework** | React Native, Expo SDK 52 |
| **Mobile Routing & Storage** | Expo Router v4, `expo-secure-store` |
| **Mobile Icons & Styling** | `@expo/vector-icons`, StyleSheet / Safe Area Context |
| **Mobile HTTP Client** | Axios |

---

## Folder Structure

```
taskflow/
├── .gitignore
├── README.md
├── docs/
│   ├── API.md
│   └── ER-DIAGRAM.md
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── database.ts
│       │   └── index.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── dashboard.controller.ts
│       │   ├── project.controller.ts
│       │   └── task.controller.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── validate.middleware.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── dashboard.routes.ts
│       │   ├── index.ts
│       │   ├── project.routes.ts
│       │   └── task.routes.ts
│       ├── schemas/
│       │   ├── auth.schema.ts
│       │   ├── project.schema.ts
│       │   └── task.schema.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── dashboard.service.ts
│       │   ├── project.service.ts
│       │   └── task.service.ts
│       └── utils/
│           └── jwt.ts
└── apps/
    ├── web/
    │   ├── .env.example
    │   ├── index.html
    │   ├── package.json
    │   ├── postcss.config.js
    │   ├── tailwind.config.js
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts
    │   └── src/
    │       ├── App.tsx
    │       ├── index.css
    │       ├── main.tsx
    │       ├── components/
    │       │   ├── ConfirmDialog.tsx
    │       │   ├── EmptyState.tsx
    │       │   ├── Layout.tsx
    │       │   ├── LoadingSpinner.tsx
    │       │   ├── ProtectedRoute.tsx
    │       │   ├── StatusBadge.tsx
    │       │   └── TaskModal.tsx
    │       ├── contexts/
    │       │   └── AuthContext.tsx
    │       ├── lib/
    │       │   └── axios.ts
    │       ├── pages/
    │       │   ├── CreateProjectPage.tsx
    │       │   ├── DashboardPage.tsx
    │       │   ├── EditProjectPage.tsx
    │       │   ├── LoginPage.tsx
    │       │   ├── ProjectDetailPage.tsx
    │       │   ├── ProjectsPage.tsx
    │       │   ├── RegisterPage.tsx
    │       │   └── TasksPage.tsx
    │       └── types/
    │           └── index.ts
    └── mobile/
        ├── .env.example
        ├── app.json
        ├── package.json
        ├── tsconfig.json
        ├── app/
        │   ├── _layout.tsx
        │   ├── (auth)/
        │   │   ├── _layout.tsx
        │   │   ├── login.tsx
        │   │   └── register.tsx
        │   ├── (tabs)/
        │   │   ├── _layout.tsx
        │   │   ├── index.tsx
        │   │   ├── profile.tsx
        │   │   ├── projects.tsx
        │   │   └── tasks.tsx
        │   └── projects/
        │       └── [id].tsx
        └── src/
            ├── components/
            │   ├── EmptyState.tsx
            │   ├── FilterChips.tsx
            │   ├── LoadingScreen.tsx
            │   ├── PriorityBadge.tsx
            │   └── StatusBadge.tsx
            ├── contexts/
            │   └── AuthContext.tsx
            ├── lib/
            │   └── api.ts
            └── types/
                └── index.ts
```

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: version `>= 18.0.0`
- **npm** (v9+) or **yarn** (v1.22+)
- **PostgreSQL**: version `>= 14`
- **Expo CLI**: `npm install -g expo-cli` (or use `npx expo`)
- **Mobile Emulator / Device**:
  - Android Studio (for Android Emulator) and/or
  - Xcode (for iOS Simulator, macOS only) and/or
  - Expo Go app installed on your physical iOS/Android phone

---

## Environment Setup

Clone the repository and set up environment files for each package.

```bash
git clone <repository-url>
cd taskflow
```

### 1. Server Environment (`server/.env`)
Copy the sample file:
```bash
cp server/.env.example server/.env
```
Configure your values in `server/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
TRUST_PROXY=false
```

### 2. Web App Environment (`apps/web/.env`)
Copy the sample file:
```bash
cp apps/web/.env.example apps/web/.env
```
Configure your values in `apps/web/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Mobile App Environment (`apps/mobile/.env`)
Copy the sample file:
```bash
cp apps/mobile/.env.example apps/mobile/.env
```
Configure your values in `apps/mobile/.env`:
```env
# For Android Emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api

# For iOS Simulator:
# EXPO_PUBLIC_API_URL=http://localhost:5000/api

# For Physical Device (replace with your local network IP):
# EXPO_PUBLIC_API_URL=http://192.168.1.X:5000/api
```

---

## Database Setup

1. **Install PostgreSQL** (if not already installed). Ensure the PostgreSQL server is running.
2. **Create the Database**:
   Open `psql` or pgAdmin and run:
   ```sql
   CREATE DATABASE taskflow;
   ```
3. **Update Connection String**:
   Ensure `DATABASE_URL` in `server/.env` points to your database instance:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/taskflow"
   ```
4. **Run Prisma Migrations**:
   ```bash
   cd server
   npx prisma migrate deploy
   ```
   The initial migration is included in `server/prisma/migrations/`. Keep all migration files in Git. Only run migrations after configuring a working `DATABASE_URL`; the sample URL is a placeholder. For an existing database that already contains tables, inspect and baseline its migration history before applying the initial migration.
5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

*(Optional)* You can inspect your database graphically using Prisma Studio:
```bash
npx prisma studio
```

---

## Backend Setup

Navigate to the `server` directory, install dependencies, run migrations, and start the development server:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The server will start with hot reloading at:
**`http://localhost:5000`**

Health check: `GET http://localhost:5000/health` returns `{"status":"ok","message":"TaskFlow API is running"}`. API routes use the `/api` prefix. The health endpoint confirms that the HTTP server is running; it does not check the database connection.

---

## Web App Setup

Open a new terminal window, navigate to `apps/web`, install dependencies, and launch Vite:

```bash
cd apps/web
npm install
npm run dev
```

The web application runs locally at:
**`http://localhost:5173`**

Open your browser and navigate to `http://localhost:5173` to access the application.

---

## Mobile App Setup

Open a new terminal window, navigate to `apps/mobile`, install dependencies, and launch Expo:

```bash
cd apps/mobile
npm install
npx expo start
```

### Connecting to the Mobile App:

1. **Android Emulator**:
   - Start an Android Virtual Device (AVD) from Android Studio.
   - Press `a` in the Expo terminal.
   - Ensure `EXPO_PUBLIC_API_URL` is set to `http://10.0.2.2:5000/api` (Android loopback address).
2. **iOS Simulator** *(macOS only)*:
   - Press `i` in the Expo terminal.
   - Set `EXPO_PUBLIC_API_URL=http://localhost:5000/api`.
3. **Physical Device (iOS / Android)**:
   - Install **Expo Go** from the Google Play Store or Apple App Store.
   - Connect your phone to the same Wi-Fi network as your computer.
   - Find your computer's local IP address (`ipconfig` on Windows or `ifconfig` on macOS/Linux).
   - Set `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api` in `apps/mobile/.env`.
   - Scan the QR code displayed in your terminal using the Expo Go app (Android) or Camera app (iOS).

---

## Deployment

### 1. Database Deployment
You can use managed PostgreSQL services like **Railway**, **Supabase**, or **Neon**:
- Create a new PostgreSQL instance on [Railway](https://railway.app), [Supabase](https://supabase.com), or [Neon](https://neon.tech).
- Copy the provided connection string (e.g. `postgresql://user:password@host:port/dbname?sslmode=require`).

### 2. Backend Deployment (Railway, Render, or Fly.io)
#### Using Railway / Render:
1. Link your GitHub repository.
2. Set the root directory to `server`.
3. Set the build command:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
4. Set the start command:
   ```bash
   npx prisma migrate deploy && npm run start
   ```
5. Add environment variables:
   - `DATABASE_URL`: Your hosted database connection string
   - `JWT_SECRET`: A secure 64-character random string
   - `JWT_EXPIRES_IN`: `7d`
   - `PORT`: `5000` (or leave default for Railway/Render)
   - `CORS_ORIGIN`: Your deployed web frontend URL
   - `NODE_ENV`: `production`
   - `TRUST_PROXY`: Keep `false` for direct access. Behind Render/Railway or another reverse proxy, configure only the actual trusted ingress IPs/CIDRs after checking the provider's network setup. Do not use `true` or a blanket hop count. See `server/.env.example`.

### 3. Web App Deployment (Vercel or Netlify)
1. Link your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set the root directory to `apps/web`.
3. Set the build command: `npm run build`
4. Set the output directory: `dist`
5. Configure environment variable:
   - `VITE_API_URL`: `<deployed-backend-url>/api` (fill in after deployment)
6. Deploy the project. Ensure client-side routing rewrites are configured (`vercel.json` or `_redirects`).

---

## Mobile + Deployed Backend

To connect the mobile app to your production backend:

1. Open `apps/mobile/.env`.
2. Update `EXPO_PUBLIC_API_URL` to your production API URL:
   ```env
   EXPO_PUBLIC_API_URL=<deployed-backend-url>/api
   ```
3. Restart your Expo development server with cache cleared:
   ```bash
   npx expo start -c
   ```
4. You can build standalone APKs or iOS bundles using EAS Build:
   ```bash
   npm install -g eas-cli
   eas build --platform android
   ```

---

## Security Implementation

TaskFlow adopts security-in-depth across each layer of the application:

1. **bcrypt Password Hashing**: Passwords are cryptographically salted and hashed using bcrypt (10 rounds) prior to database persistence. Plain text passwords are never stored or logged.
2. **JWT Authentication**: Stateless authentication utilizing JSON Web Tokens with configurable expiration (`7d`).
3. **Auth Middleware**: Bearer token validation middleware intercepting protected endpoints; rejects expired, malformed, or missing tokens with `401 Unauthorized`.
4. **Resource Ownership & Tenancy Isolation**: All project and task queries enforce explicit tenancy matching against the authenticated `userId`. Users cannot inspect, mutate, or delete other users' projects or tasks.
5. **Zod Input Validation**: Strict schemas validate and sanitize request bodies, UUID route parameters, and query filters. Unknown body fields are rejected and Prisma writes explicitly select editable fields. Names are trimmed, emails are trimmed and lowercased, and registration requires a password of at least 8 characters. Task moves require ownership of the destination project.
6. **Helmet Security Headers**: Comprehensive HTTP security header protection (X-Frame-Options, Content Security Policy, X-Content-Type-Options, etc.).
7. **Rate Limiting**: `express-rate-limit` separately protects login and registration with 10 requests per 15 minutes per IP. Normal project and task routes do not share these auth limits. Reverse proxy trust must match the actual deployment topology; see `server/.env.example`.
8. **CORS Configuration**: Restricts API calls to approved origins (`CORS_ORIGIN`).
9. **Prisma ORM Protection**: Parameterized queries generated by Prisma inherently eliminate SQL injection vulnerabilities.
10. **Environment Variable Safeguards**: All critical keys, secrets, and database credentials remain separated from code and excluded via `.gitignore`. Production startup requires a non-placeholder `JWT_SECRET` of at least 32 characters.
11. **Centralized Error Handling**: Unified `AppError` class and global Express error-handling middleware ensure consistent JSON errors and conceal sensitive stack traces in production environments.

---

## API Documentation

For complete endpoint documentation, request parameters, schemas, and example payloads, refer to:
👉 **[docs/API.md](docs/API.md)**

For database entity relationships, constraints, and cascade delete behavior, refer to:
👉 **[docs/ER-DIAGRAM.md](docs/ER-DIAGRAM.md)**

---

## Demo Credentials

You can use the following credentials for testing or demonstration:

```text
Email:    demo@taskflow.com
Password: demo123456
```

After configuring `DATABASE_URL` and applying migrations, run:

```bash
cd server
npm run prisma:seed
```

The seed command creates this account together with demo projects and tasks. If `demo@taskflow.com` already exists, the seed leaves it unchanged, including its password.

---

## Screenshots

### Web Application

#### Web Dashboard
> *Placeholder for Web Dashboard screenshot showing analytics overview, active projects, and task counts.*  

#### Web Projects Page
> *Placeholder for Web Projects list view with search, status filters, and project cards.*  

#### Web Tasks Page
> *Placeholder for Web Tasks board showing task filtering, status badges, and task modal.*  

---

### Mobile Application

#### Mobile Dashboard
> *Placeholder for Mobile Dashboard view displaying task statistics and quick navigation.*  

#### Mobile Projects
> *Placeholder for Mobile Projects screen displaying active project cards and status chips.*  

#### Mobile Tasks
> *Placeholder for Mobile Tasks screen showing filtering by project, priority badges, and status.*  

---

## Deployment URLs

```text
Backend API: [Not deployed yet]
Web App:     [Not deployed yet]
```

---

## License

This project is licensed under the [MIT License](LICENSE).

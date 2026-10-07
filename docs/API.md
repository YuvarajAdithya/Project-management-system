# TaskFlow REST API Documentation

This document provides complete technical specifications for the TaskFlow backend API, including request/response formats, headers, query parameters, authentication, error handling, and rate limits.

---

## Table of Contents

- [General Overview](#general-overview)
  - [Base URL](#base-url)
  - [Authentication Header](#authentication-header)
  - [Standard Error Response Format](#standard-error-response-format)
  - [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication)
    - [1. Register User](#1-register-user)
    - [2. Login User](#2-login-user)
    - [3. Logout User](#3-logout-user)
    - [4. Get Current User Profile](#4-get-current-user-profile)
  - [Projects](#projects)
    - [5. Get All Projects](#5-get-all-projects)
    - [6. Get Project by ID](#6-get-project-by-id)
    - [7. Create New Project](#7-create-new-project)
    - [8. Update Project](#8-update-project)
    - [9. Delete Project](#9-delete-project)
  - [Tasks](#tasks)
    - [10. Get All Tasks](#10-get-all-tasks)
    - [11. Get Task by ID](#11-get-task-by-id)
    - [12. Create New Task](#12-create-new-task)
    - [13. Update Task](#13-update-task)
    - [14. Delete Task](#14-delete-task)
  - [Dashboard](#dashboard)
    - [15. Get Dashboard Statistics](#15-get-dashboard-statistics)

---

## General Overview

### Base URL

```text
Local Development:  http://localhost:5000/api
Production:        [Not deployed yet]
```

All requests must include `Content-Type: application/json` where request bodies are supplied.

`GET /health` (outside the `/api` prefix, no authentication required) returns:

```json
{ "status": "ok", "message": "TaskFlow API is running" }
```

This checks HTTP availability only. Unknown API routes return JSON `404` with a `message`.

Project and task bodies reject unknown fields, including ownership, timestamps, and nested relations. Resource IDs and task `projectId` filters must be UUID strings. Invalid UUIDs, enums, dates, arrays, or objects in filters return `400`. Empty filter strings are treated as omitted; search text and required names are trimmed. A whitespace-only required name is rejected.

---

### Authentication Header

Protected endpoints require a JSON Web Token (JWT) sent via standard HTTP Authorization Bearer header:

```http
Authorization: Bearer <your_jwt_token>
```

If the token is missing, expired, or malformed, the server responds with HTTP `401 Unauthorized`.

---

### Standard Error Response Format

Errors are returned with an HTTP status code matching the failure condition and a consistent JSON payload:

#### Generic / Operational Error
```json
{
  "message": "Resource not found"
}
```

#### Validation Error (HTTP 400 Bad Request)
When input payload fails Zod schema validation:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### Rate Limiting

`/api/auth/login` and `/api/auth/register` use separate per-IP rate limiters:
- **Window**: 15 minutes
- **Max Requests**: 10 attempts per IP
- **Exceeded Response (HTTP 429 Too Many Requests)**:
  ```json
  {
    "message": "Too many login attempts, please try again later"
  }
  ```

Registration uses the message `Too many registration attempts, please try again later`. Project/task routes do not use these auth limiters. Reverse proxy trust defaults to disabled and can be configured using explicit trusted ingress addresses in `TRUST_PROXY`; see `server/.env.example`.

---

## Endpoints

---

### Authentication

#### 1. Register User

Registers a new user account, creates credentials, and returns an authentication token.

- **Method & URL**: `POST /api/auth/register`
- **Description**: Creates a new user profile with hashed password.
- **Authentication Required**: No
- **Request Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@taskflow.com",
    "password": "securepassword123"
  }
  ```
- **Validation Rules**:
  - `fullName`: trimmed string, min 2 characters (whitespace-only names rejected)
  - `email`: valid email format, trimmed and lowercased in both registration and login
  - `password`: string, min 8 characters
- **Success Response**:
  - **Status Code**: `201 Created`
  - **Body**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2E0YjFjNy05ZDdiLTQ2ODctODkxOC0wZTA5MjFiMzE0MDkiLCJpYXQiOjE3Mzg4NzE2MDAsImV4cCI6MTczOTQ3NjQwMH0.7x9EXAMPLE_JWT_TOKEN",
      "user": {
        "id": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
        "fullName": "Jane Doe",
        "email": "jane@taskflow.com",
        "createdAt": "2026-10-06T20:00:00.000Z"
      }
    }
    ```
- **Error Responses**:
  - `400 Bad Request` (Validation Error):
    ```json
    {
      "message": "Validation failed",
      "errors": [
        {
          "field": "fullName",
          "message": "Full name must be at least 2 characters"
        }
      ]
    }
    ```
  - `409 Conflict` (Email Already Registered):
    ```json
    {
      "message": "Email already in use"
    }
    ```

---

#### 2. Login User

Authenticates an existing user and returns a signed JWT.

- **Method & URL**: `POST /api/auth/login`
- **Description**: Verifies email and password against stored password hash.
- **Authentication Required**: No
- **Request Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "jane@taskflow.com",
    "password": "securepassword123"
  }
  ```
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2E0YjFjNy05ZDdiLTQ2ODctODkxOC0wZTA5MjFiMzE0MDkiLCJpYXQiOjE3Mzg4NzE2MDAsImV4cCI6MTczOTQ3NjQwMH0.7x9EXAMPLE_JWT_TOKEN",
      "user": {
        "id": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
        "fullName": "Jane Doe",
        "email": "jane@taskflow.com",
        "createdAt": "2026-10-06T20:00:00.000Z"
      }
    }
    ```
- **Error Responses**:
  - `401 Unauthorized` (Invalid Credentials):
    ```json
    {
      "message": "Invalid email or password"
    }
    ```
  - `429 Too Many Requests` (Rate Limit Exceeded):
    ```json
    {
      "message": "Too many login attempts, please try again later"
    }
    ```

---

#### 3. Logout User

Logs the user out of the application.

- **Method & URL**: `POST /api/auth/logout`
- **Description**: Invalidates client session. Clients should also discard the stored JWT.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: No token provided"
    }
    ```

---

#### 4. Get Current User Profile

Retrieves profile details of the currently authenticated user.

- **Method & URL**: `GET /api/auth/me`
- **Description**: Fetches current user record using decoded token subject.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
      "fullName": "Jane Doe",
      "email": "jane@taskflow.com",
      "createdAt": "2026-10-06T20:00:00.000Z"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: Invalid token"
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "message": "User not found"
    }
    ```

---

### Projects

#### 5. Get All Projects

Retrieves all projects owned by the authenticated user with optional search and status filtering.

- **Method & URL**: `GET /api/projects`
- **Description**: Lists all user-owned projects sorted by creation date (descending).
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Query Parameters**:
  - `search` *(optional, string)*: Filters projects by name (case-insensitive substring match).
  - `status` *(optional, enum)*: One of `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    [
      {
        "id": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
        "userId": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
        "name": "Mobile App Redesign",
        "description": "Revamp the mobile client with Expo Router",
        "status": "IN_PROGRESS",
        "startDate": "2026-10-01T00:00:00.000Z",
        "endDate": "2026-11-15T00:00:00.000Z",
        "createdAt": "2026-10-01T10:00:00.000Z",
        "updatedAt": "2026-10-06T14:30:00.000Z"
      }
    ]
    ```
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: No token provided"
    }
    ```

---

#### 6. Get Project by ID

Fetches full details of a specific project.

- **Method & URL**: `GET /api/projects/:id`
- **Description**: Retrieves single project by UUID, strictly scoped to the authenticated user.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **URL Parameters**:
  - `id`: UUID of the project
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
      "userId": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
      "name": "Mobile App Redesign",
      "description": "Revamp the mobile client with Expo Router",
      "status": "IN_PROGRESS",
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-11-15T00:00:00.000Z",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-06T14:30:00.000Z"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: Invalid token"
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "message": "Project not found"
    }
    ```

---

#### 7. Create New Project

Creates a new project record owned by the authenticated user.

- **Method & URL**: `POST /api/projects`
- **Description**: Inserts project with default status `NOT_STARTED` if omitted.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "name": "Website Redesign",
    "description": "Overhaul the company marketing site with Tailwind CSS",
    "status": "NOT_STARTED",
    "startDate": "2026-10-10T00:00:00.000Z",
    "endDate": "2026-12-01T00:00:00.000Z"
  }
  ```
- **Validation Rules**:
  - `name`: string, required (min 1 character)
  - `description`: string (optional)
  - `status`: enum `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED` (optional, default: `NOT_STARTED`)
  - `startDate`: ISO 8601 datetime string or `null` (optional)
  - `endDate`: ISO 8601 datetime string or `null` (optional); cannot be earlier than `startDate`
- **Success Response**:
  - **Status Code**: `201 Created`
  - **Body**:
    ```json
    {
      "id": "bf521946-b31c-4b55-829d-9d2c2069fa34",
      "userId": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
      "name": "Website Redesign",
      "description": "Overhaul the company marketing site with Tailwind CSS",
      "status": "NOT_STARTED",
      "startDate": "2026-10-10T00:00:00.000Z",
      "endDate": "2026-12-01T00:00:00.000Z",
      "createdAt": "2026-10-06T20:30:00.000Z",
      "updatedAt": "2026-10-06T20:30:00.000Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request` (Validation Error):
    ```json
    {
      "message": "Validation failed",
      "errors": [
        {
          "field": "name",
          "message": "Project name is required"
        }
      ]
    }
    ```
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: No token provided"
    }
    ```

---

#### 8. Update Project

Updates an existing project owned by the authenticated user.

- **Method & URL**: `PUT /api/projects/:id`
- **Description**: Performs partial update on editable project fields. Date order is checked against the resulting dates, including unchanged stored values; `null` clears a date.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **URL Parameters**:
  - `id`: UUID of the project
- **Request Body** (all fields optional):
  ```json
  {
    "name": "Website Redesign Phase 1",
    "status": "IN_PROGRESS"
  }
  ```
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": "bf521946-b31c-4b55-829d-9d2c2069fa34",
      "userId": "c3a4b1c7-9d7b-4687-8918-0e0921b31409",
      "name": "Website Redesign Phase 1",
      "description": "Overhaul the company marketing site with Tailwind CSS",
      "status": "IN_PROGRESS",
      "startDate": "2026-10-10T00:00:00.000Z",
      "endDate": "2026-12-01T00:00:00.000Z",
      "createdAt": "2026-10-06T20:30:00.000Z",
      "updatedAt": "2026-10-06T20:45:00.000Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request` (Validation Error)
  - `401 Unauthorized`
  - `404 Not Found`:
    ```json
    {
      "message": "Project not found"
    }
    ```

---

#### 9. Delete Project

Deletes an existing project and automatically cascades removal to all associated tasks.

- **Method & URL**: `DELETE /api/projects/:id`
- **Description**: Removes project and cascades deletion to child tasks.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **URL Parameters**:
  - `id`: UUID of the project
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Project deleted successfully"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`
  - `404 Not Found`:
    ```json
    {
      "message": "Project not found"
    }
    ```

---

### Tasks

#### 10. Get All Tasks

Retrieves all tasks across user-owned projects, with optional filtering.

- **Method & URL**: `GET /api/tasks`
- **Description**: Returns tasks scoped to projects owned by the user.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Query Parameters**:
  - `projectId` *(optional, UUID string)*: Restricts tasks to a specific project.
  - `search` *(optional, string)*: Search by task name (case-insensitive substring match).
  - `status` *(optional, enum)*: One of `PENDING`, `IN_PROGRESS`, `COMPLETED`.
  - `priority` *(optional, enum)*: One of `LOW`, `MEDIUM`, `HIGH`.
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    [
      {
        "id": "e0b1c2d3-e4f5-4a6b-8c9d-0e1f2a3b4c5d",
        "projectId": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
        "name": "Design Login Mockups",
        "description": "Figma mockups for light and dark mode",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2026-10-15T18:00:00.000Z",
        "createdAt": "2026-10-02T11:00:00.000Z",
        "updatedAt": "2026-10-05T09:20:00.000Z"
      }
    ]
    ```
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: No token provided"
    }
    ```

---

#### 11. Get Task by ID

Retrieves details for a single task.

- **Method & URL**: `GET /api/tasks/:id`
- **Description**: Retrieves task by UUID, verifying parent project belongs to authenticated user.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **URL Parameters**:
  - `id`: UUID of the task
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": "e0b1c2d3-e4f5-4a6b-8c9d-0e1f2a3b4c5d",
      "projectId": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
      "name": "Design Login Mockups",
      "description": "Figma mockups for light and dark mode",
      "priority": "HIGH",
      "status": "COMPLETED",
      "dueDate": "2026-10-15T18:00:00.000Z",
      "createdAt": "2026-10-02T11:00:00.000Z",
      "updatedAt": "2026-10-05T09:20:00.000Z"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`
  - `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```

---

#### 12. Create New Task

Creates a new task linked to a specified project.

- **Method & URL**: `POST /api/tasks`
- **Description**: Validates that target `projectId` exists and belongs to the authenticated user.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "projectId": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
    "name": "Setup CI/CD Pipeline",
    "description": "Configure GitHub Actions workflow for automated testing and deployment",
    "priority": "HIGH",
    "status": "PENDING",
    "dueDate": "2026-10-20T12:00:00.000Z"
  }
  ```
- **Validation Rules**:
  - `projectId`: valid UUID string, required
  - `name`: string, required (min 1 character)
  - `description`: string (optional)
  - `priority`: enum `LOW` | `MEDIUM` | `HIGH` (optional, default: `MEDIUM`)
  - `status`: enum `PENDING` | `IN_PROGRESS` | `COMPLETED` (optional, default: `PENDING`)
  - `dueDate`: ISO 8601 datetime string or `null` (optional); `null` clears a date on update
- **Success Response**:
  - **Status Code**: `201 Created`
  - **Body**:
    ```json
    {
      "id": "3c98df56-a145-42bb-92f7-ec82701f54d1",
      "projectId": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
      "name": "Setup CI/CD Pipeline",
      "description": "Configure GitHub Actions workflow for automated testing and deployment",
      "priority": "HIGH",
      "status": "PENDING",
      "dueDate": "2026-10-20T12:00:00.000Z",
      "createdAt": "2026-10-06T21:00:00.000Z",
      "updatedAt": "2026-10-06T21:00:00.000Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request` (Validation Error):
    ```json
    {
      "message": "Validation failed",
      "errors": [
        {
          "field": "projectId",
          "message": "Invalid project ID"
        }
      ]
    }
    ```
  - `401 Unauthorized`
  - `404 Not Found` (Target Project Does Not Exist Or Belongs to Another User):
    ```json
    {
      "message": "Project not found"
    }
    ```

---

#### 13. Update Task

Updates properties of an existing task.

- **Method & URL**: `PUT /api/tasks/:id`
- **Description**: Updates partial task details. An optional UUID `projectId` moves the task only if the destination project belongs to the authenticated user; otherwise returns `404`.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **URL Parameters**:
  - `id`: UUID of the task
- **Request Body** (all fields optional):
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }
  ```
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": "3c98df56-a145-42bb-92f7-ec82701f54d1",
      "projectId": "7fa65e92-3482-4fa0-86c2-06b2ef322588",
      "name": "Setup CI/CD Pipeline",
      "description": "Configure GitHub Actions workflow for automated testing and deployment",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "dueDate": "2026-10-20T12:00:00.000Z",
      "createdAt": "2026-10-06T21:00:00.000Z",
      "updatedAt": "2026-10-06T21:15:00.000Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request` (Validation Error)
  - `401 Unauthorized`
  - `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```

---

#### 14. Delete Task

Deletes an existing task.

- **Method & URL**: `DELETE /api/tasks/:id`
- **Description**: Removes the task from the database.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **URL Parameters**:
  - `id`: UUID of the task
- **Request Body**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Task deleted successfully"
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`
  - `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```

---

### Dashboard

#### 15. Get Dashboard Statistics

Computes and returns aggregate metrics for the authenticated user's workspace.

- **Method & URL**: `GET /api/dashboard`
- **Description**: Returns counters for projects and tasks filtered strictly to the caller's account.
- **Authentication Required**: Yes
- **Request Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: None
- **Query Parameters**: None
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "totalProjects": 8,
      "projectsInProgress": 3,
      "totalTasks": 24,
      "completedTasks": 15,
      "pendingTasks": 9
    }
    ```
- **Field Descriptions**:
  - `totalProjects` *(number)*: Count of all projects owned by user.
  - `projectsInProgress` *(number)*: Count of user's projects with status `IN_PROGRESS`.
  - `totalTasks` *(number)*: Total tasks across all user-owned projects.
  - `completedTasks` *(number)*: Total tasks with status `COMPLETED`.
  - `pendingTasks` *(number)*: Total tasks with status `PENDING`.
- **Error Responses**:
  - `401 Unauthorized`:
    ```json
    {
      "message": "Unauthorized: No token provided"
    }
    ```

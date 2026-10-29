# 📋 Node.js & Express Full-Stack Backend Project Documentation
**Course / Project**: Node.js Complete Backend Course (`todo-app`)  
**Author**: Somya Ranjan Rath  
**Version**: 1.0.0  
**Generated Date**: October 27, 2026  
**Repository Path**: `/home/cdot/Desktop/clone/Nodejs_practice`

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Architecture & Directory Structure](#3-architecture--directory-structure)
4. [Environment & Configuration](#4-environment--configuration)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
6. [Authentication & Authorization (RBAC)](#6-authentication--authorization-rbac)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Session & Audit Activity Logging System](#8-session--audit-activity-logging-system)
9. [Database Administration (Mongo Express)](#9-database-administration-mongo-express)
10. [Setup & Running Instructions](#10-setup--running-instructions)
11. [Troubleshooting & Maintenance Guide](#11-troubleshooting--maintenance-guide)

---

## 1. Project Overview

This project is a production-grade, enterprise-ready **RESTful API backend** built with **Node.js** (ES Modules), **Express 5**, and **MongoDB (Mongoose 9)**. 

### Key Highlights:
- **Role-Based Access Control (RBAC)**: Two distinct privilege tiers (`admin` and `user`).
- **Strict Session Management**: Tracks user login sessions, prevents simultaneous duplicate logins, measures exact session durations, and tracks active session states.
- **Granular Audit Logging**: Every critical action (`LOGIN`, `LOGOUT`, `CREATE_TODO`, `UPDATE_TODO`, `DELETE_TODO`, `DELETE_USER`, `VIEW_USERS`, etc.) is recorded with session ID, user identity, endpoint, HTTP method, status, and human-readable detail.
- **Embedded Database Admin GUI**: Seamless integration with **Mongo Express** with custom column formatting, line-by-line permission display (`can_perform`), and admin-first default ordering.

---

## 2. Technology Stack & Dependencies

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v20+ / ES Modules | Modern JavaScript execution engine with native ESM (`"type": "module"`) |
| **Framework** | Express.js | `^5.3.0` | Core web application router and HTTP server |
| **Database** | MongoDB Server | v8.0.4 | High-performance NoSQL document database |
| **ODM** | Mongoose | `^9.11.2` | Object Data Modeling (schemas, models, validations) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.3` | Cryptographically signed stateless JWT authorization tokens (pinned to HS256) |
| **Security** | Bcrypt | `^6.0.0` | Secure password hashing (salt rounds = 10) |
| **Headers** | Helmet | `^8.1.0` | HTTP security headers (CSP, HSTS, X-Content-Type-Options, etc.) |
| **Protection**| Express Rate Limit | `^7.5.0` | Brute-force mitigation on authentication routes |
| **Config** | Dotenv | `^18.0.7` | Loading environment configurations from `.env` |
| **Dev Tools** | Nodemon | `^3.1.9` | Development auto-reload server |
| **Admin UI** | Mongo-Express | `1.0.0` | Web-based MongoDB administration console (`http://localhost:8081`) |

---

## 3. Architecture & Directory Structure

```text
Nodejs_practice/
├── backend/
│   ├── controller/
│   │   ├── controller.js          # Todo operations (create, fetch, update, delete)
│   │   └── user.js                # Auth, user management, sessions, access, and audit logs
│   ├── database/
│   │   └── db.js                  # Mongoose MongoDB connection handler
│   ├── middleware/
│   │   ├── admin.js               # Admin role verification & active login session guard
│   │   └── auth.js                # JWT token validation & user session attachment
│   ├── models/
│   │   ├── access.js              # Role-Based Access schema (roles_based_access)
│   │   ├── activity.js            # User session logs schema (session_logs)
│   │   ├── activityLog.js         # Audit activity log schema & logger utility (activity_logs)
│   │   ├── todo.js                # Todo items schema (todos)
│   │   └── user.js                # User identity schema (users)
│   ├── routes/
│   │   ├── route.js               # Todo API route definitions
│   │   └── user.js                # User & authentication API route definitions
│   ├── .env                       # Environment secrets and connection strings
│   ├── index.js                   # Application entry point, Express server & middleware setup
│   └── package.json               # Project manifest, dependencies, and npm scripts
├── express/                       # Express fundamental practice files
├── folder/                        # File system & path practice exercises
├── module/                        # Custom modular architecture practice
├── first.js ... seventh.js        # Core Node.js practice scripts (buffer, fs, crypto, streams)
└── test.txt                       # Test fixture file
```

---

## 4. Environment & Configuration

Stored in `backend/.env`:

```env
PORT = 4001

# JWT Secret Key for token signing & verification
JWT_SECRET=dndbbhsjzkjkqjnzbxcjsiqkl

# MongoDB Atlas (Cloud fallback):
# DB_URL=mongodb+srv://<username>:<password>@cluster0.b0dgbcs.mongodb.net/todo-app

# Local MongoDB (Default):
DB_URL=mongodb://127.0.0.1:27017/todo-app
```

---

## 5. Database Architecture & Data Models

Database Name: **`todo-app`**

### 1. `users` Collection (`models/user.js`)
Represents registered system accounts.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Auto-generated document ID |
| `username` | `String` | Required, Unique | Unique account username |
| `email` | `String` | Required, Unique | Unique account email address |
| `password` | `String` | Required | Hashed password string (bcrypt) |
| `role` | `String` | Enum: `["user", "admin"]`, Default: `"user"` | Authorization privilege level |
| `__v` | `Number` | Auto | Mongoose internal version key |

### 2. `roles_based_access` Collection (`models/access.js`)
Maps role permissions to specific users and defines what actions they can perform.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Auto-generated ID |
| `userId` | `ObjectId` | Ref: `user` | Foreign key referencing `users._id` |
| `username` | `String` | Required, Unique | Associated user username |
| `role` | `String` | Enum: `["user", "admin"]` | Role assigned |
| `can_perform` | `String` | Required | Multi-line numbered listing of permissible endpoints |
| `createdAt` | `Date` | Timestamp | Creation timestamp |
| `updatedAt` | `Date` | Timestamp | Last modification timestamp |

### 3. `session_logs` Collection (`models/activity.js`)
Maintains active and historical login sessions for users.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Session identifier |
| `userId` | `ObjectId` | Ref: `user`, Required | User foreign key |
| `username` | `String` | Required | Username at time of session |
| `role` | `String` | Required | Role at time of session |
| `loginTime` | `Date` | Default: `Date.now` | Login timestamp |
| `logoutTime` | `Mixed` | Default: `"Session in progress"` | Date of logout or in-progress flag |
| `sessionDuration` | `String` | Default: `"Session in progress"` | Human-readable duration (e.g. `2 minutes 14 seconds`) |

### 4. `activity_logs` Collection (`models/activityLog.js`)
Fine-grained audit trail of all operations executed within the application.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Log event identifier |
| `sessionId` | `ObjectId` | Ref: `session_logs` | Link to the user's active session |
| `userId` | `ObjectId` | Ref: `user` | User ID who executed the action |
| `username` | `String` | Required | User or `"anonymous"` |
| `role` | `String` | Required | User role or `"unknown"` |
| `action` | `String` | Required | Action code (`LOGIN`, `LOGOUT`, `CREATE_TODO`, etc.) |
| `details` | `String` | Default: `""` | Detailed summary of the event |
| `endpoint` | `String` | Default: `""` | Target API URL (e.g. `/api/create`) |
| `method` | `String` | Default: `""` | HTTP method (`POST`, `GET`, `PUT`, `DELETE`) |
| `status` | `String` | Default: `"SUCCESS"` | Operation status (`SUCCESS`, `FAILED`) |
| `createdAt` | `Date` | Timestamp | Exact event timestamp |

### 5. `todos` Collection (`models/todo.js`)
Todo task items managed by administrators.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key | Item identifier |
| `title` | `String` | Required | Todo title |
| `description` | `String` | Required | Todo description |
| `createdBy` | `String` | Required | Username of creator |
| `userId` | `ObjectId` | Ref: `user` | Foreign key to creating user |
| `createdAt` | `Date` | Timestamp | Creation timestamp |
| `updatedAt` | `Date` | Timestamp | Modification timestamp |

---

## 6. Authentication & Authorization (RBAC)

### 1. Token Mechanism
- Issued upon successful `POST /api/user/login`.
- Payload structure: `{ id: user._id, role: user.role }`.
- Verified using `process.env.JWT_SECRET`.
- Supported via HTTP header: `Authorization: Bearer <token>` or raw `<token>`.

### 2. Middleware Guards
1. **`auth` (`middleware/auth.js`)**:
   - Parses and decodes the JWT token.
   - Verifies that the user still exists in MongoDB.
   - Automatically finds and attaches the user's active session (`req.sessionId`).
   - Attaches `req.user` to the request object.
2. **`admin` (`middleware/admin.js`)**:
   - Enforces `req.user.role === 'admin'`.
   - Validates that the administrator has an **active logged-in session** (`logoutTime === "Session in progress"`). If logged out, rejects access with HTTP 401.
3. **`optionalAuth` (`middleware/auth.js`)**:
   - Gracefully inspects headers: if token present, sets `req.user` and `req.sessionId` for audit tracking; if not present, proceeds anonymously.

---

## 7. API Endpoints Reference

Base URL: `http://localhost:4001`

### Authentication & User Endpoints (`routes/user.js`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/signup` | Public | Register new user. Automatically registers role activities in `roles_based_access`. |
| `POST` | `/api/user/login` | Public | Authenticates credentials, verifies no active session exists, generates JWT, logs activity. |
| `POST` | `/api/user/logout` | Authenticated | Closes active session in `session_logs`, calculates duration, records logout audit. |
| `GET` | `/api/user/get_User` | Optional Auth | Retrieves list of all registered users (excluding password). |
| `POST/DELETE` | `/api/user/remove_user` | Admin Only | Deletes target user and removes their access record (prevents self-deletion). |
| `GET` | `/api/user/session_logs` | Optional Auth | Retrieves all login/logout session histories sorted newest first. |
| `GET` | `/api/user/roles_based_access`| Optional Auth | Returns users with their assigned `can_perform` permission capabilities. |
| `GET` | `/api/user/activity_logs` | Optional Auth | Retrieves audit events. Filterable by `?sessionId=`, `?username=`, `?action=`. |

### Todo Management Endpoints (`routes/route.js`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Fetch` | Optional Auth | Fetches all todos sorted by newest creation. |
| `POST` | `/api/create` | Admin Only | Creates a new todo item associated with the creator. |
| `PUT` | `/api/update/:id` | Admin Only | Updates existing todo item by ID. |
| `DELETE` | `/api/remove/:id` | Admin Only | Deletes existing todo item by ID. |

---

## 8. Session & Audit Activity Logging System

### Single Active Session Guarantee
When a user attempts to log in via `/api/user/login`:
```javascript
const activeSession = await Activity.findOne({
    userId: user._id,
    logoutTime: "Session in progress"
});
if (activeSession) {
    return res.status(400).json({
        error: `User '${user.username}' is already logged in. Please logout before logging in again.`
    });
}
```
This prevents credential sharing and ensures clean session boundaries.

### Exact Duration Calculation
Upon logging out via `/api/user/logout`, duration is formatted in human-readable units:
- e.g.: `1 hour 12 minutes 45 seconds` or `32 seconds`.

---

## 9. Database Administration (Mongo Express)

Mongo Express is configured to provide an intuitive GUI for local database inspection.

### Configuration (`package.json`)
```bash
npm run mongo-express
```
Runs:
```bash
ME_CONFIG_BASICAUTH_USERNAME="" \
ME_CONFIG_BASICAUTH_PASSWORD="custom" \
ME_CONFIG_MONGODB_ENABLE_ADMIN=true \
ME_CONFIG_OPTIONS_FULLWIDTH_LAYOUT=true \
npx -y mongo-express@1.0.0 -U mongodb://127.0.0.1:27017/
```

### UI Enhancements Applied:
1. **Zero Whitespace Bloat**: Default `white-space: pre-line` was replaced with clean, compact spacing, removing 3-4 blank lines per cell.
2. **Line-by-Line `can_perform`**: In `roles_based_access`, items display neatly line-by-line using `white-space: pre-wrap` instead of jumbled text.
3. **Admin Priority Sorting**: `roles_based_access` automatically default-sorts with `role: 1, username: 1` so that **admin** accounts always appear above regular user accounts.
4. **Tailored Column Padding**: Generous spacing (`12px 22px`) with proper monospace widths for ObjectIds and dates.
5. **Full Screen Width**: Utilizes full viewport width without artificial 1170px container margins.
6. **Manual Cursor Column Resizing (All Collections)**:
   - Allows users to shrink or expand the size of any column across all collections manually using the cursor (`col-resize` grab handle).
   - Provides live visual feedback with a vertical guideline tracking cursor movement down the table.
   - Double-clicking any column divider automatically auto-fits / resets that specific column.
   - Includes a "Reset Column Width" button to restore default column sizes at any time.
   - Custom column widths are saved and persisted per database and collection in `localStorage`.
7. **Light & Dark Mode Toggle**:
   - A dedicated toggle button located in the top navigation bar enables instant switching between Light Mode and a modern Dark Mode theme.
   - Polished dark palette covering all navigation bars, document tables, search/query wells, form controls, modals, pagination, and CodeMirror editors.
   - Preference persists across all sessions and page reloads via `localStorage`, featuring zero-flash rendering on load.

---

## 10. Setup & Running Instructions

### Prerequisites
- Node.js installed (`node -v` >= 18)
- Local MongoDB installed (`mongod`)

### Step 1: Start MongoDB
```bash
mongod --dbpath /home/cdot/mongodb/data --logpath /home/cdot/mongodb/mongod.log --fork
```

### Step 2: Install Dependencies & Run Backend Server
```bash
cd /home/cdot/Desktop/clone/Nodejs_practice/backend
npm install
npm start
```
Server runs on: **`http://localhost:4001`**

### Step 3: Run Mongo Express Web GUI
In a separate terminal:
```bash
cd /home/cdot/Desktop/clone/Nodejs_practice/backend
npm run mongo-express
```
Access at: **`http://localhost:8081`**

---

## 11. Troubleshooting & Maintenance Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:27017` | Local `mongod` is stopped | Run `mongod --dbpath /home/cdot/mongodb/data --logpath /home/cdot/mongodb/mongod.log --fork` |
| `User already logged in` | Previous session was not logged out | Call `POST /api/user/logout` with username/credentials or update session in Mongo Express |
| `Access denied. Admin only` | User role is not admin, or admin is not logged in | Ensure login has occurred and JWT contains `role: "admin"` |
| Atlas Connection Timeout | Corporate/enterprise network blocking port 27017 | Use local MongoDB connection in `.env` |

---
*Documentation compiled and verified on local environment.*

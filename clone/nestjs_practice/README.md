# NestJS & Prisma Todo Application

A modern, enterprise-ready recreation of the Express.js + Mongoose backend from `Nodejs_practice/backend`, built using **NestJS 10**, **TypeScript**, and **Prisma ORM 5** connected to **MongoDB**.

---

## 🌟 Key Features

1. **Architecture & Design**:
   - Modular NestJS structure: `AuthModule`, `UsersModule`, `TodosModule`, `PrismaModule`, `ActivityLogsModule`.
   - Dependency Injection (DI) with singleton services.
   - Robust Input Validation using `class-validator` and `class-transformer` via global `ValidationPipe`.

2. **Data & Persistence (Prisma ORM)**:
   - Direct connection to local MongoDB (`todo-app` database).
   - Fully backward-compatible Prisma schema matching existing MongoDB collections:
     - `users` (`User`)
     - `todos` (`Todo`)
     - `roles_based_access` (`RolesBasedAccess`)
     - `session_logs` (`SessionLog`)
     - `activity_logs` (`ActivityLog`)
   - Prisma Studio integration for visual database management (`npm run prisma:studio`).

3. **Authentication & Security**:
   - Password hashing with `bcrypt` (10 salt rounds).
   - Stateless JWT authentication via `@nestjs/passport` and `passport-jwt` pinned to `HS256`.
   - Single Active Session Enforcement: Prevents concurrent logins for the same user until they logout.
   - Self-deletion guard: Prevents admin users from deleting their own active account.

4. **Role-Based Access Control (RBAC)**:
   - Dynamic permissions definition (`can_perform`) for `admin` vs `user`.
   - Guards: `JwtAuthGuard`, `OptionalJwtAuthGuard`, and `RolesGuard`.
   - Admin-only guarded endpoints (`POST /api/create`, `PUT /api/update/:id`, `DELETE /api/remove/:id`, `DELETE /api/user/delete_user`).

5. **Audit & Activity Logging**:
   - Comprehensive audit trails for logins, logouts, todo CRUD, session inspections, and user deletions.
   - Session duration calculation (e.g. `12 minutes 35 seconds`).

---

## 📁 Project Structure

```
nestjs_practice/
├── prisma/
│   └── schema.prisma           # Prisma MongoDB schema definition
├── src/
│   ├── activity-logs/          # Global audit logging service & module
│   │   ├── activity-logs.module.ts
│   │   └── activity-logs.service.ts
│   ├── auth/                   # Authentication & authorization module
│   │   ├── decorators/         # @Roles(), @GetUser() decorators
│   │   ├── dto/                # SignupDto, LoginDto with class-validator
│   │   ├── guards/             # JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── constants.ts        # JWT secrets, token expiry, role permissions
│   │   └── jwt.strategy.ts     # Passport JWT Strategy (HS256)
│   ├── prisma/                 # Global Prisma service & lifecycle module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── todos/                  # Todos CRUD module
│   │   ├── dto/                # CreateTodoDto, UpdateTodoDto
│   │   ├── todos.controller.ts
│   │   ├── todos.module.ts
│   │   └── todos.service.ts
│   ├── users/                  # User management, roles, and session logs
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts                 # NestJS entrypoint (port 3000, ValidationPipe)
├── .env                        # Environment configuration
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints Mapping

### 1. Authentication (`/api/user`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/user/signup` | Public | Register new user (`username`, `email`, `password`, `role`) |
| `POST` | `/api/user/login` | Public | Login with single active session protection |
| `POST` | `/api/user/logout` | Authenticated | End active session, calculate duration & log activity |

### 2. User Management & Audit (`/api/user`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/user/get_User` | Public | List all users (passwords omitted) |
| `DELETE` / `POST` | `/api/user/delete_user` | Admin | Delete a user & associated permissions |
| `GET` | `/api/user/roles_based_access` | Public | List all roles & permissions (Admin sorted first) |
| `GET` | `/api/user/session_logs` | Public | View login/logout session histories |
| `GET` | `/api/user/activity_logs` | Public | View all audit activity logs |
| `GET` | `/api/user/activity_logs/:sessionId`| Public | View activity logs for a specific session |

### 3. Todos CRUD (`/api`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/Fetch` or `/api/fetch` | Public | Fetch all todos with author details |
| `POST` | `/api/create` or `/api/send` | Admin | Create a new todo item |
| `PUT` | `/api/update/:id` | Admin | Update an existing todo |
| `DELETE` | `/api/remove/:id` | Admin | Delete a todo |

---

## 🚀 Getting Started

### 1. Environment Variables (`.env`)
```ini
DATABASE_URL="mongodb://127.0.0.1:27017/todo-app?replicaSet=rs0&directConnection=true"
PORT=3000
JWT_SECRET="dndbbhsjzkjkqjnzbxcjsiqkl"
```

> **Note on MongoDB**: Prisma requires MongoDB to run with replica sets enabled (even for single-node local instances) to support transactions.
>
> If not already running:
> ```bash
> mongod --dbpath /home/cdot/mongodb/data --logpath /home/cdot/mongodb/mongod.log --fork --replSet rs0
> mongosh --eval "rs.initiate()"
> ```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run the Development Server
```bash
npm run start:dev
```
The server will start on `http://localhost:3000`.

### 4. Prisma Studio (GUI Data Viewer)
```bash
npm run prisma:studio
```
Opens Prisma Studio on `http://localhost:5555`.

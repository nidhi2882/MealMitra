# 📚 MealMitra: Concepts Used by File & Purpose Summary

This document provides a comprehensive, file-by-file breakdown of **every software engineering concept, design pattern, architectural mechanism, library, and technique** implemented in the **MealMitra** MERN-stack project, along with its specific purpose and role.

---

## 📑 Table of Contents

1. [High-Level Architectural Patterns](#-high-level-architectural-patterns)
2. [Quick-Reference Master Matrix](#-quick-reference-master-matrix)
3. [Backend: Core & Configuration](#-backend-core--configuration)
4. [Backend: Middleware Layer](#-backend-middleware-layer)
5. [Backend: Mongoose Data Models (Schemas)](#-backend-mongoose-data-models-schemas)
6. [Backend: Controllers (Business Logic)](#-backend-controllers-business-logic)
7. [Backend: Routes (API Endpoint Routing)](#-backend-routes-api-endpoint-routing)
8. [Backend: Utilities & Scripts](#-backend-utilities--scripts)
9. [Frontend: Core, Config & Entry](#-frontend-core-config--entry)
10. [Frontend: Services, State & Context](#-frontend-services-state--context)
11. [Frontend: Routing & Protection](#-frontend-routing--protection)
12. [Frontend: Reusable UI Components](#-frontend-reusable-ui-components)
13. [Frontend: Page Views](#-frontend-page-views)
14. [Concept Cross-Reference Index (Viva / Interview Guide)](#-concept-cross-reference-index)

---

## 🏛️ High-Level Architectural Patterns

- **MVC (Model-View-Controller) Architecture**: The backend strictly separates data structures (`models/`), business logic execution (`controllers/`), and route declarations (`routes/`), while Express serves as the controller orchestrator and React serves as the view layer.
- **Single Page Application (SPA)**: The frontend dynamically renders client-side views via React 18 and React Router DOM without full-page browser reloads.
- **RESTful API Design**: Predictable HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), standardized status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`), and clean JSON payloads.
- **Schema Discriminators / Polymorphism**: Uses Mongoose single-table inheritance on the `users` collection to derive specialized schemas (`Restaurant`, `NGO`, `Admin`, `EventOrganizer`) from a base `User` model.
- **Stateless Token-Based Authentication & RBAC**: JWT (JSON Web Tokens) with encoded claims (`id`, `role`) verifying authorization in memory without server-side session stores, combined with Role-Based Access Control closures.
- **Soft Delete Pattern**: Preserves data integrity by tagging records (`isDeleted`, `deletedAt`, `deletedBy`) and filtering them out via Mongoose query pre-hooks rather than executing destructive physical drops.
- **Finite State Machine (FSM)**: Manages donation and pickup lifecycles through deterministic status states: `Available` ➔ `Requested` ➔ `Accepted` ➔ `Picked Up` ➔ `Completed`.

---

## ⚡ Quick-Reference Master Matrix

| File Path | Layer / Module | Primary Concepts Used | Purpose & Function |
|---|---|---|---|
| [`server/server.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/server.js) | Backend Entry | Express setup, CORS, JSON body-parser, DB boot, route mounting, 404 & error handlers | Boots the Express server, coordinates middlewares, and mounts API route prefixes. |
| [`server/config/db.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/config/db.js) | Database Config | Asynchronous connection (`async/await`), Mongoose connection pool, error handling, `process.exit(1)` | Establishes a connection to MongoDB Atlas or local MongoDB; handles fatal connection aborts. |
| [`server/utils/GenerateToken.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/utils/GenerateToken.js) | Security Utility | Cryptographic JWT signing (`jwt.sign`), payload claims, expiration window | Generates signed JSON Web Tokens for client authentication containing `id` and `role`. |
| [`server/middleware/Authmiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Authmiddleware.js) | Security Middleware | Bearer token extraction, `jwt.verify`, DB lookup with `.select("-password")`, Request Hydration (`req.user`) | Protects endpoints by validating the token and attaching the authenticated user to `req.user`. |
| [`server/middleware/Rolemiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Rolemiddleware.js) | Authorization | Higher-Order Functions, Closures, Rest parameters (`...allowedRoles`), RBAC, 403 Forbidden | Restricts endpoint execution strictly to authorized user roles. |
| [`server/middleware/errorMiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/errorMiddleware.js) | Error Handling | Express 4-argument error signature, Mongoose error mapping (`CastError`, `11000`, `ValidationError`), stack trace concealment | Intercepts errors thrown in controllers, formats structured JSON responses, and conceals stack traces in production. |
| [`server/models/User.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/User.js) | Data Layer (Base) | Mongoose Schema, Discriminator key, Timestamps, Soft Deletes, Query pre-hooks (`pre(["find", ...])`) | Base schema representing all platform accounts; transparently filters out soft-deleted users. |
| [`server/models/Restaurant.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Restaurant.js) | Data Layer (Subclass) | Mongoose Schema Discriminator (`User.discriminator`), schema validation | Extends `User` with restaurant attributes (organization name, location, FSSAI license number). |
| [`server/models/NGO.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/NGO.js) | Data Layer (Subclass) | Mongoose Schema Discriminator, required field validations | Extends `User` with NGO attributes (NGO name, legal registration number). |
| [`server/models/Admin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Admin.js) | Data Layer (Subclass) | Mongoose Schema Discriminator | Extends `User` for platform administrators with system-level privileges. |
| [`server/models/EventOrganizer.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/EventOrganizer.js) | Data Layer (Subclass) | Mongoose Schema Discriminator | Extends `User` for event organizers donating large batches of catering surplus. |
| [`server/models/Donation.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Donation.js) | Data Layer | Schema References (`ObjectId` referencing `User`), Enum validations, Number boundaries (`min: 1`) | Represents food surplus listings, expiry timestamps, quantities, and current availability status. |
| [`server/models/PickupRequest.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/PickupRequest.js) | Data Layer | Multi-schema references (`Donation`, `User`), Date defaults, Enum state tracking | Represents an NGO's request to claim and collect an available food donation. |
| [`server/models/Notification.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Notification.js) | Data Layer | ObjectId referencing, Boolean flags (`isRead`), default timestamps | Stores in-app alerts and notifications generated for users. |
| [`server/models/Report.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Report.js) | Data Layer | Document schema, ObjectId references, aggregate audit fields | Stores metadata and snapshots of analytical reports generated by platform admins. |
| [`server/controllers/AuthController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AuthController.js) | Business Logic | Mass-Assignment Protection (Whitelisting), `bcryptjs` salt & hashing, `express-async-handler`, Stateless auth | Handles user registration, credentials authentication, profile fetching, and profile updates. |
| [`server/controllers/DonationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/DonationController.js) | Business Logic | Regex query search (`new RegExp(..., "i")`), Date comparison operators (`$gt`, `$lte`), Pagination (`skip`, `limit`), Population, Resource Ownership Verification | Handles food listing creation, filtering, browsing, updating, and deletion (restricted to donor owners). |
| [`server/controllers/PickupController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/PickupController.js) | Business Logic | State Machine Transitions, Dual-document synchronization, Dual-party authorization, Automatic notification creation | Handles pickup request submission, donor accept/reject decisions, and step-by-step pickup completion. |
| [`server/controllers/AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js) | Business Logic | MongoDB Aggregation Pipelines (`$group`, `$year`, `$month`, `$sort`), PDF document streaming (`pdfkit`), Soft Delete & Restore | Handles user verification, listing moderation, platform-wide metrics aggregation, and PDF export generation. |
| [`server/controllers/NotificationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/NotificationController.js) | Business Logic | User-scoped queries, ownership verification, bulk updates (`updateMany`), document removal | Fetches notifications, marks individual or all notifications as read, and deletes notifications. |
| [`server/controllers/HistoryController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/HistoryController.js) | Business Logic | Polymorphic role query branching, populated references, admin audit permissions | Returns completed donation/pickup history tailored to the requesting user's role. |
| [`server/routes/Authroutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/Authroutes.js) | Routing | Express Router, Public vs Private route separation with `protect` middleware | Defines API routes for `/register`, `/login`, `/me`, `/profile`, and `/logout`. |
| [`server/routes/AdminRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/AdminRoutes.js) | Routing | Middleware chaining (`protect`, `authorize("Admin")`), RESTful resource routes | Mounts administrative endpoints for user management, moderation, analytics, and PDF reports. |
| [`server/routes/DonationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/DonationRoutes.js) | Routing | Route Order Precedence (`/my-donations` before `/:id`), Role-restricted write endpoints | Mounts endpoints for creating, editing, fetching, and browsing donations. |
| [`server/routes/PickupRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/PickupRoutes.js) | Routing | Role-restricted route mounting (`NGO` vs `Restaurant`), parameterized paths | Mounts pickup request creation, response, status progression, and single pickup retrieval. |
| [`server/routes/NotificationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/NotificationRoutes.js) | Routing | Express Router, specific string route precedence (`/read-all` before `/:id/read`) | Mounts notification list, mark single/bulk read, and delete endpoints. |
| [`server/routes/HistoryRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/HistoryRoutes.js) | Routing | Express Router, Parameterized URL routing (`/:userId`) | Mounts own-history and user-specific history endpoints. |
| [`server/Createadmin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/Createadmin.js) | Scripting / Seeding | Direct DB initialization, Idempotence checking, Salt generation & password hashing | Standalone CLI script to seed the first Administrator account into the database safely. |
| [`client/src/main.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/main.jsx) | Client Entry | React 18 Concurrent Root (`createRoot`), React StrictMode, Browser history provider (`BrowserRouter`) | Mounts the root React DOM tree and initializes the client-side routing environment. |
| [`client/src/App.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/App.jsx) | Client Shell | Context Provider nesting (`AuthProvider`), Component Composition, Layout container | Acts as the main application container, providing auth context and persistent navbar across all pages. |
| [`client/src/services/api.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/services/api.js) | Network / HTTP | Axios Singleton, Request Interceptors, Response Interceptors, LocalStorage synchronization, Global 401 handling | Centralized HTTP client that attaches JWT headers automatically and clears tokens on authorization failure. |
| [`client/src/context/AuthContext.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/context/AuthContext.jsx) | State Management | React Context API (`createContext`, `useContext`), Custom Hook (`useAuth`), LocalStorage hydration | Manages global user authentication state, login session persistence, and logout synchronization. |
| [`client/src/routes/AppRoutes.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/AppRoutes.jsx) | Navigation | Declarative routing (`Routes`, `Route`), Route Guards, Wildcard 404 fallback | Configures all application URLs and pairs them with role-protected components. |
| [`client/src/routes/ProtectedRoute.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/ProtectedRoute.jsx) | Routing Guard | Higher-Order Component pattern, Declarative navigation (`<Navigate replace />`), Loading-state prevention of flash-redirects | Restricts page rendering to authenticated users with the appropriate role permissions. |
| [`client/src/components/common/Navbar.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/common/Navbar.jsx) | Reusable UI | Dynamic role-based navigation mapping, `useLocation` route inspection, Integrated notification widget | Displays adaptive top navigation links depending on whether the user is logged in and their role. |
| [`client/src/components/common/Loader.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/common/Loader.jsx) | Reusable UI | CSS animation (`animate-spin`), Accessibility (`role="status"`, `aria-live="polite"`), Default props | Provides a clean, accessible spinner across async loading states. |
| [`client/src/components/donation/DonationCard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/donation/DonationCard.jsx) | Reusable UI | Status styling dictionary, Date formatting (`Intl`/`toLocaleString`), Resource ownership checks, Conditional action buttons | Renders an individual donation card with status indicators, metadata, and role-appropriate actions. |
| [`client/src/components/donation/DonationForm.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/donation/DonationForm.jsx) | Reusable UI | Controlled component forms, ISO datetime-local conversion, Dual create/edit mode handling, Form validation | Modal dialog allowing restaurants to list new surplus food or update existing available listings. |
| [`client/src/components/notification/NotificationBell.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationBell.jsx) | Reusable UI | Polling (`setInterval` + `clearInterval`), Click-outside listener via `useRef`, Optimistic UI updates with rollback | Displays real-time unread notification count badge and toggles the notification inbox dropdown. |
| [`client/src/components/notification/NotificationList.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationList.jsx) | Reusable UI | Event bubbling handlers, Conditional item highlight styling, Relative/Formatted date rendering | Dropdown panel showing list of notifications with single/bulk mark-read and deletion controls. |
| [`client/src/components/pickup/RequestPickupModal.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/RequestPickupModal.jsx) | Reusable UI | Datetime min/max constraints, Event propagation isolation (`e.stopPropagation()`), Controlled form inputs | Modal form for NGOs to schedule a pickup time and attach optional notes to a food listing. |
| [`client/src/components/pickup/StatusTracker.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/StatusTracker.jsx) | Reusable UI | Step-progress stepper, Index-based state mapping, Forward-only lifecycle transition buttons | Visual timeline displaying the 4-step progress of a pickup request with status advance trigger. |
| [`client/src/pages/Home.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/Home.jsx) | Public View | Hero landing layout, CSS blur decorative backdrop elements, Call-To-Action (CTA) routing | Welcomes visitors, explains the mission of MealMitra, and directs users to Register or Login. |
| [`client/src/pages/History.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/History.jsx) | Private View | Real-time client-side search filtering, Polymorphic data card rendering (Donation vs Pickup) | Shows searchable permanent activity log of completed donations or pickups. |
| [`client/src/pages/auth/Login.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Login.jsx) | Auth View | Controlled inputs, Async submission, Global state hydration (`login()`), Role-based conditional redirect | Authenticates registered users and routes them to their specific dashboard. |
| [`client/src/pages/auth/Register.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Register.jsx) | Auth View | Dynamic multi-schema form switching, State cleanup on role switch, Delayed navigation | Allows Restaurants, NGOs, and Event Organizers to sign up with role-specific verification fields. |
| [`client/src/pages/auth/Profile.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Profile.jsx) | Auth View | Data pre-filling via `useEffect`, Controlled field editing, Live validation and user feedback | Displays and allows editing of personal contact info and organization credentials. |
| [`client/src/pages/restaurant/RestaurantDashboard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/restaurant/RestaurantDashboard.jsx) | Donor View | Tabbed filtering (`All`, `Available`, `In Progress`, `Completed`), Section toggling, Confirmation dialogs | Central dashboard for donors to manage their listings, monitor active donations, and review incoming requests. |
| [`client/src/pages/restaurant/IncomingRequests.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/restaurant/IncomingRequests.jsx) | Donor View | Request inbox, Decision dispatch (`Accepted`/`Rejected`), Embedded `StatusTracker` component | Displays pickup requests submitted by NGOs for the donor's donations and allows immediate response. |
| [`client/src/pages/ngo/NgoDashboard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/NgoDashboard.jsx) | Receiver View | Aggregate metrics calculation (`countBy`), Filter tabs, Live status stepper integration | Provides NGOs with an overview of all their requested pickups and live tracking. |
| [`client/src/pages/ngo/BrowseDonations.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/BrowseDonations.jsx) | Receiver View | Multi-parameter filter form, Server-side pagination, Memoized data fetch (`useCallback`), Modal triggering | Allows NGOs to discover and filter active donations by location, food type, quantity, and expiry. |
| [`client/src/pages/admin/AllUsers.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AllUsers.jsx) | Admin View | Server pagination, Multi-criteria filter dropdowns, Soft-delete and restore operations, Row-level action state | Enables admins to inspect all platform users, filter by role/status, and soft-delete or restore accounts. |
| [`client/src/pages/admin/VerifyUsers.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/VerifyUsers.jsx) | Admin View | Oldest-first pending queue, Modal review dialog, Verification remarks submission, Dynamic list excision | Dedicated interface for admins to approve or reject pending restaurants and NGOs. |
| [`client/src/pages/admin/ModerateDonations.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/ModerateDonations.jsx) | Admin View | Server-side paginated table, Admin override deletion, Status badges | Empowers admins to monitor and take down inappropriate, expired, or non-compliant food listings. |
| [`client/src/pages/admin/AdminReports.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AdminReports.jsx) | Admin View | Concurrent data fetching (`Promise.all`), Visual bar chart trend visualization, Binary Blob download handling | Displays platform statistics, user growth, monthly donation trends, and generates a downloadable PDF summary report. |
| [`client/src/index.css`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/index.css) | Global Styling | Google Fonts `@import` (Fraunces & Work Sans), Tailwind directives, Focus-visible accessibility, Reduced-motion query | Sets typography, base background/ink colors, keyboard navigation outlines, and motion accessibility. |
| [`client/src/pages/ngo/ngo.css`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/ngo.css) | Custom Styling | Pure CSS Grid, Flexbox layouts, Custom Status Badge classes, Backdrop modals | Supplies styling rules for NGO dashboard cards, filter bars, status pills, and modal overlays. |
| [`client/tailwind.config.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/tailwind.config.js) | Styling Config | Tailwind Design Tokens, Custom theme extensions (turmeric accent, herb green verified, muted alert) | Defines project-wide color schemes and typography variables for atomic Tailwind utilities. |
| [`client/vite.config.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/vite.config.js) | Build Tooling | Vite plugin architecture (`@vitejs/plugin-react`), Fast Refresh, ESModule bundling | Configures Vite build system for lightning-fast HMR (Hot Module Replacement) and production compilation. |

---

## 🔧 Backend: Core & Configuration

### 1. [`server/server.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/server.js)
- **Primary Purpose**: The main entry point of the Node.js backend. Initializes Express, configures global middlewares, establishes the database connection, mounts all API route handlers, and sets up 404 and global error handling.
- **Concepts Used**:
  - **Environment Configuration**: Uses `dotenv` to load environment variables (`process.env.PORT`, `process.env.MONGO_URI`, etc.) from `.env`.
  - **Middleware Pipeline**: Arranges middleware in execution order:
    1. `cors()`: Cross-Origin Resource Sharing enablement for frontend clients.
    2. `express.json()`: Built-in body-parser parsing JSON incoming payloads.
    3. Route mounting: `app.use("/api/...", ...Routes)`.
    4. Catch-all 404 middleware (`notFound`).
    5. Centralized error handling middleware (`errorHandler`).
  - **Process Port Binding**: Starts the HTTP server on `process.env.PORT || 5000`.

### 2. [`server/config/db.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/config/db.js)
- **Primary Purpose**: Initializes and manages the asynchronous database connection to MongoDB via Mongoose.
- **Concepts Used**:
  - **Mongoose Connection Lifecycle**: Connects using `mongoose.connect(process.env.MONGO_URI)`.
  - **Asynchronous Error Trapping**: Uses `try...catch` with `async/await`.
  - **Graceful Termination on Critical Failure**: If the database connection fails, logs the error and calls `process.exit(1)` to terminate the process and allow process managers (like PM2 or Docker) to restart it cleanly.

---

## 🛡️ Backend: Middleware Layer

### 3. [`server/middleware/Authmiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Authmiddleware.js)
- **Primary Purpose**: Intercepts requests to private routes, validates the JWT Bearer token, fetches the user record, and attaches it to the request object.
- **Concepts Used**:
  - **HTTP Authorization Header Parsing**: Looks for `Authorization: Bearer <token>` and extracts the token string.
  - **Cryptographic Verification**: Calls `jwt.verify(token, process.env.JWT_SECRET)`.
  - **Database Projection**: Queries `User.findById(decoded.id).select("-password")` to avoid loading sensitive password hashes into memory.
  - **Request Hydration**: Attaches the user document to `req.user`, allowing all subsequent controllers to directly access user details without re-querying MongoDB.
  - **Early Return & HTTP 401**: Returns immediate 401 responses if no token is provided, the token has expired, or the user has been deleted.

### 4. [`server/middleware/Rolemiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Rolemiddleware.js)
- **Primary Purpose**: Provides Role-Based Access Control (RBAC) to restrict route execution to specific roles (`Admin`, `Restaurant`, `NGO`, etc.).
- **Concepts Used**:
  - **Higher-Order Function / Closure**: `authorize(...allowedRoles)` returns an Express middleware function `(req, res, next) => { ... }` that retains access to `allowedRoles` via lexical scope.
  - **Rest Parameters (`...allowedRoles`)**: Allows passing multiple roles easily (e.g., `authorize("Restaurant", "EventOrganizer")`).
  - **HTTP 403 Forbidden Enforcement**: If `req.user.role` is not included in `allowedRoles`, halts execution with a 403 status and a descriptive message.

### 5. [`server/middleware/errorMiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/errorMiddleware.js)
- **Primary Purpose**: Provides a centralized catch-all error handling mechanism that standardizes API error responses and maps Mongoose database errors to proper HTTP status codes.
- **Concepts Used**:
  - **Express 4-Argument Error Signature**: Declared as `(err, req, res, next)` so Express recognizes it specifically as an error handler.
  - **Mongoose `CastError` Handling**: Converts invalid 24-character hexadecimal MongoDB ObjectIDs into `404 Not Found`.
  - **Mongoose Duplicate Key Error (`code === 11000`)**: Converts unique constraint violations (e.g., duplicate email) into `409 Conflict`.
  - **Mongoose `ValidationError` Mapping**: Extracts and joins individual schema validation failure messages, returning `400 Bad Request`.
  - **Information Disclosure Prevention**: Only includes `err.stack` when `NODE_ENV !== 'production'`.
  - **Fallback 404 Route Handler (`notFound`)**: Creates an `Error` for unhandled URLs and passes it to `next(error)`.

---

## 🗄️ Backend: Mongoose Data Models (Schemas)

### 6. [`server/models/User.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/User.js)
- **Primary Purpose**: The core user schema and base model for all actor roles on the platform.
- **Concepts Used**:
  - **Schema Discriminators (`discriminatorKey: "role"`)**: Configures Mongoose single-table inheritance so `Restaurant`, `NGO`, `Admin`, and `EventOrganizer` share the base `users` collection.
  - **Mongoose Timestamps (`timestamps: true`)**: Automatically generates `createdAt` and `updatedAt`.
  - **Field Sanitization & Validations**: `lowercase: true`, `trim: true`, `unique: true`, and enum checking (`enum: ["Pending", "Verified", "Rejected"]`).
  - **Soft Delete Pattern**: Fields `isDeleted`, `deletedAt`, and `deletedBy` mark accounts deleted without physical removal.
  - **Mongoose Query Middleware Hook**: `userSchema.pre(["find", "findOne", "findOneAndUpdate", "countDocuments"], ...)` automatically filters out soft-deleted users (`this.where({ isDeleted: { $ne: true } })`) unless the query explicitly specifies `{ includeDeleted: true }`.

### 7. [`server/models/Restaurant.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Restaurant.js)
- **Primary Purpose**: Defines the schema for restaurant donor accounts.
- **Concepts Used**:
  - **Inheritance via Discriminator**: `User.discriminator("Restaurant", restaurantSchema)`.
  - **Domain Attributes**: Stores `organizationName`, `location`, and mandatory `licenseNo` (FSSAI).

### 8. [`server/models/NGO.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/NGO.js)
- **Primary Purpose**: Defines the schema for verified NGOs that claim and distribute food.
- **Concepts Used**:
  - **Discriminator Model**: Inherits from `User`.
  - **Domain Attributes**: Stores `ngoName` and `registrationNo` (official NGO registration code).

### 9. [`server/models/Admin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Admin.js)
- **Primary Purpose**: Represents platform administrator accounts.
- **Concepts Used**:
  - **Discriminator Model**: Inherits base `User` fields without requiring external verification documents.

### 10. [`server/models/EventOrganizer.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/EventOrganizer.js)
- **Primary Purpose**: Represents event/wedding/caterer donors.
- **Concepts Used**:
  - **Discriminator Model**: Inherits from `User`.
  - **Domain Attributes**: Stores `organizationName`, `location`, and `eventType`.

### 11. [`server/models/Donation.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Donation.js)
- **Primary Purpose**: Models surplus food listings created by donors.
- **Concepts Used**:
  - **Document References (`ref: "User"`)**: Stores `donorId` as a `mongoose.Schema.Types.ObjectId` referencing the `User` model.
  - **Numerical Validation**: `min: 1` ensures quantity is at least 1 serving.
  - **Lifecycle Status Enum**: Restricts `status` to `["Available", "Requested", "Accepted", "Picked Up", "Completed"]`.
  - **Date Constraints**: Tracks `expiryTime` for timely pickup matching.

### 12. [`server/models/PickupRequest.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/PickupRequest.js)
- **Primary Purpose**: Represents the transaction when an NGO requests to collect a listed donation.
- **Concepts Used**:
  - **Relational Schema References**: Links `donationId` (`ref: "Donation"`) and `ngoId` (`ref: "User"`).
  - **Status Enum**: Tracks lifecycle status: `["Requested", "Accepted", "Rejected", "Picked Up", "Completed"]`.
  - **Timestamps**: Defaults `requestDate` to `Date.now` and tracks scheduled `pickupTime`.

### 13. [`server/models/Notification.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Notification.js)
- **Primary Purpose**: Models user notifications for status changes, verification updates, and pickup requests.
- **Concepts Used**:
  - **Reference to User**: `userId` references `User`.
  - **Read State Flag**: `isRead: { type: Boolean, default: false }`.
  - **Date Stamping**: Default `dateTime: Date.now`.

### 14. [`server/models/Report.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Report.js)
- **Primary Purpose**: Stores persistent snapshots of system audit reports generated by administrators.
- **Concepts Used**:
  - **Administrative Reference**: `adminId` references `User`.
  - **Statistical Metrics Fields**: Captures `totalUsers`, `totalDonations`, `completedPickups`, and generation timestamp.

---

## ⚙️ Backend: Controllers (Business Logic)

### 15. [`server/controllers/AuthController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AuthController.js)
- **Primary Purpose**: Handles user registration, authentication, JWT issuance, profile inspection, and updates.
- **Concepts Used**:
  - **Async Error Wrapping**: Uses `express-async-handler` to pass rejected promises directly to Express error middleware without repetitive `try/catch` blocks.
  - **Role-Model Factory Mapping**: Maps role strings to their respective discriminator models (`roleModelMap = { Restaurant, EventOrganizer, NGO }`).
  - **Mass-Assignment Protection (Field Whitelisting)**: Explicitly picks allowed fields (`name`, `email`, `phone`, `address`, etc.) rather than passing raw `req.body` to `.create()`.
  - **Bcrypt Password Hashing**: Generates cryptographic salt (`bcrypt.genSalt(10)`) and hashes passwords (`bcrypt.hash`) before persistence.
  - **Password Comparison**: Verifies credentials using `bcrypt.compare`.
  - **Verification Gate**: Blocks non-admin users whose status is not `"Verified"` from completing login (`403 Forbidden`).
  - **Mongoose Document Update**: Updates profiles via `User.findByIdAndUpdate` with `{ runValidators: true }`.

### 16. [`server/controllers/DonationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/DonationController.js)
- **Primary Purpose**: Controls the food donation lifecycle—browsing, creating, modifying, and deleting listings.
- **Concepts Used**:
  - **Dynamic Multi-Criterion Query Construction**: Builds MongoDB filters based on query params (`foodType`, `location`, `minQuantity`, `expiryBefore`).
  - **Case-Insensitive Regex Search**: Uses `new RegExp(req.query.foodType, "i")` and `new RegExp(req.query.location, "i")`.
  - **Comparison Operators**: Uses `$gt: new Date()` to filter out expired items, and `$gte` for minimum quantity.
  - **Server-Side Pagination**: Uses `skip((page - 1) * limit).limit(limit)` along with `Donation.countDocuments(filter)` to calculate `totalPages`.
  - **Query Population**: Uses `.populate("donorId", "name role organizationName location")` to join donor profile data without exposing sensitive fields like passwords.
  - **Resource Ownership Verification**: Validates `donation.donorId.toString() === req.user._id.toString()` before permitting update or deletion.
  - **State Guarding**: Forbids editing or deleting any donation whose status is not `"Available"`.

### 17. [`server/controllers/PickupController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/PickupController.js)
- **Primary Purpose**: Manages pickup request submission, donor approvals/rejections, and forward lifecycle transitions.
- **Concepts Used**:
  - **Finite State Machine Enforcement**: Validates sequential transitions:
    - `"Requested"` ➔ `"Accepted"` or `"Rejected"` (Donor only).
    - `"Accepted"` ➔ `"Picked Up"` (Donor or NGO).
    - `"Picked Up"` ➔ `"Completed"` (Donor or NGO).
  - **Dual-Document State Synchronization**: When a `PickupRequest` is accepted, the associated `Donation.status` is set to `"Accepted"`. If rejected, `Donation.status` reverts to `"Available"`, reopening it for other NGOs.
  - **Dual-Party Authorization**: Ensures only the owner donor can accept/reject, while either the donor or requesting NGO can advance status to `"Picked Up"` or `"Completed"`.
  - **Event-Driven Notification Side-Effects**: Automatically creates `Notification` documents for the counterpart party upon request and decision events.

### 18. [`server/controllers/AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js)
- **Primary Purpose**: Provides administrative control over users, verification queues, listings moderation, platform reports, and PDF generation.
- **Concepts Used**:
  - **MongoDB Aggregation Pipeline**: Uses `Donation.aggregate()` with:
    - `$group`: Groups donations by year and month using date operators (`$year: "$createdAt"`, `$month: "$createdAt"`).
    - `$sum`: Calculates count per month (`{ $sum: 1 }`).
    - `$sort`: Orders chronological output.
  - **Streaming Binary Generation (`pdfkit`)**:
    - Instantiates `new PDFDocument()`.
    - Configures HTTP response headers: `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."`.
    - Pipes the generated document stream directly to the Express response stream (`doc.pipe(res)`), streaming bytes without holding full PDFs in server RAM.
  - **Soft-Delete Management**: Flags `isDeleted = true`, sets `deletedAt`, and provides a dedicated `restoreUser` endpoint using `{ includeDeleted: true }` to bypass the query hook.
  - **Admin Override Privileges**: Allows unrestricted removal of any donation listing regardless of state.

### 19. [`server/controllers/NotificationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/NotificationController.js)
- **Primary Purpose**: Manages user notifications, read statuses, and inbox clearance.
- **Concepts Used**:
  - **User Isolation**: Constrains queries strictly to `userId: req.user._id`.
  - **Ownership Check**: Confirms `notification.userId.toString() === req.user._id.toString()` before allowing read/delete.
  - **Bulk Modification**: Uses `Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })` for instant bulk updates.

### 20. [`server/controllers/HistoryController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/HistoryController.js)
- **Primary Purpose**: Delivers completed transaction history tailored dynamically to the caller's role.
- **Concepts Used**:
  - **Polymorphic Query Branching**:
    - For `Restaurant` / `EventOrganizer`: Queries completed donations (`Donation.find({ donorId, status: "Completed" })`).
    - For `NGO`: Queries completed pickups (`PickupRequest.find({ ngoId, status: "Completed" })`).
    - For `Admin`: Queries all platform-wide completed donations.
  - **Administrative Audit Access**: Allows admins to view any specific user's history via `/api/history/:userId`.

---

## 🚦 Backend: Routes (API Endpoint Routing)

### 21. [`server/routes/Authroutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/Authroutes.js)
- **Primary Purpose**: Maps endpoints for authentication and profile management.
- **Concepts Used**:
  - **Express Router Modularization**: Creates an isolated route namespace via `express.Router()`.
  - **Public vs Protected Route Separation**: Endpoints `/register` and `/login` are unauthenticated; `/me`, `/profile`, and `/logout` are protected with the `protect` middleware.

### 22. [`server/routes/AdminRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/AdminRoutes.js)
- **Primary Purpose**: Registers all administrative routes.
- **Concepts Used**:
  - **Composite Middleware Chaining**: Every route is chained with `protect, authorize("Admin")`, ensuring only authenticated admins can access them.
  - **RESTful Action Mapping**: Maps verification to `PUT /users/:id/verify`, soft deletion to `DELETE /users/:id`, and restore to `PUT /users/:id/restore`.

### 23. [`server/routes/DonationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/DonationRoutes.js)
- **Primary Purpose**: Registers donation creation, listing, updating, and discovery endpoints.
- **Concepts Used**:
  - **Route Definition Order Precedence**: Declares `/my-donations` **before** `/:id` so Express does not mistakenly match `"my-donations"` as an ID parameter.
  - **Role-Gated Routing**: Routes creating or modifying donations require `authorize(...DONOR_ROLES)`, while browsing `/` requires `authorize("NGO")`.

### 24. [`server/routes/PickupRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/PickupRoutes.js)
- **Primary Purpose**: Declares pickup request endpoints.
- **Concepts Used**:
  - **Role-Segregated Endpoints**: Routes creating requests (`POST /`) and viewing sent requests (`GET /my-requests`) require `authorize("NGO")`; responding (`PUT /:id/respond`) requires donor roles.
  - **Lifecycle Transition Endpoint**: `PUT /:id/status` permits either `"Restaurant"` or `"NGO"`.

### 25. [`server/routes/NotificationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/NotificationRoutes.js)
- **Primary Purpose**: Declares notification management routes.
- **Concepts Used**:
  - **Route Ordering**: Places `PUT /read-all` ahead of `PUT /:id/read` to prevent parameter collisions.

### 26. [`server/routes/HistoryRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/HistoryRoutes.js)
- **Primary Purpose**: Maps endpoints for viewing historical completed activity.
- **Concepts Used**:
  - Authenticated user history (`GET /`) and parameterized target user history (`GET /:userId`).

---

## 🛠️ Backend: Utilities & Scripts

### 27. [`server/utils/GenerateToken.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/utils/GenerateToken.js)
- **Primary Purpose**: Generates signed JSON Web Tokens (JWT) for authenticated users.
- **Concepts Used**:
  - **Token Payload Claims**: Encodes both `id` and `role` inside the token payload, enabling quick role checks on both frontend and backend without querying MongoDB on every request.
  - **Configurable Token Expiration**: Reads `process.env.JWT_EXPIRES_IN || "7d"`.

### 28. [`server/Createadmin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/Createadmin.js)
- **Primary Purpose**: Standalone script to seed the initial Administrator account into MongoDB.
- **Concepts Used**:
  - **Database Seeding**: Connects directly to MongoDB, creates an admin user, and exits.
  - **Idempotence**: Checks if `admin@mealmitra.com` already exists to prevent duplicate account creation or password overwrites.
  - **Bcrypt Salting & Hashing**: Hashes the admin password before inserting.

---

## 💻 Frontend: Core, Config & Entry

### 29. [`client/src/main.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/main.jsx)
- **Primary Purpose**: The React entry point that binds the React application to the HTML root container.
- **Concepts Used**:
  - **React 18 Concurrent Root**: Uses `ReactDOM.createRoot(document.getElementById("root")).render(...)`.
  - **Strict Mode (`<React.StrictMode>`)**: Highlights potential lifecycle issues and side effects during development.
  - **Routing Provider (`<BrowserRouter>`)**: Enables HTML5 pushState client-side routing.

### 30. [`client/src/App.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/App.jsx)
- **Primary Purpose**: The top-level component that defines the persistent UI shell and wraps child components with global providers.
- **Concepts Used**:
  - **Context Provider Wrapping**: Wraps the entire layout inside `<AuthProvider>`.
  - **Persistent Layout Shell**: Renders `<Navbar />` at the top with `<AppRoutes />` rendered inside a `<main>` container across all views.

### 31. [`client/src/index.css`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/index.css)
- **Primary Purpose**: Global stylesheet declaring typography, Tailwind layers, and accessibility rules.
- **Concepts Used**:
  - **Web Font Imports**: Imports Google Fonts (`Fraunces` editorial serif and `Work Sans` geometric sans-serif).
  - **Tailwind Directives**: `@tailwind base`, `@tailwind components`, `@tailwind utilities`.
  - **Keyboard Accessibility (`:focus-visible`)**: Enforces high-contrast focus rings for keyboard navigation.
  - **Motion Accessibility (`@media (prefers-reduced-motion: reduce)`)**: Disables or minimizes animations for users with motion sensitivity.

### 32. [`client/tailwind.config.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/tailwind.config.js)
- **Primary Purpose**: Configures the design tokens and theme extensions for Tailwind CSS.
- **Concepts Used**:
  - **Design Token System**: Extends Tailwind colors:
    - `background` (`#FAF8F3`): Soft porridge.
    - `surface` (`#F3EFE4`): Card background.
    - `ink` (`#1F2E1C`): Deep forest text.
    - `accent` (`#C98A3B`): Turmeric gold for primary actions.
    - `verified` (`#4B7F52`): Herb green for success/verification.
    - `alert` (`#B3492E`): Muted brick for rejections/errors.
    - `pending` (`#B08D3E`): Muted amber for pending states.
    - `line` (`#E4DDC9`): Hairline border color.
  - **Custom Typography Families**: Maps `display` to `"Fraunces"` and `sans` to `"Work Sans"`.

### 33. [`client/vite.config.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/vite.config.js)
- **Primary Purpose**: Configures Vite build system and dev server.
- **Concepts Used**:
  - **Plugin Architecture**: Integrates `@vitejs/plugin-react` for Babel/SWC JSX transformation and Hot Module Replacement (HMR).

---

## 🔄 Frontend: Services, State & Context

### 34. [`client/src/services/api.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/services/api.js)
- **Primary Purpose**: Centralized HTTP client using Axios for all backend API communication.
- **Concepts Used**:
  - **Axios Singleton Pattern**: Instantiates `axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" })`.
  - **Request Interceptor**: Automatically inspects `localStorage` for `mealmitra_token` before every outgoing request and injects `Authorization: Bearer <token>`.
  - **Response Interceptor**: Automatically intercepts `401 Unauthorized` responses, clears tokens from `localStorage`, and redirects unauthenticated users to `/login`.
  - **Reusable Error Parsing Utility**: Exports `getErrorMessage(err)` to safely extract backend error messages.

### 35. [`client/src/context/AuthContext.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/context/AuthContext.jsx)
- **Primary Purpose**: Provides global user authentication state and login/logout handlers to the entire React tree.
- **Concepts Used**:
  - **React Context API**: `createContext` and `<AuthContext.Provider>`.
  - **Custom Hook Pattern**: Exports `useAuth()` to provide consuming components with `{ user, login, logout, loading, isAuthenticated }`.
  - **Session Hydration**: Uses `useEffect` on initial mount to check `localStorage` for existing sessions and hydrates the user state before rendering routes.
  - **Stateless Logout Handler**: Cleans up `mealmitra_token` and `mealmitra_user` from `localStorage` and resets state to `null`.

---

## 🧭 Frontend: Routing & Protection

### 36. [`client/src/routes/AppRoutes.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/AppRoutes.jsx)
- **Primary Purpose**: Declares client-side route paths and maps them to view components with role protections.
- **Concepts Used**:
  - **React Router v6 Declarative Routing**: Uses `<Routes>` and `<Route>`.
  - **Role-Guarded Routes**: Wraps private routes in `<ProtectedRoute allowedRoles={[...]}>`.
  - **Catch-All 404 Route**: `<Route path="*" element={<Placeholder ... />} />`.

### 37. [`client/src/routes/ProtectedRoute.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/ProtectedRoute.jsx)
- **Primary Purpose**: Higher-Order Component that blocks unauthorized access to private views.
- **Concepts Used**:
  - **Session Check Guard**: While `loading === true`, renders `<Loader />` to prevent premature flash-redirects to `/login`.
  - **Authentication Guard**: If `!isAuthenticated`, redirects to `/login` using `<Navigate to="/login" replace />`.
  - **Role Authorization Guard**: If `allowedRoles` does not include `user.role`, redirects the user to `/`.

---

## 🧩 Frontend: Reusable UI Components

### 38. [`client/src/components/common/Navbar.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/common/Navbar.jsx)
- **Primary Purpose**: Sticky top navigation bar with dynamic, role-adaptive links and notification badge.
- **Concepts Used**:
  - **Role-Based Link Configuration Table**: Maps user roles (`Restaurant`, `EventOrganizer`, `NGO`, `Admin`) to their respective navigation options.
  - **Active Route Inspection (`useLocation`)**: Conditionally renders public anchor links (`About Us`, `How It Works`) only when on the home page (`/`).
  - **Authentication-Aware Controls**: Renders login/register links for guests, or user profile, notification bell, and logout buttons for logged-in users.

### 39. [`client/src/components/common/Loader.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/common/Loader.jsx)
- **Primary Purpose**: Reusable loading spinner.
- **Concepts Used**:
  - **CSS Spinner Animation**: `animate-spin` with custom borders.
  - **Accessibility Attributes**: `role="status"` and `aria-live="polite"` announce loading status to screen readers.

### 40. [`client/src/components/donation/DonationCard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/donation/DonationCard.jsx)
- **Primary Purpose**: Card displaying surplus food donation details with status badges and context-aware action buttons.
- **Concepts Used**:
  - **Lookup Dictionary Pattern**: `STATUS_CLASSES` maps status values to specific Tailwind badge colors.
  - **Locale Date Formatting**: Uses `Intl`/`toLocaleString("en-IN")` for formatted expiry date and time.
  - **Ownership & Role Detection**: Determines whether the current user is the owner donor or an NGO to display Edit, Delete, or Request Pickup buttons accordingly.

### 41. [`client/src/components/donation/DonationForm.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/donation/DonationForm.jsx)
- **Primary Purpose**: Modal form for creating or editing surplus food listings.
- **Concepts Used**:
  - **Controlled Form Inputs**: Manages form values via React state.
  - **Dual Mode (Create vs Edit)**: Inspects `initialData` to pre-populate existing values for editing, or initializes blank defaults for creation.
  - **Datetime-Local Formatting**: Converts standard ISO strings into the local `YYYY-MM-THH:mm` format required by HTML5 datetime inputs.
  - **Client-Side Validation**: Ensures `expiryTime` is set in the future.

### 42. [`client/src/components/notification/NotificationBell.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationBell.jsx)
- **Primary Purpose**: Notification bell icon with real-time unread badge counter and toggleable notification dropdown.
- **Concepts Used**:
  - **Background Polling Mechanism**: Uses `setInterval` in `useEffect` to fetch fresh notifications every 30 seconds, with `clearInterval` cleanup on unmount.
  - **Outside Click Detection**: Attaches a `mousedown` listener and checks `wrapperRef.current.contains(e.target)` to close the dropdown when clicking outside.
  - **Optimistic UI Updates**: Updates notification state locally before sending the API request, refetching if the request fails.

### 43. [`client/src/components/notification/NotificationList.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationList.jsx)
- **Primary Purpose**: The dropdown panel displaying the user's notification list.
- **Concepts Used**:
  - **Conditional Styling**: Visually distinguishes unread notifications (`bg-accent/5`) from read ones (`bg-white`).
  - **Bulk Action Trigger**: Displays a "Mark all read" button whenever any unread notifications exist.

### 44. [`client/src/components/pickup/RequestPickupModal.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/RequestPickupModal.jsx)
- **Primary Purpose**: Modal dialog allowing NGOs to submit a pickup request for a donation.
- **Concepts Used**:
  - **Event Propagation Isolation**: Uses `e.stopPropagation()` on the modal dialog container to prevent clicks inside the modal from triggering the backdrop's `onClose` handler.
  - **Input Boundaries**: Enforces `min` (current time) and `max` (donation expiry time) constraints on the scheduled pickup datetime input.

### 45. [`client/src/components/pickup/StatusTracker.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/StatusTracker.jsx)
- **Primary Purpose**: Interactive step-by-step progress stepper displaying the 4 stages of a pickup request.
- **Concepts Used**:
  - **Array Index-Based State Progress**: Matches current request status against `STEPS = ["Requested", "Accepted", "Picked Up", "Completed"]` to dynamically style completed, current, and upcoming stages.
  - **Forward-Only Lifecycle Advancement**: Renders an action button that advances the pickup status sequentially (`Accepted` ➔ `Picked Up` ➔ `Completed`).

---

## 📄 Frontend: Page Views

### 46. [`client/src/pages/Home.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/Home.jsx)
- **Primary Purpose**: The public landing page showcasing MealMitra's mission, impact, and workflow.
- **Concepts Used**:
  - **Modern Hero Section**: Features gradient text clips (`bg-clip-text bg-gradient-to-r`), decorative blurred backdrop circles, and responsive two-column flex layouts.
  - **Card Grids**: Organizes "About Us" and "How It Works" sections into responsive card grids.

### 47. [`client/src/pages/History.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/History.jsx)
- **Primary Purpose**: Displays a searchable activity log of completed donations and pickups.
- **Concepts Used**:
  - **Polymorphic Data Rendering**: Seamlessly renders either donation items or pickup requests depending on the user's role.
  - **Client-Side Text Search Filtering**: Filters history items in real time via `searchTerm` on `foodName`.

### 48. [`client/src/pages/auth/Login.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Login.jsx)
- **Primary Purpose**: User login page for account authentication.
- **Concepts Used**:
  - **Controlled Form Management**: Binds form inputs to React state.
  - **Role-Based Redirect Matrix**: Upon successful authentication, routes users dynamically:
    - `Admin` ➔ `/admin/pending`
    - `NGO` ➔ `/browse`
    - `Restaurant` / `EventOrganizer` ➔ `/dashboard`

### 49. [`client/src/pages/auth/Register.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Register.jsx)
- **Primary Purpose**: Registration page allowing restaurants, NGOs, and event organizers to sign up.
- **Concepts Used**:
  - **Dynamic Schema Field Switching**: Inspects the selected `role` and dynamically renders matching input fields (e.g., FSSAI license for restaurants, registration number for NGOs).
  - **State Sanitization on Switch**: Clears role-specific form state when switching roles to avoid submitting mismatched discriminator attributes.

### 50. [`client/src/pages/auth/Profile.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Profile.jsx)
- **Primary Purpose**: Allows users to inspect and update their profile details and organizational credentials.
- **Concepts Used**:
  - **Form Pre-Population**: Fetches current user details via `/api/auth/me` on mount and initializes form state.
  - **Granular Feedback**: Shows success and error banners upon profile updates.

### 51. [`client/src/pages/restaurant/RestaurantDashboard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/restaurant/RestaurantDashboard.jsx)
- **Primary Purpose**: Main management portal for food donors.
- **Concepts Used**:
  - **Tabbed Status Filtering**: Filters donations locally across `All`, `Available`, `In Progress`, and `Completed`.
  - **Sub-Section Switching**: Toggles view between active donations and incoming pickup requests.
  - **Integrated Action Modals**: Triggers create/edit modal dialogs and handles listing deletions with confirmation prompts.

### 52. [`client/src/pages/restaurant/IncomingRequests.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/restaurant/IncomingRequests.jsx)
- **Primary Purpose**: Displays pickup requests submitted by NGOs for the donor's listings.
- **Concepts Used**:
  - **Interactive Decision Actions**: Renders Accept/Reject buttons with row-level loading states.
  - **Embedded Progress Stepper**: Integrates `<StatusTracker />` directly inside each accepted request card.

### 53. [`client/src/pages/ngo/NgoDashboard.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/NgoDashboard.jsx)
- **Primary Purpose**: Main management dashboard for recipient NGOs.
- **Concepts Used**:
  - **KPI Metrics Cards**: Calculates and displays aggregate statistics (Total, Pending, Accepted, Completed).
  - **Filter Tabs & Lifecycle Tracking**: Allows filtering requests by status with live step-progress tracking.

### 54. [`client/src/pages/ngo/BrowseDonations.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/BrowseDonations.jsx)
- **Primary Purpose**: Discovery catalog for NGOs to search and claim available food donations.
- **Concepts Used**:
  - **Multi-Field Filter Submission**: Form controls for food type, location, quantity, and expiry date.
  - **Server-Side Pagination Controls**: Previous/Next navigation updating server query parameters.
  - **Memoized Fetch Routine**: Wraps API calls with `useCallback` to prevent unnecessary re-renders.

### 55. [`client/src/pages/ngo/ngo.css`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/ngo.css)
- **Primary Purpose**: Modular CSS stylesheet providing layout grids and badges for the NGO section.
- **Concepts Used**:
  - **CSS Grid Layouts**: Responsive auto-fill grids (`repeat(auto-fill, minmax(280px, 1fr))`).
  - **Badge Color Mappings**: Distinct styling for `.badge-available`, `.badge-requested`, `.badge-accepted`, `.badge-completed`, and `.badge-rejected`.

### 56. [`client/src/pages/admin/AllUsers.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AllUsers.jsx)
- **Primary Purpose**: User account administration table for platform administrators.
- **Concepts Used**:
  - **Server-Side Paginated Table**: Fetches users with role and verification status filters.
  - **Soft-Delete & Restore Operations**: Allows admins to soft-delete active users or restore previously deleted accounts with row-level loading spinners.

### 57. [`client/src/pages/admin/VerifyUsers.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/VerifyUsers.jsx)
- **Primary Purpose**: Queue interface for reviewing pending restaurant and NGO registrations.
- **Concepts Used**:
  - **Oldest-First Priority Queue**: Fetches accounts sorted by registration date to review older submissions first.
  - **Decision Modal with Remarks**: Allows approving or rejecting accounts with custom administrative remarks.
  - **Dynamic State Excision**: Removes verified or rejected users from state without requiring a full page refetch.

### 58. [`client/src/pages/admin/ModerateDonations.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/ModerateDonations.jsx)
- **Primary Purpose**: Administration portal for reviewing and taking down non-compliant food listings.
- **Concepts Used**:
  - **Administrative Override Removal**: Enables immediate deletion of any listing across any status.
  - **Status Filtering & Server Pagination**: Provides search and pagination controls over all platform listings.

### 59. [`client/src/pages/admin/AdminReports.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AdminReports.jsx)
- **Primary Purpose**: Analytics and reporting dashboard displaying platform metrics and supporting PDF report downloads.
- **Concepts Used**:
  - **Concurrent Request Orchestration**: Uses `Promise.all([ ... ])` to fetch summary metrics, monthly trends, and user statistics simultaneously.
  - **Visual Bar Chart Trend**: Renders a CSS-based responsive bar chart visualizing monthly donation trends.
  - **Binary File Streaming & Blob URL Triggering**:
    - Calls `api.get('/admin/reports/pdf', { responseType: 'blob' })`.
    - Creates a temporary browser blob object via `window.URL.createObjectURL(new Blob([response.data]))`.
    - Dynamically generates and clicks a temporary `<a>` anchor element with `download="MealMitra_Summary_Report.pdf"` to trigger a native browser file download.

---

## 🎯 Concept Cross-Reference Index

Use this quick-reference index to look up where specific computer science and web development concepts appear across the project:

### 1. Security & Authentication
- **JSON Web Tokens (JWT)**: [`GenerateToken.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/utils/GenerateToken.js), [`Authmiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Authmiddleware.js), [`AuthController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AuthController.js), [`api.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/services/api.js).
- **Password Salting & Hashing**: [`AuthController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AuthController.js), [`Createadmin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/Createadmin.js).
- **Role-Based Access Control (RBAC)**: [`Rolemiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Rolemiddleware.js), [`AdminRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/AdminRoutes.js), [`DonationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/DonationRoutes.js), [`PickupRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/PickupRoutes.js), [`ProtectedRoute.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/ProtectedRoute.jsx).
- **Mass-Assignment Defense**: [`AuthController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AuthController.js), [`DonationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/DonationController.js).
- **Information Concealment**: [`errorMiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/errorMiddleware.js), [`Authmiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/Authmiddleware.js) (`select("-password")`).

### 2. Database & Data Modeling (MongoDB / Mongoose)
- **Schema Discriminators (Single-Table Inheritance)**: [`User.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/User.js), [`Restaurant.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Restaurant.js), [`NGO.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/NGO.js), [`Admin.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Admin.js), [`EventOrganizer.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/EventOrganizer.js).
- **Relational Referencing (`ObjectId` / `populate`)**: [`Donation.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Donation.js), [`PickupRequest.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/PickupRequest.js), [`Notification.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/Notification.js), [`DonationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/DonationController.js).
- **Soft Delete Query Pre-Hooks**: [`User.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/models/User.js), [`AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js).
- **Aggregation Pipelines**: [`AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js) (`$group`, `$year`, `$month`, `$sum`, `$sort`).
- **Pagination (`skip`, `limit`, `countDocuments`)**: [`DonationController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/DonationController.js), [`AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js), [`AllUsers.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AllUsers.jsx), [`BrowseDonations.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/ngo/BrowseDonations.jsx).

### 3. API & Asynchronous Patterns
- **Centralized Error Handling**: [`errorMiddleware.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/middleware/errorMiddleware.js), [`server.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/server.js).
- **Async Route Handlers**: `express-async-handler` across all controller files.
- **Binary Streaming**: [`AdminController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/AdminController.js) (`pdfkit`), [`AdminReports.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AdminReports.jsx) (`Blob` URL trigger).
- **Route Precedence Control**: [`DonationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/DonationRoutes.js), [`NotificationRoutes.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/routes/NotificationRoutes.js).
- **Dual State Machine Synchronization**: [`PickupController.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/server/controllers/PickupController.js).

### 4. React & Frontend Architecture
- **Global Context & Custom Hooks**: [`AuthContext.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/context/AuthContext.jsx).
- **Axios Interceptors**: [`api.js`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/services/api.js).
- **Higher-Order Components & Route Guards**: [`ProtectedRoute.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/routes/ProtectedRoute.jsx).
- **Controlled vs Uncontrolled Forms**: [`DonationForm.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/donation/DonationForm.jsx), [`Login.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Login.jsx), [`Register.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Register.jsx), [`Profile.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/auth/Profile.jsx).
- **Optimistic UI Updates**: [`NotificationBell.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationBell.jsx).
- **Interval Polling & Cleanup**: [`NotificationBell.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationBell.jsx).
- **Outside-Click Detection**: [`NotificationBell.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/notification/NotificationBell.jsx) (`useRef` + DOM listener).
- **Event Propagation Isolation**: [`RequestPickupModal.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/RequestPickupModal.jsx) (`e.stopPropagation()`).
- **Concurrent API Requests**: [`AdminReports.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/pages/admin/AdminReports.jsx) (`Promise.all`).
- **Interactive State Machine Stepper**: [`StatusTracker.jsx`](file:///c:/Users/Admin/Desktop/Nidhi/CE/Projects/MealMitra/client/src/components/pickup/StatusTracker.jsx).

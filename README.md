# 🍲 MealMitra

**Bridging Surplus Food with the Hands That Need It Most**

MealMitra is a full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) web application that connects verified **restaurants/event organizers** with verified **NGOs**, enabling seamless donation, discovery, and pickup of surplus food — reducing food waste while fighting hunger.

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project / Folder Structure](#-project--folder-structure)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Non-Functional Requirements](#-non-functional-requirements)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)
- [License](#-license)

---

## 🌍 About the Project

Every day, tons of edible surplus food from restaurants and events goes to waste while millions go hungry. **MealMitra** ("Meal Friend") solves this by digitizing the donation pipeline — allowing restaurants to list surplus food in seconds, and NGOs to discover, request, and collect it before it expires.

The platform enforces trust through **admin-verified onboarding**, tracks the full donation lifecycle from `Available → Requested → Accepted → Picked Up → Completed`, and keeps every stakeholder informed through real-time notifications.

## ❓ Problem Statement

> Restaurants and event organizers generate large quantities of surplus food with no structured, reliable channel to route it to organizations that redistribute it to those in need — resulting in preventable food waste and missed opportunities to fight hunger.

## ✨ Key Features

### 🔐 User Registration & Authentication
- Role-based signup for **Restaurants** and **NGOs** with document upload
- Accounts remain in `Pending Verification` until admin approval
- Secure **JWT-based login** with role-based dashboard access

### ✅ Admin Verification System
- Admin reviews uploaded documents before granting platform access
- Approve / reject verification requests with remarks
- Automatic notification of verification outcome

### 🍛 Food Donation Management
- Create donation listings with food type, quantity, expiry time & pickup address
- Edit or delete listings *before* they are accepted by an NGO
- Real-time status tracking: `Available`, `Requested`, `Accepted`, `Picked Up`, `Completed`

### 🔎 Smart Browsing & Pickup Requests
- NGOs browse and filter donations by **location, food type, quantity & expiry**
- One-click pickup requests routed directly to the donor restaurant

### 📦 Pickup Lifecycle Management
- Restaurants accept/reject incoming pickup requests
- Both parties track live pickup status on their dashboards

### 🕓 Donation History
- Permanent, searchable history of all completed donations and pickups
- Personal activity logs for every restaurant and NGO

### 🛠️ Admin Dashboard & Reporting
- Manage/suspend/remove user accounts
- Moderate expired or invalid donation listings
- Generate statistical & graphical reports (users, donations, pickups)

### 🔔 Smart Notifications
- Alerts for verification status, pickup requests, approvals & rejections
- Automated **expiry alerts** — donations nearing expiry are flagged/auto-removed

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **🍴 Restaurant (Donor)** | Register, list/edit/delete donations, manage pickup requests, view history |
| **🤝 NGO (Receiver)** | Register, browse/filter donations, request pickups, track completed pickups |
| **🛡️ Administrator** | Verify users, moderate donations, manage accounts, generate reports |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS / Bootstrap |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcrypt |
| **API Testing** | Postman |
| **Version Control** | Git & GitHub |

---

## 📁 Project / Folder Structure

```
MealMitra/
│
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── assets/                  # Images, logos, icons
│       ├── components/              # Reusable UI components
│       │   ├── common/              # Navbar, Footer, Loader, Modal
│       │   ├── donation/            # DonationCard, DonationForm
│       │   └── notification/        # NotificationBell, NotificationList
│       ├── pages/                   # Route-level views
│       │   ├── auth/                # Login, Register
│       │   ├── restaurant/          # RestaurantDashboard, MyDonations
│       │   ├── ngo/                 # NgoDashboard, BrowseDonations
│       │   └── admin/               # AdminDashboard, VerifyUsers, Reports
│       ├── context/                 # AuthContext, NotificationContext
│       ├── hooks/                   # useAuth, useFetch, useDebounce
│       ├── services/                # Axios API calls (api.js, authService.js…)
│       ├── utils/                   # Helpers, formatters, constants
│       ├── routes/                  # ProtectedRoute, AppRoutes.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│   ├── .env
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Node + Express Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Document/image upload config
│   ├── models/                      # Mongoose Schemas
│   │   ├── User.js                  # Restaurant / NGO / Admin (role field)
│   │   ├── Donation.js
│   │   ├── PickupRequest.js
│   │   └── Notification.js
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── donationController.js
│   │   ├── pickupController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   ├── routes/                      # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── pickupRoutes.js
│   │   ├── adminRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── roleMiddleware.js        # Role-based access control
│   │   ├── uploadMiddleware.js      # Multer file uploads
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendNotification.js
│   │   └── expiryChecker.js         # Cron job for expiry notifications
│   ├── .env                         # PORT, MONGO_URI, JWT_SECRET
│   ├── server.js                    # Entry point
│   └── package.json
│
├── docs/
│   └── SRS_MealMitra.pdf            # Software Requirements Specification
│
├── .gitignore
├── README.md
└── package.json                     # Root scripts (concurrently client + server)
```

---

## 🏗️ System Architecture

```
┌──────────────┐      REST API (JWT Auth)      ┌──────────────┐      Mongoose      ┌──────────────┐
│   React.js   │  <-------------------------->  │  Express.js  │  <-------------->  │   MongoDB    │
│   (Client)   │        Axios / Fetch           │  (Server)    │                     │  (Database)  │
└──────────────┘                                 └──────────────┘                     └──────────────┘
     │                                                  │
     │  Role-based Dashboards                           │  Cron Jobs
     ▼                                                  ▼
 Restaurant | NGO | Admin                     Expiry Checks | Notification Dispatch
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas cluster)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/MealMitra.git
cd MealMitra

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Set up environment variables (see below)

# 5. Run backend
cd ../server
npm run dev

# 6. Run frontend (in a new terminal)
cd ../client
npm run dev
```

The app will be available at `http://localhost:5173` (client) and `http://localhost:5000` (server), or as configured.

---

## 🔑 Environment Variables

**server/.env**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register restaurant/NGO | Public |
| POST | `/api/auth/login` | Login user | Public |
| PUT | `/api/admin/verify/:id` | Approve/reject user | Admin |
| POST | `/api/donations` | Create donation | Restaurant |
| PUT | `/api/donations/:id` | Update donation | Restaurant |
| DELETE | `/api/donations/:id` | Delete donation | Restaurant |
| GET | `/api/donations` | Browse/filter donations | NGO |
| POST | `/api/pickups` | Request pickup | NGO |
| PUT | `/api/pickups/:id` | Accept/reject request | Restaurant |
| GET | `/api/history` | View donation history | Restaurant/NGO |
| GET | `/api/admin/reports` | Generate reports | Admin |
| GET | `/api/notifications` | Fetch notifications | All |

*Full endpoint documentation available via the Postman collection in `/docs`.*

---

## 🛡️ Non-Functional Requirements

- **Performance:** Fast response for listing/browsing/requesting even under concurrent load
- **Security:** Encrypted passwords, JWT auth, strict role-based access control
- **Reliability & Usability:** Simple, consistent UI across all dashboards
- **Scalability:** Architected to support future location-based matching and real-time features

---

## 🔮 Future Enhancements

- 📍 GPS-based nearby donation matching
- ⚡ Real-time notifications (Socket.io)
- 🤖 AI-based demand prediction
- 📱 Mobile application
- 🛣️ Route optimization for pickups
- 🏛️ Integration with government food programs

---



---



---

<p align="center">Made with 💚 to fight food waste, one meal at a time.</p>

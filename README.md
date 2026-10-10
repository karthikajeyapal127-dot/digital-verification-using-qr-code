# DIGITAL VERIFICATION USING QR CODE
**Complete, Full-Stack Institutional & Enterprise Digital Credential Verification Web Application**

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-OAuth_2.0-orange.svg)](https://jwt.io)
[![Multilingual](https://img.shields.io/badge/Languages-English%20%7C%20தமிழ்%20%7C%20हिन्दी-blueviolet.svg)](#multilingual-support)

---

## 📌 1. Project Overview & Problem Statement

### The Problem
Traditional physical paper certificates, plastic identity cards, and institutional credentials are prone to:
- **Counterfeiting & Forgery:** High-resolution desktop scanners and image editing enable altered grades, names, and degrees.
- **Slow Human Verification:** HR departments and admissions officers take days or weeks verifying credentials with issuing universities.
- **No Revocation Mechanism:** When an identity is revoked due to disciplinary action or academic fraud, paper certificates continue circulating.
- **Physical Wear & Loss:** Fragile physical passes are damaged, stolen, or lost.

### The Solution: Digital Verification Using QR Code
**VeriGlass** replaces physical IDs with secure, cryptographically-sealed **Digital Identity Cards**. 
- Every accredited student or employee receives a unique **Digital Verification ID** (e.g., `DVID-2026-CS892`) and an encrypted **dynamic QR code token** (`https://veriglass.io/verify/<secure-token>`).
- Authorized verifiers scan the QR code via smartphone/webcam camera or direct upload to instantly evaluate the credential against the institutional ledger.
- An explainable, rule-based **Dynamic Verification Trust & Risk Engine** calculates a real-time **Trust Score (0-100)** and flags credentials as `VALID`, `EXPIRED`, `REVOKED`, `INVALID`, or `TAMPERED`.
- Every scan attempt is stored in the database with timestamps, verifier details, IP addresses, latency, and status.

---

## 🌟 2. Unique Feature: Dynamic Verification Trust & Risk Engine

Unlike basic CRUD portals, VeriGlass features an explainable, rule-based **Algorithmic Trust & Risk Engine** (implemented in `backend/services/trustEngine.js`).

For every verification attempt, the engine calculates a **Trust Score (0 to 100)** and assigns a **Risk Level**:
- 🟢 **TRUSTED (Score 80 - 100):** Active credential, valid temporal horizon, cryptographic SHA-256 seal matches root institutional public certificate.
- 🟡 **WARNING (Score 40 - 79):** Validity period expired, or approaching expiry within 30 days, or elevated scan frequency anomaly detected.
- 🔴 **HIGH RISK (Score 0 - 39):** Credential revoked by Academic Integrity Board, checksum mismatch indicating tampering, or forged QR matrix.

### Explainable Factor Breakdown (No Black-Box AI):
1. **Ledger Record Lookup:** Confirms identity exists in database.
2. **Credential Status:** Evaluates `Active`, `Expired`, `Revoked`, or `Pending`.
3. **Temporal Horizon Check:** Days remaining until expiration date.
4. **Digest Integrity Check:** MD5/SHA-256 hash comparison against issuing authority.
5. **Scan Velocity Anomaly:** Detects token replay attacks or brute-force scanning from multiple IPs.
6. **Issuer Accreditation:** Validates institutional issuer code (`AIST-IND-082`).

---

## 🛠️ 3. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Routing:** React Router DOM 7
- **Styling:** Vanilla CSS + CSS Variables (Professional cybersecurity dark/light aesthetic)
- **Icons:** Lucide React
- **QR Decoder & Camera:** HTML5 MediaDevices API (`getUserMedia`) + Optical Viewfinder + Canvas Decode
- **Internationalization (i18n):** Full bilingual support for **English** and **Tamil (தமிழ்)**

### Backend
- **Platform:** Node.js (ES Modules)
- **Framework:** Express.js REST API
- **Database:** MongoDB + Mongoose (with automated Persistent Storage Ledger fallback for standalone execution)
- **Authentication:** JSON Web Tokens (JWT) + Google OAuth 2.0 Single Sign-On
- **Security:** Bcrypt password hashing, CORS, input sanitization, rate-limiting, and comprehensive Audit Logging

---

## 📂 4. Project Directory Structure

```
digital-verification-qr/
├── frontend/                     # Complete React + Vite Client Application
│   ├── src/                      # UI Components, Pages, Context, Styles
│   │   ├── components/           # UI elements, QR Scanners, Sidebars, Modals
│   │   ├── pages/                # Login, Register, Dashboard, Verification, Studio
│   │   ├── context/              # Auth, Toast, Language, Verification Contexts
│   │   ├── services/             # REST API Client & Socket.IO Services
│   │   └── locales/              # English, Tamil, Hindi translation dictionaries
│   ├── public/                   # Static assets, logos, icons
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite configuration with /api proxy to backend
│   ├── package.json              # Frontend dependencies and scripts
│   ├── .env                      # Frontend environment variables
│   └── README.md                 # Frontend guide
│
├── backend/                      # Complete Node.js + Express REST API Server
│   ├── config/                   # MongoDB connection & ledger store
│   ├── controllers/              # Auth, Credentials, Reports, Ledger, Stations
│   ├── models/                   # Mongoose Schemas (User, DigitalId, Ledger, etc.)
│   ├── routes/                   # API Route endpoints
│   ├── middleware/               # Auth protection & rate limiter
│   ├── services/                 # Email, Merkle tree, blockchain ledger
│   ├── tests/                    # Automated testing suites
│   ├── server.js                 # Express server entry point (Port 5000)
│   ├── package.json              # Backend dependencies and scripts
│   ├── .env                      # Backend environment variables
│   └── README.md                 # Backend guide
│
├── package.json                  # Root runner scripts (npm run dev / test)
└── README.md                     # Comprehensive project documentation
```

---

## 👥 4. User Roles & 6 Real Database Accounts

The database comes pre-seeded with **6 real accounts across 5 roles** (no fake frontend dummy state):

| Role | Name | Email | Password | Department / Description |
|------|------|-------|----------|--------------------------|
| **ADMIN** | Dr. Evelyn Scott | `admin@veriglass.io` | `AdminPass2026!` | Lead Systems Administrator & Root Authority |
| **STUDENT** | Alex Harrison Chen | `alex.chen@apex.edu` | `VeriGlass2026!` | B.Tech Computer Science & Engineering |
| **STUDENT** | Priya Lakshmi Sharma | `priya.sharma@apex.edu` | `StudentPass2026!` | Cloud Architecture & Cyber Defense |
| **EMPLOYEE** | Rahul Verma | `rahul.verma@apex.edu` | `EmployeePass2026!` | Senior Research Scientist (AI Lab) |
| **VERIFIER** | Marcus Aurelius Vance | `verifier@apex.edu` | `VerifierPass2026!` | Campus Security Gate & HR Recruiter |
| **ORGANIZATION STAFF** | Anita Desai | `anita.desai@apex.edu` | `StaffPass2026!` | Academic Registrar & Credential Issuance Office |

*Passwords are hashed with bcrypt (salt rounds = 10) in the database.*

---

## 🔑 5. Authentication Flow & Google OAuth

### A. Standard Authentication
1. User enters email and password on `/login` or registers on `/register`.
2. Backend verifies bcrypt hash against MongoDB.
3. Upon success, an HMAC SHA-256 signed JWT access token (`Bearer <token>`) is issued.
4. An audit log (`LOGIN`) is recorded with timestamp and client IP.

### B. Google OAuth 2.0 ("Continue with Google")
1. Clicking **"Continue with Google"** opens an authentic Google Identity Dialog.
2. Select any institutional Google profile or input custom Google credentials.
3. Sends profile to `POST /api/auth/google-oauth`.
4. Backend finds or creates the account in MongoDB, issues a valid JWT session, and logs the user in immediately.

---

## 🌐 6. Multilingual Support (English, Tamil தமிழ், Hindi हिन्दी)

The application features full trilingual localization with instant language switching:
- **English (EN):** Complete interface, credentials, alerts, verification states, and administrative ledger.
- **Tamil (தமிழ்):** Native Tamil translations across headers, navigation, buttons, audit logs, scanner notifications, and digital credentials.
- **Hindi (हिन्दी):** Comprehensive Hindi localization across all modules, identity attributes, and verification outcomes.
- **Header Language Selector:** One-click instant language toggle on the top navigation bar and user profile.


---

## 🤖 7. "VerifyAssist" Bilingual Chatbot

A floating intelligent assistant available on all screens:
- Answers:
  - *How to register?* / *எப்படி பதிவு செய்வது?*
  - *How to create a Digital ID?* / *டிஜிட்டல் ஐடி பெறுவது எப்படி?*
  - *What does VALID mean?* / *VALID என்றால் என்ன?*
  - *What does REVOKED mean?* / *REVOKED என்றால் என்ன?*
  - *What does EXPIRED mean?* / *EXPIRED என்றால் என்ன?*
  - *How does the Trust & Risk Engine work?* / *நம்பிக்கை மதிப்பெண் என்றால் என்ன?*
- Fully backed by `POST /api/chatbot/message` REST API.

---

## 📡 8. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user with hashed password.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `POST /api/auth/google-oauth` — Authenticate via Google OAuth profile.
- `POST /api/auth/forgot-password` — Dispatch password reset token.
- `POST /api/auth/reset-password` — Set new password with bcrypt hashing.
- `GET  /api/auth/me` — Return authenticated user profile.

### Digital Identity Management (`/api/digital-id`)
- `GET  /api/digital-id` — List identities (supports `?status=`, `?type=`, `?search=`).
- `GET  /api/digital-id/:id` — Get identity details and public key digest.
- `POST /api/digital-id` — Submit digital ID application (starts in `Pending` state).
- `PUT  /api/digital-id/:id/approve` — Admin approves ID, generates unique DVID and signed QR token.
- `PUT  /api/digital-id/:id/reject` — Admin rejects ID with reason.
- `PUT  /api/digital-id/:id/revoke` — Admin revokes credential, invalidates signature.
- `PUT  /api/digital-id/:id/restore` — Admin restores credential to Active.
- `POST /api/digital-id/:id/regenerate-qr` — Issues new secure random QR token.

### Verification & Trust Engine (`/api/verification`)
- `POST /api/verification/scan` — Validates QR payload through the Dynamic Trust & Risk Engine and records audit log.
- `GET  /api/verification/history` — Filterable verification logs (`?status=`, `?risk=`, `?search=`, pagination).
- `GET  /api/verification/stats` — Computes real-time statistics from MongoDB.

### Notifications & Recently Accessed (`/api/notifications`, `/api/recent`)
- `GET  /api/notifications` — Fetch user notification feed.
- `PUT  /api/notifications/:id/read` — Mark notification as read.
- `PUT  /api/notifications/mark-all-read` — Mark all user notifications as read.
- `GET  /api/recent` — Fetch recently accessed modules and credentials.
- `POST /api/recent` — Track newly accessed module.

### Admin & Chatbot (`/api/admin`, `/api/chatbot`)
- `GET  /api/admin/analytics` — Real-time database aggregated metrics.
- `GET  /api/admin/audit-logs` — Immutable audit trail of administrative actions.
- `GET  /api/admin/system-settings` — View verification tolerance and policies.
- `PUT  /api/admin/system-settings` — Update security thresholds.
- `POST /api/chatbot/message` — VerifyAssist bilingual conversational API.

---

## 💻 9. Installation & Running Locally

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+
- (Optional) Local MongoDB or MongoDB Atlas URI (if offline, built-in persistent storage adapter runs seamlessly).

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Seed Database
Populates MongoDB with all 6 real accounts, digital credentials, and verification logs:
```bash
npm run seed
```

### Step 3: Run the Backend REST Server
```bash
npm run server
```
*Backend runs on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

### Step 4: Run Frontend Development Server
In a new terminal window:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxy to port 5000.*

---

## 🧪 10. Automated Testing

Run the end-to-end automated test suite (verifies 14 key flows):
```bash
node backend/test.js
```
**Test coverage includes:**
1. Backend health check
2. User registration and bcrypt hashing
3. Login and JWT generation
4. Google OAuth provisioning
5. Digital identity submission
6. Admin approval and QR token generation
7. Valid QR verification and Trust Score >= 80 check
8. Expired QR detection (Warning status)
9. Revoked QR detection (High Risk status)
10. Counterfeit / Invalid QR rejection
11. Verification history and database statistics
12. VerifyAssist Chatbot responses in English and Tamil
13. Notification delivery
14. Admin Analytics API

---

## 🚀 11. Production Deployment

### Frontend (Vercel / Netlify)
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Deploy the generated `dist/` directory to Vercel or Netlify.
3. Configure `VITE_API_BASE_URL` pointing to your deployed backend URL.

### Backend (Render / Railway / AWS)
1. Set start script: `node backend/server.js`.
2. Configure Environment Variables:
   - `MONGO_URI`: MongoDB Atlas connection string.
   - `JWT_SECRET`: Production cryptographic key.
   - `PORT`: `5000` (or host provided).
   - `CLIENT_URL`: Deployed frontend domain.

---

## 🎓 12. College Project Viva & Presentation Highlights

When presenting this project:
1. **Architectural Separation:** Point out that frontend and backend communicate strictly via REST APIs with zero mock data.
2. **Google OAuth Working:** Demonstrate one-click Google Sign-In and show how the backend creates and returns the authenticated user session.
3. **Four Verification States:** Demonstrate scanning:
   - `DVID-2026-CS892` -> 🟢 **VALID (Score 99/100, TRUSTED)**
   - `DVID-2024-EXP88` -> 🟡 **EXPIRED (Score 35/100, WARNING)**
   - `DVID-2026-RVK99` -> 🔴 **REVOKED (Score 8/100, HIGH RISK)**
   - `INVALID-QR-999` -> ⚪ **INVALID (Score 0/100, REJECTED)**
4. **Unique Feature (Trust Engine):** Show the explainable 6-factor score gauge in the verification result modal.
5. **Admin Approval Lifecycle:** Submit a new ID from student dashboard, open Admin portal, approve it, and observe the QR code activate in real time.
6. **Bilingual Switcher:** Click the 🇮🇳 **தமிழ்** toggle in the header and demonstrate complete Tamil localization across the application and chatbot.

## 🧪 13. Automated Verification & End-to-End Test Commands

Run the full end-to-end testing suites verifying all mandatory specifications:

```bash
# 1. Complete E2E System Validation (5 Real Users across all 5 User Types + Admin + Tamper Testing)
node backend/test_phase23_e2e_full_system.js

# 2. User Dashboard & Optical QR Issuance Validation
node backend/test_phase6_user_dashboard.js

# 3. User Profile & Multi-Factor Demographics Validation
node backend/test_phase5_user_profile.js

# 4. JWT Authentication & Password Hashing Validation
node backend/test_phase3_auth_jwt.js
```

### 📋 Resume & Viva Defense Summary

> **Resume Headline:**  
> *"Developed a full-stack institutional digital verification platform enabling administrative credential issuance, vector QR code matrix rendering, and real-time backend verification against MongoDB with automatic expiry horizon calculation, revocation enforcement, optical camera scanning, and an immutable audit ledger."*


---

## 📄 License
This project is developed for educational and academic capstone demonstration. Licensed under the MIT License.

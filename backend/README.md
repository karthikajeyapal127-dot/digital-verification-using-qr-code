# DIGITAL VERIFICATION USING QR CODE - BACKEND

This directory contains the Node.js + Express + MongoDB REST API backend service for **Digital Verification Using QR Code**.

## Directory Structure
- `config/` - Database connection and configuration
- `controllers/` - Auth, credentials, verification, reports, ledger, chatbot, and admin controllers
- `models/` - Mongoose schemas (User, DigitalId, VerificationLog, MerkleLedger, VerifierStation, Notification, Report)
- `routes/` - Express route handlers
- `middleware/` - JWT auth and rate limiting middleware
- `services/` - Email, Merkle tree, and blockchain ledger services
- `tests/` - Automated test suites (Google OAuth, 19-step E2E, mandatory feature validation)
- `server.js` - Main Express server entry point (Port 5000)
- `.env` - Backend environment variables (MongoDB URI, JWT secrets, Google OAuth secrets)

## Running Backend Independently
```bash
npm install
node server.js
```
The server will start at `http://localhost:5000`.

## Automated Tests
```bash
node test_mandatory_features.js
node test_19_steps_e2e.js
```

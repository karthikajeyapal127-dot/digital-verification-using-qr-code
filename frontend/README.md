# DIGITAL VERIFICATION USING QR CODE - FRONTEND

This directory contains the complete React + Vite frontend application for **Digital Verification Using QR Code**.

## Directory Structure
- `src/` - React components, pages, context providers, API services, and styles
  - `components/` - Common UI elements, Navbar, TopBar, Sidebars, Modals, QR scanners, and Google Auth buttons
  - `pages/` - All web pages (Login, Register, Dashboard, Secure Verification, Certificate Studio, Crypto Ledger, Admin Portal, etc.)
  - `context/` - Auth, Toast, Language, Theme, and Verification state management
  - `services/` - REST API client and Socket.IO real-time client
  - `locales/` - Multilingual translation dictionaries (English, தமிழ், हिन्दी)
  - `utils/` - Sound effects synthesizer, cryptographic formatters, QR helpers
- `public/` - Static assets, icons, and logos
- `index.html` - HTML5 template with SEO meta tags
- `vite.config.js` - Vite configuration with proxy to backend (`http://localhost:5000`)
- `.env` - Frontend environment variables (API URL, Google Client ID)

## Running Frontend Independently
```bash
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

## Production Build
```bash
npm run build
```
Generates production-ready static assets in `dist/`.

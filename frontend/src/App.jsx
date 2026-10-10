import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VerificationProvider } from './context/VerificationContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SecureVerificationPage from './pages/SecureVerificationPage';
import CertificateStudioPage from './pages/CertificateStudioPage';
import CryptoLedgerPage from './pages/CryptoLedgerPage';
import NotFoundPage from './pages/NotFoundPage';

// User / Holder Dashboard Pages
import DashboardPage from './pages/DashboardPage';
import VerificationVaultPage from './pages/VerificationVaultPage';
import DigitalIdCardPage from './pages/DigitalIdCardPage';
import GenerateQrPage from './pages/GenerateQrPage';
import VerificationHistoryPage from './pages/VerificationHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import SupportPage from './pages/SupportPage';
import ApiAccessPage from './pages/ApiAccessPage';
import VerifierDashboardPage from './pages/VerifierDashboardPage';
import CreateDigitalIdPage from './pages/CreateDigitalIdPage';

// Admin Portal Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSecurityPage from './pages/AdminSecurityPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminReportsPage from './pages/AdminReportsPage';

// Strict Role Guard for Institutional Admin Portal
function ProtectedAdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('veriglass_token') : null;
  const isStoredLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('veriglass_logged_in') === 'true' : false;

  if (!isLoggedIn && !token && !isStoredLoggedIn) {
    return <Navigate to="/login?portal=admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--bg-main)'
      }}>
        <div style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '1.75rem',
          border: '1.5px solid #fecaca',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1)',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={34} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.75rem' }}>
            403 Forbidden: Institutional Access Only
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            You are logged in as a <strong>Credential Holder</strong>. Issuing credentials, managing organizational profile, and inspecting institutional audits requires an authenticated <strong>Organization Administrator</strong> account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              Return to Holder Dashboard
            </Link>
            <Link to="/login" style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

// Protected Route for Credential Holders
function ProtectedHolderRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('veriglass_token') : null;
  const isStoredLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('veriglass_logged_in') === 'true' : false;

  if (!isLoggedIn && !token && !isStoredLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Root Entry Component: Opens Landing Page on initial visit, or routes to active dashboard if already logged in
function RootIndex() {
  const { isLoggedIn, isOrgAdmin, isVerifier } = useAuth();
  if (isLoggedIn) {
    if (isOrgAdmin) return <Navigate to="/admin" replace />;
    if (isVerifier) return <Navigate to="/verifier" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootIndex />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
        <Route path="/verify" element={<SecureVerificationPage />} />
        <Route path="/verify/:token" element={<SecureVerificationPage />} />
        <Route path="/scanner" element={<SecureVerificationPage />} />
        <Route path="/generate-qr" element={<GenerateQrPage />} />
        <Route path="/qr-code" element={<GenerateQrPage />} />
        <Route path="/secure-verification" element={<SecureVerificationPage />} />
        <Route path="/verification-result" element={<SecureVerificationPage />} />
        <Route path="/public/credential-search" element={<SecureVerificationPage />} />
        <Route path="/certificate-studio" element={<CertificateStudioPage />} />
        <Route path="/certificates" element={<CertificateStudioPage />} />
        <Route path="/certificate" element={<CertificateStudioPage />} />
        <Route path="/ledger" element={<CryptoLedgerPage />} />
        <Route path="/crypto-ledger" element={<CryptoLedgerPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Credential Holder Portal Layout (Sections 11 & 26) */}
      <Route
        element={
          <ProtectedHolderRoute>
            <DashboardLayout />
          </ProtectedHolderRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user/dashboard" element={<DashboardPage />} />
        <Route path="/user/profile" element={<ProfilePage />} />
        <Route path="/user/credentials" element={<DigitalIdCardPage />} />
        <Route path="/user/credentials/:id" element={<DigitalIdCardPage />} />
        <Route path="/user/history" element={<VerificationHistoryPage />} />
        <Route path="/user/notifications" element={<NotificationsPage />} />
        <Route path="/user/settings" element={<SettingsPage />} />
        <Route path="/holder/dashboard" element={<DashboardPage />} />
        <Route path="/holder/credentials" element={<DigitalIdCardPage />} />
        <Route path="/holder/credentials/:id" element={<DigitalIdCardPage />} />
        <Route path="/holder/history" element={<VerificationHistoryPage />} />
        <Route path="/holder/profile" element={<ProfilePage />} />
        <Route path="/holder/notifications" element={<NotificationsPage />} />
        <Route path="/holder/settings" element={<SettingsPage />} />
        <Route path="/verifier" element={<VerifierDashboardPage />} />
        <Route path="/verification" element={<VerificationVaultPage />} />
        <Route path="/digital-id" element={<DigitalIdCardPage />} />
        <Route path="/identity-card" element={<DigitalIdCardPage />} />
        <Route path="/qr-code" element={<GenerateQrPage />} />
        <Route path="/generate-qr" element={<GenerateQrPage />} />
        <Route path="/history" element={<VerificationHistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecuritySettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/api-access" element={<ApiAccessPage />} />
        <Route path="/certificate-studio" element={<CertificateStudioPage />} />
        <Route path="/ledger" element={<CryptoLedgerPage />} />
      </Route>

      {/* Organization Admin Portal Layout (Sections 10 & 26) */}
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/credential-holders" element={<AdminUsersPage />} />
        <Route path="/admin/credential-holders/:id" element={<AdminUsersPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/credentials" element={<AdminDocumentsPage />} />
        <Route path="/admin/credentials/create" element={<CreateDigitalIdPage />} />
        <Route path="/admin/credentials/:id" element={<AdminDocumentsPage />} />
        <Route path="/admin/credentials/:id/edit" element={<CreateDigitalIdPage />} />
        <Route path="/admin/create-digital-id" element={<CreateDigitalIdPage />} />
        <Route path="/admin/create" element={<CreateDigitalIdPage />} />
        <Route path="/admin/documents" element={<AdminDocumentsPage />} />
        <Route path="/admin/digital-ids" element={<AdminDocumentsPage />} />
        <Route path="/admin/certificate-studio" element={<CertificateStudioPage />} />
        <Route path="/admin/ledger" element={<CryptoLedgerPage />} />
        <Route path="/admin/verification" element={<AdminVerificationPage />} />
        <Route path="/admin/verifications" element={<AdminVerificationPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/security" element={<AdminSecurityPage />} />
        <Route path="/admin/audit-logs" element={<AdminSecurityPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/api-access" element={<ApiAccessPage />} />
        <Route path="/admin/api" element={<ApiAccessPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/support" element={<SupportPage />} />
        <Route path="/admin/scanner" element={<SecureVerificationPage />} />
        <Route path="/admin/generate-qr" element={<GenerateQrPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default function App() {
  const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '738240025158-56ihv436n35282e96iit1s7h357shedd.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <VerificationProvider>
              <ToastProvider>
                <BrowserRouter>
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                </BrowserRouter>
              </ToastProvider>
            </VerificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

import { useState } from 'react';
import { X, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, KeyRound, Globe, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function GoogleOAuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(googleClientId && !googleClientId.includes('your-google-oauth-client-id'));

  const handleProceedGoogle = () => {
    // Redirect directly to the live backend Google OAuth endpoint
    const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const backendBase = rawUrl.replace(/\/api$/, '');
    window.location.href = `${backendBase}/api/auth/google`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '1.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        animation: 'modalIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.06) 0%, rgba(52, 168, 83, 0.06) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.85rem',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Google OAuth 2.0 Authentication
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real Single Sign-On (SSO) Integration
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status Indicator */}
          <div style={{
            padding: '1rem',
            borderRadius: '1rem',
            backgroundColor: isConfigured ? '#ecfdf5' : '#eff6ff',
            border: `1.5px solid ${isConfigured ? '#a7f3d0' : '#bfdbfe'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}>
            {isConfigured ? (
              <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <Sparkles size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: isConfigured ? '#065f46' : '#1e40af',
                margin: '0 0 0.25rem'
              }}>
                {isConfigured ? 'Google OAuth 2.0 Configured' : 'Live Real OAuth Architecture'}
              </h4>
              <p style={{
                fontSize: '0.825rem',
                color: isConfigured ? '#047857' : '#1d4ed8',
                lineHeight: 1.5,
                margin: 0
              }}>
                {isConfigured
                  ? 'Your Google OAuth client credentials are configured. Clicking below will open Google account selection.'
                  : 'This application implements the real Google OAuth 2.0 flow using official Google Identity endpoints.'}
              </p>
            </div>
          </div>

          {/* Real-World Flow Steps per Section 6 */}
          <div>
            <h5 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Authentication Flow (Section 6)
            </h5>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              backgroundColor: 'var(--bg-main)',
              padding: '0.85rem 1rem',
              borderRadius: '0.85rem',
              border: '1px solid var(--border-color)',
              fontSize: '0.825rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                <span>User clicks <strong>Continue with Google</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                <span>Google account selection & OAuth consent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                <span>Backend callback at <code>/api/auth/google/callback</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                <span>Find existing user OR create new user in MongoDB</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
                <span>Generate JWT session token & redirect to User Dashboard</span>
              </div>
            </div>
          </div>

          {/* Configuration Instructions */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.85rem',
            padding: '1rem',
            fontSize: '0.825rem'
          }}>
            <h5 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Required Environment Variables (.env / backend/.env)
            </h5>
            <div style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.75rem' }}>
              <div>GOOGLE_CLIENT_ID=your-google-oauth-client-id</div>
              <div>GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret</div>
              <div>GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback</div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              Credentials can be generated in the Google Cloud Console under APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web Application).
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="gradient"
              onClick={handleProceedGoogle}
              iconRight={ExternalLink}
            >
              Continue to Google Sign-In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

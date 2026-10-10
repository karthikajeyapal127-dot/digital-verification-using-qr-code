import { ShieldCheck, Laptop, Wifi, ArrowRight, ScanLine, Lock, Key } from 'lucide-react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

export default function SecurityStatusCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Verify New Document Shortcut Box */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            <ScanLine size={13} />
            <span>Instant Authenticator</span>
          </div>

          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Verify Document
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#bfdbfe', lineHeight: 1.4, marginBottom: '1.25rem' }}>
            Scan QR code or upload degree certificates to validate cryptographic signatures in &lt;2 seconds.
          </p>

          <Link to="/verify">
            <button className="btn" style={{
              backgroundColor: '#ffffff',
              color: '#1d4ed8',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              width: '100%'
            }}>
              <span>Verify New Document</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      {/* Security Status Card */}
      <div className="vg-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Security Health</h5>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cryptographic Protection</span>
            </div>
          </div>

          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#059669',
            backgroundColor: '#ecfdf5',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px'
          }}>
            98% Excellent
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#f1f5f9',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '0.85rem'
        }}>
          <div style={{ width: '98%', height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }} />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Two-Factor Auth</span>
            <strong style={{ color: '#059669' }}>Active (TOTP)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PKI Signatures</span>
            <strong style={{ color: '#059669' }}>RSA-4096 / ECC</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tamper Detection</span>
            <strong style={{ color: '#059669' }}>Real-time Guard</strong>
          </div>
        </div>
      </div>

      {/* Active Session Card */}
      <div className="vg-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Laptop size={16} color="var(--primary)" />
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Current Session</h5>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Device</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Windows 11 (Chrome 128)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>IP Address</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>103.45.12.89</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Location</span>
            <span style={{ color: 'var(--text-main)' }}>Bangalore, India (Verified)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Status</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Active Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

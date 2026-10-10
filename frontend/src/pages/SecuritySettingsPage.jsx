import { useState } from 'react';
import {
  Shield,
  Bell,
  Sliders,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  RefreshCw,
  Save,
  Key,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'account' | 'preferences' | 'billing'
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Preferences toggles
  const [prefToggles, setPrefToggles] = useState({
    emailNotif: true,
    securityAlerts: true,
    verificationUpdates: true,
    smsAlerts: false,
    twoFactor: true
  });

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Windows 11 (Chrome 128)', ip: '103.45.12.89', location: 'Bangalore, India', current: true },
    { id: 2, device: 'iPhone 15 Pro (Safari)', ip: '157.240.19.44', location: 'Hyderabad, India', current: false },
    { id: 3, device: 'MacBook Pro (Firefox)', ip: '171.64.64.12', location: 'Palo Alto, USA', current: false }
  ]);

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    addToast('Session revoked successfully.', 'info');
  };

  const handleSavePreferences = () => {
    addToast('Security preferences updated and cryptographically applied!', 'success');
  };

  const notificationCards = [
    {
      id: 1,
      title: 'Successful Document Verification',
      message: 'Your B.Tech Computer Science Degree was verified by Deloitte Talent Acquisition with 100% cryptographic score.',
      time: '10 minutes ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'New Login Detected',
      message: 'Authorized login detected from Chrome on Windows 11 in Bangalore, India (IP: 103.45.12.89).',
      time: '1 hour ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Security Alert: Tamper Attempt Blocked',
      message: 'VeriGlass Vault automatically rejected an altered credential query (VG-2026-REVOKED) targeting your institution.',
      time: 'Yesterday at 04:30 PM',
      type: 'warning'
    },
    {
      id: 4,
      title: 'Document Verified by Academic Registry',
      message: 'Official Consolidated Transcript was re-signed using new 4096-bit institutional root key.',
      time: 'Sep 06, 2026',
      type: 'success'
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Security & Notifications
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Manage your account protection, cryptographic keys, alerts, and active login sessions.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {[
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'account', label: 'Account Settings', icon: Lock },
          { key: 'preferences', label: 'Preferences', icon: Sliders },
          { key: 'billing', label: 'Billing & Plan', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: `2.5px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px' }}>
          {notificationCards.map((n) => (
            <div
              key={n.id}
              className="vg-card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                borderLeft: `4px solid ${
                  n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : 'var(--primary)'
                }`
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: n.type === 'success' ? '#ecfdf5' : n.type === 'warning' ? '#fffbeb' : '#eff6ff',
                color: n.type === 'success' ? '#059669' : n.type === 'warning' ? '#d97706' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'warning' ? <AlertTriangle size={20} /> : <Bell size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ACCOUNT SETTINGS */}
      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }}>
          <div className="vg-card" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Two-Factor Authentication (2FA)
            </h4>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '0.75rem',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone size={22} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Authenticator App (TOTP)</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Protect your credential signing keys with Google Authenticator or 1Password.
                  </p>
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={prefToggles.twoFactor}
                  onChange={(e) => setPrefToggles({ ...prefToggles, twoFactor: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: prefToggles.twoFactor ? 'var(--primary)' : '#cbd5e1',
                  borderRadius: '34px',
                  transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '18px',
                    width: '18px',
                    left: prefToggles.twoFactor ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Input
                label="Primary Account Email"
                value={user.email}
                disabled
              />
              <Input
                label="Verified Mobile Number"
                value={user.phone}
                disabled
              />
            </div>
          </div>

          {/* Active Sessions */}
          <div className="vg-card" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Active Sessions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Laptop size={20} color="var(--text-muted)" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{session.device}</span>
                        {session.current && (
                          <span className="vg-badge badge-verified" style={{ fontSize: '0.65rem' }}>Current Session</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {session.ip} · {session.location}
                      </span>
                    </div>
                  </div>

                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="vg-card" style={{ padding: '2rem', maxWidth: '850px' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Notification & Privacy Preferences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Email Notifications</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Receive email alerts whenever an organization verifies your credentials.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefToggles.emailNotif}
                onChange={(e) => setPrefToggles({ ...prefToggles, emailNotif: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Security Alerts</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Immediate push notifications for logins from unknown IP addresses or devices.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefToggles.securityAlerts}
                onChange={(e) => setPrefToggles({ ...prefToggles, securityAlerts: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Verification Updates</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Weekly summary digest of QR scans, recruiter hits, and vault integrity stats.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefToggles.verificationUpdates}
                onChange={(e) => setPrefToggles({ ...prefToggles, verificationUpdates: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="gradient" onClick={handleSavePreferences} icon={Save}>
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: BILLING */}
      {activeTab === 'billing' && (
        <div className="vg-card" style={{ padding: '2rem', maxWidth: '850px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Current Subscription
              </span>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Academic & Enterprise Free Tier
              </h4>
            </div>
            <span className="vg-badge badge-verified">Active</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Complimentary access provided for <strong>Apex Institute of Science & Technology</strong> students and verified partner recruiters. Includes unlimited cryptographic QR verifications.
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            borderRadius: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>College Capstone License</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Expires Dec 2026</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => addToast('License is perpetual for educational demo.', 'info')}>
              Manage License
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

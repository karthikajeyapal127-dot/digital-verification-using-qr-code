import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  CreditCard,
  History,
  ShieldCheck,
  HelpCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  QrCode,
  Bell,
  Settings,
  Code2,
  Award,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const roleUpper = (user?.role || '').toUpperCase();
  const isVerifier = roleUpper === 'VERIFIER';
  const isAdm = roleUpper === 'ADMIN' || roleUpper === 'ORGANIZATION_ADMIN';

  const navItems = isVerifier
    ? [
        { to: '/dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
        { to: '/scanner', label: t('scanQr') || 'Scan QR', icon: ScanLine },
        { to: '/generate-qr', label: t('generateQr') || 'Generate QR Code', icon: QrCode },
        { to: '/history', label: t('verificationHistory') || 'Verification History', icon: History },
        { to: '/api-access', label: t('apiAccess') || 'Developer API', icon: Code2 },
        { to: '/notifications', label: t('notifications') || 'Notifications', icon: Bell, badge: '2' },
        { to: '/profile', label: t('profile') || 'Profile', icon: User },
        { to: '/settings', label: t('settings') || 'Settings', icon: Settings },
        { to: '/support', label: t('support') || 'Support & Help', icon: HelpCircle }
      ]
    : [
        { to: '/dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
        { to: '/scanner', label: t('scanQr') || 'Scan QR', icon: ScanLine },
        { to: '/certificate-studio', label: 'Degree Studio', icon: Award },
        { to: '/ledger', label: 'Crypto Ledger', icon: Cpu },
        { to: '/generate-qr', label: t('generateQr') || 'Generate QR Code', icon: QrCode },
        { to: '/digital-id', label: t('myDigitalId') || 'My Credentials', icon: CreditCard },
        { to: '/history', label: t('verificationHistory') || 'Verification History', icon: History },
        { to: '/notifications', label: t('notifications') || 'Notifications', icon: Bell },
        { to: '/profile', label: t('profile') || 'My Profile', icon: User },
        { to: '/settings', label: t('settings') || 'Settings', icon: Settings },
        { to: '/support', label: t('support') || 'Support & Help', icon: HelpCircle }
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 45
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 46,
          flexShrink: 0
        }}
        className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Header / Logo */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.625rem',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: 'var(--shadow-primary)'
            }}>
              <Shield size={20} strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div style={{ lineHeight: 1.2 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  QR <span style={{ color: 'var(--primary)' }}>Verification</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'verifier' ? 'Authorized Verifier' : 'Student / Scholar'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-secondary btn-icon-only"
              style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-item-link ${isActive ? 'active-nav-item' : ''}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 0.875rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Real-World Role Badge */}
          <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '0.625rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1e40af',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
              title={`Credential Holder (${user?.holderType || 'STUDENT'})`}
            >
              <ShieldCheck size={16} color="#2563eb" />
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.68rem', color: '#6b7280' }}>
                    Active Persona
                  </div>
                  <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    Holder ({user?.holderType || 'STUDENT'})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / User Profile & Logout */}
        <div style={{
          padding: '0.875rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#fafbfc'
        }}>
          {collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setCollapsed(false)}
                className="btn btn-secondary btn-icon-only"
                style={{ width: '32px', height: '32px', padding: 0 }}
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
              <NavLink to="/profile" title="Profile">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
                  alt={user?.name || 'User'}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-icon-only"
                style={{ width: '32px', height: '32px', padding: 0 }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div>
              <NavLink
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  marginBottom: '0.5rem'
                }}
                className="user-profile-bar"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
                  alt={user?.name || 'User'}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: 'var(--shadow-xs)' }}
                />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name || 'Authorized User'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.organization || 'College of Engineering & Technology'}
                  </p>
                </div>
              </NavLink>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <NavLink to="/profile" style={{ flex: 1 }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.75rem' }}>
                    <User size={13} />
                    Profile
                  </button>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger-subtle btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  title="Sign out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .active-nav-item {
          background-color: var(--primary-subtle) !important;
          color: var(--primary) !important;
          font-weight: 700 !important;
        }
        .nav-item-link:hover:not(.active-nav-item) {
          background-color: var(--bg-subtle) !important;
          color: var(--text-main) !important;
        }
        .user-profile-bar:hover {
          background-color: #f1f5f9;
        }
        @media (max-width: 1024px) {
          .sidebar-container {
            position: fixed !important;
            left: -280px;
            top: 0;
            bottom: 0;
            z-index: 50;
            box-shadow: var(--shadow-elevated);
          }
          .sidebar-container.mobile-open {
            left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

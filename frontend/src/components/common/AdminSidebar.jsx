import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  ArrowLeftCircle,
  Key,
  Award,
  Cpu,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const adminNav = [
    { to: '/admin', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/scanner', label: t('scanQr') || 'Scan QR Code', icon: Activity },
    { to: '/admin/certificate-studio', label: 'Degree Studio', icon: Award },
    { to: '/admin/ledger', label: 'Crypto Ledger', icon: Cpu },
    { to: '/generate-qr', label: t('generateQr') || 'Generate QR Code', icon: Key },
    { to: '/admin/users', label: t('users') || 'Users', icon: Users },
    { to: '/admin/create-digital-id', label: t('createDigitalId') || 'Create Digital ID', icon: Key },
    { to: '/admin/documents', label: t('digitalIds') || 'Digital IDs', icon: FileText },
    { to: '/admin/verification', label: t('verificationHistory') || 'Verification History', icon: Activity },
    { to: '/admin/notifications', label: t('notifications') || 'Notifications', icon: ShieldAlert },
    { to: '/admin/analytics', label: t('analytics') || 'Analytics', icon: BarChart3 },
    { to: '/admin/security', label: t('securityAudit') || 'Security & Audit', icon: Shield },
    { to: '/admin/reports', label: 'Reports & Audits', icon: FileSpreadsheet },
    { to: '/admin/settings', label: t('settings') || 'Settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
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
        />
      )}

      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 46,
          flexShrink: 0
        }}
        className={`admin-sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Shield size={20} strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div style={{ lineHeight: 1.2 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  QR <span style={{ color: '#38bdf8' }}>Verification</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Admin Console
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-icon-only"
              style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', background: '#1e293b', color: '#94a3b8' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active-admin-nav' : ''}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 0.875rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '0.625rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #1e293b' }}>
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
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
              title="Organization Administrator"
            >
              <ShieldCheck size={16} color="#38bdf8" />
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.68rem', color: '#94a3b8' }}>
                    Authority Role
                  </div>
                  <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#f8fafc' }}>
                    Organization Admin
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin User Footer */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid #1e293b', backgroundColor: '#090f1d' }}>
          {collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setCollapsed(false)}
                className="btn btn-icon-only"
                style={{ width: '32px', height: '32px', padding: 0, background: '#1e293b', color: '#94a3b8' }}
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-icon-only"
                style={{ width: '32px', height: '32px', padding: 0, background: '#1e293b', color: '#ef4444' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=7c3aed&color=fff`}
                  alt={user?.name || 'Administrator'}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name || 'System Administrator'}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#38bdf8' }}>{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-icon-only"
                style={{ width: '30px', height: '30px', padding: 0, background: '#1e293b', color: '#ef4444' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .active-admin-nav {
          background-color: #2563eb !important;
          color: #ffffff !important;
          font-weight: 700 !important;
        }
        .admin-nav-item:hover:not(.active-admin-nav) {
          background-color: #1e293b !important;
          color: #ffffff !important;
        }
        @media (max-width: 1024px) {
          .admin-sidebar-container {
            position: fixed !important;
            left: -280px;
            top: 0;
            bottom: 0;
            z-index: 50;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .admin-sidebar-container.mobile-open {
            left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

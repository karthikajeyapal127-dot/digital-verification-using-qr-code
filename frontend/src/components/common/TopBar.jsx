import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Shield, User, LogOut, CheckCircle2, AlertTriangle, ExternalLink, Globe, Sparkles, Clock, ArrowRight } from 'lucide-react';
import ThemeLanguageControls from './ThemeLanguageControls';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationApi, recentApi } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function TopBar({ onToggleMobile, title = 'System Overview', isAdminMode = false }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, isAdmin, isVerifier, isStudent, isEmployee, isStaff, logout, switchRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const recentRef = useRef(null);

  // Fetch real notifications and recently accessed
  useEffect(() => {
    async function loadData() {
      try {
        const [notifRes, recRes] = await Promise.all([
          notificationApi.get(user?.id),
          recentApi.get(user?.id)
        ]);
        if (notifRes && notifRes.success && Array.isArray(notifRes.data)) {
          setNotifications(notifRes.data);
          setUnreadCount(notifRes.unreadCount || notifRes.data.filter((n) => !n.isRead).length);
        }
        if (recRes && recRes.success && Array.isArray(recRes.data)) {
          setRecentItems(recRes.data);
        } else {
          setRecentItems([]);
        }
      } catch (e) {
        console.warn('TopBar data fetch notice:', e);
      }
    }
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (recentRef.current && !recentRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Mark all read error:', e);
    }
  };

  const roleLabel = isAdmin ? 'Admin Console' : isVerifier ? 'Verifier Station' : isEmployee ? 'Employee Portal' : 'Student Portal';

  return (
    <header style={{
      height: '70px',
      backgroundColor: isAdminMode ? '#0f172a' : '#ffffff',
      borderBottom: `1px solid ${isAdminMode ? '#1e293b' : 'var(--border-color)'}`,
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 35
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobile}
          className="btn btn-secondary btn-icon-only mobile-toggle-btn"
          style={{ display: 'none', padding: '0.45rem' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: isAdminMode ? '#ffffff' : 'var(--text-main)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            {title}
          </h2>
          <span style={{ fontSize: '0.72rem', color: isAdminMode ? '#94a3b8' : 'var(--text-muted)' }}>
            DIGITAL VERIFICATION USING QR CODE · {roleLabel}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Multilingual & Theme Controls */}
        <ThemeLanguageControls />

        {/* Role Pill Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => {
              const r = (user?.role || '').toUpperCase();
              if (r === 'ADMIN' || r === 'ORGANIZATION_ADMIN') navigate('/admin');
              else if (r === 'VERIFIER') navigate('/verify');
              else navigate('/dashboard');
            }}
            className="btn btn-subtle btn-sm"
            style={{
              borderRadius: '9999px',
              fontSize: '0.72rem',
              padding: '0.3rem 0.65rem'
            }}
          >
            <Shield size={12} color="#0284c7" />
            <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>
              {user?.role || 'User'}
            </span>
          </button>
        </div>

        {/* Recently Accessed Dropdown (Mandatory Feature) */}
        <div style={{ position: 'relative' }} ref={recentRef}>
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="btn btn-secondary btn-icon-only"
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              padding: 0,
              backgroundColor: isAdminMode ? '#1e293b' : '#ffffff',
              borderColor: isAdminMode ? '#334155' : 'var(--border-color)',
              color: isAdminMode ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Recently Accessed Credentials"
            aria-label="Recently Accessed"
          >
            <Clock size={17} color={isAdminMode ? '#38bdf8' : 'var(--primary)'} />
          </button>

          {showRecent && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={15} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Recently Accessed
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {recentItems.length} records
                </span>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {recentItems.map((rec) => (
                  <Link
                    key={rec.id || rec.itemId}
                    to={rec.path || `/verify/${rec.itemId}`}
                    onClick={() => setShowRecent(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'block' }}>
                        {rec.title}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {rec.subtitle || rec.itemId}
                      </span>
                    </div>
                    <ArrowRight size={14} color="var(--primary)" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-icon-only"
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              padding: 0,
              backgroundColor: isAdminMode ? '#1e293b' : '#ffffff',
              borderColor: isAdminMode ? '#334155' : 'var(--border-color)',
              color: isAdminMode ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Notifications ({unreadCount} new)
                </span>
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.72rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Mark all read
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        gap: '0.65rem',
                        backgroundColor: n.isRead ? '#ffffff' : '#f0f9ff'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {n.type === 'verification' ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : n.type === 'security' || n.type === 'revocation' ? (
                          <AlertTriangle size={16} color="#ef4444" />
                        ) : (
                          <Shield size={16} color="#0284c7" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                          {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/notifications"
                onClick={() => setShowNotifications(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: '#f8fafc',
                  textDecoration: 'none',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                View Notification Center →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.75rem'
            }}
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
              alt={user?.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #0284c7'
              }}
            />
            <div style={{ textAlign: 'left', display: 'none' }} className="user-profile-text">
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isAdminMode ? '#ffffff' : 'var(--text-main)', display: 'block' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: isAdminMode ? '#94a3b8' : 'var(--text-muted)' }}>
                {user?.department}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '240px',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              zIndex: 50,
              padding: '0.5rem',
              animation: 'menuDrop 0.15s ease-out'
            }}>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  {user?.email}
                </p>
              </div>

              <div style={{ padding: '0.35rem 0' }}>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    borderRadius: '0.5rem'
                  }}
                >
                  <User size={15} />
                  <span>View Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    borderRadius: '0.5rem'
                  }}
                >
                  <Globe size={15} />
                  <span>Language & Theme</span>
                </Link>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.35rem' }}>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, QrCode, Menu, X, ArrowRight, Bell, User, LogOut, Sun, Moon, Globe, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, isVerifier, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Section 5 Navigation: Home, Public Scanner, Admin Portal, Student Portal, Generate QR, How It Works
  const navLinks = [
    { name: t('home') || 'Home', path: '/' },
    { name: `📷 ${t('publicVerification') || 'Public Scanner'}`, path: '/scanner' },
    { name: '📜 Degree Studio', path: '/certificate-studio' },
    { name: '⛓️ Crypto Ledger', path: '/ledger' },
    { name: `🏢 ${t('adminPortal') || 'Admin Portal'}`, path: '/login?portal=admin' },
    { name: `🎓 ${t('studentPortal') || 'Student Portal'}`, path: '/login?portal=student' },
    { name: `✨ ${t('generateQr') || 'Generate QR'}`, path: '/generate-qr' }
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate(path);
      } else {
        const id = path.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand Logo & Title: Digital Verification Using QR Code */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '0.85rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}>
            <QrCode size={24} strokeWidth={2.4} />
          </div>
          <div>
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              display: 'block',
              lineHeight: 1.15
            }}>
              Digital Verification
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)'
            }}>
              Using QR Code
            </span>
          </div>
        </Link>

        {/* Desktop Navigation: Home, How It Works, Features, About, Verify */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: (location.pathname === link.path && !link.path.includes('#')) ? 700 : 500,
                color: (location.pathname === link.path && !link.path.includes('#')) ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'color 0.2s',
                padding: '0.25rem 0'
              }}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Right Controls: Language Selector, Theme Toggle, Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Selector Dropdown (English | தமிழ் | हिन्दी) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '0.65rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Select Language"
            >
              <Globe size={15} color="#2563eb" />
              <span>
                {language === 'ta' ? '🌐 தமிழ்' : language === 'hi' ? '🌐 हिन्दी' : '🌐 English'}
              </span>
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-card)',
                zIndex: 100,
                minWidth: '150px',
                padding: '0.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <button
                  onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: language === 'en' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: language === 'en' ? '#2563eb' : 'var(--text-main)',
                    fontWeight: language === 'en' ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>English</span>
                </button>
                <button
                  onClick={() => { setLanguage('ta'); setLangMenuOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: language === 'ta' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: language === 'ta' ? '#2563eb' : 'var(--text-main)',
                    fontWeight: language === 'ta' ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>தமிழ் (Tamil)</span>
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setLangMenuOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: language === 'hi' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: language === 'hi' ? '#2563eb' : 'var(--text-main)',
                    fontWeight: language === 'hi' ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>हिन्दी (Hindi)</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.45rem',
              borderRadius: '0.65rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#4f46e5" />}
          </button>

          {/* Authentication State Buttons */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.65rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)'
                }}
              >
                {t('dashboard') || 'Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '0.65rem',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>{t('logout') || 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm">
                  {t('login') || 'Login'}
                </Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="gradient" size="sm" iconRight={ArrowRight}>
                  {t('register') || 'Register'}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: '0.4rem'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '0.4rem 0'
              }}
            >
              {link.name}
            </button>
          ))}

          {!isLoggedIn ? (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/login" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" style={{ width: '100%' }}>
                  {t('login') || 'Login'}
                </Button>
              </Link>
              <Link to="/register" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gradient" style={{ width: '100%' }}>
                  {t('register') || 'Register'}
                </Button>
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('logout') || 'Logout'}
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

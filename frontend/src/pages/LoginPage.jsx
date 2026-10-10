import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import GoogleOAuthModal from '../components/common/GoogleOAuthModal';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, setAuthSession } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Automatic OAuth Token Processing (when redirected from real Google OAuth backend callback)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      addToast(`Google Authentication: ${oauthError}`, 'error');
    }

    if (urlToken) {
      localStorage.setItem('veriglass_token', urlToken);
      localStorage.setItem('veriglass_logged_in', 'true');
      
      const roleParam = (searchParams.get('role') || '').toUpperCase();
      const targetPath = (roleParam === 'ORGANIZATION_ADMIN' || roleParam === 'ADMIN') 
        ? '/admin' 
        : (roleParam === 'VERIFIER' ? '/verifier' : '/dashboard');

      authApi.getMe().then((res) => {
        if (res && res.user) {
          if (setAuthSession) {
            setAuthSession(urlToken, res.user);
          }
          addToast(`Authentication successful! Welcome, ${res.user.name}`, 'success');
          const userRole = (res.user.role || roleParam || '').toUpperCase();
          if (userRole === 'ORGANIZATION_ADMIN' || userRole === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else if (userRole === 'VERIFIER') {
            navigate('/verifier', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate(targetPath, { replace: true });
        }
      }).catch((err) => {
        console.warn('OAuth token resolution failed:', err);
        navigate(targetPath, { replace: true });
      });
    }
  }, [searchParams]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      setLoading(false);
      if (res && res.user) {
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        const userRole = (res.user.role || '').toUpperCase();
        if (userRole === 'ADMIN' || userRole === 'ORGANIZATION_ADMIN') {
          navigate('/admin');
        } else if (userRole === 'VERIFIER') {
          navigate('/verifier');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Invalid email or password.', 'error');
    }
  };

  const handleGoogleClick = () => {
    const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const backendBase = rawUrl.replace(/\/api$/, '');
    window.location.href = `${backendBase}/api/auth/google`;
  };

  const handleDemoLogin = async (demoEmail, demoPassword, targetRole) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPassword);
      setLoading(false);
      addToast(`Authenticated as ${res.user.name} (${res.user.role})`, 'success');
      if (targetRole === 'ADMIN') {
        navigate('/admin');
      } else if (targetRole === 'VERIFIER') {
        navigate('/verifier');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Login failed', 'error');
    }
  };

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
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        padding: '2.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            marginBottom: '1rem'
          }}>
            <Shield size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            {t('signIn') || 'Sign In'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
            {t('appTitle') || 'Digital Verification Using QR Code'}
          </p>
        </div>

        {/* ⚡ 1-Click Instant Demo Role Access Hub */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1.5px dashed var(--border-color)',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.65rem'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
              ⚡ 1-Click Instant Demo Login (Real Accounts)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
              ● Live MongoDB
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@veriglass.io', 'AdminPass2026!', 'ADMIN')}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.65rem',
                border: '1px solid #93c5fd',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
            >
              <span>🏢 <strong>Admin Portal</strong></span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>admin@veriglass.io</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('karthikajeyapal127@gmail.com', 'StudentPass2026!', 'STUDENT')}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.65rem',
                border: '1px solid #86efac',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                color: '#15803d',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.08)'}
            >
              <span>🎓 <strong>Student Portal</strong></span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>karthikajeyapal127@gmail.com</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('rahul.verma@apex.edu', 'EmployeePass2026!', 'EMPLOYEE')}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.65rem',
                border: '1px solid #cbd5e1',
                backgroundColor: 'rgba(100, 116, 139, 0.08)',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.08)'}
            >
              <span>💼 <strong>Employee Pass</strong></span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>rahul.verma@apex.edu</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('alex.chen@apex.edu', 'VeriGlass2026!', 'STUDENT')}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.65rem',
                border: '1px solid #fde047',
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                color: '#a16207',
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.08)'}
            >
              <span>🎓 <strong>Scholar Pass</strong></span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>alex.chen@apex.edu</span>
            </button>
          </div>
        </div>

        {/* Real Form per Section 5 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email Address */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              {t('email') || 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder={t('emailPlaceholder') || 'name@example.com'}
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: '0.75rem',
                  border: errors.email ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.35rem', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, color: 'var(--text-main)' }}>
                {t('password') || 'Password'}
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                {t('forgotPassword') || 'Forgot Password?'}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder={t('passwordPlaceholder') || 'Enter your password'}
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                  borderRadius: '0.75rem',
                  border: errors.password ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={showPassword ? (t('hidePassword') || 'Hide Password') : (t('showPassword') || 'Show Password')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.35rem', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              {t('rememberMe') || 'Remember Me'}
            </label>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            style={{ width: '100%', marginTop: '0.25rem' }}
            loading={loading}
            iconRight={ArrowRight}
          >
            {loading ? (t('signingIn') || 'Signing in...') : (t('login') || 'Login')}
          </Button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            <span style={{ padding: '0 0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {t('orDivider') || 'OR'}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>

          {/* Continue with Google */}
          <GoogleAuthButton role="CREDENTIAL_HOLDER" />
        </form>

        {/* Link to Register */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginTop: '1.75rem',
          marginBottom: 0
        }}>
          {t('dontHaveAccount') || "Don't have an account?"}{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            {t('signUp') || 'Create Account'}
          </Link>
        </p>
      </div>

      {/* Google OAuth Modal for Configuration & Connection Info */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </div>
  );
}

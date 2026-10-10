import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, KeyRound, Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';

import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setLoading(false);
      if (res && res.success) {
        addToast(res.message || `Password reset instructions dispatched to ${email}`, 'success');
        setStep(2);
      } else {
        addToast(res?.message || 'Email not found in registered database.', 'error');
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Failed to process password reset request.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.resetPassword(email, newPassword);
      setLoading(false);
      if (res && res.success) {
        setStep(3);
        addToast('Password successfully updated in MongoDB! You can now log in.', 'success');
      } else {
        addToast(res?.message || 'Password reset failed.', 'error');
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Failed to reset password.', 'error');
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
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        borderRadius: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        padding: '2.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '1rem',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Reset Your Password
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Follow the 3-step cryptographic identity verification flow.
          </p>
        </div>

        {/* 3-Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '30px',
            right: '30px',
            height: '2px',
            backgroundColor: '#e2e8f0',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              backgroundColor: 'var(--primary)',
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {[
            { num: 1, label: 'Email' },
            { num: 2, label: 'New Password' },
            { num: 3, label: 'Success' }
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#10b981' : (isCurrent ? 'var(--primary)' : '#ffffff'),
                  color: isDone || isCurrent ? '#ffffff' : '#64748b',
                  border: `2px solid ${isDone ? '#10b981' : (isCurrent ? 'var(--primary)' : '#cbd5e1')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  transition: 'all 0.2s'
                }}>
                  {isDone ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  marginTop: '0.35rem'
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendResetEmail}>
            <Input
              label="Registered Account Email"
              type="email"
              placeholder="e.g. karthika@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={errors.email}
              helperText="We will verify your email against MongoDB records."
              required
            />
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              loading={loading}
              iconRight={ArrowRight}
            >
              Verify Email & Continue
            </Button>
          </form>
        )}

        {/* STEP 2: Create New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              fontSize: '0.8rem',
              color: '#1e40af',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              Account verified for <strong>{email}</strong>. Enter your new password below.
            </div>

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              error={errors.newPassword}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              error={errors.confirmPassword}
              required
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                icon={ArrowLeft}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="gradient"
                style={{ flex: 1 }}
                loading={loading}
              >
                Update Password in MongoDB
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Password Reset Complete
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Your account password has been updated and cryptographically verified.
            </p>
            <Link to="/login">
              <Button variant="primary" size="lg" style={{ width: '100%' }}>
                Proceed to Login
              </Button>
            </Link>
          </div>
        )}

        {/* Back to Login link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.825rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

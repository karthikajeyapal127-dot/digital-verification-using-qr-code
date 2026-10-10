import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  Plus,
  History,
  Activity,
  User,
  CreditCard,
  XCircle,
  ExternalLink,
  Users,
  Key,
  Camera,
  Search,
  FileText,
  Sparkles,
  RotateCcw,
  Check,
  Bell
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { useVerification } from '../context/VerificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { recentApi, notificationApi } from '../services/api';
import { isDocMatchUser, getDigitalIdString, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { activities, documents, stats } = useVerification();
  const { user, isAdmin, isVerifier } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [recentlyAccessed, setRecentlyAccessed] = useState([]);
  const [quickSearchId, setQuickSearchId] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const targetUserId = user?.id || user?._id;
    if (targetUserId) {
      recentApi.get(targetUserId).then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setRecentlyAccessed(res.data);
        } else {
          setRecentlyAccessed([]);
        }
      }).catch(() => {
        setRecentlyAccessed([]);
      });

      notificationApi.get(targetUserId).then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          const unread = res.data.filter((n) => !n.isRead && !n.read).length;
          setUnreadNotifications(unread);
        }
      }).catch(() => {});
    } else {
      setRecentlyAccessed([]);
      setUnreadNotifications(0);
    }
  }, [user]);

  // Find user's actual digital ID from real database documents
  const userDocs = documents.filter((d) => isDocMatchUser(d, user));
  const activeDoc = userDocs[0] || (isAdmin ? documents[0] : null);

  // Activities related to this user or performed by this verifier
  const relevantActivities = isVerifier
    ? activities.filter((a) => a.userId === user?.id || (a.verifier && user?.name && a.verifier.includes(user.name.split(' ')[0])))
    : isAdmin
      ? activities
      : activities.filter((a) => {
          if (activeDoc) {
            const activeId = getDigitalIdString(activeDoc).toLowerCase();
            const actId = (getDigitalIdString(a.digitalId) || getDigitalIdString(a.uniqueId) || getDigitalIdString(a.documentId) || '').toLowerCase();
            if (activeId && actId && (activeId === actId || actId.includes(activeId))) return true;
          }
          if (user?.name && a.verifiedPerson && typeof a.verifiedPerson === 'string' && a.verifiedPerson.toLowerCase().includes(user.name.toLowerCase())) return true;
          return a.userId === user?.id;
        });

  const lastVerification = relevantActivities[0] || (isAdmin ? activities[0] : null);

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (quickSearchId.trim()) {
      navigate(`/verify?id=${encodeURIComponent(quickSearchId.trim())}`);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: isAdmin ? '#ede9fe' : isVerifier ? '#e0f2fe' : '#ecfdf5',
              color: isAdmin ? '#7c3aed' : isVerifier ? '#0284c7' : '#059669',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              border: `1px solid ${isAdmin ? '#ddd6fe' : isVerifier ? '#bae6fd' : '#a7f3d0'}`
            }}>
              {user?.role?.toUpperCase() || 'USER'} DASHBOARD
            </span>

            {/* User Type Badge (Student, Employee, Staff, Member, Participant) */}
            {(user?.userType || user?.holderType) && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(37, 99, 235, 0.2)'
              }}>
                {user?.userType || user?.holderType}
              </span>
            )}

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {user?.department ? `${user.department} · ` : ''}{user?.organization || 'Apex Institute of Science & Technology'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
            {t('welcomeBack') || 'Welcome back'}, {user?.name || 'User'}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {isAdmin
              ? `Welcome, Administrator ${user?.name}. Global institution identity status and verification ledger.`
              : isVerifier
                ? `Welcome, Officer ${user?.name}. Accreditation & Optical Verification Command Center.`
                : `${t('heroDescription') || 'Monitor your official credentials, secure QR codes, and live verification events.'}`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Notification Bell Icon */}
          <Link to="/notifications" style={{ textDecoration: 'none' }} title={t('notifications') || 'Notifications'}>
            <button style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)'
                }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </Link>

          {/* View Profile Button */}
          <Link to="/profile">
            <Button variant="secondary" icon={User}>
              {t('profile') || 'Profile'}
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin">
              <Button variant="secondary" icon={Shield}>
                {t('adminPortal') || 'Admin Portal'}
              </Button>
            </Link>
          )}

          <Link to="/scanner">
            <Button variant="gradient" icon={ScanLine}>
              {t('scanQr') || 'Scan QR'}
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK ACTION BUTTONS: SCAN QR, GENERATE QR, ID, HISTORY, PROFILE */}
      {/* ============================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Action 1: Scan QR Code */}
        <Link to="/scanner" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            border: '1.5px solid rgba(37, 99, 235, 0.3)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(124, 58, 237, 0.06) 100%)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0.85rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              flexShrink: 0
            }}>
              <ScanLine size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 800 }}>
                📷 {t('scanQrCode') || 'Scan QR Code'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('instantVerification') || 'Instant live optical scan'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action 2: Generate QR Code */}
        <Link to="/generate-qr" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.06) 100%)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0.85rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 800 }}>
                ✨ {t('generateQrCode') || 'Generate QR Code'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('highSecurityQrDisplay') || 'Create dynamic QR badge'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action 3: View Credentials */}
        <Link to="/digital-id" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CreditCard size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                {t('myDigitalId') || 'My Credentials'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('assignedInstitutionalId') || 'Assigned institutional ID'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action 4: Verification History */}
        <Link to="/history" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <History size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                {t('verificationHistory') || 'Verification History'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('realTimeAuditRecords') || 'Real-time audit records'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action 5: Profile */}
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                {t('profile') || 'Profile'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('manageDemographics') || 'Manage demographics'}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 1. ROLE-SPECIFIC BANNER / COMMAND STATION                     */}
      {/* ============================================================== */}

      {/* CASE A: VERIFIER ROLE COMMAND STATION */}
      {isVerifier && (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ maxWidth: '520px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <Camera size={14} />
              <span>OFFICER VERIFICATION STATION ACTIVE</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Optical QR Camera Scanner & ID Inspector
            </h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
              Scan physical or mobile QR credentials using the camera sweep engine with Web Audio acoustic feedback, or inspect tokens manually.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/verify">
              <button style={{
                backgroundColor: '#ffffff',
                color: '#0369a1',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <ScanLine size={18} />
                <span>Launch Camera Scanner</span>
              </button>
            </Link>

            <form onSubmit={handleQuickVerify} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={quickSearchId}
                onChange={(e) => setQuickSearchId(e.target.value)}
                placeholder="Enter DID-2026-..."
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  width: '180px'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Inspect
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CASE B: ADMIN ROLE EXECUTIVE OVERVIEW */}
      {isAdmin && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <ShieldCheck size={14} color="#a5b4fc" />
              <span>ADMINISTRATIVE ROOT AUTHORITY</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Executive Institutional Management Console
            </h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
              Full jurisdiction over digital identity issuance, user authorities, PKI asymmetric keys, and anomaly flags.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/documents">
              <button style={{
                backgroundColor: '#ffffff',
                color: '#312e81',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <FileText size={16} />
                <span>Issue & Manage IDs</span>
              </button>
            </Link>
            <Link to="/admin/users">
              <button style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Users size={16} />
                <span>User Directory</span>
              </button>
            </Link>
            <Link to="/api-access">
              <button style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Key size={16} />
                <span>Developer API</span>
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. RECENTLY ACCESSED CREDENTIALS & AUDIT RECORDS (MANDATORY)  */}
      {/* ============================================================== */}
      <div className="vg-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {language === 'ta' ? 'சமீபத்தில் அணுகப்பட்டவை' : language === 'hi' ? 'हाल ही में एक्सेस किए गए क्रेडेंशियल' : 'Recently Accessed Credentials'}
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Quick 1-click inspection for ongoing audits and verifications
          </span>
        </div>

        {recentlyAccessed.length === 0 ? (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '0.85rem',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            No data available yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {recentlyAccessed.map((item) => (
              <div
                key={item.id || item.itemId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.15rem',
                  borderRadius: '0.85rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.65rem',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CreditCard size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {item.subtitle || item.itemId}
                    </span>
                  </div>
                </div>

                <Link to={item.path || `/verify/${item.itemId}`}>
                  <button
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexShrink: 0
                    }}
                  >
                    <span>Verify</span>
                    <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2.5 MAIN CREDENTIAL DISPLAY (Section 10 Specification)        */}
      {/* ============================================================== */}
      {!isAdmin && !isVerifier && (
        <div style={{ marginBottom: '2rem' }}>
          {activeDoc ? (
            <div className="vg-card" style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '0.85rem',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Primary Digital Credential
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                      {activeDoc.credentialTitle || activeDoc.name || 'Official Digital Identity Card'}
                    </h3>
                  </div>
                </div>

                <StatusBadge status={activeDoc.status || 'ACTIVE'} />
              </div>

              {/* Credential Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '0.85rem',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    HOLDER NAME
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {activeDoc.holderName || user?.name}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    USER TYPE / DESIGNATION
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {activeDoc.metadata?.holderType || activeDoc.holderType || user?.userType || 'Student'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    CREDENTIAL / DVID
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {activeDoc.credentialNumber || activeDoc.uniqueId || activeDoc.id}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    ISSUE DATE
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {formatDate(activeDoc.issueDate)}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    EXPIRY DATE
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {formatDate(activeDoc.expiryDate || activeDoc.validUntil)}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/qr-code">
                  <Button variant="gradient" icon={QrCode}>
                    View Secure QR Code
                  </Button>
                </Link>
                <Link to="/digital-id">
                  <Button variant="secondary" icon={CreditCard}>
                    View Full Credential
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '2.5rem 1.75rem',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px dashed var(--border-color)',
              borderRadius: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CreditCard size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                No data available yet.
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
                No credentials have been issued to your account yet. Please contact your organization administrator to create and issue your verified digital identity.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Link to="/profile">
                  <Button variant="secondary" size="sm" icon={User}>
                    Check Profile Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FOUR SUMMARY METRICS CARDS (Section 10 Specification)       */}
      {/* ============================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Total Assigned Credentials */}
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Active Digital IDs' : isVerifier ? 'Verified Today' : 'Total Assigned Credentials'}
            </span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#10b981' }}>
            {isAdmin 
              ? documents.filter(d => (d.status || '').toUpperCase() === 'ACTIVE').length 
              : isVerifier 
                ? activities.length 
                : userDocs.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: 0 }}>
            {isAdmin 
              ? 'Enrolled in root trust ledger' 
              : isVerifier 
                ? 'Passed cryptographic checks' 
                : `${userDocs.length} credential(s) in your profile`}
          </p>
        </div>

        {/* Card 2: Active Credentials */}
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Total Users' : isVerifier ? 'Total Inspect Events' : 'Active Credentials'}
            </span>
            <CreditCard size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2563eb' }}>
            {isAdmin 
              ? `${stats?.totalUsers ?? documents.length} Profiles` 
              : isVerifier 
                ? `${activities.length} Queries` 
                : userDocs.filter(d => (d.status || '').toUpperCase() === 'ACTIVE').length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: 0 }}>
            {isAdmin 
              ? 'Admins, Verifiers & Users' 
              : isVerifier 
                ? 'Camera scans & manual' 
                : 'Currently valid & verified'}
          </p>
        </div>

        {/* Card 3: Expired / Inactive Credentials */}
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Flagged Anomalies' : isVerifier ? 'Risk Interceptions' : 'Expired / Inactive'}
            </span>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f59e0b' }}>
            {isAdmin 
              ? `${documents.filter(d => (d.status || '').toUpperCase() === 'REVOKED').length} Revoked` 
              : isVerifier 
                ? `${activities.filter(a => (a.result || a.outcome) !== 'VALID').length} Flagged` 
                : userDocs.filter(d => ['EXPIRED', 'REVOKED', 'INACTIVE'].includes((d.status || '').toUpperCase())).length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: 0 }}>
            {isAdmin 
              ? 'Revocation ledger active' 
              : isVerifier 
                ? 'Tamper alarm operational' 
                : 'Out of validity horizon'}
          </p>
        </div>

        {/* Card 4: Total Verifications */}
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Global Verifications' : isVerifier ? 'Last Verification' : 'Total Verifications'}
            </span>
            <Activity size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#8b5cf6' }}>
            {isAdmin ? activities.length : relevantActivities.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: 0 }}>
            {lastVerification ? `Latest: ${lastVerification.date} (${lastVerification.result || 'VALID'})` : 'No verification events'}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. VERIFICATION ACTIVITY & AUDIT TABLE                        */}
      {/* ============================================================== */}
      <div className="vg-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isVerifier
                ? 'Your Verification Inspection Audit'
                : isAdmin
                  ? 'Central Root Trust Audit Feed'
                  : t('verificationHistory')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Real-time SHA-256 cryptographic audit logs recorded in the central database
            </p>
          </div>

          <Link to="/history" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              View All History
            </Button>
          </Link>
        </div>

        {relevantActivities.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '1rem',
            border: '1px dashed var(--border-color)'
          }}>
            <ScanLine size={40} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No data available yet.
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
              No verification attempts have been logged for this profile yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Verification ID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Credential / DVID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Verified By</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Date & Time</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Method</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {relevantActivities.slice(0, 5).map((a) => (
                  <tr key={a.id || a.verificationId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {a.verificationId || a.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>
                      <span style={{ display: 'block', color: 'var(--text-main)' }}>{typeof a.document === 'object' ? getDigitalIdString(a.document) : (a.document || a.documentName || getDigitalIdString(a.digitalId))}</span>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getDigitalIdString(a.digitalId) || a.uniqueId}</code>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {a.verifiedBy || a.verifier || a.verifierName || 'Authorized Officer'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {a.date} {a.time}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-main)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.35rem',
                        border: '1px solid var(--border-color)'
                      }}>
                        {a.method || 'QR SCAN'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: (a.result === 'VALID' || a.outcome === 'VALID') ? '#ecfdf5' : '#fef2f2',
                        color: (a.result === 'VALID' || a.outcome === 'VALID') ? '#065f46' : '#991b1b'
                      }}>
                        {a.result || a.outcome || 'VALID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Search,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileX,
  ArrowRight,
  ExternalLink,
  QrCode
} from 'lucide-react';
import Button from '../components/common/Button';
import QRScanner from '../components/verification/QRScanner';
import { useVerification } from '../context/VerificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate, getDigitalIdString } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export default function VerifierDashboardPage() {
  const { activities, verifyDocument, loading } = useVerification();
  const { t, language } = useLanguage();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manual'
  const [manualId, setManualId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      addToast(language === 'ta' ? 'அடையாள எண் உள்ளிடவும்' : language === 'hi' ? 'सत्यापन आईडी दर्ज करें' : 'Please enter a Verification ID', 'warning');
      return;
    }

    setManualLoading(true);
    try {
      const res = await verifyDocument(manualId.trim(), 'MANUAL_ID');
      setVerificationResult(res);
      setManualLoading(false);
    } catch (err) {
      setManualLoading(false);
      addToast('Verification error: ' + err.message, 'error');
    }
  };

  const getResultBadge = (result) => {
    const res = (result || '').toUpperCase();
    if (res === 'VALID') {
      return <span className="status-badge status-active">✓ VALID</span>;
    }
    if (res === 'EXPIRED') {
      return <span className="status-badge status-expired">⚠ EXPIRED</span>;
    }
    if (res === 'REVOKED') {
      return <span className="status-badge status-revoked">✕ REVOKED</span>;
    }
    return <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>✕ INVALID</span>;
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            <ShieldCheck size={14} />
            <span>{language === 'ta' ? 'அதிகாரப்பூர்வ சரிபார்ப்பாளர் தளம்' : language === 'hi' ? 'आधिकारिक सत्यापनकर्ता पोर्टल' : 'Official Verifier Console'}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
            {language === 'ta' ? 'சரிபார்ப்பாளர் கட்டுப்பாட்டு மையம்' : language === 'hi' ? 'सत्यापनकर्ता डैशबोर्ड' : 'Verifier Dashboard'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {language === 'ta' ? 'QR குறியீடு மற்றும் அடையாள எண் மூலம் நேரடி தரவுத்தள சரிபார்ப்பு.' : language === 'hi' ? 'क्यूआर कोड और आईडी के माध्यम से त्वरित सत्यापन।' : 'Perform live cryptographic QR scanning, manual ID verification, and review institutional history.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/history" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={15} />
            <span>{language === 'ta' ? 'முழுமையான வரலாறு' : language === 'hi' ? 'पूरा इतिहास' : 'Full History'}</span>
          </Link>
        </div>
      </div>

      {/* Grid Layout: Left Scanner / Manual Form, Right Recent Verifications */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Verification Terminal */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          {/* Switcher: Scan QR or Manual ID */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'rgba(0,0,0,0.04)',
            padding: '0.35rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('scan'); setVerificationResult(null); }}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                borderRadius: '0.6rem',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'scan' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'scan' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'scan' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Camera size={16} />
              <span>{language === 'ta' ? 'QR ஸ்கேன்' : language === 'hi' ? 'क्यूआर स्कैन' : 'Scan QR Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setVerificationResult(null); }}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                borderRadius: '0.6rem',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'manual' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'manual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={16} />
              <span>{language === 'ta' ? 'கையேடு சரிபார்ப்பு' : language === 'hi' ? 'मैन्युअल सत्यापन' : 'Manual Verification'}</span>
            </button>
          </div>

          {/* Section 1: Scan QR */}
          {activeTab === 'scan' && (
            <div>
              <QRScanner onScanComplete={(res) => setVerificationResult(res)} />
            </div>
          )}

          {/* Section 2: Manual Verification */}
          {activeTab === 'manual' && (
            <div>
              <form onSubmit={handleManualVerify} style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  {language === 'ta' ? 'டிஜிட்டல் அடையாள எண் அல்லது டோக்கன்' : language === 'hi' ? 'डिजिटल आईडी या टोकन' : 'Enter Digital ID or Verification Token'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="e.g. 23CS101 or verification token"
                    className="vg-input"
                    style={{ flex: 1, fontFamily: 'monospace', fontWeight: 600 }}
                    required
                  />
                  <Button variant="primary" type="submit" loading={manualLoading} icon={ShieldCheck}>
                    {language === 'ta' ? 'சரிபார்' : language === 'hi' ? 'जांचें' : 'Verify'}
                  </Button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {language === 'ta'
                    ? 'கேமரா கிடைக்காத போது அடையாள எண்ணை நேரடியாக உள்ளிட்டு MongoDB-ல் சரிபார்க்கலாம்.'
                    : language === 'hi'
                      ? 'कैमरा उपलब्ध न होने पर सीधे आईडी दर्ज करके मोंगोडीबी में जांचें।'
                      : 'Backup verification method if camera scanner is unavailable.'}
                </p>
              </form>

              {/* Display Result if Manual Verified */}
              {verificationResult && (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  backgroundColor: verificationResult.outcome === 'VALID' ? '#ecfdf5' : verificationResult.outcome === 'EXPIRED' ? '#fffbeb' : '#fef2f2',
                  border: `1.5px solid ${verificationResult.outcome === 'VALID' ? '#a7f3d0' : verificationResult.outcome === 'EXPIRED' ? '#fde68a' : '#fecaca'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    {verificationResult.outcome === 'VALID' && <CheckCircle2 size={24} color="#059669" />}
                    {verificationResult.outcome === 'EXPIRED' && <Clock size={24} color="#d97706" />}
                    {verificationResult.outcome === 'REVOKED' && <ShieldAlert size={24} color="#dc2626" />}
                    {verificationResult.outcome === 'INVALID' && <FileX size={24} color="#64748b" />}
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: verificationResult.outcome === 'VALID' ? '#065f46' : verificationResult.outcome === 'EXPIRED' ? '#92400e' : '#991b1b' }}>
                      {verificationResult.outcome}
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 0.65rem' }}>
                    {verificationResult.message}
                  </p>

                  {verificationResult.doc && (
                    <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-muted)' }}>
                      <div><strong>Name:</strong> {verificationResult.doc.name || verificationResult.doc.holder}</div>
                      <div><strong>Unique ID:</strong> {verificationResult.doc.uniqueId || getDigitalIdString(verificationResult.doc.digitalId)}</div>
                      <div><strong>Organization:</strong> {verificationResult.doc.organization}</div>
                      <div><strong>Department:</strong> {verificationResult.doc.department}</div>
                      <div><strong>Valid Until:</strong> {formatDate(verificationResult.doc.validUntil || verificationResult.doc.expiryDate)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Recent Verifications from MongoDB */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {language === 'ta' ? 'சமீபத்திய சரிபார்ப்புகள்' : language === 'hi' ? 'हालिया सत्यापन' : 'Recent Verifications'}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {activities.length} {language === 'ta' ? 'பதிவுகள்' : language === 'hi' ? 'रिकॉर्ड' : 'Records'}
            </span>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <History size={42} strokeWidth={1.2} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                {language === 'ta' ? 'சமீபத்திய சரிபார்ப்புகள் எதுவும் இல்லை.' : language === 'hi' ? 'कोई हालिया सत्यापन नहीं।' : 'No recent verifications.'}
              </p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.35rem' }}>
                {language === 'ta' ? 'QR குறியீட்டை ஸ்கேன் செய்தவுடன் பதிவுகள் இங்கே காட்டப்படும்.' : language === 'hi' ? 'सत्यापन के बाद रिकॉर्ड यहां दिखाई देंगे।' : 'Scanned QR and manual verifications will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.slice(0, 8).map((act, index) => (
                <div
                  key={act._id || act.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: (act.result || act.outcome) === 'VALID' ? '#ecfdf5' : (act.result || act.outcome) === 'EXPIRED' ? '#fffbeb' : '#fef2f2',
                      color: (act.result || act.outcome) === 'VALID' ? '#059669' : (act.result || act.outcome) === 'EXPIRED' ? '#d97706' : '#dc2626'
                    }}>
                      <QrCode size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'block' }}>
                        {act.uniqueId || getDigitalIdString(act.digitalId) || 'Identity'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {act.verifiedPerson ? `${act.verifiedPerson} · ` : ''}{act.method} · {act.time || (act.verificationTime ? new Date(act.verificationTime).toLocaleTimeString() : '')}
                      </span>
                    </div>
                  </div>

                  <div>
                    {getResultBadge(act.result || act.outcome)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

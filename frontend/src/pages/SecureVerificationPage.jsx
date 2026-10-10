import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileX,
  Search,
  Camera,
  Printer,
  QrCode,
  RefreshCw,
  Building,
  User,
  Calendar,
  Lock,
  ArrowLeft
} from 'lucide-react';
import Button from '../components/common/Button';
import QRScanner from '../components/verification/QRScanner';
import { useVerification } from '../context/VerificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { playScanSuccessSound, playTamperAlertSound } from '../utils/audioEffects';

export default function SecureVerificationPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const initialId = token || searchParams.get('id') || searchParams.get('token') || '';

  const { verifyDocument } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialId ? 'manual' : 'scan'); // 'scan' | 'manual'
  const [searchId, setSearchId] = useState(initialId);
  const [activeVerification, setActiveVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performVerification = async (targetId, method = 'MANUAL ID') => {
    if (!targetId || !targetId.trim()) {
      addToast(
        language === 'ta'
          ? 'சரிபார்ப்பு அடையாள எண் உள்ளிடவும்'
          : language === 'hi'
            ? 'कृपया सत्यापन आईडी दर्ज करें'
            : 'Please enter a Verification ID',
        'warning'
      );
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const result = await verifyDocument(targetId.trim(), method);
      setActiveVerification(result);
      setLoading(false);

      if (result.outcome === 'VALID') {
        playScanSuccessSound();
        addToast(
          language === 'ta'
            ? '✓ சரிபார்க்கப்பட்டது: உண்மையான டிஜிட்டல் சான்றிதழ்!'
            : language === 'hi'
              ? '✓ सत्यापित: प्रामाणिक डिजिटल क्रेडेंशियल!'
              : '✓ VALID: Authentic record verified!',
          'success'
        );
      } else if (result.outcome === 'EXPIRED') {
        playTamperAlertSound();
        addToast(
          language === 'ta'
            ? '⚠ காலாவதியானது!'
            : language === 'hi'
              ? '⚠ वैधता समाप्त हो चुकी है!'
              : '⚠ EXPIRED: Validity lapsed',
          'warning'
        );
      } else if (result.outcome === 'REVOKED') {
        playTamperAlertSound();
        addToast(
          language === 'ta'
            ? '🚫 ரத்து செய்யப்பட்ட சான்றிதழ்!'
            : language === 'hi'
              ? '🚫 रद्द किया गया क्रेडेंशियल!'
              : '🚫 REVOKED: Flagged / Revoked ID',
          'error'
        );
      } else {
        playTamperAlertSound();
        addToast(
          language === 'ta'
            ? '❌ பதிவு காணப்படவில்லை!'
            : language === 'hi'
              ? '❌ डेटाबेस में कोई रिकॉर्ड नहीं मिला!'
              : '❌ INVALID: No matching record found',
          'error'
        );
      }
    } catch (err) {
      setLoading(false);
      addToast('Verification failed: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      performVerification(initialId, 'QR SCAN');
    }
  }, [initialId]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setActiveVerification(null);
    setHasSearched(false);
    setSearchId('');
  };

  const outcome = activeVerification?.outcome;
  const doc = activeVerification?.doc || null;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '90vh', padding: '3rem 1.5rem', transition: 'background-color 0.2s' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            border: '1px solid var(--primary-border)'
          }}>
            <ShieldCheck size={16} />
            <span>
              {language === 'ta' ? 'அதிகாரப்பூர்வ பொது சரிபார்ப்பு பதிவேடு' : language === 'hi' ? 'आधिकारिक सार्वजनिक सत्यापन रजिस्ट्री' : 'Official Public Verification Registry'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            {language === 'ta' ? 'டிஜிட்டல் அடையாள அட்டையை ஸ்கேன் செய்க' : language === 'hi' ? 'डिजिटल आईडी स्कैन करें' : 'Scan Digital ID'}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0.35rem auto 0', lineHeight: 1.5 }}>
            {language === 'ta'
              ? 'பயனரிடம் தங்கள் QR குறியீட்டைக் காட்டுமாறு கேட்கவும். QR குறியீட்டை ஸ்கேனரின் உள்ளே வைக்கவும்.'
              : language === 'hi'
                ? 'उपयोगकर्ता से अपना क्यूआर कोड दिखाने के लिए कहें। क्यूआर कोड को स्कैनर के अंदर रखें।'
                : 'Ask the user to display their QR code. Position the QR code inside the scanner.'}
          </p>
        </div>

        {/* Verification Options / Input Tabs */}
        {!activeVerification ? (
          <div className="vg-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'rgba(0,0,0,0.04)',
              padding: '0.35rem',
              borderRadius: '0.85rem',
              marginBottom: '1.75rem',
              maxWidth: '440px',
              margin: '0 auto 1.75rem'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '0.65rem',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'scan' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'scan' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'scan' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Camera size={16} />
                <span>{language === 'ta' ? '1. QR குறியீடு ஸ்கேன்' : language === 'hi' ? '1. क्यूआर कोड स्कैन' : '1. Scan QR Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '0.65rem',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'manual' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'manual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Search size={16} />
                <span>{language === 'ta' ? '2. அடையாள எண் உள்ளீடு' : language === 'hi' ? '2. सत्यापन आईडी दर्ज करें' : '2. Enter ID Manually'}</span>
              </button>
            </div>

            {/* Tab 1: Live QR Scanner Terminal */}
            {activeTab === 'scan' && (
              <div>
                <QRScanner onScanComplete={(result) => setActiveVerification(result)} />
              </div>
            )}

            {/* Tab 2: Manual ID Input Form */}
            {activeTab === 'manual' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performVerification(searchId, 'MANUAL ID');
                }}
                style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}
              >
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-card)',
                  padding: '0.45rem',
                  borderRadius: '0.85rem',
                  border: '2px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '0.75rem', gap: '0.5rem' }}>
                    <Search size={18} color="var(--primary)" />
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder={
                        language === 'ta'
                          ? 'சரிபார்ப்பு அடையாள எண் உள்ளிடவும் (எ.கா. DID-XXXXX)'
                          : language === 'hi'
                            ? 'सत्यापन आईडी दर्ज करें (उदा. DID-XXXXX)'
                            : 'Enter Verification ID (e.g. DID-2026-001)'
                      }
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.95rem',
                        backgroundColor: 'transparent',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontFamily: 'monospace'
                      }}
                      required
                    />
                  </div>
                  <Button variant="primary" type="submit" loading={loading} icon={ShieldCheck}>
                    {language === 'ta' ? 'சரிபார்' : language === 'hi' ? 'जांचें' : 'Verify ID'}
                  </Button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                  {language === 'ta'
                    ? 'டிஜிட்டல் அடையாள அட்டையில் அச்சிடப்பட்டுள்ள தனித்துவமான அடையாள எண் அல்லது டோக்கனை உள்ளிடவும்.'
                    : language === 'hi'
                      ? 'पहचान पत्र पर छपी विशिष्ट आईडी या टोकन दर्ज करें।'
                      : 'Enter the unique ID or verification token printed on the digital card.'}
                </p>

              </form>
            )}
          </div>
        ) : (
          /* RESULT DISPLAY SECTION (EXACT SPECIFICATION REQUIREMENT) */
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>{language === 'ta' ? 'மற்றொரு அடையாளத்தைச் சரிபார்க்கவும்' : language === 'hi' ? 'अन्य आईडी सत्यापित करें' : 'Verify Another ID'}</span>
              </button>
            </div>

            {/* 1. ACTIVE / VALID OUTCOME */}
            {outcome === 'VALID' && (
              <div className="vg-card" style={{
                borderTop: '6px solid #10b981',
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.12)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46', margin: 0 }}>
                      🟢 VALID
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#047857', margin: '0.2rem 0 0' }}>
                      {language === 'ta'
                        ? 'இந்த டிஜிட்டல் அடையாளம் அதிகாரப்பூர்வமானது மற்றும் செயலில் உள்ளது.'
                        : language === 'hi'
                          ? 'यह डिजिटल पहचान सक्रिय और आधिकारिक रूप से सत्यापित है।'
                          : 'This digital identity is authentic, active, and officially verified.'}
                    </p>
                  </div>
                </div>

                {/* Section 8: Live Verification Watermark Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px dashed #86efac',
                  borderRadius: '0.85rem',
                  color: '#166534',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  marginBottom: '1.75rem',
                  textAlign: 'center'
                }}>
                  <ShieldCheck size={18} color="#16a34a" />
                  <span>
                    {language === 'ta'
                      ? '✓ வழங்கும் நிறுவனத்தின் நேரடித் தரவுத்தளத்துடன் சரிபார்க்கப்பட்டது'
                      : language === 'hi'
                        ? '✓ जारीकर्ता संस्थान के लाइव रिकॉर्ड के विरुद्ध सत्यापित'
                        : '✓ Verified against issuing organization\'s live record in real-time'}
                  </span>
                </div>

                {/* Safe Public Permitted Information Grid (Section 19 Specification) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  fontSize: '0.9rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Digital ID</span>
                    <code style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800 }}>{doc?.uniqueId || doc?.digitalId || doc?.id || 'N/A'}</code>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Name</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{doc?.holder || doc?.name || 'N/A'}</strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Organization</span>
                    <strong style={{ color: 'var(--text-main)' }}>{doc?.organization || doc?.issuer || 'VeriGlass Registry'}</strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Department</span>
                    <strong style={{ color: 'var(--text-main)' }}>{doc?.department || 'General'}</strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Issue Date</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {doc?.issueDate ? formatDate(doc.issueDate) : 'Official Record'}
                    </strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Expiry Date</span>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                      {(doc?.validUntil || doc?.expiryDate) ? formatDate(doc.validUntil || doc.expiryDate) : 'Indefinite'}
                    </strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Verification Time</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {activeVerification?.verificationRecord?.time ? `${activeVerification.verificationRecord.time} (${activeVerification.verificationRecord.date})` : new Date().toLocaleTimeString()}
                    </strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Status</span>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      border: '1px solid #a7f3d0'
                    }}>
                      VALID
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                    {language === 'ta' ? 'அறிக்கையை அச்சிடு' : language === 'hi' ? 'सत्यापन रिपोर्ट प्रिंट करें' : 'Print Verification Report'}
                  </Button>
                  <Button variant="primary" onClick={handleReset}>
                    {language === 'ta' ? 'புதிய சரிபார்ப்பு' : language === 'hi' ? 'नया सत्यापन' : 'Verify Another Record'}
                  </Button>
                </div>
              </div>
            )}

            {/* 2. EXPIRED OUTCOME */}
            {outcome === 'EXPIRED' && (
              <div className="vg-card" style={{
                borderTop: '6px solid #f59e0b',
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.12)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Clock size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e', margin: 0 }}>
                      🟠 EXPIRED
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#b45309', margin: '0.2rem 0 0', fontWeight: 700 }}>
                      {language === 'ta'
                        ? 'இந்த டிஜிட்டல் அடையாளம் அதன் காலாவதி தேதியை கடந்துவிட்டது.'
                        : language === 'hi'
                          ? 'यह डिजिटल पहचान अपनी समाप्ति तिथि पार कर चुकी है।'
                          : 'This digital identity has passed its expiry date.'}
                    </p>
                  </div>
                </div>

                {/* Permitted verification details */}
                {doc && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                    fontSize: '0.9rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Digital ID</span>
                      <code style={{ fontWeight: 800 }}>{doc.uniqueId || doc.digitalId || doc.id}</code>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Name</span>
                      <strong style={{ color: 'var(--text-main)' }}>{doc.holder || doc.name}</strong>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Organization</span>
                      <strong>{doc.organization || doc.issuer}</strong>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Expired On</span>
                      <strong style={{ color: '#d97706' }}>{formatDate(doc.validUntil || doc.expiryDate)}</strong>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="primary" onClick={handleReset}>
                    {language === 'ta' ? 'புதிய சரிபார்ப்பு' : 'Verify Another Record'}
                  </Button>
                </div>
              </div>
            )}

            {/* 3. REVOKED OUTCOME */}
            {outcome === 'REVOKED' && (
              <div className="vg-card" style={{
                borderTop: '6px solid #ef4444',
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.12)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#991b1b', margin: 0 }}>
                      🔴 REVOKED
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#b91c1c', margin: '0.2rem 0 0', fontWeight: 700 }}>
                      {language === 'ta'
                        ? 'இந்த டிஜிட்டல் அடையாளம் ரத்து செய்யப்பட்டுள்ளது.'
                        : language === 'hi'
                          ? 'यह डिजिटल पहचान रद्द कर दी गई है।'
                          : 'This digital identity has been revoked.'}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {language === 'ta'
                    ? 'இந்த அடையாள அட்டை நிர்வாகத்தால் அதிகாரப்பூர்வமாக ரத்து செய்யப்பட்டுள்ளது அல்லது பாதுகாப்பு காரணங்களுக்காக முடக்கப்பட்டுள்ளது.'
                    : language === 'hi'
                      ? 'इस डिजिटल पहचान को प्रशासन द्वारा रद्द कर दिया गया है।'
                      : 'This digital identity has been officially revoked and is no longer valid for institutional authentication.'}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="primary" onClick={handleReset}>
                    {language === 'ta' ? 'புதிய சரிபார்ப்பு' : 'Verify Another Record'}
                  </Button>
                </div>
              </div>
            )}

            {/* 4. NOT FOUND / INVALID OUTCOME */}
            {outcome === 'INVALID' && (
              <div className="vg-card" style={{
                borderTop: '6px solid #64748b',
                padding: '2.5rem 2rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px rgba(100, 116, 139, 0.12)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#64748b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileX size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#334155', margin: 0 }}>
                      🔴 INVALID
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0.2rem 0 0', fontWeight: 700 }}>
                      {language === 'ta'
                        ? 'இந்த QR குறியீட்டிற்கான செல்லுபடியாகும் டிஜிட்டல் அடையாளம் எதுவும் காணப்படவில்லை.'
                        : language === 'hi'
                          ? 'इस क्यूआर कोड के लिए कोई वैध डिजिटल पहचान नहीं मिली।'
                          : 'No valid digital identity was found for this QR code.'}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {language === 'ta'
                    ? 'இந்த சரிபார்ப்பு அடையாள எண் தரவுத்தளத்தில் பதிவு செய்யப்படவில்லை.'
                    : language === 'hi'
                      ? 'इस आईडी का कोई रिकॉर्ड डेटाबेस में मौजूद नहीं है।'
                      : 'No matching record was found in the institutional root ledger for this query.'}
                </p>

                {/* Helpful guidance when invalid */}
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={16} />
                    <span>
                      {language === 'ta'
                        ? 'ஏன் "INVALID" என்று வருகிறது?'
                        : language === 'hi'
                          ? '"INVALID" क्यों दिखाई दे रहा है?'
                          : 'Why did this verify as INVALID?'}
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    <li>
                      {language === 'ta'
                        ? 'QR Generator பக்கத்தில் புதிய QR உருவாக்கியிருந்தால், அதை முதலில் "Save to Database" செய்ய வேண்டும். சேமிக்காத ID தரவுத்தளத்தில் இருக்காது.'
                        : 'If you created a new QR Code on the Generator page, it must be saved to the database first. Unsaved drafts do not exist in the ledger.'}
                    </li>
                    <li>
                      {language === 'ta'
                        ? 'அல்லது உள்ளிடப்பட்ட அடையாள எண் தவறாக இருக்கலாம்.'
                        : 'Or the verification ID was entered incorrectly.'}
                    </li>
                  </ul>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to="/generate-qr" style={{ textDecoration: 'none' }}>
                      <button
                        type="button"
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary)',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {language === 'ta' ? '✨ புதிய சான்றிதழ் QR உருவாக்க' : '✨ Issue / Generate New Credential'}
                      </button>
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="primary" onClick={handleReset}>
                    {language === 'ta' ? 'புதிய சரிபார்ப்பு' : 'Verify Another Record'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

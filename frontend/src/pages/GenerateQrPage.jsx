import { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Sparkles,
  Check,
  RefreshCw,
  FileText,
  ArrowRight,
  Eye,
  ShieldCheck,
  CreditCard,
  User,
  Calendar,
  Building,
  ScanLine,
  Barcode as BarcodeIcon
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import QRCodeDisplay from '../components/identity/QRCodeDisplay';
import BarcodeDisplay from '../components/identity/BarcodeDisplay';
import Modal from '../components/common/Modal';
import { useVerification } from '../context/VerificationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { copyToClipboard, formatDate, isDocMatchUser } from '../utils/formatters';
import { digitalIdApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function GenerateQrPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { documents = [], refreshData } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const userDocs = documents.filter((d) => isDocMatchUser(d, user));
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const activeUserDoc = userDocs[selectedDocIndex] || userDocs[0] || null;

  // Tabs: 'generate' (Dynamic Generator) or 'my-codes' (Existing credentials)
  const [activeTab, setActiveTab] = useState('generate');

  const generateDynamicId = () => `DID-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 2);
  const expiryDefault = nextYear.toISOString().split('T')[0];

  const [form, setForm] = useState({
    id: generateDynamicId(),
    name: 'Digital Identity Credential',
    holder: user?.name || 'J. Karthika',
    issuer: user?.organization || 'Apex Institute of Science & Technology',
    department: user?.department || 'Computer Science & Engineering',
    role: user?.role || 'CREDENTIAL_HOLDER',
    issueDate: todayStr,
    expiryDate: expiryDefault,
    type: 'Identity Card'
  });

  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [barcodeFormat, setBarcodeFormat] = useState('qr'); // 'qr' | 'barcode' | 'dual'

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        holder: prev.holder === 'J. Karthika' ? (user.name || 'J. Karthika') : prev.holder,
        issuer: prev.issuer === 'Apex Institute of Science & Technology' ? (user.organization || 'Apex Institute of Science & Technology') : prev.issuer,
        department: prev.department === 'Computer Science & Engineering' ? (user.department || 'Computer Science & Engineering') : prev.department,
        role: user.role || prev.role
      }));
    }
  }, [user]);

  const handleGenerateNewId = () => {
    const newId = generateDynamicId();
    setForm((prev) => ({ ...prev, id: newId }));
    setIsSaved(false);
    addToast(language === 'ta' ? `புதிய ஐடி உருவாக்கப்பட்டது: ${newId}` : language === 'hi' ? `नई आईडी उत्पन्न हुई: ${newId}` : `Generated new ID: ${newId}`, 'info');
  };


  const handleSaveToVault = async () => {
    if (!form.name || !form.holder) {
      addToast(
        language === 'ta'
          ? 'சான்றிதழ் மற்றும் வைத்திருப்பவர் பெயரை உள்ளிடவும்'
          : language === 'hi'
            ? 'कृपया क्रेडेंशियल और धारक का नाम दर्ज करें'
            : 'Please provide credential and holder name',
        'error'
      );
      return false;
    }

    setSaving(true);
    try {
      const res = await digitalIdApi.create({
        uniqueId: form.id,
        name: form.name,
        holder: form.holder,
        organization: form.issuer,
        department: form.department,
        role: form.role,
        issueDate: form.issueDate,
        validUntil: form.expiryDate,
        status: 'Active',
        userId: user?.id || user?._id || undefined
      });
      setSaving(false);
      setIsSaved(true);
      addToast(
        language === 'ta'
          ? `✓ சான்றிதழ் ${form.id} தரவுத்தளத்தில் சேமிக்கப்பட்டது! இப்போது சரிபார்க்கத் தயார்.`
          : language === 'hi'
            ? `✓ क्रेडेंशियल ${form.id} डेटाबेस में सहेजा गया! अब सत्यापन के लिए तैयार है।`
            : `✓ Credential ${form.id} saved to MongoDB! Ready for verification.`,
        'success'
      );
      if (refreshData) refreshData();
      return true;
    } catch (err) {
      setSaving(false);
      addToast('Error saving: ' + (err.message || 'Server error'), 'error');
      return false;
    }
  };

  const handleSaveAndVerify = async () => {
    let proceed = isSaved;
    if (!isSaved) {
      proceed = await handleSaveToVault();
    }
    if (proceed) {
      navigate(`/verify/${form.id}`);
    }
  };

  const handleCopyLink = (tokenOrId) => {
    const targetUrl = `${window.location.origin}/verify/${tokenOrId}`;
    copyToClipboard(targetUrl);
    addToast(t('copied') || 'Verification link copied to clipboard!', 'success');
  };

  const qrVerificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${form.id}`
    : `/verify/${form.id}`;

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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
            {t('generateQrTitle') || 'Dynamic Credential QR Generator'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {t('generateQrSubtitle') || 'Generate, customize, and export high-security QR codes for physical or digital credentials.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/scanner" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={ScanLine}>
              📷 {t('scanQr') || 'Scan QR'}
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleGenerateNewId}
            icon={RefreshCw}
          >
            {t('generateNewId') || 'New ID'}
          </Button>

          <Button
            variant="gradient"
            onClick={handleSaveToVault}
            icon={FileText}
            loading={saving}
          >
            {t('saveToVault') || 'Save to Database'}
          </Button>
        </div>
      </div>

      {/* TABS: Generate New QR Code | My Assigned QR Codes */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('generate')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.75rem',
            border: 'none',
            backgroundColor: activeTab === 'generate' ? '#2563eb' : 'transparent',
            color: activeTab === 'generate' ? '#ffffff' : 'var(--text-main)',
            fontWeight: activeTab === 'generate' ? 800 : 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={16} />
          <span>✨ {t('generateQrCode') || 'Generate New QR Code'}</span>
        </button>

        <button
          onClick={() => setActiveTab('my-codes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.75rem',
            border: 'none',
            backgroundColor: activeTab === 'my-codes' ? '#2563eb' : 'transparent',
            color: activeTab === 'my-codes' ? '#ffffff' : 'var(--text-main)',
            fontWeight: activeTab === 'my-codes' ? 800 : 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <CreditCard size={16} />
          <span>📱 {t('myQrCode') || 'My Existing Credentials'} ({userDocs.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DYNAMIC QR GENERATOR FORM & LIVE PREVIEW               */}
      {/* ============================================================== */}
      {activeTab === 'generate' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)',
          gap: '2.5rem',
          alignItems: 'start'
        }} className="generate-qr-grid">
          {/* Left: Input Form */}
          <div className="vg-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t('credentialOverview') || 'Credential Details'}
              </h3>
              <button
                type="button"
                onClick={handleGenerateNewId}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <RefreshCw size={14} />
                <span>{t('generateNewId') || 'Refresh ID'}</span>
              </button>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {language === 'ta'
                ? 'இங்கு உள்ளிடப்படும் தகவல்களுக்கு ஏற்ப வலதுபுறத்தில் உள்ள QR குறியீடு உடனடியாக மாறும்.'
                : language === 'hi'
                  ? 'यहां विवरण दर्ज करने पर दाईं ओर का क्यूआर कोड तुरंत अपडेट होगा।'
                  : 'Modifications update the cryptographic QR matrix on the right in real-time.'}
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveToVault(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">
                    <span>{t('officialIdNumber') || 'Verification ID'}</span>
                  </label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="vg-input"
                    style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">{t('credentialType') || 'Credential Category'}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="vg-input"
                  >
                    <option value="Identity Card">Digital Identity Card</option>
                    <option value="Student ID">Student ID</option>
                    <option value="Employee ID">Employee ID</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Professional Certification">Professional Certification</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <Input
                  label={t('credentialName') || 'Credential / Document Name'}
                  placeholder="e.g. Bachelor of Technology in Computer Science"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <Input
                  label={t('holderName') || 'Holder Full Name'}
                  placeholder="e.g. J. Karthika"
                  value={form.holder}
                  onChange={(e) => setForm({ ...form, holder: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                  label={t('department') || 'Department'}
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
                <Input
                  label={t('issuingAuthority') || 'Organization'}
                  placeholder="e.g. Apex Institute of Science & Technology"
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <Input
                  label={t('issueDate') || 'Issue Date'}
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  required
                />
                <Input
                  label={t('expiryDate') || 'Valid Until'}
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  required
                />
              </div>

              {/* Action Buttons: Save to Database & Sample Preset */}
              <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  type="submit"
                  loading={saving}
                  icon={Sparkles}
                  style={{ flex: 1, minWidth: '220px' }}
                >
                  {isSaved
                    ? (language === 'ta' ? '✓ தரவுத்தளத்தில் புதுப்பிக்கவும்' : '✓ Update in MongoDB')
                    : (language === 'ta' ? '💾 தரவுத்தளத்தில் சேமித்து செயல்படுத்தவும்' : '💾 Save Credential to Database')}
                </Button>
              </div>

              {/* Security Banner */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '0.85rem',
                fontSize: '0.825rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Sparkles size={20} color="var(--primary)" className="shrink-0" />
                <span>
                  <strong>{t('securityProtocol') || 'Security Standard'}:</strong>{' '}
                  {language === 'ta'
                    ? 'இந்த QR குறியீட்டை சரிபார்க்கும் முன் "Save to Database" செய்ய வேண்டும் அல்லது "Save & Verify Now" அழுத்தவும்.'
                    : 'Save this credential to the institutional ledger so that verification immediately confirms authenticity.'}
                </span>
              </div>
            </form>
          </div>

          {/* Right: Dynamic Live QR Code Display Card */}
          <div>
            {/* Live Database Registration Status Badge */}
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: isSaved ? '#ecfdf5' : '#fffbeb',
                color: isSaved ? '#065f46' : '#b45309',
                border: `1.5px solid ${isSaved ? '#a7f3d0' : '#fde68a'}`
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSaved ? '#10b981' : '#f59e0b'
                }}></span>
                <span>
                  {isSaved
                    ? (language === 'ta' ? '✓ தரவுத்தளத்தில் சேமிக்கப்பட்டது (செல்லுபடியாகும் / VALID)' : '✓ Registered in Database (VALID)')
                    : (language === 'ta' ? '⚠ வரைவு - சரிபார்க்க "Save & Verify Now" அழுத்தவும்' : '⚠ Draft - Click "Save & Verify Now"')}
                </span>
              </div>
            </div>

            {/* Format Selector: 2D QR Code | 1D Barcode | Dual */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.35rem',
              marginBottom: '1rem',
              backgroundColor: '#f1f5f9',
              padding: '0.25rem',
              borderRadius: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => setBarcodeFormat('qr')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.55rem',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: barcodeFormat === 'qr' ? 800 : 600,
                  backgroundColor: barcodeFormat === 'qr' ? '#2563eb' : 'transparent',
                  color: barcodeFormat === 'qr' ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={13} />
                <span>2D QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setBarcodeFormat('barcode')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.55rem',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: barcodeFormat === 'barcode' ? 800 : 600,
                  backgroundColor: barcodeFormat === 'barcode' ? '#2563eb' : 'transparent',
                  color: barcodeFormat === 'barcode' ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <BarcodeIcon size={13} />
                <span>1D Barcode (Code-128)</span>
              </button>

              <button
                type="button"
                onClick={() => setBarcodeFormat('dual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.55rem',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: barcodeFormat === 'dual' ? 800 : 600,
                  backgroundColor: barcodeFormat === 'dual' ? '#2563eb' : 'transparent',
                  color: barcodeFormat === 'dual' ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={13} />
                <span>Dual Badge</span>
              </button>
            </div>

            {/* Display based on selected format */}
            {(barcodeFormat === 'qr' || barcodeFormat === 'dual') && (
              <div style={{ marginBottom: barcodeFormat === 'dual' ? '1rem' : 0 }}>
                <QRCodeDisplay
                  value={qrVerificationUrl}
                  title={form.name}
                  subtitle={`ID: ${form.id}`}
                  size={230}
                  showActions={true}
                  documentInfo={{ holder: form.holder, issuer: form.issuer, expiryDate: form.expiryDate }}
                />
              </div>
            )}

            {(barcodeFormat === 'barcode' || barcodeFormat === 'dual') && (
              <BarcodeDisplay
                value={form.id}
                title={form.name}
                subtitle={`Holder: ${form.holder} · Valid until: ${form.expiryDate}`}
                format="CODE128"
                width={2}
                height={60}
                showControls={true}
              />
            )}

            {/* Test Link to Public Page */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Button
                variant="outline"
                icon={Copy}
                onClick={() => handleCopyLink(form.id)}
              >
                {t('copyVerificationLink') || 'Copy Verification Link'}
              </Button>

              <Button
                variant="primary"
                style={{ width: '100%', padding: '0.75rem 1rem', fontWeight: 800 }}
                iconRight={ArrowRight}
                loading={saving}
                onClick={handleSaveAndVerify}
              >
                {language === 'ta'
                  ? '⚡ சேமித்து உடனே சரிபார்க்கவும் (Save & Verify Now)'
                  : '⚡ Save & Verify Now (Test Authenticity)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY EXISTING ASSIGNED QR CODES                           */}
      {/* ============================================================== */}
      {activeTab === 'my-codes' && (
        <div>
          {userDocs.length === 0 ? (
            <div className="vg-card" style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              maxWidth: '620px',
              margin: '1rem auto',
              borderRadius: '1.5rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <QrCode size={32} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {t('noDigitalIdYet') || 'No Assigned Credentials Yet'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                {language === 'ta'
                  ? 'உங்கள் கணக்கிற்கு இன்னும் சான்றிதழ்கள் ஒதுக்கப்படவில்லை. மேலே உள்ள "Generate New QR Code" மூலம் உடனடியாக புதிய QR-ஐ உருவாக்கலாம்!'
                  : language === 'hi'
                    ? 'आपके खाते में अभी कोई क्रेडेंशियल नहीं है। आप ऊपर "Generate New QR Code" टैब से नया क्यूआर कोड बना सकते हैं!'
                    : 'You have no assigned documents yet. Use the "Generate New QR Code" tab above to generate and test any credential QR immediately!'}
              </p>
              <Button variant="gradient" onClick={() => setActiveTab('generate')} icon={Sparkles}>
                {t('generateQrCode') || 'Generate New QR Code'}
              </Button>
            </div>
          ) : (
            <div>
              {/* Switcher if user has multiple assigned credentials */}
              {userDocs.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Select Credential:
                  </span>
                  {userDocs.map((d, index) => (
                    <button
                      key={`${d.uniqueId || d.id || d._id || 'cred'}-${index}`}
                      onClick={() => setSelectedDocIndex(index)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '0.65rem',
                        border: selectedDocIndex === index ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: selectedDocIndex === index ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
                        color: selectedDocIndex === index ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedDocIndex === index ? 800 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {d.name || d.credentialTitle || d.uniqueId} ({d.status || 'ACTIVE'})
                    </button>
                  ))}
                </div>
              )}

              {activeUserDoc && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 1.3fr)',
                  gap: '2.5rem',
                  alignItems: 'start'
                }} className="generate-qr-grid">
                  {/* Left: Secure QR / Barcode Display */}
                  <div>
                    {/* Format Selector: 2D QR Code | 1D Barcode | Dual */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      marginBottom: '1rem',
                      backgroundColor: '#f1f5f9',
                      padding: '0.25rem',
                      borderRadius: '0.75rem'
                    }}>
                      <button
                        type="button"
                        onClick={() => setBarcodeFormat('qr')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.55rem',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: barcodeFormat === 'qr' ? 800 : 600,
                          backgroundColor: barcodeFormat === 'qr' ? '#2563eb' : 'transparent',
                          color: barcodeFormat === 'qr' ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer'
                        }}
                      >
                        <QrCode size={13} />
                        <span>2D QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBarcodeFormat('barcode')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.55rem',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: barcodeFormat === 'barcode' ? 800 : 600,
                          backgroundColor: barcodeFormat === 'barcode' ? '#2563eb' : 'transparent',
                          color: barcodeFormat === 'barcode' ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer'
                        }}
                      >
                        <BarcodeIcon size={13} />
                        <span>1D Barcode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBarcodeFormat('dual')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.55rem',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: barcodeFormat === 'dual' ? 800 : 600,
                          backgroundColor: barcodeFormat === 'dual' ? '#2563eb' : 'transparent',
                          color: barcodeFormat === 'dual' ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer'
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Dual</span>
                      </button>
                    </div>

                    {(barcodeFormat === 'qr' || barcodeFormat === 'dual') && (
                      <div style={{ marginBottom: barcodeFormat === 'dual' ? '1rem' : 0 }}>
                        <QRCodeDisplay
                          value={`${window.location.origin}/verify/${activeUserDoc.verificationToken || activeUserDoc.qrToken || activeUserDoc.uniqueId || activeUserDoc.id}`}
                          title={activeUserDoc.credentialTitle || activeUserDoc.name || 'Official Credential'}
                          subtitle={`DVID: ${activeUserDoc.credentialNumber || activeUserDoc.uniqueId || activeUserDoc.id}`}
                          size={240}
                          showActions={true}
                          documentInfo={{
                            holder: activeUserDoc.holderName || user?.name,
                            issuer: activeUserDoc.organization || 'Issuing Authority',
                            expiryDate: activeUserDoc.expiryDate || activeUserDoc.validUntil
                          }}
                        />
                      </div>
                    )}

                    {(barcodeFormat === 'barcode' || barcodeFormat === 'dual') && (
                      <BarcodeDisplay
                        value={activeUserDoc.credentialNumber || activeUserDoc.uniqueId || activeUserDoc.id}
                        title={activeUserDoc.credentialTitle || activeUserDoc.name}
                        subtitle={`Holder: ${activeUserDoc.holderName || user?.name}`}
                        format="CODE128"
                        width={2}
                        height={60}
                        showControls={true}
                      />
                    )}

                    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <Button
                        variant="outline"
                        icon={Copy}
                        onClick={() => handleCopyLink(activeUserDoc.verificationToken || activeUserDoc.qrToken || activeUserDoc.uniqueId || activeUserDoc.id)}
                      >
                        {t('copyVerificationLink') || 'Copy Direct Verification Link'}
                      </Button>

                      <Link to={`/verify/${activeUserDoc.verificationToken || activeUserDoc.qrToken || activeUserDoc.uniqueId || activeUserDoc.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%' }} iconRight={ArrowRight}>
                          {t('verifyNow') || 'Open Public Verification Page'}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Right: Credential Identity Metadata Card */}
                  <div className="vg-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '0.85rem',
                          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff'
                        }}>
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                            {activeUserDoc.credentialTitle || activeUserDoc.name}
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {activeUserDoc.credentialType || activeUserDoc.category || 'Digital Credential'}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={activeUserDoc.status || 'ACTIVE'} size="md" />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: '1rem',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1.5rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                          {t('fullName') || 'CREDENTIAL HOLDER'}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {activeUserDoc.holderName || user?.name}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                          {t('issuingAuthority') || 'ISSUING ORGANIZATION'}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {activeUserDoc.organization || 'Apex Institute of Science & Technology'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                          {t('issueDate') || 'ISSUE DATE'}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {formatDate(activeUserDoc.issueDate)}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                          {t('expiryDate') || 'EXPIRY DATE'}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {formatDate(activeUserDoc.expiryDate || activeUserDoc.validUntil)}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link to="/digital-id" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" icon={CreditCard}>
                          {t('myDigitalId') || 'View Digital ID Card'}
                        </Button>
                      </Link>
                      <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" icon={User}>
                          {t('profile') || 'My Profile'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View QR Large Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={t('qrPreview') || 'View QR Code Matrix'}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <QRCodeDisplay
            value={qrVerificationUrl}
            title={form.name}
            subtitle={`Holder: ${form.holder || 'N/A'} · ID: ${form.id}`}
            size={280}
            showActions={true}
          />
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('scanToVerify') || 'Point your camera at this QR code to trigger real verification.'}
          </p>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 960px) {
          .generate-qr-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

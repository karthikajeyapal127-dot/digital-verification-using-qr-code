import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Download,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
  FileCheck,
  Copy,
  ExternalLink,
  Printer,
  Plus,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import DigitalIdCard from '../components/identity/DigitalIdCard';
import QRCodeDisplay from '../components/identity/QRCodeDisplay';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useVerification } from '../context/VerificationContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { digitalIdApi, recentApi } from '../services/api';
import { copyToClipboard, formatDate, isDocMatchUser } from '../utils/formatters';

export default function DigitalIdCardPage() {
  const { user } = useAuth();
  const { documents, refreshData } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 2);
  const expiryDefault = nextYear.toISOString().split('T')[0];

  // New ID Application State
  const [formData, setFormData] = useState({
    name: 'Digital Identity Card',
    type: 'Identity Card',
    holder: user?.name || '',
    holderId: '',
    department: user?.department || '',
    designationOrCourse: user?.role || 'Member',
    phone: user?.phone || '',
    organization: user?.organization || '',
    expiryDate: expiryDefault
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        holder: prev.holder || user.name || '',
        department: prev.department || user.department || '',
        organization: prev.organization || user.organization || '',
        designationOrCourse: prev.designationOrCourse || user.role || 'Member'
      }));
    }
  }, [user]);

  // Real filtered documents belonging to this user (or all if admin)
  const isAnyAdmin = (user?.role || '').toUpperCase() === 'ADMIN' || (user?.role || '').toUpperCase() === 'ORGANIZATION_ADMIN';
  const userDocs = isAnyAdmin
    ? documents
    : documents.filter((d) => isDocMatchUser(d, user));

  const activeDoc = userDocs[selectedDocIndex] || userDocs[0] || null;
  const shareUrl = activeDoc
    ? `${window.location.origin}/verify/${activeDoc.qrToken || activeDoc.uniqueId || activeDoc.id}`
    : '';

  // Log to recently accessed when active doc exists
  useEffect(() => {
    if (activeDoc && user?.id) {
      recentApi.add({
        userId: user.id,
        itemType: 'identity',
        itemId: activeDoc.uniqueId || activeDoc.id,
        title: activeDoc.name || activeDoc.holder,
        subtitle: `${activeDoc.uniqueId || activeDoc.id} · ${activeDoc.status}`,
        path: '/digital-id'
      }).catch(() => {});
    }
  }, [activeDoc, user]);

  const handleCopyShareLink = () => {
    if (!shareUrl) return;
    copyToClipboard(shareUrl);
    addToast(language === 'ta' ? 'சரிபார்ப்பு இணைப்பு நகலெடுக்கப்பட்டது!' : language === 'hi' ? 'सत्यापन लिंक कॉपी किया गया!' : 'Direct verification URL copied to clipboard!', 'success');
  };

  const handleDownloadCard = () => {
    window.print();
    addToast(language === 'ta' ? 'அடையாள அட்டை அச்சிடப்பட்டது.' : language === 'hi' ? 'कार्ड प्रिंट किया गया।' : 'Card exported/printed successfully.', 'success');
  };

  const handleRegenerateQR = async () => {
    if (!activeDoc) return;
    setRegenerating(true);
    try {
      const docId = activeDoc.uniqueId || activeDoc.id;
      const res = await digitalIdApi.regenerateQR(docId);
      setRegenerating(false);
      if (res && res.success) {
        addToast(language === 'ta' ? 'புதிய பாதுகாப்பான QR குறியீடு உருவாக்கப்பட்டது!' : language === 'hi' ? 'नया सुरक्षित क्यूआर कोड जारी किया गया!' : 'New dynamic cryptographic QR token issued!', 'success');
        refreshData();
      }
    } catch (err) {
      setRegenerating(false);
      addToast(err.message || 'Failed to regenerate QR token', 'error');
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.holder) {
      addToast(language === 'ta' ? 'பெயர் மற்றும் விவரங்களை உள்ளிடவும்' : language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please enter credential name and holder name', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await digitalIdApi.create({
        ...formData,
        userId: user?.id,
        autoApprove: true
      });
      setSubmitting(false);
      if (res && res.success) {
        addToast(language === 'ta' ? 'டிஜிட்டல் அடையாளம் வெற்றிகரமாக உருவாக்கப்பட்டது!' : language === 'hi' ? 'डिजिटल पहचान पत्र सफलतापूर्वक बनाया गया!' : 'Digital ID created successfully with secure QR code!', 'success');
        setRequestModalOpen(false);
        refreshData();
      }
    } catch (err) {
      setSubmitting(false);
      addToast(err.message || 'Submission failed', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Heading */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            {t('digitalId')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {language === 'ta'
              ? 'பாதுகாப்பான QR குறியீட்டுடன் கூடிய அதிகாரப்பூர்வ டிஜிட்டல் அடையாள அட்டை.'
              : language === 'hi'
                ? 'सुरक्षित क्यूआर कोड और डिजिटल सत्यापन के साथ आधिकारिक डिजिटल पहचान पत्र।'
                : 'Official verifiable mobile credential issued with asymmetric cryptography and dynamic QR integrity.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAnyAdmin && (
            <Button variant="secondary" onClick={() => setRequestModalOpen(true)} icon={Plus}>
              {language === 'ta' ? 'புதிய ஐடி உருவாக்கு' : language === 'hi' ? 'नई आईडी बनाएं' : 'Issue Digital ID'}
            </Button>
          )}
          {activeDoc && (
            <>
              <Button variant="secondary" onClick={() => setShareModalOpen(true)} icon={Share2}>
                {language === 'ta' ? 'இணைப்பைப் பகிர்' : language === 'hi' ? 'लिंक साझा करें' : 'Share Link'}
              </Button>
              <Button variant="gradient" onClick={handleDownloadCard} icon={Download}>
                {t('printId')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Switcher if user has multiple cards */}
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
            {language === 'ta' ? 'அடையாள அட்டை தேர்வு:' : language === 'hi' ? 'क्रेडेंशियल चुनें:' : 'Select Credential:'}
          </span>
          {userDocs.map((d, index) => (
            <button
              key={`${d.uniqueId || d.id || d._id || 'doc'}-${index}`}
              onClick={() => setSelectedDocIndex(index)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: selectedDocIndex === index ? '2px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: selectedDocIndex === index ? '#eff6ff' : '#ffffff',
                color: selectedDocIndex === index ? '#0284c7' : '#334155',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {d.holder} - {d.uniqueId || d.id} ({d.status})
            </button>
          ))}
        </div>
      )}

      {/* Empty State when no Digital ID exists */}
      {userDocs.length === 0 ? (
        <div className="vg-card" style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          maxWidth: '620px',
          margin: '2rem auto',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--primary)',
            border: '1px solid rgba(37,99,235,0.2)'
          }}>
            <QrCode size={34} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {language === 'ta'
              ? 'தரவு எதுவும் இன்னும் கிடைக்கவில்லை (No data available yet).'
              : language === 'hi'
                ? 'अभी कोई डेटा उपलब्ध नहीं है (No data available yet).'
                : 'No data available yet.'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
            {isAnyAdmin
              ? 'Issue an official cryptographically verified digital identity document with dynamic QR verification.'
              : 'Official digital credentials and secure QR codes are issued exclusively by your organization administrator. Please contact your institutional administration office to have your credential issued.'}
          </p>
          {isAnyAdmin ? (
            <Button variant="gradient" onClick={() => setRequestModalOpen(true)} icon={Plus}>
              {language === 'ta' ? 'டிஜிட்டல் ஐடி உருவாக்கு' : language === 'hi' ? 'डिजिटल आईडी बनाएं' : 'Issue Digital ID'}
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/profile">
                <Button variant="secondary">View Profile</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Main Grid: Holographic Card on Left, Specs on Right */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 1.1fr)',
          gap: '2.5rem',
          alignItems: 'start',
          marginBottom: '3rem'
        }} className="id-card-grid">
          {/* Left: Card Render */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DigitalIdCard user={user} document={activeDoc} />

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={() => setQrModalOpen(true)}
              >
                {language === 'ta' ? 'QR குறியீட்டைக் காட்டு' : language === 'hi' ? 'क्यूआर कोड दिखाएं' : 'Show QR Code'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => setQrModalOpen(true)}
              >
                {language === 'ta' ? 'QR பதிவிறக்கு' : language === 'hi' ? 'क्यूआर डाउनलोड करें' : 'Download QR'}
              </Button>
              <Button
                variant="subtle"
                size="sm"
                icon={RefreshCw}
                loading={regenerating}
                onClick={handleRegenerateQR}
              >
                {t('regenerateQr')}
              </Button>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              marginTop: '1rem',
              textAlign: 'center',
              maxWidth: '380px'
            }}>
              {language === 'ta'
                ? 'SHA-256 கிரிப்டோகிராஃபிக் ஹாஷ் மற்றும் மையப்படுத்தப்பட்ட தரவுத்தள சரிபார்ப்பால் பாதுகாக்கப்படுகிறது.'
                : language === 'hi'
                  ? 'SHA-256 क्रिप्टोग्राफ़िक हैश और संस्थागत डेटाबेस सत्यापन द्वारा सुरक्षित।'
                  : 'Protected by SHA-256 asymmetric cryptographic digest. Verified in real-time by institutional root authority.'}
            </p>
          </div>

          {/* Right: Actions, Metadata & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status & Integrity Card */}
            <div className="vg-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {language === 'ta' ? 'அடையாள நிலை' : language === 'hi' ? 'क्रेडेंशियल स्थिति' : 'Credential Status'}
                  </h3>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: activeDoc?.status === 'Active' || activeDoc?.status === 'VALID' ? '#ecfdf5' : activeDoc?.status === 'Expired' || activeDoc?.status === 'EXPIRED' ? '#fffbeb' : '#fef2f2',
                  color: activeDoc?.status === 'Active' || activeDoc?.status === 'VALID' ? '#065f46' : activeDoc?.status === 'Expired' || activeDoc?.status === 'EXPIRED' ? '#92400e' : '#991b1b',
                  border: '1px solid currentColor'
                }}>
                  {activeDoc?.status || 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Unique ID:</span>
                  <code style={{ fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.05)', padding: '0.15rem 0.4rem', borderRadius: '0.3rem' }}>
                    {activeDoc?.uniqueId || activeDoc?.id}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Holder Name:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeDoc?.holder}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                  <span style={{ fontWeight: 600 }}>{activeDoc?.department || 'General'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
                  <span style={{ fontWeight: 600 }}>{activeDoc?.organization || activeDoc?.issuer || 'VeriGlass Registry'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                  <span style={{ fontWeight: 600 }}>{activeDoc?.role || user?.role || 'Member'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Issue Date:</span>
                  <span>{activeDoc?.issueDate ? formatDate(activeDoc.issueDate) : 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Valid Until:</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                    {(activeDoc?.validUntil || activeDoc?.expiryDate) ? formatDate(activeDoc.validUntil || activeDoc.expiryDate) : 'Indefinite'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>QR Verification Token:</span>
                  <code style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                    {activeDoc?.qrToken ? `${activeDoc.qrToken.substring(0, 18)}...` : activeDoc?.uniqueId}
                  </code>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="vg-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
                {language === 'ta' ? 'சரிபார்ப்பு விருப்பங்கள்' : language === 'hi' ? 'सत्यापन विकल्प' : 'Verification Options'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleCopyShareLink}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Copy size={16} />
                  <span>{language === 'ta' ? 'பொது சரிபார்ப்பு இணைப்பை நகலெடு' : language === 'hi' ? 'सार्वजनिक सत्यापन लिंक कॉपी करें' : 'Copy Public Verification Link'}</span>
                </button>
                <button
                  onClick={handleDownloadCard}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Printer size={16} />
                  <span>{language === 'ta' ? 'அடையாள அட்டையை அச்சிடு' : language === 'hi' ? 'पहचान पत्र प्रिंट करें' : 'Print Official Digital ID Card'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title={language === 'ta' ? 'டிஜிட்டல் அடையாளத்தைப் பகிரவும்' : language === 'hi' ? 'डिजिटल पहचान साझा करें' : 'Share Digital Identity'}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {language === 'ta'
            ? 'இந்த இணைப்பைப் பயன்படுத்தி எவரும் உங்கள் சான்றிதழைப் பாதுகாப்பாகச் சரிபார்க்கலாம்:'
            : language === 'hi'
              ? 'इस लिंक का उपयोग करके कोई भी व्यक्ति आपके क्रेडेंशियल को सुरक्षित रूप से सत्यापित कर सकता है:'
              : 'Anyone with this link can cryptographically verify your credential without requiring an account:'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)'
            }}
          />
          <Button variant="primary" size="sm" onClick={handleCopyShareLink}>
            {language === 'ta' ? 'நகலெடு' : language === 'hi' ? 'कॉपी करें' : 'Copy'}
          </Button>
        </div>
      </Modal>

      {/* Request New Identity Application Modal */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title={language === 'ta' ? 'டிஜிட்டல் அடையாளத்தை உருவாக்கவும்' : language === 'hi' ? 'डिजिटल पहचान बनाएं' : 'Create Digital Identity'}>
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.holder}
              onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              placeholder="e.g. John Doe"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Identity Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Student ID Card"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Role / Designation
              </label>
              <input
                type="text"
                value={formData.designationOrCourse}
                onChange={(e) => setFormData({ ...formData, designationOrCourse: e.target.value })}
                placeholder="e.g. Student / Verifier / Officer"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Organization
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. National College of Technology"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Valid Until (Expiry Date) *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Generate & Enroll
            </Button>
          </div>
        </form>
      </Modal>

      {/* Show & Download QR Code Modal (Section 17 Specification) */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={language === 'ta' ? 'அதிகாரப்பூர்வ சரிபார்ப்பு QR குறியீடு' : language === 'hi' ? 'आधिकारिक सत्यापन क्यूआर कोड' : 'Official Verification QR Code'}
      >
        <div style={{ padding: '0.5rem 0', textAlign: 'center' }}>
          <QRCodeDisplay
            value={shareUrl}
            title={activeDoc?.name || 'Digital Identity'}
            subtitle={language === 'ta' ? 'அங்கீகரிக்கப்பட்ட சரிபார்ப்பாளரிடம் இந்த QR குறியீட்டைக் காட்டவும்' : language === 'hi' ? 'अधिकृत सत्यापनकर्ता को यह क्यूआर कोड दिखाएं' : 'Show this QR code to an authorized verifier'}
            size={220}
          />
        </div>
      </Modal>
    </div>
  );
}

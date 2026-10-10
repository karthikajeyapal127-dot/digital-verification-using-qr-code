import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight,
  RefreshCw,
  Scan,
  Zap,
  Shield
} from 'lucide-react';
import QRScanner from '../components/verification/QRScanner';
import VerificationResult from '../components/verification/VerificationResult';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { useVerification } from '../context/VerificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';

export default function VerificationVaultPage() {
  const { documents, activities, lastVerifiedDoc, setLastVerifiedDoc } = useVerification();
  const [verificationResult, setVerificationResult] = useState(null);
  const { t, language } = useLanguage();

  const handleScanFinished = (result) => {
    setVerificationResult(result);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
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
            Verification Vault
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Cryptographically scan, extract, and authenticate QR credentials against the root trust ledger.
          </p>
        </div>

        <Link to="/history">
          <Button variant="secondary" icon={History}>
            View Full History
          </Button>
        </Link>
      </div>

      {/* Grid: Scanner Area on Left, Verification Info Card on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '2.5rem'
      }} className="vault-grid">
        {/* Left: Interactive Scanner Terminal */}
        <div>
          <QRScanner onScanComplete={handleScanFinished} />
        </div>

        {/* Right: Document Verification Information Card */}
        <div>
          {verificationResult ? (
            <VerificationResult
              result={verificationResult}
              document={verificationResult.doc}
              onReset={() => setVerificationResult(null)}
            />
          ) : (
            <div className="vg-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                border: '2px dashed var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--primary)'
              }}>
                <Scan size={32} />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid var(--border-color)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                <span>
                  {language === 'ta' ? 'ஸ்கேனர் காத்திருக்கிறது' : language === 'hi' ? 'स्कैनर प्रतीक्षा में है' : 'Optical Engine Standby'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {language === 'ta'
                  ? 'QR குறியீடு ஸ்கேன் செய்ய காத்திருக்கிறது'
                  : language === 'hi'
                    ? 'QR कोड स्कैन की प्रतीक्षा में'
                    : 'Awaiting QR Code Scan'}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '380px', margin: '0 auto 1.5rem' }}>
                {language === 'ta'
                  ? 'கேமராவில் உண்மையான QR குறியீட்டைக் காட்டவும் அல்லது படத்தை பதிவேற்றவும். உண்மை சரிபார்ப்பு மற்றும் தணிக்கை முடிவுகள் ஸ்கேன் செய்த பிறகு மட்டுமே காட்டப்படும்.'
                  : language === 'hi'
                    ? 'कैमरे के सामने असली QR कोड लाएं या छवि अपलोड करें। प्रामाणिक सत्यापन परिणाम स्कैन के बाद ही प्रदर्शित होंगे।'
                    : 'Point your camera at a physical ID card or document, upload a QR code image, or select a test credential on the left to verify.'}
              </p>

              {/* 3-Step Verification Pipeline Infographic */}
              <div style={{
                textAlign: 'left',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '0.85rem',
                padding: '1rem',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>1</span>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                      {language === 'ta' ? 'நேரடி கேமரா / பட ஸ்கேனிங்' : language === 'hi' ? 'लाइव कैमरा / छवि स्कैनिंग' : 'Optical Capture'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {language === 'ta' ? 'jsQR இயந்திரம் மூலம் உண்மையான பிக்சல் பகுப்பாய்வு' : language === 'hi' ? 'jsQR मैट्रिक्स द्वारा पिक्सेल डिकोडिंग' : 'jsQR matrix frame analyzer'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>2</span>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                      {language === 'ta' ? 'கிரிப்டோகிராஃபிக் சரிபார்ப்பு' : language === 'hi' ? 'क्रिप्टोग्राफिक सत्यापन' : 'Cryptographic Hash Check'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {language === 'ta' ? 'SHA-256 டிஜிட்டல் கையொப்பம் சரிபார்க்கப்படுகிறது' : language === 'hi' ? 'SHA-256 डिजिटल हस्ताक्षर का मिलान' : 'SHA-256 seal verified against root ledger'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>3</span>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                      {language === 'ta' ? 'டைனமிக் டிரஸ்ட் மற்றும் ரிஸ்க் ஸ்கோர்' : language === 'hi' ? 'डायनामिक ट्रस्ट और जोखिम स्कोर' : 'Multi-Factor Trust Score'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {language === 'ta' ? '6 காரணிகள் அடிப்படையில் முடிவு வெளியிடப்படும்' : language === 'hi' ? '6 सुरक्षा कारकों के आधार पर परिणाम' : 'Algorithmic 0-100 score + explainable factors'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="vg-card" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recently Verified Documents
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Audit stream of recent documents scanned in your current session
            </p>
          </div>
          <Link to="/history">
            <Button variant="subtle" size="sm" iconRight={ArrowRight}>
              View Full History
            </Button>
          </Link>
        </div>

        <div className="vg-table-container">
          <table className="vg-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Verification ID</th>
                <th>Verification Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No data available yet.
                  </td>
                </tr>
              ) : (
                activities.slice(0, 4).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.document}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{item.verificationId}</td>
                    <td>{item.date} at {item.time}</td>
                    <td><StatusBadge status={item.status} size="sm" /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/secure-verification?id=${item.verificationId}`}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                          Inspect
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .vault-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

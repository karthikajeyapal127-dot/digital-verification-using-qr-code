import { useState } from 'react';
import { Mail, X, Copy, Check, ShieldCheck, QrCode, ExternalLink, Download, Send } from 'lucide-react';
import Button from './Button';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function EmailNotificationModal({
  isOpen,
  onClose,
  emailData,
  onUseId
}) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const { language } = useLanguage();

  if (!isOpen || !emailData) return null;

  const digitalId = emailData.digitalId || 'DID-PENDING';
  const recipientName = emailData.recipientName || 'Member';
  const toEmail = emailData.to || '';
  const docName = emailData.docName || 'Digital Identity Document';
  const subject = emailData.subject || `🎓 Official Digital Verification ID: ${digitalId}`;
  const timestamp = emailData.timestamp ? new Date(emailData.timestamp).toLocaleString() : new Date().toLocaleString();

  const handleCopyId = () => {
    navigator.clipboard.writeText(digitalId);
    setCopied(true);
    addToast(
      language === 'ta'
        ? `✓ ஐடி நகலெடுக்கப்பட்டது: ${digitalId}`
        : language === 'hi'
          ? `✓ आईडी कॉपी की गई: ${digitalId}`
          : `✓ Copied Verification ID: ${digitalId}`,
      'success'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseAndClose = () => {
    if (onUseId) {
      onUseId(digitalId);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Email Client Top Bar */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={18} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
                {language === 'ta' ? 'அதிகாரப்பூர்வ மின்னஞ்சல் அறிவிப்பு' : language === 'hi' ? 'आधिकारिक ईमेल अधिसूचना' : 'Institutional Email Notification'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Apex Institute Academic Credential Registry
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Email Headers Meta */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          fontSize: '0.82rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <strong style={{ color: '#64748b', width: '65px' }}>From:</strong>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Apex Institute Registry &lt;registry@apex.edu&gt;</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <strong style={{ color: '#64748b', width: '65px' }}>To:</strong>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>{toEmail} ({recipientName})</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <strong style={{ color: '#64748b', width: '65px' }}>Subject:</strong>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{subject}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <strong style={{ color: '#64748b', width: '65px' }}>Date:</strong>
            <span style={{ color: '#64748b' }}>{timestamp}</span>
          </div>
        </div>

        {/* Email Body Content */}
        <div style={{ padding: '1.75rem 1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          {/* Official Letterhead Banner */}
          <div style={{
            borderBottom: '2px solid #0284c7',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                APEX INSTITUTE OF SCIENCE & TECHNOLOGY
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Office of Credential Verification & Cryptographic Ledger
              </span>
            </div>
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#065f46',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              <ShieldCheck size={14} />
              <span>OFFICIAL SEAL</span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Dear <strong>{recipientName}</strong>,
          </p>
          <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {language === 'ta'
              ? `உங்கள் அதிகாரப்பூர்வ டிஜிட்டல் சான்றிதழ் (${docName}) வெற்றிகரமாக அங்கீகரிக்கப்பட்டு கிரிப்டோகிராஃபிக் முறையில் முத்திரையிடப்பட்டுள்ளது. உங்கள் தனித்துவமான டிஜிட்டல் சரிபார்ப்பு ஐடி (Verification ID) கீழே வழங்கப்பட்டுள்ளது:`
              : language === 'hi'
                ? `आपका आधिकारिक डिजिटल क्रेडेंशियल (${docName}) अनुमोदित कर दिया गया है। आपका विशिष्ट डिजिटल सत्यापन आईडी (Verification ID) नीचे दिया गया है:`
                : `We are pleased to notify you that your official institutional credential (${docName}) has been approved and registered in the root trust ledger. Your permanent Digital Verification ID is detailed below:`}
          </p>

          {/* HIGHLIGHTED DVID BOX (The exact ID the user needs) */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px dashed #0284c7',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0369a1',
              display: 'block',
              marginBottom: '0.35rem'
            }}>
              {language === 'ta' ? 'உங்கள் டிஜிட்டல் சரிபார்ப்பு ஐடி (VERIFICATION ID)' : language === 'hi' ? 'आपकी डिजिटल सत्यापन आईडी (VERIFICATION ID)' : 'YOUR DIGITAL VERIFICATION ID (DVID)'}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '0.5rem 0'
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0284c7',
                letterSpacing: '0.04em'
              }}>
                {digitalId}
              </span>

              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  backgroundColor: copied ? '#10b981' : '#ffffff',
                  color: copied ? '#ffffff' : '#0284c7',
                  border: '1px solid #bae6fd',
                  borderRadius: '0.55rem',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
              {language === 'ta'
                ? 'இந்த ஐடியை QR ஸ்கேனரின் "Enter ID" பகுதியில் உள்ளிட்டு உடனடியாக சரிபார்க்கலாம்.'
                : language === 'hi'
                  ? 'इस आईडी को QR स्कैनर के "Enter ID" बॉक्स में दर्ज करके तुरंत जांच सकते हैं।'
                  : 'You can type or paste this exact ID in the "Enter ID" box of the QR Scanner to verify.'}
            </p>
          </div>

          {/* Quick Credential Summary Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.85rem',
            padding: '1rem',
            fontSize: '0.8rem',
            marginBottom: '1.25rem'
          }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Credential
              </span>
              <strong style={{ color: '#0f172a' }}>{docName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Status
              </span>
              <strong style={{ color: '#10b981' }}>Active / Verified ✓</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Issuing Body
              </span>
              <span style={{ color: '#0f172a' }}>Apex Institute of Science & Tech</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Valid Until
              </span>
              <span style={{ color: '#0f172a' }}>{emailData.expiryDate || '2031-06-15'}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
            This is an automated institutional notification generated by the VeriGlass Cryptographic Digital Verification Engine.
          </p>
        </div>

        {/* Modal Bottom Actions */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={handleCopyId}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Verification ID'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onUseId && (
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={handleUseAndClose}
              >
                {language === 'ta' ? 'ஐடியை ஸ்கேனரில் நிரப்புக' : language === 'hi' ? 'स्कैनर में आईडी भरें' : 'Paste Into Scanner & Verify'}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

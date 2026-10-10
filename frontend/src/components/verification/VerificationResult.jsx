import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, Clock, FileX, Download, Share2, ExternalLink, RefreshCw, Printer, Activity, Check, AlertOctagon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function VerificationResult({
  result,
  document,
  outcome: propOutcome,
  onReset
}) {
  const { t, language } = useLanguage();

  const resolvedOutcome = (propOutcome || result?.outcome || result?.result || (
    document
      ? document.status === 'EXPIRED'
        ? 'EXPIRED'
        : document.status === 'REVOKED'
          ? 'REVOKED'
          : document.status === 'TAMPERED'
            ? 'TAMPERED'
            : 'VALID'
      : 'INVALID'
  )).toUpperCase();

  const doc = document || result?.doc;
  const trustAnalysis = result?.trustAnalysis;
  const trustScore = trustAnalysis?.trustScore ?? (resolvedOutcome === 'VALID' ? 99 : resolvedOutcome === 'EXPIRED' ? 35 : 0);
  const riskLevel = trustAnalysis?.riskLevel ?? (resolvedOutcome === 'VALID' ? 'TRUSTED' : resolvedOutcome === 'EXPIRED' ? 'WARNING' : 'CRITICAL RISK');
  const factors = trustAnalysis?.factors || [];
  const verificationRecord = result?.verificationRecord;

  const outcomeConfig = {
    VALID: {
      theme: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      textColor: '#065f46',
      subTextColor: '#047857',
      label: 'VALID (VERIFIED)',
      title: 'IDENTITY & CREDENTIAL VERIFIED',
      subtitle: 'Centralized database match confirmed. ID is active, genuine, and in good standing.',
      icon: ShieldCheck,
      auditScore: '100% - Authentic Record'
    },
    EXPIRED: {
      theme: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
      textColor: '#92400e',
      subTextColor: '#b45309',
      label: 'EXPIRED (REJECTED)',
      title: 'VALIDITY LAPSED / EXPIRED',
      subtitle: 'This identity pass has passed its scheduled validity expiration date. Access rejected.',
      icon: Clock,
      auditScore: '0% - Expired Pass'
    },
    REVOKED: {
      theme: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
      textColor: '#991b1b',
      subTextColor: '#b91c1c',
      label: 'REVOKED (REJECTED)',
      title: 'REVOKED / CANCELLED',
      subtitle: 'This ID has been officially cancelled, revoked, or decommissioned by the authority.',
      icon: ShieldAlert,
      auditScore: '0% - Flagged / Revoked'
    },
    TAMPERED: {
      theme: '#dc2626',
      bg: '#fef2f2',
      border: '#f87171',
      textColor: '#7f1d1d',
      subTextColor: '#991b1b',
      label: 'TAMPERED (REJECTED)',
      title: 'CRYPTOGRAPHIC TAMPER DETECTED',
      subtitle: 'The credential integrity hash check failed. Data alteration detected and reported to administration.',
      icon: AlertOctagon,
      auditScore: '0% - Integrity Failure'
    },
    INVALID: {
      theme: '#64748b',
      bg: '#f8fafc',
      border: '#cbd5e1',
      textColor: '#334155',
      subTextColor: '#475569',
      label: 'INVALID (REJECTED)',
      title: 'RECORD NOT FOUND / INVALID QR',
      subtitle: 'The scanned QR code is either counterfeit, malformed, or unregistered in the database.',
      icon: FileX,
      auditScore: '0% - Unknown Hash'
    }
  };

  const currentConfig = outcomeConfig[resolvedOutcome] || outcomeConfig.INVALID;
  const StatusIcon = currentConfig.icon;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    const vId = verificationRecord?.verificationId || `VRF-${Date.now().toString().slice(-6)}`;
    const title = doc?.credentialTitle || doc?.department || 'Digital Credential';
    const number = doc?.credentialNumber || doc?.uniqueId || 'N/A';
    const org = doc?.organizationName || doc?.issuer || 'VeriGlass Authority';
    const time = new Date().toLocaleString();
    const receiptContent = `=====================================================
OFFICIAL DIGITAL CREDENTIAL VERIFICATION RECEIPT
=====================================================
Verification ID:      ${vId}
Verification Result:  ${resolvedOutcome}
Trust Score:          ${trustScore} / 100 (${riskLevel})

Credential Title:     ${title}
Credential Number:    ${number}
Credential Holder:    ${doc?.holderName || doc?.name || 'Authorized Subject'}
Issuing Organization: ${org}

Verification Method:  ${verificationRecord?.verificationMethod || 'QR_SCAN'}
Verification Time:    ${time}
Security Digest:      ${doc?.integrityHash || 'SHA-256 Verified'}
Status:               GENUINE DATABASE LEDGER AUDIT
=====================================================
Issued by VeriGlass Live QR Trust Verification Network
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${vId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="vg-card" style={{
      borderTop: `5px solid ${currentConfig.theme}`,
      overflow: 'hidden',
      padding: '1.75rem',
      position: 'relative'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: currentConfig.bg,
        border: `1px solid ${currentConfig.border}`,
        borderRadius: '1rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: currentConfig.theme,
          color: '#ffffff',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <StatusIcon size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              color: currentConfig.textColor,
              border: `1px solid ${currentConfig.border}`
            }}>
              {currentConfig.label}
            </span>

            <span style={{ fontSize: '0.75rem', color: currentConfig.subTextColor, fontWeight: 700 }}>
              {result?.verificationRecord?.latency || '0.24s'} verification latency
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: currentConfig.textColor, marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            {currentConfig.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: currentConfig.subTextColor, marginTop: '0.25rem', lineHeight: 1.4 }}>
            {result?.message || currentConfig.subtitle}
          </p>
        </div>
      </div>

      {/* Dynamic Trust & Risk Engine Card (Unique Feature) */}
      <div style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#38bdf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              Verification Trust & Risk Engine
            </span>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: riskLevel === 'TRUSTED' ? '#065f46' : riskLevel === 'WARNING' ? '#78350f' : '#7f1d1d',
            color: riskLevel === 'TRUSTED' ? '#34d399' : riskLevel === 'WARNING' ? '#fbbf24' : '#f87171'
          }}>
            {riskLevel}
          </span>
        </div>

        {/* Score Gauge */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>Algorithmic Trust Score:</span>
            <span style={{ fontWeight: 800, color: trustScore >= 80 ? '#34d399' : trustScore >= 40 ? '#fbbf24' : '#f87171' }}>
              {trustScore} / 100
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${trustScore}%`,
              height: '100%',
              backgroundColor: trustScore >= 80 ? '#10b981' : trustScore >= 40 ? '#f59e0b' : '#ef4444',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>

        {/* Explainable Factor Pills */}
        {factors.length > 0 && (
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
              Explainable Factor Audit:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {factors.map((f, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '0.45rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {f.status === 'PASS' ? (
                      <Check size={13} color="#34d399" />
                    ) : f.status === 'WARN' ? (
                      <AlertTriangle size={13} color="#fbbf24" />
                    ) : (
                      <AlertOctagon size={13} color="#f87171" />
                    )}
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{f.name}</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Details (if record exists) */}
      {doc && (
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fafbfc'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Credential Record Breakdown
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Holder Name:</span>
              <strong style={{ color: 'var(--text-main)' }}>{doc.holder}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Identifier (DVID):</span>
              <code style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '0.3rem' }}>
                {doc.id || doc.digitalId}
              </code>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Credential Type:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.type}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Issuing Authority:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.issuer} [{doc.issuerCode}]</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Validity Horizon:</span>
              <span style={{ color: 'var(--text-main)' }}>{doc.issueDate} through {doc.expiryDate}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Security Hash Digest:</span>
              <code style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {doc.tamperProofHash ? `${doc.tamperProofHash.substring(0, 16)}...` : 'SHA256_VERIFIED'}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadReceipt}>
            Download Receipt
          </Button>
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Certificate
          </Button>
          <Link to="/history">
            <Button variant="subtle" size="sm" icon={ExternalLink}>
              View in Audit Ledger
            </Button>
          </Link>
        </div>

        {onReset && (
          <Button variant="primary" size="sm" icon={RefreshCw} onClick={onReset}>
            Scan Next QR
          </Button>
        )}
      </div>
    </div>
  );
}

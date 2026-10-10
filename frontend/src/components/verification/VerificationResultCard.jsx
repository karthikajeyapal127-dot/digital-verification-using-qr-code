import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, Download, Share2, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDate, truncateHash } from '../../utils/formatters';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

export default function VerificationResultCard({
  document,
  isRevoked = false,
  onReset
}) {
  if (!document) return null;

  const isValid = document.status === 'VERIFIED' && !isRevoked;

  return (
    <div className="vg-card" style={{
      borderTop: `4px solid ${isValid ? '#10b981' : '#ef4444'}`,
      overflow: 'hidden',
      padding: '1.75rem'
    }}>
      {/* Banner / Status Indicator */}
      <div style={{
        backgroundColor: isValid ? '#ecfdf5' : '#fef2f2',
        border: `1px solid ${isValid ? '#a7f3d0' : '#fecaca'}`,
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: isValid ? '#10b981' : '#ef4444',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${isValid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
        }}>
          {isValid ? <ShieldCheck size={26} strokeWidth={2.5} /> : <ShieldAlert size={26} strokeWidth={2.5} />}
        </div>

        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isValid ? '#065f46' : '#991b1b'
          }}>
            {isValid ? 'Official Verification Passed' : 'Cryptographic Integrity Alert'}
          </span>
          <h3 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: isValid ? '#065f46' : '#991b1b',
            letterSpacing: '-0.02em',
            margin: '0.1rem 0'
          }}>
            {isValid ? 'DOCUMENT VERIFIED' : 'VERIFICATION FAILED'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: isValid ? '#047857' : '#b91c1c' }}>
            {isValid
              ? 'Institutional cryptographic signature confirmed against root trust registry.'
              : 'Signatures do not match institutional root digest or document is flagged REVOKED.'}
          </p>
        </div>
      </div>

      {/* Security Checklist */}
      <div style={{
        backgroundColor: '#fafbfc',
        borderRadius: '0.875rem',
        padding: '1rem 1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: isValid ? '#065f46' : '#991b1b' }}>
            {isValid ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
            <span>Identity Verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: isValid ? '#065f46' : '#991b1b' }}>
            {isValid ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
            <span>Document Authentic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: isValid ? '#065f46' : '#991b1b' }}>
            {isValid ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
            <span>Digital Signature Valid</span>
          </div>
        </div>
      </div>

      {/* Credential Data Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.85rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Document Name</span>
          <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>{document.name}</p>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Holder Name</span>
          <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>{document.holder} ({document.holderId || 'N/A'})</p>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Issuing Organization</span>
          <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>{document.issuer}</p>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Verification ID</span>
          <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-dark)', marginTop: '0.15rem' }}>{document.id}</p>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Issue Date</span>
          <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem' }}>{formatDate(document.issueDate)}</p>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Verified Timestamp</span>
          <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem' }}>Just now (Synchronized)</p>
        </div>
      </div>

      {/* Cryptographic Proof Card */}
      <div style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '1rem',
        borderRadius: '0.75rem',
        fontSize: '0.75rem',
        marginBottom: '1.5rem',
        fontFamily: 'monospace'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ color: '#38bdf8' }}>Cryptographic SHA-256 Digest:</span>
          <span style={{ color: isValid ? '#34d399' : '#f87171' }}>{isValid ? 'VALIDATED' : 'INTEGRITY_FAIL'}</span>
        </div>
        <p style={{ wordBreak: 'break-all', color: '#e2e8f0' }}>{document.digitalSignature}</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {onReset && (
          <Button variant="secondary" onClick={onReset} icon={RefreshCw}>
            Verify Again
          </Button>
        )}
        <Link to={`/secure-verification?id=${document.id}`} style={{ flex: 1 }}>
          <Button variant="primary" style={{ width: '100%' }} icon={ExternalLink}>
            View Official Public Certificate
          </Button>
        </Link>
        <Link to="/identity-card">
          <Button variant="outline">
            Open Digital Card
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { Shield, Award, CheckCircle2, Lock } from 'lucide-react';
import QRCodeCard from './QRCodeCard';
import { formatDate } from '../../utils/formatters';

export default function DocumentPreview({ document }) {
  if (!document) return null;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '8px solid #f8fafc',
      boxShadow: 'var(--shadow-elevated)',
      borderRadius: '1.25rem',
      padding: '2.5rem 2rem',
      position: 'relative',
      fontFamily: "'Georgia', serif",
      color: '#1e293b',
      maxWidth: '680px',
      margin: '0 auto',
      outline: '1px solid #cbd5e1'
    }}>
      {/* Ornamental Inner Border */}
      <div style={{
        border: '2px solid #e2e8f0',
        padding: '2rem 1.75rem',
        borderRadius: '0.75rem',
        position: 'relative',
        backgroundColor: '#fefefe'
      }}>
        {/* Certificate Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            margin: '0 auto 0.75rem',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            border: '2px solid #2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#0f172a',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {document.issuer}
          </h2>
          <p style={{
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#64748b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginTop: '0.2rem'
          }}>
            Office of Academic Registry · Institutional Accreditation Seal
          </p>
        </div>

        {/* Certificate Text */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem' }}>
            This officially certifies that
          </p>
          <h3 style={{
            fontSize: '1.85rem',
            fontWeight: 700,
            color: '#1e3a8a',
            letterSpacing: '-0.01em',
            margin: '0.5rem 0',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.5rem',
            display: 'inline-block'
          }}>
            {document.holder}
          </h3>
          <p style={{ fontStyle: 'italic', fontSize: '0.925rem', color: '#475569', marginTop: '0.75rem' }}>
            has successfully satisfied all academic regulations and is awarded
          </p>
          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            marginTop: '0.5rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {document.name}
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginTop: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {document.grade}
          </p>
        </div>

        {/* Bottom Signatures & QR Seal */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px dashed #cbd5e1'
        }}>
          {/* Signatory */}
          <div style={{ textAlign: 'left', maxWidth: '200px' }}>
            <div style={{
              fontFamily: "'Brush Script MT', cursive, serif",
              fontSize: '1.35rem',
              color: '#1e3a8a',
              marginBottom: '0.25rem'
            }}>
              Ronald Vance
            </div>
            <div style={{ height: '1px', backgroundColor: '#94a3b8', marginBottom: '0.35rem' }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {document.authorizedSignatory}
            </p>
            <p style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Issue Date: {formatDate(document.issueDate)}
            </p>
          </div>

          {/* Embedded QR Code Stamp */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-block'
            }}>
              <QRCodeCard
                value={document.id}
                title=""
                subtitle=""
                size={85}
                showActions={false}
              />
            </div>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              color: '#64748b',
              fontWeight: 700,
              letterSpacing: '0.04em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: '0.25rem'
            }}>
              ID: {document.id}
            </span>
          </div>
        </div>

        {/* Security watermark footer */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.65rem',
          color: '#94a3b8',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <Lock size={12} color="#10b981" />
          <span>VeriGlass Cryptographically Verified Record · Immutable Digital Identity</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Sparkles,
  Printer,
  Copy,
  ExternalLink,
  GraduationCap,
  Building,
  Calendar,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import { generateQRMatrix, getQRSVGPath } from '../utils/qrGenerator';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/formatters';
import { playScanSuccessSound, playClickTone } from '../utils/audioEffects';

export default function CertificateStudioPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const certificateRef = useRef(null);

  const [template, setTemplate] = useState('DEGREE'); // DEGREE, DIPLOMA, EXCELLENCE
  const [candidateName, setCandidateName] = useState(user?.name || 'J. Karthika');
  const [degreeTitle, setDegreeTitle] = useState('Bachelor of Technology in Computer Science & Engineering');
  const [institution, setInstitution] = useState('Apex Institute of Science & Technology');
  const [regNumber, setRegNumber] = useState('AIST-2022-CSE-042');
  const [cgpa, setCgpa] = useState('8.94 / 10.00 First Class with Distinction');
  const [convocationDate, setConvocationDate] = useState('October 15, 2026');
  const [signatureAuthority, setSignatureAuthority] = useState('Dr. Evelyn Scott, Ph.D. — Vice-Chancellor');

  // Dynamic Cryptographic Token calculation
  const cryptoHash = '0x7e3a98f1c42b789d9e01f568a2bc4e7d98124b89c7219f8016ba34cf91d8e12a';
  const qrVerificationUrl = `${window.location.origin}/verify/7373dd6f5a636c6047decb13a499f4484c44d2b366336ce0c359a3024c2bf8d6`;

  const handlePrint = () => {
    playClickTone();
    window.print();
  };

  const handleCopyHash = () => {
    copyToClipboard(cryptoHash);
    playScanSuccessSound();
    addToast('Cryptographic SHA-256 seal copied to clipboard!', 'success');
  };

  const handleCopyLink = () => {
    copyToClipboard(qrVerificationUrl);
    playClickTone();
    addToast('Public verification link copied!', 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main, #030712)',
      color: 'var(--text-main, #f8fafc)',
      padding: '2.5rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}>
              <Sparkles size={14} />
              <span>OFFICIAL ACADEMIC CREDENTIAL STUDIO</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Holographic Degree & Certificate Studio
            </h1>
            <p style={{ color: 'var(--text-muted, #94a3b8)', marginTop: '0.5rem', marginBottom: 0 }}>
              Issue, inspect, and mathematically verify tamper-proof university degrees with embedded SHA-256 QR seals.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Share2 size={16} />
              <span>Copy Verification Link</span>
            </button>
          </div>
        </div>

        {/* Studio Layout: Left Controls + Right Live Certificate */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          
          {/* Controls Panel */}
          <div style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '1.5rem',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Layers size={18} color="#38bdf8" />
              <span>Credential Customizer</span>
            </h3>

            {/* Template Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                CERTIFICATE TEMPLATE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'DEGREE', label: '🎓 B.Tech Degree' },
                  { id: 'DIPLOMA', label: '📜 Diploma' },
                  { id: 'EXCELLENCE', label: '🏆 Honors' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplate(t.id);
                      playClickTone();
                    }}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '0.65rem',
                      border: template === t.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: template === t.id ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: template === t.id ? '#38bdf8' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                GRADUATE / CANDIDATE NAME
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Degree Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                DEGREE PROGRAM / SPECIALIZATION
              </label>
              <input
                type="text"
                value={degreeTitle}
                onChange={(e) => setDegreeTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Registration Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  REGISTRATION NO.
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  CONVOCATION DATE
                </label>
                <input
                  type="text"
                  value={convocationDate}
                  onChange={(e) => setConvocationDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Cryptographic Seal info */}
            <div style={{
              marginTop: '1.75rem',
              padding: '1.25rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px dashed rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#60a5fa' }}>
                  🔒 SHA-256 LEDGER PROOF HASH
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
              <code style={{ fontSize: '0.72rem', color: '#93c5fd', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {cryptoHash}
              </code>
            </div>
          </div>

          {/* Right Preview: High-Security Guilloche Academic Certificate */}
          <div style={{ position: 'relative' }}>
            <div
              ref={certificateRef}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '1rem',
                padding: '3rem 2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.1)',
                border: '12px double #1e293b',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'serif'
              }}
            >
              {/* Subtle Guilloche Watermark Pattern */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.035,
                pointerEvents: 'none',
                background: 'radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle at 50% 50%, #000 5%, transparent 6%)',
                backgroundSize: '24px 24px'
              }} />

              {/* Certificate Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  boxShadow: '0 4px 10px rgba(30, 58, 138, 0.25)'
                }}>
                  <GraduationCap size={32} />
                </div>
                <h2 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  margin: '0 0 0.25rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {institution}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                  Accredited by National Cryptographic Identity Board · ISO 27001 Certified
                </span>
              </div>

              {/* Certificate Body */}
              <div style={{ textAlign: 'center', padding: '0 1rem', marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '1rem', color: '#475569', margin: '0 0 1rem', letterSpacing: '0.05em' }}>
                  This is to certify that
                </p>

                <h3 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  margin: '0 0 1rem',
                  letterSpacing: '0.02em',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                  textDecorationColor: '#f59e0b'
                }}>
                  {candidateName}
                </h3>

                <p style={{ fontSize: '1rem', color: '#475569', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                  has successfully fulfilled the prescribed curriculum and passed all rigorous evaluations for the conferral of
                </p>

                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  display: 'inline-block',
                  margin: '0 0 1.25rem'
                }}>
                  {degreeTitle}
                </div>

                <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 0.5rem' }}>
                  Classification: <strong>{cgpa}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Registration ID: <strong>{regNumber}</strong> · Conferred on <strong>{convocationDate}</strong>
                </p>
              </div>

              {/* Certificate Footer: Official Seal + QR Code + Signature */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                borderTop: '2px solid #e2e8f0',
                gap: '1.5rem'
              }}>
                {/* Official Golden Seal */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #d97706, #fef08a, #d97706, #b45309, #fef08a, #d97706)',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#78350f',
                    padding: '4px',
                    margin: '0 auto 0.5rem'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '2px dashed #78350f',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(254, 240, 138, 0.4)'
                    }}>
                      <ShieldCheck size={28} color="#78350f" />
                      <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.05em' }}>VERIFIED</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#78350f', textTransform: 'uppercase' }}>
                    Institutional Seal
                  </span>
                </div>

                {/* Embedded High-Security Cryptographic QR Code */}
                <div style={{
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid #cbd5e1'
                }}>
                  {(() => {
                    const qrSize = 88;
                    const { matrix, size: matrixSize } = generateQRMatrix(qrVerificationUrl);
                    const cellSize = qrSize / matrixSize;
                    const pathData = getQRSVGPath(matrix, matrixSize, cellSize);
                    return (
                      <svg width={qrSize} height={qrSize} viewBox={`0 0 ${qrSize} ${qrSize}`} style={{ display: 'block', margin: '0 auto' }}>
                        <path d={pathData} fill="#0f172a" />
                      </svg>
                    );
                  })()}
                  <div style={{ marginTop: '0.4rem', fontSize: '0.62rem', fontWeight: 800, color: '#1e3a8a' }}>
                    SCAN TO VERIFY
                  </div>
                </div>

                {/* Vice Chancellor Signature */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Brush Script MT, cursive, serif',
                    fontSize: '1.65rem',
                    color: '#1e3a8a',
                    marginBottom: '0.25rem'
                  }}>
                    Evelyn Scott
                  </div>
                  <div style={{ height: '1px', width: '160px', backgroundColor: '#334155', marginLeft: 'auto', marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block' }}>
                    {signatureAuthority}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    Digital Signature Key: 0x8FA4...12C
                  </span>
                </div>
              </div>

              {/* Cryptographic Proof Hash Bar */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: '#475569',
                fontFamily: 'monospace'
              }}>
                <span>SECURITY CERTIFICATE ID: DID-2026-CSE-894</span>
                <span>SHA-256: 7373dd6f5a636c...bf8d6</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

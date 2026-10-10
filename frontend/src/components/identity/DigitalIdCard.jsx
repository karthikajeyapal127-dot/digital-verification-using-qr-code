import { useState, useRef } from 'react';
import { ShieldCheck, QrCode, Sparkles, Award, Lock, CheckCircle2 } from 'lucide-react';
import { generateQRMatrix, getQRSVGPath } from '../../utils/qrGenerator';
import { formatDate } from '../../utils/formatters';

export default function DigitalIdCard({ user, document }) {
  const cardRef = useRef(null);

  const uniqueId = document?.uniqueId || document?.id || user?.id || '';
  const token = document?.verificationToken || document?.qrToken || uniqueId;
  const qrPayload = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${token}`
    : `/verify/${token}`;

  const { matrix, size: matrixSize } = generateQRMatrix(qrPayload || 'VERIFY_TOKEN');
  const cellSize = 75 / matrixSize;
  const pathData = getQRSVGPath(matrix, matrixSize, cellSize);

  const fullName = document?.holder || user?.name || 'Registered Member';
  const roleName = document?.role || user?.role || 'Member';
  const departmentName = document?.department || user?.department || 'General';
  const orgName = document?.organization || user?.organization || 'VeriGlass Registry';
  const issueDateFormatted = document?.issueDate ? formatDate(document.issueDate) : formatDate(new Date().toISOString().split('T')[0]);
  const validUntilFormatted = (document?.validUntil || document?.expiryDate) ? formatDate(document.validUntil || document.expiryDate) : 'Indefinite';
  const statusStr = (document?.status || 'Active').toUpperCase();

  const statusBg = statusStr === 'ACTIVE' || statusStr === 'VALID' ? '#ecfdf5' : statusStr === 'EXPIRED' ? '#fffbeb' : '#fef2f2';
  const statusColor = statusStr === 'ACTIVE' || statusStr === 'VALID' ? '#065f46' : statusStr === 'EXPIRED' ? '#92400e' : '#991b1b';

  return (
    <div className="digital-id-card-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="digital-id-card holographic-sheen" ref={cardRef}>
        {/* Holographic Conic Seal on Top Right */}
        <div className="digital-id-hologram">
          <Sparkles size={22} color="#ffffff" />
        </div>

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(56, 189, 248, 0.25)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#38bdf8" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
                Apex Institute · VeriGlass
              </h4>
              <span style={{ fontSize: '0.65rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Official Cryptographic Identity Pass
              </span>
            </div>
          </div>
        </div>

        {/* Gold Cryptographic Smartchip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '0.35rem',
          background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
          color: '#451a03',
          fontSize: '0.6rem',
          fontWeight: 900,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)',
          marginBottom: '1rem'
        }}>
          <span>✦ SHA-256 HARDWARE CRYPTO SEAL</span>
        </div>

        {/* Profile and QR section */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          {/* Avatar photo with security border */}
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt={fullName}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '1rem',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              backgroundColor: statusStr === 'ACTIVE' || statusStr === 'VALID' ? '#10b981' : '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #1e3a8a'
            }}>
              <CheckCircle2 size={14} />
            </div>
          </div>

          {/* Identity details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: statusBg,
              color: statusColor,
              border: '1px solid currentColor',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              marginBottom: '0.35rem',
              textTransform: 'uppercase'
            }}>
              {statusStr}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {fullName}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 600 }}>
              {roleName} · {departmentName}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#93c5fd', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '0.1rem' }}>
              {orgName}
            </p>
          </div>
        </div>

        {/* Card Data Grid */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          backdropFilter: 'blur(6px)',
          borderRadius: '1rem',
          padding: '0.875rem 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          fontSize: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span style={{ color: '#93c5fd', fontSize: '0.65rem', textTransform: 'uppercase' }}>Unique ID</span>
            <p style={{ fontWeight: 700, fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.03em' }}>{uniqueId || 'NOT ASSIGNED'}</p>
          </div>
          <div>
            <span style={{ color: '#93c5fd', fontSize: '0.65rem', textTransform: 'uppercase' }}>Department</span>
            <p style={{ fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{departmentName}</p>
          </div>
          <div>
            <span style={{ color: '#93c5fd', fontSize: '0.65rem', textTransform: 'uppercase' }}>Issue Date</span>
            <p style={{ fontWeight: 600, color: '#ffffff' }}>{issueDateFormatted}</p>
          </div>
          <div>
            <span style={{ color: '#93c5fd', fontSize: '0.65rem', textTransform: 'uppercase' }}>Valid Until</span>
            <p style={{ fontWeight: 700, color: '#fbbf24' }}>{validUntilFormatted}</p>
          </div>
        </div>

        {/* Bottom QR Code Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#0f172a',
          padding: '0.6rem 0.85rem',
          borderRadius: '0.85rem'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', display: 'block' }}>
              Cryptographic QR Seal
            </span>
            <span style={{ fontSize: '0.625rem', color: '#64748b', fontFamily: 'monospace' }}>
              Scan to verify status
            </span>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: '4px',
            borderRadius: '0.35rem',
            border: '1px solid #cbd5e1'
          }}>
            <svg width="75" height="75" viewBox="0 0 75 75" style={{ display: 'block' }}>
              <rect width="75" height="75" fill="#ffffff" />
              <path d={pathData} fill="#0f172a" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

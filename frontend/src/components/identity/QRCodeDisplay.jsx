import { useState, useRef } from 'react';
import { generateQRMatrix, getQRSVGPath } from '../../utils/qrGenerator';
import { copyToClipboard } from '../../utils/formatters';
import { Download, Copy, Printer, Check, ShieldCheck, QrCode } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

/**
 * QRCodeDisplay Component (MWT Syllabus Component Specification)
 * Generates and displays dynamic scannable QR matrices with real-time vector path rendering,
 * download to PNG, print, copy ID, and cryptographic authenticity seal.
 */
export default function QRCodeDisplay({
  value = 'VG-2026-001284',
  title = 'Digital QR Identity Code',
  subtitle = 'Scan with any camera or verifier terminal',
  size = 220,
  showActions = true,
  documentInfo = null,
  showEmblem = true
}) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);
  const { addToast } = useToast();

  const { matrix, size: matrixSize } = generateQRMatrix(value);
  const cellSize = size / matrixSize;
  const pathData = getQRSVGPath(matrix, matrixSize, cellSize);

  const handleCopy = () => {
    copyToClipboard(value);
    setCopied(true);
    addToast(`Copied QR Payload / ID: ${value}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Identity-${value}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      addToast('QR Code exported as high-resolution PNG!', 'success');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="vg-card" style={{ textAlign: 'center', position: 'relative', padding: '1.75rem' }}>
      {title && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
            <QrCode size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Centralized QR Identity
            </span>
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h4>
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{subtitle}</p>}
        </div>
      )}

      {/* QR Code Container */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        border: '2px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '1.25rem',
        position: 'relative'
      }}>
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: 'block' }}
        >
          <rect width={size} height={size} fill="#ffffff" />
          <path d={pathData} fill="#0f172a" />
        </svg>

        {/* Center Holographic Emblem */}
        {showEmblem && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '42px',
            height: '42px',
            borderRadius: '0.65rem',
            backgroundColor: '#ffffff',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <ShieldCheck size={24} color="var(--primary)" />
          </div>
        )}
      </div>

      {/* Code Text Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#f1f5f9',
        padding: '0.45rem 0.85rem',
        borderRadius: '9999px',
        marginBottom: '1.25rem',
        fontSize: '0.85rem',
        fontWeight: 700,
        fontFamily: 'monospace',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)'
      }}>
        <span>{value}</span>
        <button
          onClick={handleCopy}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
          title="Copy ID"
          type="button"
        >
          {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
        </button>
      </div>

      {documentInfo && (
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem',
          marginBottom: '1.25rem',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div><strong style={{ color: 'var(--text-main)' }}>Holder:</strong> {documentInfo.holder}</div>
          <div><strong style={{ color: 'var(--text-main)' }}>Issuer:</strong> {documentInfo.issuer}</div>
          {documentInfo.expiryDate && (
            <div><strong style={{ color: 'var(--text-main)' }}>Valid Until:</strong> {documentInfo.expiryDate}</div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={handleDownload}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            type="button"
          >
            <Download size={14} />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            type="button"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Print QR"
            type="button"
          >
            <Printer size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

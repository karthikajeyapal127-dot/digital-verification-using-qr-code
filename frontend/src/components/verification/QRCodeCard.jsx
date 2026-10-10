import { useState, useRef } from 'react';
import { generateQRMatrix, getQRSVGPath } from '../../utils/qrGenerator';
import { copyToClipboard } from '../../utils/formatters';
import { Download, Copy, Printer, Check, ShieldCheck, QrCode } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function QRCodeCard({
  value = 'VG-2026-001284',
  title = 'VeriGlass Cryptographic QR',
  subtitle = 'Scan to verify authenticity',
  size = 200,
  showActions = true,
  documentInfo = null
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
    addToast(`Copied Verification ID: ${value}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Generate downloadable SVG or Canvas PNG
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
      downloadLink.download = `VeriGlass-QR-${value}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      addToast('QR Code downloaded as PNG!', 'success');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="vg-card" style={{ textAlign: 'center', position: 'relative' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>

      {/* QR Code Container */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        border: '1.5px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1rem',
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

        {/* Center Emblem */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '38px',
          height: '38px',
          borderRadius: '0.5rem',
          backgroundColor: '#ffffff',
          border: '2px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <ShieldCheck size={20} color="var(--primary)" />
        </div>
      </div>

      {/* Code Text */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#f1f5f9',
        padding: '0.45rem 0.85rem',
        borderRadius: '9999px',
        marginBottom: '1.25rem',
        fontSize: '0.8rem',
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
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
        </button>
      </div>

      {documentInfo && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <p><strong>Holder:</strong> {documentInfo.holder}</p>
          <p><strong>Issuer:</strong> {documentInfo.issuer}</p>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={handleDownload}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <Download size={14} />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Print QR"
          >
            <Printer size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

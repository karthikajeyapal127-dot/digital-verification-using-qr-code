import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Copy, Check, Barcode as BarcodeIcon, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BarcodeDisplay({
  value,
  format = 'CODE128',
  title = '',
  subtitle = '',
  width = 2,
  height = 65,
  displayValue = true,
  showControls = true
}) {
  const svgRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const { language } = useLanguage();

  const cleanValue = (value || 'DVID-2026-CS892').trim();

  useEffect(() => {
    if (svgRef.current && cleanValue) {
      try {
        JsBarcode(svgRef.current, cleanValue, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          font: 'monospace',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 4,
          fontSize: 13,
          background: 'transparent',
          lineColor: '#0f172a',
          margin: 10
        });
      } catch (err) {
        console.warn('JsBarcode rendering note:', err);
      }
    }
  }, [cleanValue, format, width, height, displayValue]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanValue).then(() => {
      setCopied(true);
      addToast(
        language === 'ta'
          ? `✓ பார்-கோடு எண் நகலெடுக்கப்பட்டது: ${cleanValue}`
          : `✓ Barcode value copied: ${cleanValue}`,
        'success'
      );
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barcode-${cleanValue}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Downloaded Barcode (SVG vector)', 'success');
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `Barcode-${cleanValue}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Downloaded Barcode (PNG image)', 'success');
    };
    img.src = url;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      padding: '1.25rem',
      borderRadius: '1rem',
      border: '1.5px solid var(--border-color)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto'
    }}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</div>}
        </div>
      )}

      {/* Barcode SVG Container */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        borderRadius: '0.65rem',
        border: '1px solid #e2e8f0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        color: '#64748b',
        marginTop: '0.5rem',
        fontWeight: 600
      }}>
        <BarcodeIcon size={14} color="#2563eb" />
        <span>1D Linear Code-128 Institutional Barcode</span>
      </div>

      {showControls && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPNG}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} />
            <span>Download SVG</span>
          </button>
        </div>
      )}
    </div>
  );
}

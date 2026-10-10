import { Loader2, ShieldCheck, Scan } from 'lucide-react';

/**
 * Loading Component (MWT Syllabus Component Specification)
 * Provides animated spinners, skeleton states, and laser scanner loading indicators.
 */
export default function Loading({
  message = 'Loading...',
  fullScreen = false,
  variant = 'spinner', // 'spinner' | 'scanner'
  size = 'md'
}) {
  const sizeMap = {
    sm: 20,
    md: 36,
    lg: 52
  };

  const pixelSize = sizeMap[size] || 36;

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1rem',
      textAlign: 'center'
    }}>
      {variant === 'scanner' ? (
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '1rem',
          backgroundColor: 'var(--primary-subtle)',
          border: '2px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Scan size={32} color="var(--primary)" />
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #2563eb, transparent)',
            boxShadow: '0 0 10px #2563eb',
            animation: 'laserScan 1.8s ease-in-out infinite'
          }} />
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2
            size={pixelSize}
            color="var(--primary)"
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </div>
      )}

      {message && (
        <p style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '-0.01em',
          maxWidth: '300px'
        }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes laserScan {
          0% { top: 0%; opacity: 0.2; }
          50% { top: 90%; opacity: 1; }
          100% { top: 0%; opacity: 0.2; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
}

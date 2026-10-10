import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: 'var(--bg-main)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '480px', position: 'relative' }}>
        {/* Soft glowing ambient blur */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '1.25rem',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            border: '1px solid #bfdbfe',
            marginBottom: '1.5rem'
          }}>
            <Compass size={32} strokeWidth={2} />
          </div>

          <h1 style={{
            fontSize: '5rem',
            fontWeight: 900,
            lineHeight: 1,
            color: 'var(--primary)',
            letterSpacing: '-0.04em',
            marginBottom: '0.5rem'
          }}>
            404
          </h1>

          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem'
          }}>
            Lost in the glass?
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            The page you're looking for could not be found or has been moved to another vault.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={ArrowLeft}
            >
              Previous Page
            </Button>
            <Link to="/">
              <Button
                variant="gradient"
                icon={Home}
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

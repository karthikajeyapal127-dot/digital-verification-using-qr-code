import { Shield, Lock, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      padding: '4.5rem 1.5rem 2.5rem',
      borderTop: '1px solid #1e293b'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Brand Col */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '0.65rem',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Shield size={20} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Veri<span style={{ color: '#38bdf8' }}>Glass</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Cryptographically verified digital credentials secured with dynamic QR code authentication for universities, governments, and enterprises.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <Lock size={14} className="text-emerald-400" />
              <span>SHA-256 Asymmetric Cryptography</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li><Link to="/verify" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Verification Vault</Link></li>
              <li><Link to="/identity-card" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Digital ID Cards</Link></li>
              <li><Link to="/generate-qr" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Generate QR Code</Link></li>
              <li><Link to="/secure-verification" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Public Authenticator</Link></li>
              <li><Link to="/history" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Verification History</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem' }}>
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li><a href="#solutions" style={{ color: '#cbd5e1' }}>Higher Education Degrees</a></li>
              <li><a href="#solutions" style={{ color: '#cbd5e1' }}>Professional Licenses</a></li>
              <li><a href="#solutions" style={{ color: '#cbd5e1' }}>Consolidated Transcripts</a></li>
              <li><a href="#solutions" style={{ color: '#cbd5e1' }}>Government & Police Clearances</a></li>
              <li><a href="#enterprise" style={{ color: '#cbd5e1' }}>Enterprise HR Background Check</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem' }}>
              Company & Docs
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li><a href="#how-it-works" style={{ color: '#cbd5e1' }}>Architecture Overview</a></li>
              <li><Link to="/support" style={{ color: '#cbd5e1' }}>Help Center & FAQ</Link></li>
              <li><Link to="/admin" style={{ color: '#cbd5e1' }}>Admin Portal Access</Link></li>
              <li><Link to="/security" style={{ color: '#cbd5e1' }}>Security Compliance</Link></li>
              <li><a href="#contact" style={{ color: '#cbd5e1' }}>Partner With Us</a></li>
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1rem' }}>
              Project Context
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <strong>Title:</strong> Digital Verification Using QR Code
            </p>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
              Computer Science & Engineering Major Capstone Project.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1e293b', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#38bdf8' }}>
              <span>Status: Ready for Viva / Demo</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 VeriGlass Platform. All rights reserved. Built for College Project Demonstration.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#privacy" style={{ color: '#64748b', transition: 'color 0.2s' }}>Privacy Policy</a>
            <a href="#terms" style={{ color: '#64748b', transition: 'color 0.2s' }}>Terms of Service</a>
            <a href="#security" style={{ color: '#64748b', transition: 'color 0.2s' }}>Security Audit</a>
            <Link to="/support" style={{ color: '#64748b', transition: 'color 0.2s' }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

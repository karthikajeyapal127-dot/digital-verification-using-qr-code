import { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  LifeBuoy,
  ShieldAlert,
  Send,
  Star,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';

const platformFaqs = [
  {
    q: "How does QR-based digital verification work?",
    a: "Every credential issued receives a unique, cryptographically signed verification token embedded directly inside a QR matrix. When scanned, the system checks the token against the live MongoDB records to verify authenticity in real-time."
  },
  {
    q: "Can the QR code be forged or duplicated?",
    a: "No. The QR code contains only a secure verification token URL. The actual credential status (VALID, EXPIRED, REVOKED, INVALID) is determined exclusively by the backend and MongoDB database."
  },
  {
    q: "Does a verifier need an account to verify credentials?",
    a: "No. Public verification is accessible to anyone with a smartphone camera or via the verification page without logging in."
  },
  {
    q: "How are credentials revoked?",
    a: "Organization administrators can revoke compromised credentials from the Admin Portal. Once revoked, scanning the QR code immediately displays REVOKED."
  }
];

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState('contact'); // 'started' | 'faq' | 'help' | 'contact'
  const [tickets, setTickets] = useState([]);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    subject: '',
    category: 'Verification Issue',
    message: '',
    rating: 5
  });

  const [hoverRating, setHoverRating] = useState(0);

  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.subject.trim() || !form.message.trim()) {
        addToast('Please enter both subject and your message.', 'error');
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/support/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '', // optionally add user name if auth context available
            email: '', // optionally add user email if auth context available
            message: `Subject: ${form.subject}\nCategory: ${form.category}\nMessage: ${form.message}`
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit feedback');
        const newTicket = {
          id: `TKT-${Math.floor(3000 + Math.random() * 1000)}`,
          subject: form.subject,
          category: form.category,
          status: 'Under Review',
          priority: 'Medium',
          date: new Date().toISOString().split('T')[0],
          rating: form.rating
        };
        setTickets([newTicket, ...tickets]);
        addToast('Feedback & support ticket submitted successfully!', 'success');
        setForm({ subject: '', category: 'Verification Issue', message: '', rating: 5 });
      } catch (err) {
        console.error(err);
        addToast(err.message || 'Failed to submit feedback', 'error');
      }
    };



  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          How can we help?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '560px', margin: '0.35rem auto 0' }}>
          Explore FAQs, report verification queries, or share feedback on your digital credential experience.
        </p>
      </div>

      {/* Main Support Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px minmax(0, 1.4fr) minmax(280px, 1fr)',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '3rem'
      }} className="support-layout-grid">
        {/* Left Sidebar Menu */}
        <div className="vg-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              { id: 'contact', label: 'Contact Support', icon: MessageSquare },
              { id: 'faq', label: 'Frequently Asked', icon: HelpCircle },
              { id: 'started', label: 'Get Started Guide', icon: BookOpen },
              { id: 'help', label: 'Help Center Hub', icon: LifeBuoy }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Feedback Form OR FAQs */}
        <div>
          {activeCategory === 'faq' ? (
            <div className="vg-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Frequently Asked Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {platformFaqs.map((faq, idx) => (
                  <div key={idx} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h5 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      {faq.q}
                    </h5>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="vg-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Feedback & Support Form
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Our cryptographic systems team responds to inquiries within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <Input
                  label="Subject"
                  placeholder="e.g. Issue reading QR on mobile camera"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="vg-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Verification Issue">Verification Issue</option>
                    <option value="QR Scanning">QR Scanning & Camera</option>
                    <option value="Account Security">Account Security & 2FA</option>
                    <option value="Enterprise Feature">Enterprise Feature Request</option>
                    <option value="Other">General Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details</label>
                  <textarea
                    rows={4}
                    className="vg-input"
                    placeholder="Describe your question or recommendation..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                {/* 5-Star Rating Widget */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Rate Your Experience</label>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          color: (hoverRating || form.rating) >= star ? '#f59e0b' : '#cbd5e1',
                          transition: 'color 0.15s'
                        }}
                      >
                        <Star size={24} fill={(hoverRating || form.rating) >= star ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="gradient" size="lg" icon={Send} style={{ width: '100%' }}>
                  Submit Feedback
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Recent Submissions */}
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Recent Submissions
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>No support tickets submitted yet.</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Your inquiries will appear here after submission.</span>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {t.id}
                    </span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {t.subject}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    <span>{t.category}</span>
                    <span>{t.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldAlert size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Security Whistleblower
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Report counterfeit QR codes, forged certificates, or illegal credential alteration attempts confidentially.
          </p>
        </div>

        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BookOpen size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Knowledge Base
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Developer guides, API specification, and step-by-step institutional onboarding manual.
          </p>
        </div>

        <div className="vg-card" style={{ padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <LifeBuoy size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Technical Support
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Direct emergency escalation line for college project evaluation and university registrars.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .support-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

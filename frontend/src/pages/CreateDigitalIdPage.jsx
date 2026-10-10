import { useState, useEffect } from 'react';
import {
  Key,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Briefcase,
  Layers,
  User,
  Download,
  Eye,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import QRCodeCard from '../components/verification/QRCodeCard';
import { userApi, digitalIdApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useVerification } from '../context/VerificationContext';

export default function CreateDigitalIdPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const { refreshData } = useVerification();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextTwoYears = new Date();
  nextTwoYears.setFullYear(nextTwoYears.getFullYear() + 2);
  const expiryDefault = nextTwoYears.toISOString().split('T')[0];

  const [form, setForm] = useState({
    userId: '',
    uniqueId: `23CS${Math.floor(100 + Math.random() * 900)}`,
    organization: 'Apex Institute of Science & Technology',
    department: 'Computer Science & Engineering',
    designation: 'Scholar / Student',
    issueDate: todayStr,
    expiryDate: expiryDefault
  });

  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoadingUsers(true);
        const res = await userApi.getUsers();
        if (res && res.success && Array.isArray(res.data)) {
          setUsers(res.data);
          if (res.data.length > 0) {
            setForm((prev) => ({
              ...prev,
              userId: res.data[0]._id || res.data[0].id
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  const handleUserSelect = (selectedId) => {
    const selectedUser = users.find((u) => (u._id || u.id) === selectedId);
    setForm((prev) => ({
      ...prev,
      userId: selectedId,
      organization: selectedUser?.organization || prev.organization,
      department: selectedUser?.department || prev.department,
      designation: selectedUser?.designation || prev.designation
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.uniqueId || !form.uniqueId.trim()) {
      addToast('Unique ID is required (e.g. 23CS101)', 'warning');
      return;
    }
    if (!form.userId) {
      addToast('Please select a registered User for this Digital ID', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Backend validates data, generates secure unique verification token,
      // creates DigitalID document in MongoDB, saves it, and returns QR information
      const res = await digitalIdApi.create({
        userId: form.userId,
        uniqueId: form.uniqueId.trim(),
        organization: form.organization.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        issueDate: form.issueDate,
        expiryDate: form.expiryDate
      });

      setSubmitting(false);

      if (res && res.success) {
        setCreatedResult(res);
        addToast(
          language === 'ta'
            ? `✓ டிஜிட்டல் அடையாளம் [${form.uniqueId}] உருவாக்கப்பட்டது!`
            : language === 'hi'
              ? `✓ डिजिटल पहचान [${form.uniqueId}] सफलतापूर्वक बनाई गई!`
              : `✓ Digital ID [${form.uniqueId}] successfully created in MongoDB!`,
          'success'
        );
        refreshData();
      } else {
        addToast(res.message || 'Failed to create Digital ID', 'error');
      }
    } catch (err) {
      setSubmitting(false);
      addToast(err.message || 'Failed to create Digital ID', 'error');
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setForm({
      userId: users[0]?._id || users[0]?.id || '',
      uniqueId: `23CS${Math.floor(100 + Math.random() * 900)}`,
      organization: 'Apex Institute of Science & Technology',
      department: 'Computer Science & Engineering',
      designation: 'Scholar / Student',
      issueDate: todayStr,
      expiryDate: expiryDefault
    });
  };

  const downloadQR = () => {
    if (!createdResult?.qrDataUrl) return;
    const link = document.createElement('a');
    link.href = createdResult.qrDataUrl;
    link.download = `QR_${createdResult.data?.uniqueId || 'DigitalID'}.png`;
    link.click();
    addToast('QR code downloaded successfully', 'success');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: '#eff6ff',
          color: 'var(--primary)',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '0.5rem'
        }}>
          <Key size={14} />
          <span>Section 10 Requirement: Create Digital ID</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
          {language === 'ta' ? 'டிஜிட்டல் அடையாளம் உருவாக்கு' : language === 'hi' ? 'डिजिटल आईडी बनाएं' : 'Create Digital ID'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {language === 'ta'
            ? 'நிர்வாகி புதிய டிஜிட்டல் அடையாளத்தை உருவாக்கி MongoDB-ல் டோக்கனுடன் பதிவு செய்கிறார்.'
            : language === 'hi'
              ? 'प्रशासक नई डिजिटल आईडी बनाता है और इसे मोंगोडीबी में टोकन के साथ सहेजता है।'
              : 'Admin enters identity credentials, generates a cryptographic verification token, and stores it in MongoDB.'}
        </p>
      </div>

      {!createdResult ? (
        <div className="vg-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* User Selection */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} color="var(--primary)" />
                <span>User (Holder)</span>
              </label>
              {loadingUsers ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading registered users...</div>
              ) : users.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: '0.75rem',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '0.85rem'
                }}>
                  No users registered in MongoDB yet. Please register a user first or enter user details.
                </div>
              ) : (
                <select
                  value={form.userId}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="vg-input"
                  required
                >
                  {users.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.email}) — [{u.role}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Unique ID */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={15} color="var(--primary)" />
                  <span>Unique ID</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, uniqueId: `23CS${Math.floor(100 + Math.random() * 900)}` }))}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Generate New ID
                </button>
              </label>
              <input
                type="text"
                value={form.uniqueId}
                onChange={(e) => setForm({ ...form, uniqueId: e.target.value })}
                placeholder="e.g. 23CS101"
                className="vg-input"
                style={{ fontFamily: 'monospace', fontWeight: 700 }}
                required
              />
            </div>

            {/* Grid 2 Columns: Organization & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={15} color="var(--primary)" />
                  <span>Organization</span>
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="vg-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={15} color="var(--primary)" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="vg-input"
                  required
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={15} color="var(--primary)" />
                <span>Designation</span>
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. B.Tech Computer Science / Research Associate"
                className="vg-input"
                required
              />
            </div>

            {/* Grid 2 Columns: Issue Date & Expiry Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="var(--primary)" />
                  <span>Issue Date</span>
                </label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  className="vg-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="var(--primary)" />
                  <span>Expiry Date</span>
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="vg-input"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="gradient"
                type="submit"
                loading={submitting}
                icon={Key}
                style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
              >
                {language === 'ta' ? 'டிஜிட்டல் அடையாளம் உருவாக்கு' : language === 'hi' ? 'डिजिटल आईडी बनाएं' : 'Create Digital ID'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* SUCCESS RESULT: Displays generated QR, Token & MongoDB Confirmation (Section 10/11) */
        <div className="vg-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46', margin: '0 0 0.5rem' }}>
            Digital ID Created & Saved in MongoDB!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 2rem' }}>
            The digital identity document was persisted in the <code style={{ color: 'var(--primary)', fontWeight: 800 }}>digitalids</code> MongoDB collection with a cryptographic verification token.
          </p>

          {/* Generated QR Code Card */}
          <div style={{
            maxWidth: '380px',
            margin: '0 auto 2rem',
            padding: '1.75rem',
            borderRadius: '1.5rem',
            border: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: '0.85rem' }}>
              OFFICIAL VERIFICATION QR CODE
            </span>

            {createdResult.qrDataUrl ? (
              <img
                src={createdResult.qrDataUrl}
                alt="Verification QR Code"
                style={{ width: '220px', height: '220px', margin: '0 auto', display: 'block', borderRadius: '0.5rem' }}
              />
            ) : (
              <div style={{ width: '220px', height: '220px', backgroundColor: '#f1f5f9', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={64} color="var(--primary)" />
              </div>
            )}

            <div style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.82rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem' }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong>Unique ID:</strong> <code style={{ color: 'var(--primary)', fontWeight: 800 }}>{createdResult.data?.uniqueId}</code>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong>Holder:</strong> {createdResult.data?.holderName}
              </div>
              <div style={{ marginBottom: '0.35rem', wordBreak: 'break-all' }}>
                <strong>Verification Token:</strong> <code style={{ color: '#059669', fontSize: '0.75rem' }}>{createdResult.verificationToken}</code>
              </div>
              <div style={{ wordBreak: 'break-all' }}>
                <strong>QR URL:</strong> <a href={createdResult.qrUrl} target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontSize: '0.75rem' }}>{createdResult.qrUrl}</a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={Download} onClick={downloadQR}>
              Download QR
            </Button>
            <Button
              variant="secondary"
              icon={ExternalLink}
              onClick={() => window.open(createdResult.qrUrl, '_blank')}
            >
              Test Verify URL
            </Button>
            <Button variant="primary" icon={ArrowRight} onClick={handleReset}>
              Create Another Digital ID
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

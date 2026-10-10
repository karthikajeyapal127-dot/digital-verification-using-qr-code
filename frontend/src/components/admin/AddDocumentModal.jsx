import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useVerification } from '../../context/VerificationContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { credentialApi, digitalIdApi, userApi } from '../../services/api';
import { Sparkles, FileText, Check, UserCheck, ShieldCheck } from 'lucide-react';

export default function AddDocumentModal({ isOpen, onClose }) {
  const { refreshData } = useVerification();
  const { addToast } = useToast();
  const { language } = useLanguage();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const fourYearsLater = new Date();
  fourYearsLater.setFullYear(fourYearsLater.getFullYear() + 4);
  const defaultExpiryStr = fourYearsLater.toISOString().split('T')[0];

  const [form, setForm] = useState({
    id: `VG-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    type: 'Degree Certificate',
    holder: '',
    holderEmail: '',
    holderType: 'STUDENT',
    department: 'Computer Science & Engineering',
    issuer: 'Apex Institute of Science & Technology',
    issuerCode: 'AIST-IND-082',
    issueDate: todayStr,
    expiryDate: defaultExpiryStr,
    grade: 'First Class with Distinction',
    authorizedSignatory: 'Dr. Ronald Vance, Registrar'
  });

  // Fetch holders from MongoDB when opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadHolders() {
      try {
        setLoadingUsers(true);
        const res = await userApi.getUsers();
        if (res && res.success && Array.isArray(res.data)) {
          // Filter holders or show all users
          const holderUsers = res.data.filter(
            (u) => (u.role || '').toUpperCase() === 'CREDENTIAL_HOLDER' || (u.role || '').toUpperCase() === 'USER'
          );
          const list = holderUsers.length > 0 ? holderUsers : res.data;
          setUsers(list);

          if (list.length > 0 && !selectedUserId) {
            const first = list[0];
            setSelectedUserId(first._id || first.id);
            setForm((prev) => ({
              ...prev,
              holder: first.name,
              holderEmail: first.email,
              holderType: first.holderType || 'STUDENT',
              department: first.department || prev.department,
              issuer: first.organization || prev.issuer
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load registered holders:', err);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadHolders();
  }, [isOpen]);

  const handleUserSelect = (e) => {
    const val = e.target.value;
    setSelectedUserId(val);
    if (!val || val === 'CUSTOM') {
      return;
    }
    const target = users.find((u) => (u._id || u.id) === val);
    if (target) {
      setForm((prev) => ({
        ...prev,
        holder: target.name,
        holderEmail: target.email,
        holderType: target.holderType || 'STUDENT',
        department: target.department || prev.department,
        issuer: target.organization || prev.issuer
      }));
    }
  };

  const handleGenerateRandomId = () => {
    setForm((prev) => ({
      ...prev,
      id: `VG-2026-${Math.floor(100000 + Math.random() * 900000)}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.holder) {
      addToast('Please provide both credential title and recipient holder name.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. First attempt to issue via Credential API (Section 5 model with live QR and dual sync)
      let success = false;
      let issuedId = form.id;

      try {
        const credPayload = {
          holderId: selectedUserId && selectedUserId !== 'CUSTOM' ? selectedUserId : undefined,
          credentialType: form.type,
          credentialTitle: form.name.trim(),
          credentialNumber: form.id.trim(),
          issueDate: form.issueDate,
          expiryDate: form.expiryDate,
          metadata: {
            holderName: form.holder.trim(),
            holderEmail: form.holderEmail.trim(),
            holderType: form.holderType,
            department: form.department,
            grade: form.grade,
            authorizedSignatory: form.authorizedSignatory,
            organizationName: form.issuer
          }
        };

        const credRes = await credentialApi.create(credPayload);
        if (credRes && credRes.success) {
          success = true;
          issuedId = credRes.data?.credentialNumber || form.id;
        }
      } catch (credErr) {
        console.warn('Credential API note, trying fallback:', credErr);
      }

      // 2. Fallback to digitalIdApi if credentialApi was not reachable
      if (!success) {
        const digRes = await digitalIdApi.create({
          userId: selectedUserId && selectedUserId !== 'CUSTOM' ? selectedUserId : undefined,
          uniqueId: form.id.trim(),
          holderName: form.holder.trim(),
          department: form.department,
          designation: form.type,
          organization: form.issuer,
          issueDate: form.issueDate,
          expiryDate: form.expiryDate,
          autoApprove: true,
          metadata: {
            holderEmail: form.holderEmail,
            holderType: form.holderType,
            credentialTitle: form.name,
            grade: form.grade
          }
        });

        if (digRes && digRes.success) {
          success = true;
          issuedId = digRes.data?.uniqueId || form.id;
        }
      }

      setSubmitting(false);

      if (success) {
        addToast(
          language === 'ta'
            ? `✓ புதிய சான்றிதழ் (${issuedId}) வெற்றிகரமாக வழங்கப்பட்டது!`
            : language === 'hi'
              ? `✓ नया क्रेडेंशियल (${issuedId}) सफलतापूर्वक जारी किया गया!`
              : `✓ Successfully issued & cryptographically signed ${issuedId}!`,
          'success'
        );
        refreshData();
        onClose();
      } else {
        addToast('Failed to issue credential. Please check fields.', 'error');
      }
    } catch (err) {
      setSubmitting(false);
      addToast(err.message || 'Failed to issue credential', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Official Verifiable Credential"
      subtitle="Register institutional credential with cryptographic QR verification in root ledger"
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        {/* Row 1: Existing Holder Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={15} color="var(--primary)" />
            <span>Select Registered Credential Holder</span>
          </label>
          <select
            value={selectedUserId}
            onChange={handleUserSelect}
            className="vg-input"
            style={{ fontWeight: 600 }}
          >
            {users.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name} — {u.email} ({u.holderType || u.role || 'HOLDER'})
              </option>
            ))}
            <option value="CUSTOM">+ Enter Custom Holder (Direct Input)</option>
          </select>
        </div>

        {/* Row 2: Credential ID & Credential Type */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">
              <span>Credential ID / Number</span>
              <button
                type="button"
                onClick={handleGenerateRandomId}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.725rem', fontWeight: 600 }}
              >
                Auto Generate
              </button>
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="vg-input"
              style={{ fontFamily: 'monospace', fontWeight: 700 }}
              required
            />
          </div>

          <div>
            <label className="form-label">Credential Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="vg-input"
            >
              <option value="Degree Certificate">Degree Certificate</option>
              <option value="Student ID">Student ID</option>
              <option value="Employee ID">Employee ID</option>
              <option value="Professional Certification">Professional Certification</option>
              <option value="Academic Transcript">Academic Transcript</option>
              <option value="Diploma">Diploma</option>
              <option value="Membership Credential">Membership Credential</option>
              <option value="Participant Badge">Participant Badge</option>
            </select>
          </div>
        </div>

        {/* Row 3: Credential Title */}
        <div style={{ marginTop: '0.85rem' }}>
          <Input
            label="Credential / Degree Title"
            placeholder="e.g. Master of Science in Artificial Intelligence"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Row 4: Holder Name & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
          <Input
            label="Holder Name"
            placeholder="e.g. Rachel Adams"
            value={form.holder}
            onChange={(e) => setForm({ ...form, holder: e.target.value })}
            required
          />
          <Input
            label="Holder Email Address"
            type="email"
            placeholder="e.g. rachel.adams@institution.edu"
            value={form.holderEmail}
            onChange={(e) => setForm({ ...form, holderEmail: e.target.value })}
            required
          />
        </div>

        {/* Row 5: Holder Type & Department */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
          <div>
            <label className="form-label">Recipient Category</label>
            <select
              value={form.holderType}
              onChange={(e) => setForm({ ...form, holderType: e.target.value })}
              className="vg-input"
            >
              <option value="STUDENT">Student</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="STAFF">Staff</option>
              <option value="MEMBER">Member</option>
              <option value="PARTICIPANT">Participant</option>
            </select>
          </div>

          <Input
            label="Department / Faculty"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
        </div>

        {/* Row 6: Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
          <Input
            label="Issue Date"
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            required
          />
          <Input
            label="Expiry Date (Validity Horizon)"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
          />
        </div>

        {/* Row 7: Grade & Signatory */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.85rem' }}>
          <Input
            label="Grade / Classification"
            placeholder="e.g. First Class with Distinction"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
          />
          <Input
            label="Authorized Signatory"
            placeholder="e.g. Dr. Ronald Vance, Registrar"
            value={form.authorizedSignatory}
            onChange={(e) => setForm({ ...form, authorizedSignatory: e.target.value })}
          />
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.75rem',
          padding: '0.85rem 1rem',
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.8rem',
          color: '#1e40af'
        }}>
          <Sparkles size={18} />
          <span>
            VeriGlass will generate a cryptographically random verification token (no personal info in token), create high-res QR seal, and notify recipient.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" icon={Check} loading={submitting}>
            Issue & Generate QR Seal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

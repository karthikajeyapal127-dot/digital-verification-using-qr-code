import { useState } from 'react';
import { Settings, Save, Building, Shield, QrCode, Database } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    institutionName: 'Apex Institute of Science & Technology',
    institutionCode: 'AIST-IND-082',
    adminEmail: 'admin@veriglass.io',
    qrPrefix: 'VG-2026',
    qrErrorCorrection: 'Level H (High 30%)',
    auditLogRetention: '10 Years (Regulatory Compliance)',
    autoRevokeOnAnomaly: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Institution and QR system configuration saved successfully!', 'success');
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
          System Settings & Enterprise Parameters
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Configure institutional metadata, QR error correction rates, and automated tamper rules.
        </p>
      </div>

      <div className="vg-card" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSave}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Institutional Authority Configuration
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Institution Legal Name"
              value={form.institutionName}
              onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
              required
            />
            <Input
              label="Institutional Code"
              value={form.institutionCode}
              onChange={(e) => setForm({ ...form, institutionCode: e.target.value })}
              required
            />
          </div>

          <Input
            label="System Root Administrator Email"
            type="email"
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
            required
          />

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1.5rem 0' }} />

          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            QR Code Matrix Parameters
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="QR Identifier Prefix"
              value={form.qrPrefix}
              onChange={(e) => setForm({ ...form, qrPrefix: e.target.value })}
              required
            />
            <div className="form-group">
              <label className="form-label">Reed-Solomon Error Correction</label>
              <select
                className="vg-input"
                value={form.qrErrorCorrection}
                onChange={(e) => setForm({ ...form, qrErrorCorrection: e.target.value })}
              >
                <option value="Level H (High 30%)">Level H (High 30% restoration)</option>
                <option value="Level Q (Quartile 25%)">Level Q (Quartile 25%)</option>
                <option value="Level M (Medium 15%)">Level M (Medium 15%)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Retention Policy</label>
            <select
              className="vg-input"
              value={form.auditLogRetention}
              onChange={(e) => setForm({ ...form, auditLogRetention: e.target.value })}
            >
              <option value="10 Years (Regulatory Compliance)">10 Years (Accreditation Standard)</option>
              <option value="5 Years">5 Years</option>
              <option value="Indefinite / Permanent">Indefinite / Permanent Root Ledger</option>
            </select>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={form.autoRevokeOnAnomaly}
                onChange={(e) => setForm({ ...form, autoRevokeOnAnomaly: e.target.checked })}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontWeight: 600 }}>
                Automatically flag & revoke credentials when checksum signature tampering is detected
              </span>
            </label>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="gradient" icon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

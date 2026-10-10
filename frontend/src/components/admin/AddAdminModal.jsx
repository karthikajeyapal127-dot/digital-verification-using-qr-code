import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { UserCheck } from 'lucide-react';

export default function AddAdminModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Verification Officer',
    department: 'Academic Registry',
    accessLevel: 'Full Write Access'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      addToast('Please enter both name and official email.', 'error');
      return;
    }
    addToast(`Admin account invitation sent to ${form.email}!`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New System Admin / Verifier"
      subtitle="Grant administrative role and cryptographic signing authority"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Julian Morales"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Official Work Email"
          type="email"
          placeholder="e.g. j.morales@apex.edu"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">Role Category</label>
            <select
              className="vg-input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="Superadmin">Superadmin</option>
              <option value="Security Officer">Security Officer</option>
              <option value="Verification Officer">Verification Officer</option>
              <option value="Academic Registrar">Academic Registrar</option>
            </select>
          </div>
          <div>
            <label className="form-label">Access Level</label>
            <select
              className="vg-input"
              value={form.accessLevel}
              onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}
            >
              <option value="Full Write Access">Full Write Access</option>
              <option value="Signing Only">Signing Only</option>
              <option value="Audit Read Only">Audit Read Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" icon={UserCheck}>
            Grant Admin Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  ShieldCheck,
  Calendar,
  Lock,
  Edit,
  Key,
  CheckCircle2,
  FileCheck,
  Activity,
  MapPin,
  Camera,
  Globe
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useVerification } from '../context/VerificationContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { userApi } from '../services/api';
import { formatDate, isDocMatchUser, getDigitalIdString } from '../utils/formatters';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setAuthSession } = useAuth();
  const { activities, documents } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // All fields specified in Section 8
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || user?.dateOfBirth || '',
    gender: user?.gender || 'Male',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
    userType: user?.userType || user?.holderType || 'Student',
    profilePhoto: user?.profilePhoto || user?.avatar || ''
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        dob: user.dob || user.dateOfBirth || '',
        gender: user.gender || 'Male',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        userType: user.userType || user.holderType || 'Student',
        profilePhoto: user.profilePhoto || user.avatar || ''
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Please Sign In</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Please sign in to view and manage your profile.
        </p>
        <Link to="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  // Real database verification audits
  const userVerifications = activities.filter(
    (a) =>
      (a.verifiedPerson && typeof a.verifiedPerson === 'string' && a.verifiedPerson.toLowerCase() === user.name?.toLowerCase()) ||
      (getDigitalIdString(a.digitalId).toLowerCase() === user.id?.toLowerCase()) ||
      a.userId === user.id
  );
  const totalVerifications = userVerifications.length;
  const successfulVerifications = userVerifications.filter(
    (a) => a.outcome === 'VALID' || a.status === 'Verified'
  ).length;
  const userDocs = documents.filter((d) => isDocMatchUser(d, user));

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Profile image must be less than 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        dob: editForm.dob,
        dateOfBirth: editForm.dob,
        gender: editForm.gender,
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        country: editForm.country.trim(),
        userType: editForm.userType,
        profilePhoto: editForm.profilePhoto,
        profileImage: editForm.profilePhoto
      };

      const res = await userApi.updateProfile(payload);
      setSaving(false);

      if (res && res.success && res.data) {
        // Update user session in Context & LocalStorage
        const token = localStorage.getItem('veriglass_token');
        setAuthSession(token, { ...user, ...res.data });
        setEditModalOpen(false);
        addToast('Profile updated in MongoDB successfully!', 'success');
      } else {
        addToast(res?.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      setSaving(false);
      addToast(err.message || 'Error updating profile', 'error');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword) {
      addToast('Current password is required.', 'error');
      return;
    }
    if (!passForm.newPassword || passForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await userApi.changePassword(passForm.currentPassword, passForm.newPassword);
      setSaving(false);
      if (res && res.success) {
        addToast('Account password updated successfully!', 'success');
        setPasswordModalOpen(false);
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        addToast(res?.message || 'Failed to update password.', 'error');
      }
    } catch (err) {
      setSaving(false);
      addToast(err.message || 'Error updating password.', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header Profile Hero Card */}
      <div className="vg-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user.profilePhoto || user.profileImage || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                alt={user.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  {user.name}
                </h2>
                <span className="vg-badge badge-verified" style={{ textTransform: 'uppercase' }}>
                  <ShieldCheck size={13} />
                  <span>{user.role}</span>
                </span>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(37,99,235,0.08)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  🎓 {user.userType || user.holderType || 'Student'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                {user.email} · {user.organization || 'Apex Institute of Science & Technology'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem', fontFamily: 'monospace', marginBottom: 0 }}>
                User ID: {user.userId || user.id}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(true)} icon={Edit}>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setPasswordModalOpen(true)} icon={Key}>
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* STATISTICS BAR (REAL DATABASE NUMBERS ONLY) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="vg-stat-card">
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Verifications</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              {totalVerifications}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {totalVerifications === 0 ? 'No verification activity yet' : 'Recorded audits'}
            </span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
        </div>

        <div className="vg-stat-card">
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Successful Verifications</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
              {successfulVerifications}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
              {totalVerifications > 0 ? `${((successfulVerifications / totalVerifications) * 100).toFixed(0)}% authentic pass` : '0 passed'}
            </span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="vg-stat-card">
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Digital IDs</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
              {userDocs.length}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              {userDocs.length === 0 ? 'No credentials issued yet' : 'Enrolled in registry'}
            </span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', backgroundColor: 'rgba(124,58,237,0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: REAL ACCOUNT INFO & RECENT ACTIVITY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {/* Account Information Card (All Section 8 Fields) */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Account Profile Information
            </h4>
            <button
              onClick={() => setEditModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>FULL NAME</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>EMAIL ADDRESS</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>PHONE NUMBER</span>
                <strong>{user.phone || 'Not provided'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>DATE OF BIRTH</span>
                <strong>{user.dateOfBirth || user.dob || 'Not provided'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Briefcase size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>GENDER</span>
                <strong>{user.gender || 'Not specified'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Briefcase size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>USER TYPE</span>
                <strong>{user.userType || user.holderType || 'Student'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>ADDRESS</span>
                <strong>{user.address || 'Not provided'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Globe size={18} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>CITY, STATE, COUNTRY</span>
                <strong>
                  {[user.city, user.state, user.country || 'India'].filter(Boolean).join(', ') || 'Not specified'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Verification Activity Section */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Recent Verification Activity
          </h4>

          {userVerifications.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Activity size={36} color="var(--text-subtle)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                No verification activity yet.
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Audits will appear here when your QR credentials are scanned and verified.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userVerifications.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id || item.verificationId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {item.documentName || item.document || 'Digital Identity'}
                    </p>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {item.method || 'QR SCAN'} · {item.date || 'Today'}
                    </span>
                  </div>
                  <span className={`vg-badge ${item.outcome === 'VALID' || item.status === 'Verified' ? 'badge-verified' : 'badge-failed'}`} style={{ fontSize: '0.7rem' }}>
                    {item.outcome || item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal (Section 8: Edit Profile & Save Changes to MongoDB) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile Information"
        subtitle="Changes are updated directly into the live MongoDB database"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="vg-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="vg-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="vg-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Gender
              </label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="vg-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                User Type
              </label>
              <select
                value={editForm.userType}
                onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                className="vg-input"
              >
                <option value="Student">Student</option>
                <option value="Employee">Employee</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
                <option value="Participant">Participant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              Address
            </label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="vg-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                City
              </label>
              <input
                type="text"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="vg-input"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                State
              </label>
              <input
                type="text"
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="vg-input"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                Country
              </label>
              <input
                type="text"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                className="vg-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              Profile Photo URL or Upload
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={editForm.profilePhoto}
                onChange={(e) => setEditForm({ ...editForm, profilePhoto: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="vg-input"
                style={{ flex: 1 }}
              />
              <label style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                <Camera size={16} />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Account Password"
        subtitle="Secure your account with a strong new password"
      >
        <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              className="vg-input"
              required
            />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              className="vg-input"
              required
            />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              className="vg-input"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={saving}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

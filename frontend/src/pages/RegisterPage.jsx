import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  Camera,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Building,
  Check
} from 'lucide-react';
import Button from '../components/common/Button';
import GoogleOAuthModal from '../components/common/GoogleOAuthModal';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Real user information fields specified in Section 7
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [userType, setUserType] = useState('Student');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Field validation per Section 7
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms and Privacy Policy.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Profile photo size should be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        dob,
        gender,
        password,
        confirmPassword,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        profilePhoto: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563eb&color=fff`,
        role: 'CREDENTIAL_HOLDER',
        userType: userType, // Student, Employee, Staff, Member, Participant
        holderType: userType.toUpperCase()
      };

      const res = await register(payload);
      setLoading(false);
      if (res && res.user) {
        addToast('Registration successful. Please login.', 'success');
        navigate('/login');
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Registration failed. Please verify your details.', 'error');
    }
  };

  const handleAutoFillSample = (selectedType = 'Student') => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setName(`Test ${selectedType} ${randomId}`);
    setEmail(`test.${selectedType.toLowerCase()}${randomId}@apex.edu`);
    setPhone('+91 98765 43210');
    setDob('2002-05-15');
    setGender('Male');
    setPassword('SecurePass2026!');
    setConfirmPassword('SecurePass2026!');
    setAddress('Tech Campus Road, Cyber Valley');
    setCity('Chennai');
    setState('Tamil Nadu');
    setCountry('India');
    setUserType(selectedType);
    setAgreeTerms(true);
    addToast(`Sample ${selectedType} registration details filled!`, 'info');
  };

  const userTypes = [
    { id: 'Student', label: 'Student', icon: '🎓', color: '#2563eb' },
    { id: 'Employee', label: 'Employee', icon: '💼', color: '#059669' },
    { id: 'Staff', label: 'Staff', icon: '🏛️', color: '#d97706' },
    { id: 'Member', label: 'Member', icon: '👥', color: '#7c3aed' },
    { id: 'Participant', label: 'Participant', icon: '🏆', color: '#0891b2' }
  ];

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        padding: '2.5rem 2.25rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            marginBottom: '1rem'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            {t('signUp') || 'Create Account'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1rem' }}>
            {t('heroDescription') || 'Register your profile to access your verified digital credentials'}
          </p>

          {/* Quick Auto-Fill for Testing Convenience */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '0.65rem',
            backgroundColor: 'var(--bg-main)',
            border: '1px dashed var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ fontWeight: 700 }}>⚡ Auto-Fill Form:</span>
            <button
              type="button"
              onClick={() => handleAutoFillSample('Student')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: '0.15rem 0.35rem' }}
            >
              🎓 Student
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleAutoFillSample('Employee')}
              style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', padding: '0.15rem 0.35rem' }}
            >
              💼 Employee
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleAutoFillSample('Staff')}
              style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, cursor: 'pointer', padding: '0.15rem 0.35rem' }}
            >
              🏛️ Staff
            </button>
          </div>
        </div>

        {/* Continue with Google */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleAuthButton isRegister={true} userType={userType} role="CREDENTIAL_HOLDER" />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.25rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.78rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {t('orDivider') || 'OR'}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>
        </div>

        {/* Complete Registration Form per Section 7 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Row 1: Full Name & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  placeholder="e.g. John Doe"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: errors.name ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
              {errors.name && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.name}</span>}
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  placeholder="name@example.com"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: errors.email ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.email}</span>}
            </div>
          </div>

          {/* Row 2: Phone, DOB, Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  placeholder="+91 98765 43210"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: errors.phone ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
              {errors.phone && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.phone}</span>}
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* User Type Selection per Section 7 */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>
              User Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {userTypes.map((type) => {
                const isSelected = userType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUserType(type.id)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '0.75rem',
                      border: isSelected ? `2px solid ${type.color}` : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-main)',
                      color: isSelected ? type.color : 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Address
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '0.9rem', top: '0.85rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or residential area"
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* City, State, Country */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="vg-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Profile Photo Upload or URL */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Profile Photo
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile Preview"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  <Camera size={20} />
                </div>
              )}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="Paste image URL or upload photo"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <label style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap'
              }}>
                <Camera size={16} />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  placeholder="At least 6 characters"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: errors.password ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.password}</span>}
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Repeat password"
                  className="vg-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                    borderRadius: '0.75rem',
                    border: errors.confirmPassword ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Terms and Privacy Checkbox */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: null });
                }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
            {errors.agreeTerms && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem', display: 'block' }}>{errors.agreeTerms}</span>}
          </div>

          {/* Button: [ Create Account ] */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            loading={loading}
            iconRight={ArrowRight}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer Link to Login */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginTop: '1.75rem',
          marginBottom: 0
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>

      {/* Google OAuth Modal for Configuration & Connection Info */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </div>
  );
}

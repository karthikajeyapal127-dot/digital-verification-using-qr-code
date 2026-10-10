import { useState } from 'react';
import { Settings, Shield, Bell, Key, User, Check, Smartphone, Lock, Eye, Save, Globe, Moon, Sun, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { userApi, authApi } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { paletteId, changePalette, isDark, toggleDarkMode, palettes } = useTheme();
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    notifyOnScan: true,
    notifyOnExpiry: true,
    notifySecurityAlerts: true,
    theme: 'light',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user?.id) {
        await userApi.updateUser(user.id, {
          name: settings.name,
          department: settings.department,
          phone: settings.phone,
          organization: settings.organization
        });
      }

      if (settings.newPassword) {
        if (settings.newPassword !== settings.confirmPassword) {
          addToast('New passwords do not match!', 'error');
          setSaving(false);
          return;
        }
        await authApi.resetPassword(user?.email, settings.newPassword);
        addToast('Password successfully updated!', 'success');
      }

      updateUser({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        department: settings.department,
        organization: settings.organization
      });

      setSaving(false);
      addToast(language === 'ta' ? 'அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!' : 'Settings and preferences saved successfully!', 'success');
    } catch (err) {
      setSaving(false);
      addToast(err.message || 'Error saving settings', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
          <Settings size={18} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Configuration
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {t('settings')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Manage your digital identity profile, language preferences (English / தமிழ்), security controls, and notifications.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }}>
        {/* Language & Internationalization Card */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <Globe size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {t('language')} (Multilingual Support)
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Select your preferred interface language. The whole application including navigation, verification engine, and chatbot will adapt instantly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => { setLanguage('en'); addToast('Language switched to English', 'info'); }}
              style={{
                border: language === 'en' ? '2.5px solid var(--primary)' : '1px solid var(--border-color)',
                borderRadius: '0.85rem',
                padding: '1rem',
                backgroundColor: language === 'en' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: language === 'en' ? '0 0 0 1px var(--primary)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>🇬🇧</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>English</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>International Standard</span>
              </div>
            </div>

            <div
              onClick={() => { setLanguage('ta'); addToast('மொழி தமிழுக்கு மாற்றப்பட்டது', 'info'); }}
              style={{
                border: language === 'ta' ? '2.5px solid var(--primary)' : '1px solid var(--border-color)',
                borderRadius: '0.85rem',
                padding: '1rem',
                backgroundColor: language === 'ta' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: language === 'ta' ? '0 0 0 1px var(--primary)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>🇮🇳</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>தமிழ் (Tamil)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>முழுமையான தமிழ் இடைமுகம்</span>
              </div>
            </div>

            <div
              onClick={() => { setLanguage('hi'); addToast('भाषा बदलकर हिन्दी कर दी गई है', 'info'); }}
              style={{
                border: language === 'hi' ? '2.5px solid var(--primary)' : '1px solid var(--border-color)',
                borderRadius: '0.85rem',
                padding: '1rem',
                backgroundColor: language === 'hi' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: language === 'hi' ? '0 0 0 1px var(--primary)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>🇮🇳</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>हिन्दी (Hindi)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>सम्पूर्ण हिन्दी इंटरफ़ेस</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Color Palettes Card */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Palette size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t('theme')} (8 Color Palettes & Dark Mode)
              </h3>
            </div>

            {/* Dark Mode Switch */}
            <button
              type="button"
              onClick={toggleDarkMode}
              style={{
                background: isDark ? '#334155' : '#f1f5f9',
                border: '1px solid var(--border-color)',
                color: isDark ? '#fbbf24' : '#0f172a',
                padding: '0.4rem 0.85rem',
                borderRadius: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
              <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Personalize the UI accent colors across the entire system. Choose any of our 8 vibrant palettes:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {palettes.map((p) => {
              const isSelected = paletteId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    changePalette(p.id);
                    addToast(`Theme palette changed to ${p.name}`, 'success');
                  }}
                  style={{
                    border: isSelected ? `2.5px solid ${p.previewColor}` : '1px solid var(--border-color)',
                    borderRadius: '0.85rem',
                    padding: '0.85rem',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: isSelected ? `0 0 12px ${p.previewColor}40` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: p.previewColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 6px ${p.previewColor}60`
                    }}
                  >
                    {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                      {language === 'ta' ? p.nameTa : language === 'hi' ? p.nameHi : p.name}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {p.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Card */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Identity & Profile Information
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Full Name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
            />
            <Input
              label="Official Email Address"
              value={settings.email}
              type="email"
              readOnly
              disabled
            />
            <Input
              label="Department / Faculty"
              value={settings.department}
              onChange={(e) => setSettings({ ...settings, department: e.target.value })}
            />
            <Input
              label="Organization / University"
              value={settings.organization}
              onChange={(e) => setSettings({ ...settings, organization: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Password & Security Card */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <Lock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Change Password
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="New Password"
              type="password"
              placeholder="Leave blank to keep current"
              value={settings.newPassword}
              onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={settings.confirmPassword}
              onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Notification Alerts
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Instant Scan Notifications
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Receive an alert every time an authorized verifier or campus gate scans your QR code.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyOnScan}
                onChange={() => handleToggle('notifyOnScan')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Credential Expiry Reminders
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Send automated alerts 30 days and 7 days prior to ID validity lapse.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyOnExpiry}
                onChange={() => handleToggle('notifyOnExpiry')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Security & Tamper Audit Warnings
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Immediate push warnings if a revoked or invalid verification attempt is made with your ID.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifySecurityAlerts}
                onChange={() => handleToggle('notifySecurityAlerts')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="primary" type="submit" loading={saving} icon={Save} size="lg">
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}

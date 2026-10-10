import { useState, useRef, useEffect } from 'react';
import { Globe, Palette, Moon, Sun, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeLanguageControls({ compact = false }) {
  const { language, setLanguage, t } = useLanguage();
  const { paletteId, changePalette, isDark, toggleDarkMode, palettes } = useTheme();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const langRef = useRef(null);
  const colorRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        setShowColorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', sub: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', sub: 'Tamil', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' }
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
      {/* Language Selector Dropdown */}
      <div style={{ position: 'relative' }} ref={langRef}>
        <button
          type="button"
          onClick={() => {
            setShowLangMenu(!showLangMenu);
            setShowColorMenu(false);
          }}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            color: isDark ? '#f8fafc' : '#0f172a',
            padding: '0.35rem 0.65rem',
            borderRadius: '0.55rem',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
          title="Choose Language (English / தமிழ் / हिन्दी)"
        >
          <Globe size={13} color="var(--primary)" />
          <span>{currentLang.label}</span>
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        {showLangMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
              padding: '0.35rem',
              minWidth: '150px',
              zIndex: 100
            }}
          >
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setShowLangMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '0.45rem',
                  border: 'none',
                  backgroundColor: language === l.code ? (isDark ? '#334155' : 'var(--primary-subtle)') : 'transparent',
                  color: language === l.code ? 'var(--primary)' : isDark ? '#f8fafc' : '#0f172a',
                  fontWeight: language === l.code ? 800 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{l.flag}</span>
                  <div>
                    <span>{l.label}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>{l.sub}</span>
                  </div>
                </div>
                {language === l.code && <Check size={14} color="var(--primary)" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Color Palettes Dropdown */}
      <div style={{ position: 'relative' }} ref={colorRef}>
        <button
          type="button"
          onClick={() => {
            setShowColorMenu(!showColorMenu);
            setShowLangMenu(false);
          }}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            color: isDark ? '#f8fafc' : '#0f172a',
            padding: '0.35rem 0.55rem',
            borderRadius: '0.55rem',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
          title="Choose Theme Color (8 Palettes Available)"
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              boxShadow: '0 0 5px var(--primary)'
            }}
          />
          <Palette size={13} color="var(--primary)" />
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        {showColorMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '0.75rem',
              boxShadow: '0 12px 30px -5px rgba(0,0,0,0.25)',
              padding: '0.65rem',
              width: '210px',
              zIndex: 100
            }}
          >
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: isDark ? '#94a3b8' : '#64748b',
              marginBottom: '0.5rem',
              paddingLeft: '0.2rem'
            }}>
              {language === 'ta' ? 'வண்ண தீம் தேர்ந்தெடுக்கவும்' : language === 'hi' ? 'रंग थीम चुनें' : 'Color Palette'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.65rem' }}>
              {palettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    changePalette(p.id);
                    setShowColorMenu(false);
                  }}
                  title={language === 'ta' ? p.nameTa : language === 'hi' ? p.nameHi : p.name}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0.55rem',
                    border: paletteId === p.id ? '2.5px solid #ffffff' : '1px solid rgba(0,0,0,0.1)',
                    outline: paletteId === p.id ? `2px solid ${p.previewColor}` : 'none',
                    backgroundColor: p.previewColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: paletteId === p.id ? `0 0 10px ${p.previewColor}` : 'none',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {paletteId === p.id && <Check size={16} color="#ffffff" strokeWidth={3} />}
                </button>
              ))}
            </div>

            <div style={{
              fontSize: '0.72rem',
              textAlign: 'center',
              fontWeight: 700,
              color: 'var(--primary)',
              borderTop: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
              paddingTop: '0.45rem'
            }}>
              {language === 'ta'
                ? palettes.find((p) => p.id === paletteId)?.nameTa
                : language === 'hi'
                  ? palettes.find((p) => p.id === paletteId)?.nameHi
                  : palettes.find((p) => p.id === paletteId)?.name}
            </div>
          </div>
        )}
      </div>

      {/* Dark / Light Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleDarkMode}
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          color: isDark ? '#fbbf24' : '#0f172a',
          padding: '0.35rem 0.5rem',
          borderRadius: '0.55rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
      </button>
    </div>
  );
}

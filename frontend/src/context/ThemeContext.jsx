import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEME_PALETTES = [
  {
    id: 'blue',
    name: 'Cyber Blue',
    nameTa: 'நீல நிறம்',
    nameHi: 'साइबर नीला',
    primary: '#0284c7',
    primaryDark: '#0369a1',
    primaryLight: '#38bdf8',
    subtle: '#eff6ff',
    border: '#bae6fd',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
    previewColor: '#0284c7'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    nameTa: 'மரகத பச்சை',
    nameHi: 'एमराल्ड हरा',
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#34d399',
    subtle: '#ecfdf5',
    border: '#a7f3d0',
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)',
    previewColor: '#059669'
  },
  {
    id: 'purple',
    name: 'Royal Violet',
    nameTa: 'ஊதா நிறம்',
    nameHi: 'शाही बैंगनी',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primaryLight: '#a78bfa',
    subtle: '#f5f3ff',
    border: '#ddd6fe',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a78bfa 100%)',
    previewColor: '#7c3aed'
  },
  {
    id: 'rose',
    name: 'Crimson Ruby',
    nameTa: 'சிவப்பு நிறம்',
    nameHi: 'क्रिमसन लाल',
    primary: '#e11d48',
    primaryDark: '#be123c',
    primaryLight: '#fb7185',
    subtle: '#fff1f2',
    border: '#fecdd3',
    gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 50%, #fb7185 100%)',
    previewColor: '#e11d48'
  },
  {
    id: 'amber',
    name: 'Sunset Gold',
    nameTa: 'தங்க மஞ்சள்',
    nameHi: 'सुनहरा अम्बर',
    primary: '#d97706',
    primaryDark: '#b45309',
    primaryLight: '#fbbf24',
    subtle: '#fffbeb',
    border: '#fde68a',
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)',
    previewColor: '#d97706'
  },
  {
    id: 'cyan',
    name: 'Ocean Teal',
    nameTa: 'கடல் நீலம்',
    nameHi: 'स्यान टील',
    primary: '#0891b2',
    primaryDark: '#0e7490',
    primaryLight: '#22d3ee',
    subtle: '#ecfeff',
    border: '#a5f3fc',
    gradient: 'linear-gradient(135deg, #155e75 0%, #0891b2 50%, #22d3ee 100%)',
    previewColor: '#0891b2'
  },
  {
    id: 'orange',
    name: 'Flame Orange',
    nameTa: 'சுடர் ஆரஞ்சு',
    nameHi: 'फ्लेम नारंगी',
    primary: '#ea580c',
    primaryDark: '#c2410c',
    primaryLight: '#fb923c',
    subtle: '#fff7ed',
    border: '#fed7aa',
    gradient: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #fb923c 100%)',
    previewColor: '#ea580c'
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    nameTa: 'அடர் இண்டிகோ',
    nameHi: 'इलेक्ट्रिक इंडिगो',
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    primaryLight: '#818cf8',
    subtle: '#eef2ff',
    border: '#c7d2fe',
    gradient: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #818cf8 100%)',
    previewColor: '#4f46e5'
  }
];

export function ThemeProvider({ children }) {
  const [paletteId, setPaletteId] = useState(() => {
    return localStorage.getItem('veriglass_palette') || 'blue';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('veriglass_dark');
    return saved !== null ? saved === 'true' : true; // Default to Cyber Dark & Holographic
  });

  const activePalette = THEME_PALETTES.find((p) => p.id === paletteId) || THEME_PALETTES[0];

  useEffect(() => {
    localStorage.setItem('veriglass_palette', paletteId);
    localStorage.setItem('veriglass_dark', isDark);

    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--primary', activePalette.primary);
    root.style.setProperty('--primary-dark', activePalette.primaryDark);
    root.style.setProperty('--primary-light', activePalette.primaryLight);
    root.style.setProperty('--primary-subtle', activePalette.subtle);
    root.style.setProperty('--primary-border', activePalette.border);
    root.style.setProperty('--primary-gradient', activePalette.gradient);

    // Apply Cyber Dark Holographic glassmorphism
    if (isDark) {
      root.classList.add('dark');
      root.style.setProperty('--bg-main', '#030712');
      root.style.setProperty('--bg-card', 'rgba(15, 23, 42, 0.82)');
      root.style.setProperty('--bg-subtle', 'rgba(30, 41, 59, 0.6)');
      root.style.setProperty('--bg-sidebar', '#080d1a');
      root.style.setProperty('--text-main', '#f8fafc');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-color', 'rgba(56, 189, 248, 0.18)');
      root.style.setProperty('--shadow-card', '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.05)');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-main', '#f8fafc');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-subtle', '#f1f5f9');
      root.style.setProperty('--bg-sidebar', '#ffffff');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow-card', '0 4px 20px -2px rgba(15, 23, 42, 0.05)');
    }
  }, [paletteId, isDark, activePalette]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const changePalette = (id) => {
    setPaletteId(id);
  };

  return (
    <ThemeContext.Provider
      value={{
        paletteId,
        changePalette,
        isDark,
        toggleDarkMode,
        activePalette,
        palettes: THEME_PALETTES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

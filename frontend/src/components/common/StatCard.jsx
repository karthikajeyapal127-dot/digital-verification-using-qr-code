export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'blue', subtitle }) {
  const colorStyles = {
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    emerald: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    rose: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    indigo: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' }
  };

  const scheme = colorStyles[color] || colorStyles.blue;

  return (
    <div className="vg-stat-card">
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {value}
        </h3>
        {(change || subtitle) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
            {change && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: changeType === 'positive' ? '#059669' : (changeType === 'negative' ? '#dc2626' : 'var(--text-muted)'),
                background: changeType === 'positive' ? '#ecfdf5' : (changeType === 'negative' ? '#fef2f2' : '#f1f5f9'),
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px'
              }}>
                {change}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '1rem',
          backgroundColor: scheme.bg,
          color: scheme.text,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '1rem',
          flexShrink: 0
        }}>
          <Icon size={24} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
}

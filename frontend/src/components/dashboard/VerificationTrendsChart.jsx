import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function VerificationTrendsChart() {
  const { activities } = useVerification();
  const { t } = useLanguage();

  // Aggregate real verification events by date
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const dateMap = {};
    activities.forEach((item) => {
      const d = item.date || item.createdAt?.split('T')[0] || 'Today';
      if (!dateMap[d]) {
        dateMap[d] = { date: d, count: 0, valid: 0, failed: 0 };
      }
      dateMap[d].count += 1;
      if (item.result === 'VALID' || item.outcome === 'VALID') {
        dateMap[d].valid += 1;
      } else {
        dateMap[d].failed += 1;
      }
    });

    return Object.values(dateMap).slice(-7); // Last 7 active dates
  }, [activities]);

  const maxVal = Math.max(...chartData.map((d) => d.count), 5);

  if (!activities || activities.length === 0) {
    return (
      <div className="vg-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <BarChart3 size={44} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 0.75rem' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {t('noAnalytics')}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          No verification events logged in the database yet. Real activity trends will visualize automatically after scans.
        </p>
      </div>
    );
  }

  return (
    <div className="vg-card" style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Verification Activity by Date
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
          Calculated from real verification attempts stored in the database
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '220px', paddingTop: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {chartData.map((item, idx) => {
          const heightPercent = Math.max((item.count / maxVal) * 100, 10);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                {item.count}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: `${heightPercent}%`,
                  borderRadius: '0.5rem 0.5rem 0 0',
                  background: 'linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)',
                  transition: 'height 0.3s ease'
                }}
                title={`${item.date}: ${item.count} scans (${item.valid} valid, ${item.failed} failed)`}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>
                {item.date.length > 5 ? item.date.slice(5) : item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

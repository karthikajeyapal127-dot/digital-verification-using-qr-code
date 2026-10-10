import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Smartphone, Globe, CheckCircle2, Shield, Activity, Users, Files, AlertTriangle, XCircle, Clock, ScanLine } from 'lucide-react';
import VerificationTrendsChart from '../components/dashboard/VerificationTrendsChart';
import StatCard from '../components/common/StatCard';
import { verificationApi, digitalIdApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, histRes, docsRes] = await Promise.all([
          verificationApi.getStats(),
          verificationApi.getHistory(),
          digitalIdApi.getAll()
        ]);
        if (statsRes && statsRes.stats) setStats(statsRes.stats);
        if (histRes && Array.isArray(histRes.data)) setActivities(histRes.data);
        if (docsRes && Array.isArray(docsRes.data)) setDocuments(docsRes.data);
      } catch (e) {
        console.warn('Analytics fetch notice:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalVerifications = activities.length;
  const totalIdentities = documents.length;

  // Breakdown 1: Outcome (Valid vs Expired vs Revoked vs Invalid)
  const outcomeCounts = useMemo(() => {
    const valid = activities.filter((a) => a.result === 'VALID' || a.outcome === 'VALID').length;
    const expired = activities.filter((a) => a.result === 'EXPIRED' || a.outcome === 'EXPIRED').length;
    const revoked = activities.filter((a) => a.result === 'REVOKED' || a.outcome === 'REVOKED').length;
    const invalid = activities.filter((a) => a.result === 'INVALID' || a.outcome === 'INVALID').length;
    return { valid, expired, revoked, invalid };
  }, [activities]);

  // Breakdown 2: ID Status (Active vs Expired vs Revoked)
  const idStatusCounts = useMemo(() => {
    const active = documents.filter((d) => (d.status || '').toUpperCase() === 'ACTIVE' || (d.status || '').toUpperCase() === 'VALID').length;
    const expired = documents.filter((d) => (d.status || '').toUpperCase() === 'EXPIRED').length;
    const revoked = documents.filter((d) => (d.status || '').toUpperCase() === 'REVOKED').length;
    return { active, expired, revoked };
  }, [documents]);

  // Breakdown 3: Verification Methods (QR Scan vs Manual ID)
  const methodCounts = useMemo(() => {
    const qrScan = activities.filter((a) => (a.method || '').toUpperCase().includes('QR')).length;
    const manualId = activities.filter((a) => (a.method || '').toUpperCase().includes('MANUAL')).length;
    return { qrScan, manualId };
  }, [activities]);

  const isEmpty = totalVerifications === 0 && totalIdentities === 0;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Verification & Security Analytics
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Real-time metrics, risk distribution, and cryptographic verification telemetry.
        </p>
      </div>

      {/* Top 4 Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title={t('totalVerifications')}
          value={totalVerifications.toString()}
          change={stats?.successRate ? `${stats.successRate} success` : 'Real database count'}
          changeType="positive"
          icon={TrendingUp}
          color="blue"
          subtitle="Database records"
        />
        <StatCard
          title={t('activeIds')}
          value={idStatusCounts.active.toString()}
          change={`Out of ${totalIdentities} issued`}
          changeType="positive"
          icon={Files}
          color="emerald"
          subtitle="Active credentials"
        />
        <StatCard
          title={t('totalUsers')}
          value={(stats?.totalUsers ?? 0).toString()}
          change="Across all roles"
          changeType="positive"
          icon={Users}
          color="indigo"
          subtitle="Registered accounts"
        />
        <StatCard
          title={t('revokedIds')}
          value={idStatusCounts.revoked.toString()}
          change={idStatusCounts.revoked > 0 ? "Flagged/Revoked" : "0 alerts"}
          changeType={idStatusCounts.revoked > 0 ? "negative" : "positive"}
          icon={XCircle}
          color="rose"
          subtitle="Terminated credentials"
        />
      </div>

      {isEmpty ? (
        <div className="vg-card" style={{ padding: '4rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <BarChart3 size={48} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {t('noAnalytics')}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
            No verification attempts or digital identities have been registered in the database yet. All analytics are computed strictly from real data.
          </p>
        </div>
      ) : (
        <>
          {/* Chart 1: Verification Activity by Date */}
          <div style={{ marginBottom: '2rem' }}>
            <VerificationTrendsChart />
          </div>

          {/* Grid of the 3 Breakdown Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Chart 2: Valid vs Expired vs Revoked vs Invalid */}
            <div className="vg-card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Valid vs Expired vs Revoked vs Invalid
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                {[
                  { label: 'VALID (Verified)', count: outcomeCounts.valid, color: '#10b981', bg: '#ecfdf5' },
                  { label: 'EXPIRED (Timed Out)', count: outcomeCounts.expired, color: '#f59e0b', bg: '#fffbeb' },
                  { label: 'REVOKED (Flagged)', count: outcomeCounts.revoked, color: '#ef4444', bg: '#fef2f2' },
                  { label: 'INVALID (Unknown)', count: outcomeCounts.invalid, color: '#64748b', bg: '#f1f5f9' }
                ].map((item) => {
                  const pct = totalVerifications > 0 ? ((item.count / totalVerifications) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Active vs Expired vs Revoked IDs */}
            <div className="vg-card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Active vs Expired vs Revoked IDs
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                {[
                  { label: 'Active Credentials', count: idStatusCounts.active, color: '#10b981' },
                  { label: 'Expired Credentials', count: idStatusCounts.expired, color: '#f59e0b' },
                  { label: 'Revoked Credentials', count: idStatusCounts.revoked, color: '#ef4444' }
                ].map((item) => {
                  const pct = totalIdentities > 0 ? ((item.count / totalIdentities) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 4: Verification Methods (QR Scan vs Manual ID) */}
            <div className="vg-card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Verification Methods: QR Scan vs Manual ID
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                {[
                  { label: 'QR Scan (Optical Camera)', count: methodCounts.qrScan, color: '#06b6d4' },
                  { label: 'Manual ID (Keypad Input)', count: methodCounts.manualId, color: '#8b5cf6' }
                ].map((item) => {
                  const pct = totalVerifications > 0 ? ((item.count / totalVerifications) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

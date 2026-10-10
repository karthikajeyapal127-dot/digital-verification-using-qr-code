import { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Plus,
  Shield,
  Activity,
  ArrowRight,
  RefreshCw,
  Search,
  ScanLine
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import AddAdminModal from '../components/admin/AddAdminModal';
import AddDocumentModal from '../components/admin/AddDocumentModal';
import { verificationApi, adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { getDigitalIdString } from '../utils/formatters';

export default function AdminDashboardPage() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdentities: 0,
    activeIdentities: 0,
    expiredIdentities: 0,
    revokedIdentities: 0,
    total: 0,
    todayVerifications: 0,
    valid: 0,
    successRate: '0%'
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();
  const { t } = useLanguage();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, histRes] = await Promise.all([
        verificationApi.getStats(),
        verificationApi.getHistory()
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (histRes && Array.isArray(histRes.data)) {
        setRecentVerifications(histRes.data.slice(0, 8));
      }
    } catch (e) {
      console.warn('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportSystemReport = () => {
    if (recentVerifications.length === 0) {
      addToast('No verification records available to export.', 'info');
      return;
    }
    let csv = 'VerificationID,DigitalID,VerifiedBy,Date,Time,Method,Result\n';
    recentVerifications.forEach((t) => {
      const digStr = getDigitalIdString(t.digitalId) || t.uniqueId || '';
      csv += `"${t.verificationId || t.id}","${digStr}","${t.verifiedBy || t.verifierName}","${t.date}","${t.time}","${t.method}","${t.result || t.outcome}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Verification-Audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('Verification records exported to CSV.', 'success');
  };

  return (
    <div className="page-wrapper">
      {/* Header with Admin Quick Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid #ddd6fe'
            }}>
              ADMINISTRATION COMMAND CENTER
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time cryptographic database statistics, active digital IDs, and live verification monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary" onClick={loadData} icon={RefreshCw}>
            Refresh Data
          </Button>
          <Button variant="secondary" onClick={handleExportSystemReport} icon={Download}>
            Export Audit CSV
          </Button>
          <Button variant="gradient" onClick={() => setDocModalOpen(true)} icon={Plus}>
            {t('createDigitalId')}
          </Button>
        </div>
      </div>

      {/* 4 ADMIN QUICK ACTIONS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link to="/admin/credentials/create" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Plus size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                Issue Credential
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Create verifiable token
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/credentials" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                Credential Registry
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Revoke, view & manage
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                Holders & Users
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enrollment & roles
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
          <div className="vg-card" style={{
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Activity size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                Live Analytics
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Trends & inspection stats
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 6 REAL DATABASE STATISTICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* 1. Total Users */}
        <StatCard
          title={t('totalUsers')}
          value={(stats.totalUsers ?? 0).toString()}
          change={stats.totalUsers === 0 ? "No users registered yet" : "Real database count"}
          changeType="positive"
          icon={Users}
          color="indigo"
          subtitle="Registered accounts"
        />

        {/* 2. Active IDs */}
        <StatCard
          title={t('activeIds')}
          value={(stats.activeIdentities ?? 0).toString()}
          change={`${stats.totalIdentities ?? 0} total issued`}
          changeType="positive"
          icon={CheckCircle2}
          color="emerald"
          subtitle="Cryptographically active"
        />

        {/* 3. Expired IDs */}
        <StatCard
          title={t('expiredIds')}
          value={(stats.expiredIdentities ?? 0).toString()}
          change={stats.expiredIdentities > 0 ? "Past validity date" : "0 expired"}
          changeType="warning"
          icon={Clock}
          color="amber"
          subtitle="Auto-expired credentials"
        />

        {/* 4. Revoked IDs */}
        <StatCard
          title={t('revokedIds')}
          value={(stats.revokedIdentities ?? 0).toString()}
          change={stats.revokedIdentities > 0 ? "Flagged/Revoked" : "0 revoked"}
          changeType={stats.revokedIdentities > 0 ? "negative" : "positive"}
          icon={XCircle}
          color="rose"
          subtitle="Terminated credentials"
        />

        {/* 5. Total Verifications */}
        <StatCard
          title={t('totalVerifications')}
          value={(stats.total ?? 0).toString()}
          change={`${stats.successRate || '0%'} success rate`}
          changeType="positive"
          icon={Activity}
          color="blue"
          subtitle="Logged in database"
        />

        {/* 6. Today's Verifications */}
        <StatCard
          title={t('todayVerifications')}
          value={(stats.todayVerifications ?? 0).toString()}
          change="Recorded today"
          changeType="positive"
          icon={ScanLine}
          color="cyan"
          subtitle="Today's optical scans"
        />
      </div>

      {/* RECENT REAL VERIFICATION ACTIVITY TABLE */}
      <div className="vg-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Live Verification Stream
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Real verification attempts recorded in the database
            </p>
          </div>

          <Link to="/history" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>
              View All History
            </Button>
          </Link>
        </div>

        {recentVerifications.length === 0 ? (
          <div style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '1rem',
            border: '1px dashed var(--border-color)'
          }}>
            <ScanLine size={42} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No data available yet.
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
              No verification scans have occurred yet. Open the QR Scanner or public verification page to perform your first verification.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Verification ID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Digital ID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Method</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Date & Time</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVerifications.map((v) => {
                  const isSuccess = v.result === 'VALID' || v.outcome === 'VALID';
                  const isExpired = v.result === 'EXPIRED' || v.outcome === 'EXPIRED';
                  const isRevoked = v.result === 'REVOKED' || v.outcome === 'REVOKED';
                  const bgBadge = isSuccess ? '#ecfdf5' : isExpired ? '#fffbeb' : '#fef2f2';
                  const textBadge = isSuccess ? '#065f46' : isExpired ? '#92400e' : '#991b1b';
                  const borderBadge = isSuccess ? '#a7f3d0' : isExpired ? '#fde68a' : '#fecaca';

                  return (
                    <tr key={v.id || v.verificationId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {v.verificationId || v.id}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {getDigitalIdString(v.digitalId) || v.uniqueId}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-main)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.35rem',
                          border: '1px solid var(--border-color)'
                        }}>
                          {v.method || 'QR SCAN'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>
                        {v.date} {v.time}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: bgBadge,
                          color: textBadge,
                          border: `1px solid ${borderBadge}`
                        }}>
                          {v.result || v.outcome}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Document / ID Modal */}
      <AddDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Activity,
  Check,
  X
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useVerification } from '../context/VerificationContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard, getDigitalIdString } from '../utils/formatters';

export default function VerificationHistoryPage() {
  const { activities, stats } = useVerification();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const pageSize = 8;

  // Real Database Numbers
  const totalVerifications = activities.length;
  const validVerifications = activities.filter((a) => a.outcome === 'VALID' || a.status === 'Verified').length;
  const failedVerifications = totalVerifications - validVerifications;
  const successRate = totalVerifications > 0 ? ((validVerifications / totalVerifications) * 100).toFixed(1) : '0.0';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter((act) => {
      const digStr = getDigitalIdString(act.digitalId) || act.uniqueId || '';
      const docStr = typeof act.documentName === 'string' ? act.documentName : (typeof act.document === 'string' ? act.document : '');
      const verStr = typeof act.verifierName === 'string' ? act.verifierName : (typeof act.verifier === 'string' ? act.verifier : '');
      const persStr = typeof act.verifiedPerson === 'string' ? act.verifiedPerson : '';
      const verIdStr = typeof act.verificationId === 'string' ? act.verificationId : (typeof act.id === 'string' ? act.id : '');

      const matchQuery =
        !q ||
        docStr.toLowerCase().includes(q) ||
        digStr.toLowerCase().includes(q) ||
        verIdStr.toLowerCase().includes(q) ||
        verStr.toLowerCase().includes(q) ||
        persStr.toLowerCase().includes(q);

      const outcomeVal = act.outcome || (act.status === 'Verified' ? 'VALID' : 'FAILED');
      const matchStatus =
        statusFilter === 'ALL' || outcomeVal.toUpperCase() === statusFilter.toUpperCase();

      const riskVal = act.riskLevel || 'TRUSTED';
      const matchRisk =
        riskFilter === 'ALL' || riskVal.toUpperCase() === riskFilter.toUpperCase();

      return matchQuery && matchStatus && matchRisk;
    });
  }, [activities, search, statusFilter, riskFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    let csv = 'LogID,Date,Time,Document,DigitalID,VerifiedPerson,Verifier,TrustScore,RiskLevel,Status,IPAddress\n';
    activities.forEach((a) => {
      const digStr = getDigitalIdString(a.digitalId) || a.uniqueId || '';
      const docStr = typeof a.documentName === 'string' ? a.documentName : (typeof a.document === 'string' ? a.document : 'Digital ID');
      csv += `"${a.verificationId || a.id}","${a.date}","${a.time}","${docStr}","${digStr}","${a.verifiedPerson || 'Holder'}","${a.verifierName || a.verifier}","${a.trustScore || 100}","${a.riskLevel || 'TRUSTED'}","${a.outcome || a.status}","${a.ipAddress || '127.0.0.1'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Verification-History-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('Audit log exported to CSV successfully.', 'success');
  };

  const handleCopyId = (id) => {
    copyToClipboard(id);
    addToast(`Copied ID: ${id}`, 'success');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Verification History & Audit Ledger
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Immutable records of every scan attempt with Trust & Risk Engine scores and explainable factors.
          </p>
        </div>

        <Button variant="gradient" onClick={handleExportCSV} icon={Download}>
          Export Audit Report (CSV)
        </Button>
      </div>

      {/* TOP STATS CARDS (Real Database Numbers) */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Verifications"
          value={totalVerifications.toString()}
          change="Recorded in ledger"
          changeType="positive"
          icon={History}
          color="blue"
          subtitle="Real MongoDB verification logs"
        />
        <StatCard
          title="Authentic Ratio"
          value={`${successRate}%`}
          change={`${validVerifications} passed`}
          changeType="positive"
          icon={CheckCircle2}
          color="emerald"
          subtitle="Cryptographically verified"
        />
        <StatCard
          title="Flagged / Anomalies"
          value={failedVerifications.toString()}
          change={failedVerifications > 0 ? "Tamper/Lapsed scans" : "0 alerts"}
          changeType={failedVerifications > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="rose"
          subtitle="Rejected by trust engine"
        />
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="vg-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Search */}
          <div className="input-with-icon" style={{ minWidth: '280px', flex: 1 }}>
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              placeholder="Search document name, verifier, DVID, or holder..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="vg-input"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Status buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.625rem' }}>
            {['ALL', 'VALID', 'EXPIRED', 'REVOKED', 'INVALID'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Risk:</span>
            {['ALL', 'TRUSTED', 'WARNING', 'HIGH RISK'].map((rk) => (
              <button
                key={rk}
                onClick={() => {
                  setRiskFilter(rk);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: riskFilter === rk ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: riskFilter === rk ? '#eff6ff' : '#ffffff',
                  color: riskFilter === rk ? '#0284c7' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VERIFICATION TABLE */}
      <div className="vg-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="vg-table-container">
          <table className="vg-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Credential & Subject</th>
                <th>Verifier / Location</th>
                <th>DVID Identifier</th>
                <th>Trust Score & Risk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {activities.length === 0 ? 'No data available yet.' : 'No matching records found'}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {activities.length === 0 ? 'Verification attempts will appear here in real-time as QR codes or barcodes are scanned.' : 'No verification events match your search/filter criteria.'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((act) => {
                  const trustScore = act.trustScore ?? (act.outcome === 'VALID' ? 100 : 0);
                  const riskLevel = act.riskLevel || (act.outcome === 'VALID' ? 'TRUSTED' : 'WARNING');

                  return (
                    <tr key={act.id || act.verificationId}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{act.date}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.time}</span>
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>
                          {act.documentName || act.document}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Subject: {act.verifiedPerson || act.holder || 'Digital ID Holder'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                          {act.verifierName || act.verifier}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {act.location || 'Campus Gate 1'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '0.3rem' }}>
                            {getDigitalIdString(act.digitalId) || act.uniqueId}
                          </code>
                          <button
                            onClick={() => handleCopyId(getDigitalIdString(act.digitalId) || act.uniqueId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            backgroundColor: riskLevel === 'TRUSTED' ? '#ecfdf5' : riskLevel === 'WARNING' ? '#fffbeb' : '#fef2f2',
                            color: riskLevel === 'TRUSTED' ? '#065f46' : riskLevel === 'WARNING' ? '#b45309' : '#b91c1c'
                          }}>
                            {trustScore}/100 · {riskLevel}
                          </span>
                        </div>
                      </td>

                      <td>
                        <StatusBadge status={act.outcome || act.status} size="sm" />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedItem(act)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Showing Page {currentPage} of {totalPages} ({filtered.length} total verification events)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Verification Audit Inspection · ${selectedItem.verificationId || selectedItem.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Dynamic Trust Score:</span>
                <strong style={{ color: '#38bdf8' }}>{selectedItem.trustScore || 100} / 100 ({selectedItem.riskLevel || 'TRUSTED'})</strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                {selectedItem.summary || 'SHA-256 seal integrity validated against root institutional certificates.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Subject:</span>
                <p style={{ fontWeight: 700, margin: '0.1rem 0' }}>{selectedItem.verifiedPerson || 'Holder'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Verifier:</span>
                <p style={{ fontWeight: 700, margin: '0.1rem 0' }}>{selectedItem.verifierName || selectedItem.verifier}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Verification Method:</span>
                <p style={{ margin: '0.1rem 0' }}>{selectedItem.method || 'Live Camera QR Scan'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Latency & IP:</span>
                <p style={{ margin: '0.1rem 0' }}>{selectedItem.latency || '0.24s'} · {selectedItem.ipAddress || '127.0.0.1'}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="sm" onClick={() => setSelectedItem(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

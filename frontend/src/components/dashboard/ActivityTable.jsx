import { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Copy } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatDate, copyToClipboard, getDigitalIdString } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function ActivityTable({ activities = [], title = "Recent Verification Activity", pageSize = 5 }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter((act) => {
      const docStr = typeof act.document === 'string' ? act.document : (typeof act.documentName === 'string' ? act.documentName : getDigitalIdString(act.document));
      const verIdStr = typeof act.verificationId === 'string' ? act.verificationId : (typeof act.id === 'string' ? act.id : '');
      const verifierStr = typeof act.verifier === 'string' ? act.verifier : (typeof act.verifierName === 'string' ? act.verifierName : '');

      const matchSearch =
        !q ||
        docStr.toLowerCase().includes(q) ||
        verIdStr.toLowerCase().includes(q) ||
        verifierStr.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        (act.status && act.status.toUpperCase() === statusFilter.toUpperCase()) ||
        (act.outcome && act.outcome.toUpperCase() === statusFilter.toUpperCase()) ||
        (act.result && act.result.toUpperCase() === statusFilter.toUpperCase());

      return matchSearch && matchStatus;
    });
  }, [activities, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCopyId = (id) => {
    copyToClipboard(id);
    addToast(`Copied Verification ID: ${id}`, 'success');
  };

  return (
    <div className="vg-card" style={{ padding: '1.5rem' }}>
      {/* Header and Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time audit log of all scanned credentials and query sessions
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search box */}
          <div className="input-with-icon" style={{ minWidth: '220px' }}>
            <Search size={15} className="input-icon-left" />
            <input
              type="text"
              placeholder="Search by document, ID, or verifier..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="vg-input"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
            />
          </div>

          {/* Status filter buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '0.2rem',
            borderRadius: '0.5rem'
          }}>
            {['ALL', 'VERIFIED', 'PENDING', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === st ? '#ffffff' : 'transparent',
                  color: statusFilter === st ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === st ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vg-table-container">
        <table className="vg-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Document Name</th>
              <th>Verification ID</th>
              <th>Type / Channel</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((act) => (
                <tr key={act.id}>
                  <td>
                    <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>{act.date}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{act.time}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                      {typeof act.document === 'object' ? getDigitalIdString(act.document) : (act.document || act.documentName || 'Digital Identity')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {typeof act.verifier === 'object' ? (act.verifier?.name || 'Authorized Verifier') : (act.verifier || act.verifierName || 'Authorized Verifier')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {act.verificationId}
                      </span>
                      <button
                        onClick={() => handleCopyId(act.verificationId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                        title="Copy ID"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {act.verificationType}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={act.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedActivity(act)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} />
                      Audit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {activities.length === 0 ? 'No verification history available' : 'No records found'}
                  </div>
                  <span style={{ fontSize: '0.8rem' }}>
                    {activities.length === 0 ? 'Verification attempts will be recorded here automatically.' : 'Try adjusting your search query or filters.'}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', padding: '0 0.5rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title="Verification Audit Record"
        subtitle={`Session ID: ${selectedActivity?.id}`}
      >
        {selectedActivity && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <StatusBadge status={selectedActivity.status} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Score</span>
                <p style={{ fontWeight: 800, color: selectedActivity.status === 'Verified' ? '#059669' : '#dc2626' }}>
                  {selectedActivity.auditScore}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DOCUMENT</strong>
                <span>{typeof selectedActivity.document === 'object' ? getDigitalIdString(selectedActivity.document) : (selectedActivity.document || selectedActivity.documentName || 'Digital Identity')}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VERIFICATION ID</strong>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedActivity.verificationId}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VERIFYING PARTY</strong>
                <span>{typeof selectedActivity.verifier === 'object' ? (selectedActivity.verifier?.name || 'Authorized Verifier') : (selectedActivity.verifier || selectedActivity.verifierName || 'Authorized Verifier')}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>GEOGRAPHIC ORIGIN</strong>
                <span>{selectedActivity.location}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>IP ADDRESS</strong>
                <span style={{ fontFamily: 'monospace' }}>{selectedActivity.ipAddress}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VERIFICATION LATENCY</strong>
                <span>{selectedActivity.latency}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="primary"
                style={{ flex: 1 }}
                onClick={() => {
                  addToast('Exported audit report as certified PDF receipt.', 'success');
                  setSelectedActivity(null);
                }}
                icon={Download}
              >
                Download Certified Audit Receipt
              </Button>
              <Button variant="secondary" onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

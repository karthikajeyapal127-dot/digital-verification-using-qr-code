import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  QrCode,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  ShieldCheck,
  Award,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import AddDocumentModal from '../components/admin/AddDocumentModal';
import QRCodeCard from '../components/verification/QRCodeCard';
import { useVerification } from '../context/VerificationContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

export default function AdminDocumentsPage() {
  const { documents, approveIdentity, rejectIdentity, revokeIdentity, restoreIdentity, deleteIdentity } = useVerification();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedQrDoc, setSelectedQrDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const q = (search || '').toLowerCase();
      const matchSearch =
        (doc.name || '').toLowerCase().includes(q) ||
        (doc.holder || doc.holderName || '').toLowerCase().includes(q) ||
        (doc.id || doc.uniqueId || '').toLowerCase().includes(q) ||
        (doc.issuer || doc.organization || '').toLowerCase().includes(q) ||
        (doc.department || '').toLowerCase().includes(q);

      const statusUpper = (doc.status || '').toUpperCase();
      const matchStatus =
        statusFilter === 'ALL' ||
        statusUpper === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [documents, search, statusFilter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await approveIdentity(id);
      setActionLoading(null);
      if (res && res.success) {
        addToast(`Identity ${id} approved! Cryptographic QR code activated.`, 'success');
      } else {
        addToast(res?.message || 'Approval failed', 'error');
      }
    } catch (e) {
      setActionLoading(null);
      addToast('Approval failed', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:', 'Incomplete documentation');
    if (!reason) return;
    setActionLoading(id);
    try {
      const res = await rejectIdentity(id, reason);
      setActionLoading(null);
      if (res && res.success) {
        addToast(`Identity ${id} rejected.`, 'info');
      } else {
        addToast(res?.message || 'Rejection failed', 'error');
      }
    } catch (e) {
      setActionLoading(null);
      addToast('Rejection failed', 'error');
    }
  };

  const handleRevoke = async (id) => {
    const reason = window.prompt('Enter revocation reason (e.g. Integrity violation, grade alteration):', 'Revoked by order of Academic Integrity Board');
    if (!reason) return;
    setActionLoading(id);
    try {
      const res = await revokeIdentity(id, reason);
      setActionLoading(null);
      if (res && res.success) {
        addToast(`Identity ${id} marked as REVOKED in root ledger.`, 'error');
      } else {
        addToast(res?.message || 'Revocation failed', 'error');
      }
    } catch (e) {
      setActionLoading(null);
      addToast('Revocation failed', 'error');
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(id);
    try {
      const res = await restoreIdentity(id);
      setActionLoading(null);
      if (res && res.success) {
        addToast(`Identity ${id} restored to Active status!`, 'success');
      } else {
        addToast(res?.message || 'Restore failed', 'error');
      }
    } catch (e) {
      setActionLoading(null);
      addToast('Restore failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete record [${id}] from the system database?`)) return;
    setActionLoading(id);
    try {
      const res = await deleteIdentity(id);
      setActionLoading(null);
      if (res && res.success) {
        addToast(`Identity ${id} permanently deleted from database.`, 'success');
      } else {
        addToast(res?.message || 'Delete failed', 'error');
      }
    } catch (e) {
      setActionLoading(null);
      addToast('Delete failed', 'error');
    }
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
            Digital Identity Management & Approvals
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Review pending identity submissions, approve credentials, revoke compromised records, and audit cryptographic hashes.
          </p>
        </div>

        <Button variant="gradient" onClick={() => setAddModalOpen(true)} icon={Plus}>
          Issue New Identity
        </Button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="vg-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Search Box */}
          <div className="input-with-icon" style={{ flex: 1, minWidth: '260px' }}>
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              placeholder="Search by holder, DVID, department, or degree..."
              className="vg-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED', 'REVOKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: statusFilter === st ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: statusFilter === st ? '#eff6ff' : '#ffffff',
                  color: statusFilter === st ? '#0284c7' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vg-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vg-table">
            <thead>
              <tr>
                <th>Digital ID (DVID)</th>
                <th>Credential & Holder</th>
                <th>Department</th>
                <th>Validity Horizon</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {documents.length === 0 ? 'No data available yet.' : 'No matching records found'}
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>
                      {documents.length === 0 ? 'Click "+ Issue New Identity" to enroll the first digital ID.' : 'Try adjusting your search query or filter.'}
                    </span>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const statusUpper = (doc.status || '').toUpperCase();
                  const isPending = statusUpper === 'PENDING';
                  const isActive = statusUpper === 'ACTIVE' || statusUpper === 'VALID';
                  const isRevoked = statusUpper === 'REVOKED';
                  const isExpired = statusUpper === 'EXPIRED';
                  const docKey = doc.id || doc.uniqueId || doc._id;
                  const displayId = doc.uniqueId || doc.digitalId || doc.id;

                  return (
                    <tr key={docKey}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '0.35rem' }}>
                            {displayId}
                          </code>
                          <button
                            onClick={() => setSelectedQrDoc(doc)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '0.2rem' }}
                            title="View QR Code Matrix"
                          >
                            <QrCode size={16} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'block' }}>
                            {doc.holder || doc.holderName || doc.metadata?.holderName || 'Credential Holder'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {doc.name || doc.credentialTitle || doc.credentialType || doc.type || 'Verifiable Credential'}
                          </span>
                        </div>
                      </td>

                      <td style={{ fontSize: '0.85rem' }}>
                        {doc.department || doc.metadata?.department || 'General'}
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(doc.issueDate)} to {formatDate(doc.expiryDate || doc.validUntil)}
                      </td>

                      <td>
                        <StatusBadge status={doc.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {(() => {
                          const targetId = doc._id || doc.id || doc.uniqueId;
                          return (
                            <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(targetId)}
                                    disabled={actionLoading === targetId}
                                    style={{
                                      backgroundColor: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '0.45rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                    title="Approve Identity"
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </button>

                                  <button
                                    onClick={() => handleReject(targetId)}
                                    disabled={actionLoading === targetId}
                                    style={{
                                      backgroundColor: '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '0.45rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                    title="Reject Application"
                                  >
                                    <X size={13} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isActive && (
                                <button
                                  onClick={() => handleRevoke(targetId)}
                                  disabled={actionLoading === targetId}
                                  style={{
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    border: '1px solid #fecdd3',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '0.45rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  title="Revoke Credential"
                                >
                                  <AlertTriangle size={13} />
                                  <span>Revoke</span>
                                </button>
                              )}

                              {isRevoked && (
                                <button
                                  onClick={() => handleRestore(targetId)}
                                  disabled={actionLoading === targetId}
                                  style={{
                                    backgroundColor: '#f0fdf4',
                                    color: '#16a34a',
                                    border: '1px solid #bbf7d0',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '0.45rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  title="Restore to Active"
                                >
                                  <RotateCcw size={13} />
                                  <span>Restore</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(targetId)}
                                disabled={actionLoading === targetId}
                                style={{
                                  backgroundColor: '#f8fafc',
                                  color: '#64748b',
                                  border: '1px solid #e2e8f0',
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '0.45rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Permanently Delete Record"
                              >
                                <Trash2 size={13} />
                              </button>

                              <Link
                                to={`/verify/${doc.qrToken || doc.verificationToken || doc.uniqueId || doc.id}`}
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '0.45rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  textDecoration: 'none'
                                }}
                                title="Open in Public Registry"
                              >
                                <ExternalLink size={14} />
                              </Link>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Preview Modal */}
      {selectedQrDoc && (
        <Modal
          isOpen={!!selectedQrDoc}
          onClose={() => setSelectedQrDoc(null)}
          title={`Secure QR Matrix · ${selectedQrDoc.id}`}
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <QRCodeCard
              document={selectedQrDoc}
              qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${selectedQrDoc.qrToken || selectedQrDoc.id}` : `/verify/${selectedQrDoc.qrToken || selectedQrDoc.id}`}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Dynamic Token: <code>{selectedQrDoc.qrToken || selectedQrDoc.id}</code>
            </p>
          </div>
        </Modal>
      )}

      {/* Add Document Modal */}
      <AddDocumentModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}

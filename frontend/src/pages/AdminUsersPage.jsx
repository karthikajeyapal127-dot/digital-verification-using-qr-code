import { useState, useEffect, useMemo } from 'react';
import { Users, Search, UserPlus, Shield, CheckCircle2, UserX, ShieldAlert, Trash2, Edit3, Eye } from 'lucide-react';
import Button from '../components/common/Button';
import AddAdminModal from '../components/admin/AddAdminModal';
import Modal from '../components/common/Modal';
import { userApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const { addToast } = useToast();
  const { t } = useLanguage();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers();
      if (res && res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (e) {
      console.warn('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await userApi.updateStatus(id, nextStatus);
      if (res && res.success) {
        addToast(`User status updated to ${nextStatus}`, 'info');
        setUsers((prev) =>
          prev.map((u) => (u._id === id || u.id === id || u.userId === id ? { ...u, status: nextStatus } : u))
        );
      } else {
        addToast(res?.message || 'Status update failed', 'error');
      }
    } catch (e) {
      addToast('Status update failed', 'error');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await userApi.updateRole(id, newRole);
      if (res && res.success) {
        addToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === id || u.id === id || u.userId === id ? { ...u, role: newRole } : u))
        );
      } else {
        addToast(res?.message || 'Role change failed', 'error');
      }
    } catch (e) {
      addToast('Role change failed', 'error');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user [${name}]?`)) return;
    try {
      const res = await userApi.deleteUser(id);
      if (res && res.success) {
        addToast(`User [${name}] deleted successfully`, 'success');
        setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id && u.userId !== id));
      } else {
        addToast(res?.message || 'Failed to delete user', 'error');
      }
    } catch (e) {
      addToast('Failed to delete user', 'error');
    }
  };

  // Search across: Name, Email, Unique ID, Department, Role, Holder Type
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.userId && u.userId.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.holderType && u.holderType.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      const uRole = (u.role || '').toUpperCase();
      const uType = (u.holderType || '').toUpperCase();
      const targetFilter = roleFilter.toUpperCase();

      const matchRole =
        targetFilter === 'ALL' ||
        uRole === targetFilter ||
        uType === targetFilter ||
        (targetFilter === 'ADMIN' && (uRole === 'ADMIN' || uRole === 'ORGANIZATION_ADMIN')) ||
        (targetFilter === 'USER' && (uRole === 'USER' || uRole === 'CREDENTIAL_HOLDER'));

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Credential Holders & User Directory
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage students, employees, staff, members, participants, and authorized verifiers registered in live MongoDB database.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setModalOpen(true)} icon={UserPlus}>
          Add Credential Holder
        </Button>
      </div>

      <div className="vg-card" style={{ padding: '1.5rem' }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Name, Email, Unique ID, Department, or Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vg-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT', 'VERIFIER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: roleFilter === r ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: roleFilter === r ? '#eff6ff' : 'transparent',
                  color: roleFilter === r ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Users size={48} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No data available yet.
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Click "Create User" to add the first user account to MongoDB.
            </p>
            <Button variant="gradient" onClick={() => setModalOpen(true)} icon={UserPlus}>
              Create User
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <Search size={40} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              {t('noRecords')}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              No users matched your search criteria "{search}".
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>User</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Unique ID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Department</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id || u.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* User info */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`}
                          alt={u.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</span>
                            {u.holderType && u.holderType !== 'NONE' && (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '9999px',
                                backgroundColor:
                                  u.holderType === 'STUDENT' ? '#eff6ff' :
                                  u.holderType === 'EMPLOYEE' ? '#ecfdf5' :
                                  u.holderType === 'STAFF' ? '#f5f3ff' :
                                  u.holderType === 'MEMBER' ? '#fffbeb' :
                                  u.holderType === 'PARTICIPANT' ? '#fff1f2' : '#f1f5f9',
                                color:
                                  u.holderType === 'STUDENT' ? '#1d4ed8' :
                                  u.holderType === 'EMPLOYEE' ? '#047857' :
                                  u.holderType === 'STAFF' ? '#6d28d9' :
                                  u.holderType === 'MEMBER' ? '#b45309' :
                                  u.holderType === 'PARTICIPANT' ? '#be123c' : '#475569',
                                border: '1px solid rgba(0,0,0,0.06)'
                              }}>
                                {u.holderType}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Unique ID */}
                    <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {u.userId || u.id}
                    </td>

                    {/* Department */}
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-main)' }}>
                      {u.department || 'General'}
                    </td>

                    {/* Role dropdown */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <select
                        value={(u.role || 'user').toLowerCase()}
                        onChange={(e) => handleRoleChange(u._id || u.id || u.userId, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-main)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="user">USER</option>
                        <option value="student">STUDENT</option>
                        <option value="verifier">VERIFIER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span
                        onClick={() => handleToggleSuspend(u._id || u.id || u.userId, u.status)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          backgroundColor: u.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                          color: u.status === 'Active' ? '#065f46' : '#991b1b',
                          border: `1px solid ${u.status === 'Active' ? '#a7f3d0' : '#fecaca'}`
                        }}
                        title="Click to toggle Active / Suspended"
                      >
                        {u.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions: View & Delete */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setViewingUser(u)}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id || u.id || u.userId, u.name)}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddAdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {/* View User Modal */}
      <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="User Details">
        {viewingUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <img
                src={viewingUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingUser.name)}&background=2563eb&color=fff`}
                alt={viewingUser.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{viewingUser.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{viewingUser.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unique ID</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingUser.userId || viewingUser.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Role</span>
                <strong>{viewingUser.role?.toUpperCase()}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department</span>
                <strong>{viewingUser.department}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Organization</span>
                <strong>{viewingUser.organization}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                <strong style={{ color: viewingUser.status === 'Active' ? '#10b981' : '#ef4444' }}>{viewingUser.status}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Registered Date</span>
                <strong>{viewingUser.createdAt ? viewingUser.createdAt.split('T')[0] : 'Recent'}</strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

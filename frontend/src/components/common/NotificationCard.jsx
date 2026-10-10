import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, X, Clock } from 'lucide-react';

/**
 * NotificationCard Component (MWT Syllabus Component Specification)
 * Displays notification items with type badges, timestamps, unread indicators, and dismiss actions.
 */
export default function NotificationCard({
  notification,
  onDismiss,
  onMarkRead
}) {
  if (!notification) return null;

  const typeConfig = {
    warning: {
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: AlertTriangle
    },
    danger: {
      color: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
      icon: ShieldAlert
    },
    success: {
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: CheckCircle2
    },
    info: {
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: Info
    }
  };

  const config = typeConfig[notification.type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className="vg-card"
      style={{
        padding: '1.25rem',
        marginBottom: '0.85rem',
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: notification.unread ? '#ffffff' : '#f8fafc',
        boxShadow: notification.unread ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        position: 'relative'
      }}
    >
      {/* Icon Badge */}
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <IconComponent size={18} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, paddingRight: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {notification.title}
          </h5>
          {notification.unread && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '0.1rem 0.45rem',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              New
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '0.2rem 0 0.5rem 0' }}>
          {notification.message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          <Clock size={12} />
          <span>{notification.time || 'Just now'}</span>
          {notification.category && (
            <>
              <span>•</span>
              <span style={{ fontWeight: 600 }}>{notification.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            borderRadius: '0.25rem',
            display: 'flex'
          }}
          title="Dismiss notification"
          type="button"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

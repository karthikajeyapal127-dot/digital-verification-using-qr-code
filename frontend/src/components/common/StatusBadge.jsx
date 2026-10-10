import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toUpperCase();

  let className = 'badge-blue';
  let Icon = ShieldCheck;

  if (norm.includes('VERIFIED') || norm.includes('SUCCESS') || norm.includes('ACTIVE') || norm.includes('RESOLVED')) {
    className = 'badge-verified';
    Icon = CheckCircle2;
  } else if (norm.includes('PENDING') || norm.includes('REVIEW') || norm.includes('PROGRESS')) {
    className = 'badge-pending';
    Icon = Clock;
  } else if (norm.includes('FAILED') || norm.includes('REVOKED') || norm.includes('SUSPENDED') || norm.includes('ALERT')) {
    className = 'badge-failed';
    Icon = norm.includes('REVOKED') ? ShieldAlert : (norm.includes('ALERT') ? AlertTriangle : XCircle);
  }

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`vg-badge ${className} ${size === 'sm' ? 'text-xs py-0.5 px-2' : ''}`}>
      <Icon size={iconSize} className="shrink-0" />
      <span>{status || 'UNKNOWN'}</span>
    </span>
  );
}

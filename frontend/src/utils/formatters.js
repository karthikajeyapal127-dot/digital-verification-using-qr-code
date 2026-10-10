export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

export function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function truncateHash(hash, startLen = 8, endLen = 8) {
  if (!hash) return '';
  if (hash.length <= startLen + endLen) return hash;
  return `${hash.slice(0, startLen)}...${hash.slice(-endLen)}`;
}

export function isDocMatchUser(d, user) {
  if (!d || !user) return false;
  const docUserId = typeof d.userId === 'object' ? (d.userId?._id || d.userId?.id) : d.userId;
  const currentUserId = user.id || user._id || user.userId;
  if (docUserId && currentUserId && docUserId.toString() === currentUserId.toString()) return true;

  const credHolderId = typeof d.holderId === 'object' ? (d.holderId?._id || d.holderId?.id) : d.holderId;
  if (credHolderId && currentUserId && credHolderId.toString() === currentUserId.toString()) return true;

  const docEmail = typeof d.userId === 'object' ? d.userId?.email : (d.email || d.metadata?.holderEmail || '');
  if (docEmail && user.email && docEmail.toLowerCase() === user.email.toLowerCase()) return true;

  const holderName = (d.holderName || d.holder || d.metadata?.holderName || '').toLowerCase().trim();
  const userName = (user.name || '').toLowerCase().trim();
  if (holderName && userName && (holderName === userName || userName.includes(holderName) || holderName.includes(userName))) return true;

  return false;
}

export function getDigitalIdString(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.uniqueId || item.digitalId || item.id || item._id || '';
  }
  return String(item);
}


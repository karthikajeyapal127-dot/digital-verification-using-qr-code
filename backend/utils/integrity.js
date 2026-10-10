import crypto from 'crypto';

/**
 * Calculates a SHA-256 cryptographic integrity hash for a digital credential.
 * Used for tamper detection (Section 14 & 20).
 */
export function calculateIntegrityHash(credentialData) {
  const normIssue = credentialData.issueDate
    ? new Date(credentialData.issueDate).toISOString().split('T')[0]
    : '';
  const normExpiry = credentialData.expiryDate
    ? new Date(credentialData.expiryDate).toISOString().split('T')[0]
    : '';

  // Safely extract holder ID whether raw ObjectId or populated document
  let holderIdStr = '';
  if (credentialData.holderId) {
    holderIdStr = (credentialData.holderId._id || credentialData.holderId).toString();
  } else if (credentialData.userId) {
    holderIdStr = (credentialData.userId._id || credentialData.userId).toString();
  }

  const payload = [
    credentialData.credentialNumber || '',
    credentialData.credentialTitle || '',
    credentialData.credentialType || '',
    holderIdStr,
    normIssue,
    normExpiry,
    credentialData.verificationToken || ''
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Verifies if current credential data matches stored integrity hash.
 */
export function verifyCredentialIntegrity(credential) {
  if (!credential || !credential.integrityHash) {
    // If no integrity hash is stored, generate one and consider valid
    return true;
  }
  const computed = calculateIntegrityHash(credential);
  return computed === credential.integrityHash;
}

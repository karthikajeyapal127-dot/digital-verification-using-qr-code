import DigitalID from '../models/DigitalID.js';
import Credential from '../models/Credential.js';
import Organization from '../models/Organization.js';
import Verification from '../models/Verification.js';
import Notification from '../models/Notification.js';
import SecurityAlert from '../models/SecurityAlert.js';
import User from '../models/User.js';
import { emitVerificationEvent, emitNotificationEvent } from '../services/socketService.js';
import { calculateTrustScore } from '../services/trustEngine.js';
import { verifyCredentialIntegrity } from '../utils/integrity.js';
import {
  sendVerificationSuccessEmail,
  sendExpiredCredentialEmail,
  sendRevokedCredentialEmail,
  sendInvalidCredentialAlert,
  sendTamperedCredentialAlert
} from '../services/emailService.js';

// Core Verification Engine (Sections 7 & 15 Specification)
export const processVerification = async ({
  searchKey,
  verifierId,
  verifierName,
  verifierOrganization = '',
  method = 'QR_SCAN',
  ipAddress = '127.0.0.1',
  userAgent = ''
}) => {
  let cleanKey = (searchKey || '').trim();
  try {
    cleanKey = decodeURIComponent(cleanKey);
  } catch (e) {
    // ignore
  }

  // If searchKey is a full URL, extract the token / ID
  if (cleanKey.includes('/verify/')) {
    cleanKey = cleanKey.split('/verify/')[1].split('?')[0].split('#')[0].replace(/\/+$/, '');
  } else if (cleanKey.includes('id=')) {
    const match = cleanKey.match(/id=([^&]+)/);
    if (match) cleanKey = match[1];
  } else if (cleanKey.includes('token=')) {
    const match = cleanKey.match(/token=([^&]+)/);
    if (match) cleanKey = match[1];
  }
  cleanKey = cleanKey.trim().replace(/^['"]|['"]$/g, '');

  const now = new Date();
  const cleanEsc = cleanKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ciRegex = new RegExp(`^${cleanEsc}$`, 'i');

  // 1. Search MongoDB Credential collection first
  let credential = await Credential.findOne({
    $or: [
      { verificationToken: cleanKey },
      { verificationToken: ciRegex },
      { credentialNumber: cleanKey },
      { credentialNumber: ciRegex },
      { credentialId: cleanKey },
      { credentialId: ciRegex },
      { _id: cleanKey.match(/^[0-9a-fA-F]{24}$/) ? cleanKey : null }
    ].filter(Boolean)
  })
    .populate('holderId', 'name email phone holderType department designation avatar')
    .populate('organizationId', 'organizationName email website address phone logo');

  // Fallback to DigitalID for backwards compatibility with test suites
  let digitalIdDoc = null;
  if (!credential) {
    digitalIdDoc = await DigitalID.findOne({
      $or: [
        { verificationToken: cleanKey },
        { verificationToken: ciRegex },
        { uniqueId: cleanKey },
        { uniqueId: ciRegex },
        { _id: cleanKey.match(/^[0-9a-fA-F]{24}$/) ? cleanKey : null }
      ].filter(Boolean)
    }).populate('userId', 'name email phone organization department designation');
  }

  // 2. Exact Specification Verification Logic (Section 7)
  // IF token does not exist: INVALID
  // ELSE IF credential status is REVOKED: REVOKED
  // ELSE IF current date is greater than expiry date: EXPIRED
  // ELSE: VALID
  let result = 'VALID';
  let message = 'Credential Verified';

  const activeDoc = credential || digitalIdDoc;

  const isRevoked = (credential && credential.status === 'REVOKED') || (digitalIdDoc && digitalIdDoc.status === 'REVOKED');
  const isExpired = (credential && (new Date(credential.expiryDate) < now || credential.status === 'EXPIRED')) ||
                    (digitalIdDoc && (new Date(digitalIdDoc.expiryDate) < now || digitalIdDoc.status === 'EXPIRED'));

  if (!activeDoc) {
    result = 'INVALID';
    message = 'Invalid Credential - No matching record found';
  } else if (isRevoked) {
    result = 'REVOKED';
    message = 'Credential Revoked by issuing organization';
    if (activeDoc.status !== 'REVOKED') {
      activeDoc.status = 'REVOKED';
      await activeDoc.save();
    }
  } else if (isExpired) {
    result = 'EXPIRED';
    message = 'Credential Expired';
    if (activeDoc.status !== 'EXPIRED') {
      activeDoc.status = 'EXPIRED';
      await activeDoc.save();
    }
  } else if (credential && credential.integrityHash && !verifyCredentialIntegrity(credential)) {
    result = 'TAMPERED';
    message = 'Cryptographic Integrity Check Failed - Credential data tampered';
  } else {
    result = 'VALID';
    message = 'Credential Verified';
  }

  // 3. Trust & Risk Engine calculation
  const previousLogs = await Verification.find({
    $or: [
      { uniqueId: credential ? credential.credentialNumber : digitalIdDoc ? digitalIdDoc.uniqueId : cleanKey },
      { scannedPayload: cleanKey }
    ]
  }).limit(10).lean();

  const trustAnalysis = calculateTrustScore({
    doc: activeDoc,
    searchKey: cleanKey,
    previousVerifications: previousLogs,
    ipAddress
  });

  // 4. Save Verification History (Section 14 - Save for VALID, EXPIRED, REVOKED, INVALID)
  const normalizedMethod = method.toUpperCase().includes('MANUAL') || method.toUpperCase().includes('ID')
    ? 'VERIFICATION_ID'
    : 'QR_SCAN';

  const verificationId = `VRF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

  const docName = credential
    ? `${credential.credentialTitle} (${credential.credentialNumber})`
    : digitalIdDoc
    ? `${digitalIdDoc.designation} (${digitalIdDoc.department})`
    : 'Unknown Credential';

  const holderName = credential
    ? (credential.holderId?.name || credential.metadata?.holderName || 'Credential Holder')
    : digitalIdDoc
    ? (digitalIdDoc.userId?.name || digitalIdDoc.holderName || 'Credential Holder')
    : '';

  const verificationRecord = await Verification.create({
    verificationId,
    credentialId: credential ? credential._id : null,
    organizationId: credential?.organizationId?._id || credential?.organizationId || null,
    digitalId: digitalIdDoc ? digitalIdDoc._id : null,
    uniqueId: credential ? credential.credentialNumber : digitalIdDoc ? digitalIdDoc.uniqueId : cleanKey,
    verifierName: verifierName || 'Public Verifier',
    verifierOrganization: verifierOrganization || '',
    verificationMethod: normalizedMethod,
    method: normalizedMethod === 'VERIFICATION_ID' ? 'MANUAL_ID' : 'QR_SCAN',
    result,
    verificationTime: now,
    documentName: docName,
    verifiedPerson: holderName,
    scannedPayload: cleanKey,
    ipAddress,
    userAgent
  });

  // Security Alert logging (Section 20 & 23)
  if (result === 'TAMPERED') {
    try {
      await SecurityAlert.create({
        type: 'TAMPER_DETECTED',
        severity: 'CRITICAL',
        message: `Cryptographic tamper detected for credential ${credential?.credentialNumber || cleanKey}.`,
        targetId: credential ? credential._id.toString() : cleanKey,
        credentialNumber: credential?.credentialNumber || '',
        token: cleanKey,
        ipAddress,
        userAgent
      });
    } catch (e) {
      console.warn('SecurityAlert error:', e.message);
    }
  } else if (result === 'INVALID') {
    try {
      const recentInvalids = await Verification.countDocuments({
        result: 'INVALID',
        ipAddress,
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });
      if (recentInvalids >= 3) {
        await SecurityAlert.create({
          type: 'REPEATED_INVALID_ATTEMPTS',
          severity: 'HIGH',
          message: `Repeated invalid verification attempts (${recentInvalids}) detected from IP ${ipAddress}.`,
          token: cleanKey,
          attemptCount: recentInvalids,
          ipAddress,
          userAgent
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // 5. Create real notification for holder in MongoDB
  const targetUserId = credential?.holderId?._id || credential?.holderId || digitalIdDoc?.userId?._id || digitalIdDoc?.userId;
  if (targetUserId) {
    try {
      const notif = await Notification.create({
        userId: targetUserId,
        organizationId: credential?.organizationId?._id || null,
        title: result === 'VALID' ? 'Credential Verified' : `Verification Attempt: ${result}`,
        message: `Your credential [${docName}] was verified via ${normalizedMethod}. Status: ${result}.`,
        type: result === 'VALID' ? 'VERIFIED' : 'WARNING',
        relatedId: (credential ? credential._id : digitalIdDoc._id).toString()
      });
      emitNotificationEvent(notif);
    } catch (notifErr) {
      console.warn('Holder notification error:', notifErr.message);
    }
  }

  // Real-time Socket.IO broadcast
  emitVerificationEvent(verificationRecord);

  // Asynchronous Email Alert Dispatch (Section 21, 22, 25)
  (async () => {
    try {
      const holderEmail = credential?.holderId?.email || credential?.metadata?.holderEmail || digitalIdDoc?.userId?.email;
      const orgName = credential?.organizationId?.organizationName || credential?.metadata?.organizationName || 'Issuing Authority';
      const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@veriglass.edu';

      if (result === 'VALID' && holderEmail) {
        await sendVerificationSuccessEmail({
          to: holderEmail,
          holderName,
          credentialTitle: docName,
          credentialNumber: credential?.credentialNumber || cleanKey,
          organization: orgName,
          verificationId,
          verificationTime: now
        });
      } else if (result === 'EXPIRED' && holderEmail) {
        await sendExpiredCredentialEmail({
          to: holderEmail,
          holderName,
          credentialTitle: docName,
          credentialNumber: credential?.credentialNumber || cleanKey,
          organization: orgName,
          expiryDate: activeDoc.expiryDate
        });
      } else if (result === 'REVOKED' && holderEmail) {
        await sendRevokedCredentialEmail({
          to: holderEmail,
          holderName,
          credentialTitle: docName,
          credentialNumber: credential?.credentialNumber || cleanKey,
          organization: orgName,
          reason: credential?.metadata?.revocationReason || 'Revoked by issuing authority'
        });
      } else if (result === 'INVALID') {
        await sendInvalidCredentialAlert({
          adminEmail,
          scannedKey: cleanKey,
          ipAddress,
          attemptTime: now
        });
      } else if (result === 'TAMPERED') {
        await sendTamperedCredentialAlert({
          adminEmail,
          credentialNumber: credential?.credentialNumber || cleanKey,
          credentialTitle: docName,
          ipAddress
        });
      }
    } catch (emailErr) {
      console.warn('[Email Dispatch Note]:', emailErr.message);
    }
  })();

  // Safe document payload (Section 8 Verification Result Page fields)
  const safeDoc = activeDoc ? {
    id: activeDoc._id,
    credentialId: credential?.credentialId || activeDoc._id,
    organizationName: credential?.organizationId?.organizationName || credential?.metadata?.organizationName || digitalIdDoc?.organization || 'Issuing Authority',
    holderName: holderName,
    holderEmail: credential?.holderId?.email || credential?.metadata?.holderEmail || digitalIdDoc?.userId?.email || '',
    holderType: credential?.holderId?.holderType || credential?.metadata?.holderType || 'STUDENT',
    credentialType: credential?.credentialType || digitalIdDoc?.designation || 'Credential',
    credentialTitle: credential?.credentialTitle || digitalIdDoc?.department || 'Digital Credential',
    credentialNumber: credential?.credentialNumber || digitalIdDoc?.uniqueId || cleanKey,
    issueDate: activeDoc.issueDate,
    expiryDate: activeDoc.expiryDate,
    status: activeDoc.status,
    verificationTime: now,
    verifiedAgainstLiveRecord: true,
    // Backwards compatibility aliases
    digitalId: credential ? credential.credentialNumber : digitalIdDoc.uniqueId,
    uniqueId: credential ? credential.credentialNumber : digitalIdDoc.uniqueId,
    name: holderName,
    holder: holderName,
    organization: credential?.organizationId?.organizationName || credential?.metadata?.organizationName || digitalIdDoc?.organization || 'Issuing Authority',
    department: credential?.metadata?.department || digitalIdDoc?.department || '',
    designation: credential?.credentialType || digitalIdDoc?.designation || '',
    validUntil: activeDoc.expiryDate
  } : null;

  return {
    success: result === 'VALID',
    status: result,
    result,
    outcome: result,
    message,
    statusText: result,
    doc: safeDoc,
    credential: safeDoc,
    holder: safeDoc ? { name: holderName, email: safeDoc.holderEmail, type: safeDoc.holderType } : null,
    verificationRecord,
    verificationTime: now,
    verifiedAgainstLiveRecord: true,
    trustAnalysis
  };
};

// @desc    Verify by token via GET URL (/api/verify/:token)
// @route   GET /api/verify/:token
// @access  Public
export const verifyByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { verifierName, verifierOrganization } = req.query;

    const verificationResult = await processVerification({
      searchKey: token,
      verifierId: req.user?._id,
      verifierName: verifierName || req.user?.name || 'Public Verifier',
      verifierOrganization: verifierOrganization || '',
      method: 'QR_SCAN',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || ''
    });

    res.json(verificationResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Scan and Verify QR or Manual ID
// @route   POST /api/verify or POST /api/verification/scan
// @access  Public / Authenticated
export const scanVerification = async (req, res) => {
  try {
    const {
      qrPayload,
      queryId,
      identifier,
      id,
      token,
      verifierName,
      verifierOrganization = '',
      searchKey: directSearchKey,
      purpose,
      method = 'QR_SCAN'
    } = req.body;

    const searchKey = directSearchKey || qrPayload || queryId || identifier || id || token || '';
    if (!searchKey || !searchKey.trim()) {
      return res.status(400).json({ success: false, message: 'Verification token or Credential Number is required.' });
    }

    const verificationResult = await processVerification({
      searchKey,
      verifierId: req.user?._id,
      verifierName: verifierName || req.user?.name || 'Authorized Verifier',
      verifierOrganization: verifierOrganization || '',
      method,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || ''
    });

    res.json(verificationResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explicitly Save a Verification Record
// @route   POST /api/verifications
// @access  Public / Authenticated
export const createVerificationRecord = async (req, res) => {
  return scanVerification(req, res);
};

// @desc    Get All Verification Logs from MongoDB
// @route   GET /api/verifications or GET /api/verification/history
// @access  Public / Authenticated
export const getVerificationHistory = async (req, res) => {
  try {
    const { search = '', status = '', result = '', date = '', userId = '' } = req.query;

    const query = {};

    const targetResult = status || result || req.query.outcome;
    if (targetResult && targetResult !== 'ALL') {
      query.result = targetResult.toUpperCase();
    }

    const targetUserId = userId || req.query.holderId || ((req.user?.role === 'CREDENTIAL_HOLDER' || req.user?.role === 'USER') ? req.user?._id : null);
    if (targetUserId) {
      const userDocIds = await DigitalID.find({ userId: targetUserId }).distinct('_id');
      const userCredIds = await Credential.find({ holderId: targetUserId }).distinct('_id');
      query.$or = [
        { digitalId: { $in: userDocIds } },
        { credentialId: { $in: userCredIds } },
        { verifierId: targetUserId }
      ];
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { uniqueId: regex },
        { verifierName: regex },
        { documentName: regex },
        { verifiedPerson: regex }
      ];
    }

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.verificationTime = { $gte: d, $lt: nextDay };
    }

    const history = await Verification.find(query)
      .populate('credentialId')
      .populate('digitalId')
      .populate('verifierId', 'name email role')
      .sort({ verificationTime: -1 });

    res.json({
      success: true,
      total: history.length,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Real Verification Statistics from MongoDB
// @route   GET /api/dashboard/stats or GET /api/verification/stats
// @access  Public / Authenticated
export const getVerificationStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCredentials = await Credential.countDocuments();
    const totalDigitalIDs = await DigitalID.countDocuments();

    const activeCreds = await Credential.countDocuments({ status: 'ACTIVE' });
    const expiredCreds = await Credential.countDocuments({ status: 'EXPIRED' });
    const revokedCreds = await Credential.countDocuments({ status: 'REVOKED' });

    const totalVerifications = await Verification.countDocuments();
    const validVerifications = await Verification.countDocuments({ result: 'VALID' });
    const expiredVerifications = await Verification.countDocuments({ result: 'EXPIRED' });
    const revokedVerifications = await Verification.countDocuments({ result: 'REVOKED' });
    const invalidVerifications = await Verification.countDocuments({ result: 'INVALID' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVerifications = await Verification.countDocuments({
      verificationTime: { $gte: startOfToday }
    });

    const successRate = totalVerifications > 0
      ? ((validVerifications / totalVerifications) * 100).toFixed(1)
      : '0';

    const effectiveTotalCreds = totalCredentials || totalDigitalIDs;

    res.json({
      success: true,
      stats: {
        total: totalVerifications,
        totalVerifications,
        valid: validVerifications,
        expired: expiredVerifications,
        revoked: revokedVerifications,
        invalid: invalidVerifications,
        todayVerifications,
        successRate: `${successRate}%`,
        totalUsers,
        totalCredentials: effectiveTotalCreds,
        totalDigitalIDs: effectiveTotalCreds,
        totalIdentities: effectiveTotalCreds,
        activeIdentities: activeCreds || (await DigitalID.countDocuments({ status: 'ACTIVE' })),
        expiredIdentities: expiredCreds || (await DigitalID.countDocuments({ status: 'EXPIRED' })),
        revokedIdentities: revokedCreds || (await DigitalID.countDocuments({ status: 'REVOKED' }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single verification by ID
// @route   GET /api/verifications/:id
// @access  Public
export const getVerificationById = async (req, res) => {
  try {
    const searchId = req.params.id;
    const record = await Verification.findOne({
      $or: [
        { _id: searchId.match(/^[0-9a-fA-F]{24}$/) ? searchId : null },
        { verificationId: searchId },
        { scannedPayload: searchId },
        { uniqueId: searchId }
      ].filter(Boolean)
    })
      .populate('credentialId')
      .populate('digitalId')
      .populate('verifierId', 'name email role');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

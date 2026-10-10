import User from '../models/User.js';
import DigitalID from '../models/DigitalID.js';
import Credential from '../models/Credential.js';
import CredentialVersion from '../models/CredentialVersion.js';
import Verification from '../models/Verification.js';
import SecurityAlert from '../models/SecurityAlert.js';
import Notification from '../models/Notification.js';

let systemSettings = {
  systemName: 'Digital Verification Using QR Code',
  institutionCode: 'DIGITAL-VERIFICATION-2026',
  allowSelfRegistration: true,
  requireAdminApproval: false,
  qrTokenExpirationHours: 720,
  maxVerificationLatencyMs: 800,
  maintenanceMode: false
};

// @desc    Get real-time admin analytics calculated from MongoDB (Section 7)
// @route   GET /api/admin/analytics and GET /api/admin/dashboard
// @access  Admin Only / Authenticated
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. User metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
    const userRoleCount = await User.countDocuments({ role: { $in: ['USER', 'CREDENTIAL_HOLDER'] } });
    const verifiersCount = await User.countDocuments({ role: 'VERIFIER' });
    const adminsCount = await User.countDocuments({ role: { $in: ['ADMIN', 'ORGANIZATION_ADMIN'] } });

    // 2. Credential metrics (Section 7 & 10)
    const credTotal = await Credential.countDocuments();
    const credActive = await Credential.countDocuments({ status: 'ACTIVE' });
    const credExpired = await Credential.countDocuments({ status: 'EXPIRED' });
    const credRevoked = await Credential.countDocuments({ status: 'REVOKED' });

    // Fallback/combined with DigitalID for dual compatibility
    const totalCredentials = credTotal || await DigitalID.countDocuments();
    const activeCredentials = credTotal > 0 ? credActive : await DigitalID.countDocuments({ status: 'ACTIVE' });
    const expiredCredentials = credTotal > 0 ? credExpired : await DigitalID.countDocuments({ status: 'EXPIRED' });
    const revokedCredentials = credTotal > 0 ? credRevoked : await DigitalID.countDocuments({ status: 'REVOKED' });

    // 3. Verification metrics (VALID, EXPIRED, REVOKED, INVALID, TAMPERED)
    const totalVerifications = await Verification.countDocuments();
    const validVerifications = await Verification.countDocuments({ result: 'VALID' });
    const expiredVerifications = await Verification.countDocuments({ result: 'EXPIRED' });
    const revokedVerifications = await Verification.countDocuments({ result: 'REVOKED' });
    const invalidVerifications = await Verification.countDocuments({ result: 'INVALID' });
    const tamperedVerifications = await Verification.countDocuments({ result: 'TAMPERED' });

    const successRate = totalVerifications > 0
      ? ((validVerifications / totalVerifications) * 100).toFixed(1)
      : '0.0';

    // 4. Security Alerts
    const securityAlertsCount = await SecurityAlert.countDocuments();
    const unresolvedAlertsCount = await SecurityAlert.countDocuments({ status: 'UNRESOLVED' });
    const recentAlerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(5);

    // 5. Recent verification activity
    const recentVerifications = await Verification.find()
      .populate('credentialId')
      .populate('digitalId')
      .sort({ verificationTime: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          userRole: userRoleCount,
          verifiers: verifiersCount,
          admins: adminsCount
        },
        credentials: {
          total: totalCredentials,
          active: activeCredentials,
          expired: expiredCredentials,
          revoked: revokedCredentials
        },
        identities: {
          total: totalCredentials,
          active: activeCredentials,
          expired: expiredCredentials,
          revoked: revokedCredentials
        },
        verifications: {
          total: totalVerifications,
          valid: validVerifications,
          expired: expiredVerifications,
          revoked: revokedVerifications,
          invalid: invalidVerifications,
          tampered: tamperedVerifications,
          successRate: `${successRate}%`
        },
        securityAlerts: {
          total: securityAlertsCount,
          unresolved: unresolvedAlertsCount,
          recent: recentAlerts
        },
        recentVerifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = getAdminAnalytics;

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin Only
export const getAuditLogs = async (req, res) => {
  try {
    const recentVerifications = await Verification.find().sort({ verificationTime: -1 }).limit(30);
    const logs = recentVerifications.map((v) => ({
      id: v._id.toString(),
      action: `VERIFICATION_${v.result}`,
      performedBy: v.verifierName || 'Public Verifier',
      role: 'VERIFIER',
      targetId: v.uniqueId || (v.credentialId ? v.credentialId.toString() : 'UNKNOWN'),
      details: `Verification processed via ${v.method || v.verificationMethod}. Result: ${v.result}.`,
      ipAddress: v.ipAddress || '127.0.0.1',
      status: v.result === 'VALID' ? 'SUCCESS' : v.result === 'TAMPERED' ? 'CRITICAL' : 'WARNING',
      timestamp: v.verificationTime || v.createdAt
    }));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Security Alerts
// @route   GET /api/admin/security-alerts
// @access  Admin Only
export const getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Admin Only
export const getSettings = (req, res) => {
  res.json({ success: true, data: systemSettings });
};
export const getSystemSettings = getSettings;

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Admin Only
export const updateSettings = (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json({ success: true, message: 'Settings updated successfully', data: systemSettings });
};
export const updateSystemSettings = updateSettings;

// @desc    Reset Database (Admin action)
// @route   POST /api/admin/reset-database
// @access  Admin Only
export const resetDatabaseAction = async (req, res) => {
  try {
    await Credential.deleteMany({});
    await CredentialVersion.deleteMany({});
    await DigitalID.deleteMany({});
    await Verification.deleteMany({});
    await SecurityAlert.deleteMany({});
    await User.deleteMany({ role: { $nin: ['ADMIN', 'ORGANIZATION_ADMIN'] } });
    await Notification.deleteMany({});

    res.json({
      success: true,
      message: 'Database reset to clean state. All non-admin records purged from MongoDB.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

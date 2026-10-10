import Credential from '../models/Credential.js';
import DigitalID from '../models/DigitalID.js';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import Organization from '../models/Organization.js';

// @desc    Get real-time organization dashboard stats
// @route   GET /api/dashboard/stats
// @access  Public / Authenticated
export const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user?.organizationId;
    const orgFilter = orgId ? { organizationId: orgId } : {};

    // 1. Users & Holders count
    const totalUsers = await User.countDocuments();
    const totalHolders = await User.countDocuments({
      role: { $in: ['CREDENTIAL_HOLDER', 'USER', 'STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT'] },
      ...(orgId ? { organizationId: orgId } : {})
    });

    // 2. Credentials counts (Check Credential model, fall back to DigitalID if none)
    let credCount = await Credential.countDocuments(orgFilter);
    let activeCreds = await Credential.countDocuments({ ...orgFilter, status: 'ACTIVE' });
    let expiredCreds = await Credential.countDocuments({ ...orgFilter, status: 'EXPIRED' });
    let revokedCreds = await Credential.countDocuments({ ...orgFilter, status: 'REVOKED' });

    // Include DigitalIDs if Credential model is empty
    if (credCount === 0) {
      const idCount = await DigitalID.countDocuments();
      if (idCount > 0) {
        credCount = idCount;
        activeCreds = await DigitalID.countDocuments({ status: 'ACTIVE' });
        expiredCreds = await DigitalID.countDocuments({ status: 'EXPIRED' });
        revokedCreds = await DigitalID.countDocuments({ status: 'REVOKED' });
      }
    }

    // 3. Verifications
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

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCredentialHolders: totalHolders,
        totalHolders,
        totalCredentials: credCount,
        activeCredentials: activeCreds,
        expiredCredentials: expiredCreds,
        revokedCredentials: revokedCreds,
        totalVerifications,
        todayVerifications,
        validVerifications,
        expiredVerifications,
        revokedVerifications,
        invalidVerifications,
        successRate: `${successRate}%`,
        // Backwards compatibility aliases
        total: totalVerifications,
        valid: validVerifications,
        expired: expiredVerifications,
        revoked: revokedVerifications,
        invalid: invalidVerifications,
        totalDigitalIDs: credCount,
        activeIdentities: activeCreds,
        expiredIdentities: expiredCreds,
        revokedIdentities: revokedCreds
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get real verification activity trends over time
// @route   GET /api/dashboard/verification-trends
// @access  Public / Authenticated
export const getVerificationTrends = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const trends = await Verification.aggregate([
      {
        $match: {
          verificationTime: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$verificationTime' }
          },
          date: {
            $first: { $dateToString: { format: '%b %d', date: '$verificationTime' } }
          },
          total: { $sum: 1 },
          valid: {
            $sum: { $cond: [{ $eq: ['$result', 'VALID'] }, 1, 0] }
          },
          expired: {
            $sum: { $cond: [{ $eq: ['$result', 'EXPIRED'] }, 1, 0] }
          },
          revoked: {
            $sum: { $cond: [{ $eq: ['$result', 'REVOKED'] }, 1, 0] }
          },
          invalid: {
            $sum: { $cond: [{ $eq: ['$result', 'INVALID'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get real credential distribution & breakdowns from MongoDB
// @route   GET /api/dashboard/credential-distribution
// @access  Public / Authenticated
export const getCredentialDistribution = async (req, res) => {
  try {
    // 1. Status distribution
    let statusDist = await Credential.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    if (!statusDist.length) {
      statusDist = await DigitalID.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
    }

    // 2. Holder type distribution
    const holderTypeDist = await User.aggregate([
      { $match: { role: { $in: ['CREDENTIAL_HOLDER', 'USER', 'STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT'] } } },
      { $group: { _id: '$holderType', count: { $sum: 1 } } }
    ]);

    // 3. Credential type distribution
    const credTypeDist = await Credential.aggregate([
      { $group: { _id: '$credentialType', count: { $sum: 1 } } }
    ]);

    // 4. Verification result distribution
    const verifResultDist = await Verification.aggregate([
      { $group: { _id: '$result', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: statusDist.map((item) => ({ name: item._id || 'UNKNOWN', value: item.count })),
        holderTypeDistribution: holderTypeDist.map((item) => ({ name: item._id || 'STUDENT', value: item.count })),
        credentialTypeDistribution: credTypeDist.map((item) => ({ name: item._id || 'General', value: item.count })),
        verificationResultDistribution: verifResultDist.map((item) => ({ name: item._id, value: item.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recently verified credentials (Section 12: GET /api/dashboard/recent)
// @route   GET /api/dashboard/recent
// @access  Public / Authenticated
export const getDashboardRecent = async (req, res) => {
  try {
    const list = await Verification.find({})
      .sort({ createdAt: -1, verificationTime: -1 })
      .limit(10);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics overview (Section 12: GET /api/dashboard/analytics)
// @route   GET /api/dashboard/analytics
// @access  Public / Authenticated
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHolders = await User.countDocuments({ role: { $in: ['CREDENTIAL_HOLDER', 'USER', 'STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT'] } });
    const totalCredentials = await Credential.countDocuments();
    const totalVerifications = await Verification.countDocuments();

    const statusDist = await Credential.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const holderTypeDist = await User.aggregate([
      { $match: { role: { $in: ['CREDENTIAL_HOLDER', 'USER', 'STUDENT', 'EMPLOYEE'] } } },
      { $group: { _id: '$holderType', count: { $sum: 1 } } }
    ]);
    const verifResultDist = await Verification.aggregate([
      { $group: { _id: '$result', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalHolders,
        totalCredentials,
        totalVerifications
      },
      distributions: {
        status: statusDist,
        holderTypes: holderTypeDist,
        results: verifResultDist
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

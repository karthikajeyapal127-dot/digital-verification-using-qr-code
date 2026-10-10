import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import DigitalID from '../models/DigitalID.js';
import Credential from '../models/Credential.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitDigitalIDEvent, emitNotificationEvent } from '../services/socketService.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const findRecordFlexible = async (searchId) => {
  if (!searchId) return { doc: null, model: null };
  const clean = String(searchId).trim();
  const isOid = clean.match(/^[0-9a-fA-F]{24}$/);

  let doc = await DigitalID.findOne({
    $or: [
      { _id: isOid ? clean : null },
      { uniqueId: clean },
      { verificationToken: clean }
    ].filter(Boolean)
  });
  if (doc) return { doc, model: 'DigitalID' };

  let cred = await Credential.findOne({
    $or: [
      { _id: isOid ? clean : null },
      { credentialNumber: clean },
      { credentialId: clean },
      { verificationToken: clean }
    ].filter(Boolean)
  });
  if (cred) return { doc: cred, model: 'Credential' };

  return { doc: null, model: null };
};

// @desc    Get all digital IDs with search & status filter directly from MongoDB
// @route   GET /api/digital-ids or GET /api/digital-id
// @access  Public / Authenticated
export const getAllDigitalIDs = async (req, res) => {
  try {
    const { status, search, userId } = req.query;
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { uniqueId: regex },
        { holderName: regex },
        { organization: regex },
        { department: regex },
        { designation: regex }
      ];
    }

    const docs = await DigitalID.find(query)
      .populate('userId', 'name email phone role organization department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single digital ID by ID, uniqueId, or verificationToken
// @route   GET /api/digital-ids/:id
// @access  Public
export const getDigitalIDById = async (req, res) => {
  try {
    const searchId = req.params.id;

    let doc = null;
    // Check if it's a valid ObjectId
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await DigitalID.findById(searchId).populate('userId', 'name email phone role organization department');
    }

    if (!doc) {
      doc = await DigitalID.findOne({
        $or: [
          { uniqueId: searchId },
          { uniqueId: searchId.toUpperCase() },
          { verificationToken: searchId }
        ]
      }).populate('userId', 'name email phone role organization department');
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Digital ID not found' });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Digital ID (Admin Flow - Mandatory End-to-End Requirement)
// @route   POST /api/digital-ids
// @access  Admin / Authenticated
export const createDigitalID = async (req, res) => {
  try {
    const {
      userId,
      user,
      uniqueId,
      organization = 'Digital Verification Authority',
      department = 'General',
      designation = 'Member',
      issueDate = new Date(),
      expiryDate,
      validUntil
    } = req.body;

    // 1. Validate data
    let targetUniqueId = (uniqueId || req.body.id || req.body.digitalId || `DVID-2026-${Math.floor(10000 + Math.random() * 90000)}`).trim();

    // Extract user from token if req.user is undefined
    let tokenUser = req.user;
    if (!tokenUser && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veriglass-production-super-secret-key-2026');
        tokenUser = await User.findById(decoded.id);
      } catch (err) {
        // ignore
      }
    }

    // Determine target user
    let userDoc = null;
    const targetUserId = userId || user || tokenUser?._id;

    if (targetUserId) {
      if (typeof targetUserId === 'string' && targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
        userDoc = await User.findById(targetUserId);
      } else if (typeof targetUserId === 'string' && targetUserId.includes('@')) {
        userDoc = await User.findOne({ email: targetUserId.toLowerCase() });
      }
    }

    if (!userDoc && tokenUser) {
      userDoc = tokenUser;
    }

    // Fallback: If no user specified, associate with Karthika or first registered user
    if (!userDoc) {
      userDoc = await User.findOne({ email: 'karthika@apex.edu' }) ||
                await User.findOne({ role: 'CREDENTIAL_HOLDER' }) ||
                await User.findOne({ role: 'USER' }) ||
                await User.findOne({});
    }

    if (!userDoc) {
      userDoc = await User.create({
        name: req.body.holder || 'J. Karthika',
        email: 'karthika@apex.edu',
        password: '$2a$10$XU0nB8wBsm.m2R9W9hW41eM58fP44v5Z9.6zZ6fV087kH13vA.B2G',
        role: 'CREDENTIAL_HOLDER',
        organization: 'Apex Institute of Science & Technology',
        department: 'Computer Science & Engineering',
        status: 'ACTIVE'
      });
    }

    // Determine initial status: defaults to ACTIVE so generated credentials verify immediately
    let initialStatus = 'ACTIVE';
    if (req.body.status) {
      initialStatus = req.body.status.toUpperCase();
    }

    const targetHolderName = req.body.holder || userDoc.name || 'Credential Holder';
    const targetDesignation = designation !== 'Member' ? designation : (req.body.name || req.body.type || 'Member');
    const targetDepartment = department !== 'General' ? department : (req.body.department || userDoc.department || 'General');
    const targetOrg = organization !== 'Digital Verification Authority' ? organization : (req.body.issuer || userDoc.organization || 'Apex Institute of Science & Technology');

    // Check if uniqueId already exists - if so, update to ACTIVE and return seamlessly
    let existing = await DigitalID.findOne({ uniqueId: targetUniqueId });
    if (existing) {
      existing.holderName = targetHolderName;
      existing.designation = targetDesignation;
      existing.department = targetDepartment;
      existing.organization = targetOrg;
      existing.status = initialStatus;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Digital ID updated and active in MongoDB ledger',
        data: existing,
        verificationToken: existing.verificationToken,
        qrUrl: existing.qrCodeUrl
      });
    }

    // 2. Generate a secure unique verification token
    const verificationToken = crypto.randomBytes(16).toString('hex');

    // 3. Form verification URL
    const qrUrl = `${clientUrl}/verify/${verificationToken}`;

    // Compute dates
    const parsedIssueDate = issueDate ? new Date(issueDate) : new Date();
    let parsedExpiryDate;
    if (expiryDate || validUntil) {
      parsedExpiryDate = new Date(expiryDate || validUntil);
    } else {
      parsedExpiryDate = new Date(parsedIssueDate);
      parsedExpiryDate.setFullYear(parsedExpiryDate.getFullYear() + 2);
    }

    // 4. Create DigitalID document and save in MongoDB
    const digitalId = await DigitalID.create({
      userId: userDoc._id,
      uniqueId: targetUniqueId,
      organization: targetOrg,
      department: targetDepartment,
      designation: targetDesignation,
      issueDate: parsedIssueDate,
      expiryDate: parsedExpiryDate,
      verificationToken,
      status: initialStatus,
      holderName: targetHolderName,
      qrCodeUrl: qrUrl,
      issuerCode: req.body.issuerCode || 'AIST-IND-082',
      type: req.body.type || 'Degree Certificate',
      holderId: req.body.holderId || targetUniqueId,
      tamperProofHash: crypto.createHash('sha256').update(`${targetUniqueId}-${verificationToken}-${targetHolderName}`).digest('hex')
    });

    // 5. Generate QR Data URL for instant preview
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // 6. Create notification for the user
    const notif = await Notification.create({
      userId: userDoc._id,
      title: initialStatus === 'PENDING' ? 'Digital ID Application Submitted' : 'Digital ID Created',
      message: `Your Digital ID [${targetUniqueId}] is ${initialStatus}.`,
      type: initialStatus === 'PENDING' ? 'CREATED' : 'CREATED',
      relatedId: digitalId._id.toString()
    });

    // Real-time broadcast
    emitDigitalIDEvent('created', digitalId);
    emitNotificationEvent(notif);

    const retData = digitalId.toJSON();
    if (initialStatus === 'PENDING') retData.status = 'Pending';
    else if (initialStatus === 'ACTIVE') retData.status = 'Active';

    // 7. Return the QR information to frontend
    res.status(201).json({
      success: true,
      message: 'Digital ID created and cryptographically saved to MongoDB',
      data: retData,
      verificationToken,
      qrUrl,
      qrDataUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke Digital ID
// @route   PUT /api/digital-ids/:id/revoke
// @access  Admin
export const revokeDigitalID = async (req, res) => {
  try {
    const { doc, model } = await findRecordFlexible(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Identity or Credential not found' });
    }

    doc.status = 'REVOKED';
    if (model === 'Credential') {
      doc.revocationReason = req.body?.reason || 'Revoked by administration';
      doc.revokedAt = new Date();
    }
    await doc.save();

    // Synchronize both collections by key
    const idKey = doc.uniqueId || doc.credentialNumber;
    const tokenKey = doc.verificationToken;
    const syncQuery = {
      $or: [
        { uniqueId: idKey },
        { credentialNumber: idKey },
        { verificationToken: tokenKey }
      ].filter(Boolean)
    };
    await DigitalID.updateMany(syncQuery, { status: 'REVOKED' });
    await Credential.updateMany(syncQuery, {
      status: 'REVOKED',
      revokedAt: new Date(),
      revocationReason: req.body?.reason || 'Revoked by administration'
    });

    const notifUserId = doc.userId || doc.holderId?._id || doc.holderId;
    if (notifUserId) {
      const idCode = doc.uniqueId || doc.credentialNumber || 'ID';
      const notif = await Notification.create({
        userId: notifUserId,
        title: 'Identity Revoked',
        message: `Your credential [${idCode}] has been revoked by Administration.`,
        type: 'REVOKED',
        relatedId: doc._id.toString()
      });
      emitNotificationEvent(notif);
    }

    emitDigitalIDEvent('revoked', doc);

    const retData = doc.toJSON ? doc.toJSON() : doc;
    res.json({
      success: true,
      message: `Identity marked as REVOKED successfully.`,
      data: retData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore / Reactivate Digital ID
// @route   PUT /api/digital-ids/:id/restore
// @access  Admin
export const restoreDigitalID = async (req, res) => {
  try {
    const { doc, model } = await findRecordFlexible(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Identity or Credential not found' });
    }

    doc.status = 'ACTIVE';
    if (model === 'Credential') {
      doc.revocationReason = '';
      doc.revokedAt = null;
    }
    await doc.save();

    // Synchronize both collections by key
    const idKey = doc.uniqueId || doc.credentialNumber;
    const tokenKey = doc.verificationToken;
    const syncQuery = {
      $or: [
        { uniqueId: idKey },
        { credentialNumber: idKey },
        { verificationToken: tokenKey }
      ].filter(Boolean)
    };
    await DigitalID.updateMany(syncQuery, { status: 'ACTIVE' });
    await Credential.updateMany(syncQuery, {
      status: 'ACTIVE',
      revocationReason: '',
      revokedAt: null
    });

    const notifUserId = doc.userId || doc.holderId?._id || doc.holderId;
    if (notifUserId) {
      const idCode = doc.uniqueId || doc.credentialNumber || 'ID';
      const notif = await Notification.create({
        userId: notifUserId,
        title: 'Identity Restored',
        message: `Your credential [${idCode}] has been restored to ACTIVE status.`,
        type: 'CREATED',
        relatedId: doc._id.toString()
      });
      emitNotificationEvent(notif);
    }

    emitDigitalIDEvent('restored', doc);

    const retData = doc.toJSON ? doc.toJSON() : doc;
    res.json({
      success: true,
      message: `Identity restored to ACTIVE status.`,
      data: retData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Regenerate QR Verification Token
// @route   POST /api/digital-ids/:id/regenerate-qr
// @access  Admin / Authenticated
export const regenerateQR = async (req, res) => {
  try {
    const searchId = req.params.id;
    let doc = await DigitalID.findOne({
      $or: [
        { _id: searchId.match(/^[0-9a-fA-F]{24}$/) ? searchId : null },
        { uniqueId: searchId },
        { verificationToken: searchId }
      ].filter(Boolean)
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Digital ID not found' });
    }

    const newToken = crypto.randomBytes(16).toString('hex');
    const newQrUrl = `${clientUrl}/verify/${newToken}`;

    doc.verificationToken = newToken;
    doc.qrCodeUrl = newQrUrl;
    await doc.save();

    emitDigitalIDEvent('regenerated', doc);

    res.json({
      success: true,
      message: 'New QR code and verification token generated',
      verificationToken: newToken,
      qrUrl: newQrUrl,
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get QR Code Image as PNG or SVG
// @route   GET /api/digital-ids/:id/qr-image
// @access  Public
export const getQRImage = async (req, res) => {
  try {
    const searchId = req.params.id;
    let doc = await DigitalID.findOne({
      $or: [
        { _id: searchId.match(/^[0-9a-fA-F]{24}$/) ? searchId : null },
        { uniqueId: searchId },
        { verificationToken: searchId }
      ].filter(Boolean)
    });

    const qrText = doc ? (doc.qrCodeUrl || `${clientUrl}/verify/${doc.verificationToken}`) : `${clientUrl}/verify/${searchId}`;

    res.setHeader('Content-Type', 'image/png');
    QRCode.toFileStream(res, qrText, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'H'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDigitalID = async (req, res) => {
  try {
    const { doc, model } = await findRecordFlexible(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Identity or Credential not found' });
    }

    doc.status = 'ACTIVE';
    if (!doc.verificationToken) {
      doc.verificationToken = crypto.randomBytes(16).toString('hex');
      doc.qrCodeUrl = `${clientUrl}/verify/${doc.verificationToken}`;
    }
    await doc.save();

    const notifUserId = doc.userId || doc.holderId?._id || doc.holderId;
    if (notifUserId) {
      const idCode = doc.uniqueId || doc.credentialNumber || 'ID';
      const notif = await Notification.create({
        userId: notifUserId,
        title: 'Identity Approved',
        message: `Your credential [${idCode}] has been approved and is now ACTIVE.`,
        type: 'CREATED',
        relatedId: doc._id.toString()
      });
      emitNotificationEvent(notif);
    }

    emitDigitalIDEvent('approved', doc);

    const retData = doc.toJSON ? doc.toJSON() : doc;
    retData.status = 'Active';
    retData.qrToken = doc.verificationToken;

    res.json({
      success: true,
      message: `Identity approved and activated.`,
      data: retData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDigitalID = async (req, res) => {
  try {
    const searchId = req.params.id;
    const clean = String(searchId).trim();
    const isOid = clean.match(/^[0-9a-fA-F]{24}$/);

    let doc = await DigitalID.findOne({
      $or: [
        { _id: isOid ? clean : null },
        { uniqueId: clean },
        { verificationToken: clean }
      ].filter(Boolean)
    });

    if (!doc) {
      doc = await Credential.findOne({
        $or: [
          { _id: isOid ? clean : null },
          { credentialNumber: clean },
          { credentialId: clean },
          { verificationToken: clean }
        ].filter(Boolean)
      });
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Record not found in database' });
    }

    const idKey = doc.uniqueId || doc.credentialNumber || doc.credentialId;
    const tokenKey = doc.verificationToken;
    const syncQuery = {
      $or: [
        { uniqueId: idKey },
        { credentialNumber: idKey },
        { credentialId: idKey },
        { verificationToken: tokenKey }
      ].filter(Boolean)
    };

    await DigitalID.deleteMany(syncQuery);
    await Credential.deleteMany(syncQuery);

    res.json({ success: true, message: 'Record permanently deleted from MongoDB' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDigitalID = revokeDigitalID;

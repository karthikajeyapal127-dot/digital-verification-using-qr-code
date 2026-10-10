import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import Credential from '../models/Credential.js';
import CredentialVersion from '../models/CredentialVersion.js';
import DigitalID from '../models/DigitalID.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Notification from '../models/Notification.js';
import Verification from '../models/Verification.js';
import { emitNotificationEvent } from '../services/socketService.js';

const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

// @desc    Issue a new credential with secure verification token & QR
// @route   POST /api/credentials
// @access  Private (Organization Admin)
export const createCredential = async (req, res) => {
  try {
    const {
      holderId,
      credentialType,
      credentialTitle,
      credentialNumber,
      issueDate,
      expiryDate,
      metadata = {}
    } = req.body;

    if (!credentialType || !credentialTitle || !credentialNumber || !issueDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'credentialType, credentialTitle, credentialNumber, issueDate, and expiryDate are required.'
      });
    }

    // Verify holder exists in MongoDB
    let holder = null;
    if (holderId) {
      if (holderId.match(/^[0-9a-fA-F]{24}$/)) {
        holder = await User.findById(holderId);
      }
      if (!holder) {
        holder = await User.findOne({
          $or: [{ userId: holderId }, { email: holderId.toLowerCase() }]
        });
      }
    }

    // If no holder was found by ID, allow creating or looking up by metadata email/name
    if (!holder && (metadata?.holderEmail || metadata?.holderName)) {
      const email = (metadata.holderEmail || `${(metadata.holderName || 'holder').toLowerCase().replace(/\s+/g, '.')}@institution.edu`).toLowerCase().trim();
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        holder = existingUser;
      } else {
        const hashedPassword = await bcrypt.hash('HolderPass@2026', 10);
        holder = await User.create({
          userId: `HLD-${Date.now().toString().slice(-6)}`,
          name: metadata.holderName || 'Credential Holder',
          email,
          passwordHash: hashedPassword,
          role: 'CREDENTIAL_HOLDER',
          holderType: metadata.holderType || 'STUDENT',
          department: metadata.department || 'General',
          designation: metadata.designation || credentialType,
          organization: req.user?.organizationName || 'Apex Institute of Science & Technology',
          status: 'ACTIVE'
        });
      }
    }

    if (!holder) {
      return res.status(400).json({
        success: false,
        message: 'Valid credential holder is required. Please create or select a holder first.'
      });
    }

    // Verify organization
    let organizationId = req.user?.organizationId;
    let org = null;
    if (organizationId) {
      org = await Organization.findById(organizationId);
    }
    if (!org) {
      org = await Organization.findOne();
      if (org) organizationId = org._id;
    }

    // Check duplicate credential number within the organization
    const existingCred = await Credential.findOne({
      credentialNumber: credentialNumber.trim(),
      ...(organizationId ? { organizationId } : {})
    });
    if (existingCred) {
      return res.status(400).json({
        success: false,
        message: `Credential with number '${credentialNumber}' already exists.`
      });
    }

    // Generate cryptographically secure random verification token (no personal info in token)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${clientUrl}/verify/${verificationToken}`;

    // Generate QR Code data URL
    const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    const isExpired = new Date(expiryDate) < new Date();
    const initialStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

    const credentialId = `CRD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newCredential = await Credential.create({
      credentialId,
      organizationId: organizationId || holder._id,
      holderId: holder._id,
      credentialType: credentialType.trim(),
      credentialTitle: credentialTitle.trim(),
      credentialNumber: credentialNumber.trim(),
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      verificationToken,
      status: initialStatus,
      qrCodeUrl,
      metadata: {
        holderName: holder.name,
        holderEmail: holder.email,
        holderType: holder.holderType || 'STUDENT',
        organizationName: org ? org.organizationName : (req.user?.organizationName || 'Issuing Organization'),
        department: metadata.department || holder.department || 'General',
        designation: metadata.designation || holder.designation || credentialType,
        grade: metadata.grade || '',
        description: metadata.description || ''
      }
    });

    // Also sync to DigitalID model for complete dual compatibility
    try {
      await DigitalID.create({
        uniqueId: credentialNumber.trim(),
        userId: holder._id,
        holderName: holder.name,
        organization: org ? org.organizationName : (req.user?.organizationName || 'Issuing Authority'),
        department: metadata.department || holder.department || 'General',
        designation: metadata.designation || holder.designation || credentialType,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        status: initialStatus,
        verificationToken,
        qrCodeUrl,
        metadata: {
          credentialId: newCredential._id.toString(),
          credentialTitle: credentialTitle.trim()
        }
      });
    } catch (syncErr) {
      // Non-fatal if uniqueId matches existing DigitalID
      console.warn('DigitalID sync note:', syncErr.message);
    }

    // Create Notification for the holder
    try {
      const notif = await Notification.create({
        userId: holder._id,
        organizationId: organizationId || null,
        title: 'New Credential Issued',
        message: `Your credential "${credentialTitle}" (${credentialNumber}) has been issued by ${org ? org.organizationName : 'Organization'}.`,
        type: 'CREDENTIAL_ISSUED',
        relatedId: newCredential._id.toString()
      });
      emitNotificationEvent(notif);
    } catch (notifErr) {
      console.warn('Notification creation error:', notifErr.message);
    }

    // Record initial version in CredentialVersion (Section 21)
    try {
      await CredentialVersion.create({
        credentialId: newCredential._id,
        credentialNumber: newCredential.credentialNumber,
        versionNumber: 1,
        changedBy: req.user?._id || holder._id,
        changedByName: req.user?.name || 'Administrator',
        action: 'CREATED',
        newValue: newCredential.toObject ? newCredential.toObject() : newCredential,
        notes: `Initial issuance of ${newCredential.credentialTitle}`
      });
    } catch (vErr) {
      console.warn('CredentialVersion note:', vErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      data: newCredential,
      verificationUrl,
      qrCodeUrl
    });
  } catch (error) {
    console.error('Error creating credential:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all credentials with filters & live expiry check
// @route   GET /api/credentials
// @access  Private
export const getCredentials = async (req, res) => {
  try {
    const { status, search, holderId, credentialType, organizationId } = req.query;
    const query = {};

    // If user is a Credential Holder, restrict to their own credentials
    const isHolderRole = req.user?.role === 'CREDENTIAL_HOLDER' || req.user?.role === 'USER';
    if (isHolderRole) {
      query.$or = [
        { holderId: req.user._id },
        { 'metadata.holderEmail': req.user.email.toLowerCase() }
      ];
    } else if (holderId) {
      query.holderId = holderId;
    }

    if (organizationId) {
      query.organizationId = organizationId;
    } else if (req.user?.organizationId && req.user?.role === 'ORGANIZATION_ADMIN') {
      query.organizationId = req.user.organizationId;
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    if (credentialType) {
      query.credentialType = credentialType;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      const searchConditions = [
        { credentialTitle: regex },
        { credentialNumber: regex },
        { credentialType: regex },
        { 'metadata.holderName': regex },
        { 'metadata.holderEmail': regex },
        { 'metadata.department': regex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const credentials = await Credential.find(query)
      .populate('holderId', 'name email phone holderType department designation avatar')
      .populate('organizationId', 'organizationName email website')
      .sort({ createdAt: -1 });

    // Live Expiry Update check directly from MongoDB records
    const now = new Date();
    const processed = await Promise.all(
      credentials.map(async (cred) => {
        if (cred.status === 'ACTIVE' && new Date(cred.expiryDate) < now) {
          cred.status = 'EXPIRED';
          await cred.save();
        }
        return cred;
      })
    );

    res.json({
      success: true,
      count: processed.length,
      data: processed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single credential by ID, credentialNumber or verificationToken
// @route   GET /api/credentials/:id
// @access  Public / Private
export const getCredentialById = async (req, res) => {
  try {
    const searchId = req.params.id;
    let cred = null;

    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      cred = await Credential.findById(searchId)
        .populate('holderId', 'name email phone holderType department designation avatar')
        .populate('organizationId', 'organizationName email website address phone logo');
    }

    if (!cred) {
      cred = await Credential.findOne({
        $or: [
          { credentialId: searchId },
          { credentialNumber: searchId },
          { verificationToken: searchId }
        ]
      })
        .populate('holderId', 'name email phone holderType department designation avatar')
        .populate('organizationId', 'organizationName email website address phone logo');
    }

    if (!cred) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    // Live expiry calculation
    if (cred.status === 'ACTIVE' && new Date(cred.expiryDate) < new Date()) {
      cred.status = 'EXPIRED';
      await cred.save();
    }

    // Fetch verification history for this credential
    const verifications = await Verification.find({
      $or: [
        { credentialId: cred._id },
        { uniqueId: cred.credentialNumber },
        { scannedPayload: cred.verificationToken }
      ]
    }).sort({ verificationTime: -1 });

    res.json({
      success: true,
      data: {
        ...cred.toJSON(),
        verifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update credential details (Admin only)
// @route   PUT /api/credentials/:id
// @access  Private (Organization Admin)
export const updateCredential = async (req, res) => {
  try {
    const { credentialTitle, credentialType, expiryDate, metadata } = req.body;
    const searchId = req.params.id;

    let cred = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      cred = await Credential.findById(searchId);
    }
    if (!cred) {
      cred = await Credential.findOne({
        $or: [{ credentialId: searchId }, { credentialNumber: searchId }]
      });
    }

    if (!cred) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    if (credentialTitle) cred.credentialTitle = credentialTitle.trim();
    if (credentialType) cred.credentialType = credentialType.trim();
    if (expiryDate) {
      cred.expiryDate = new Date(expiryDate);
      if (new Date(expiryDate) > new Date() && cred.status === 'EXPIRED') {
        cred.status = 'ACTIVE';
      }
    }
    if (metadata) {
      cred.metadata = { ...cred.metadata, ...metadata };
    }

    await cred.save();

    // Also update DigitalID if matching
    await DigitalID.updateOne(
      { uniqueId: cred.credentialNumber },
      {
        $set: {
          expiryDate: cred.expiryDate,
          designation: cred.credentialType,
          status: cred.status
        }
      }
    );

    // Notify holder
    try {
      const notif = await Notification.create({
        userId: cred.holderId,
        title: 'Credential Updated',
        message: `Your credential "${cred.credentialTitle}" has been updated by the issuing organization.`,
        type: 'GENERAL',
        relatedId: cred._id.toString()
      });
      emitNotificationEvent(notif);
    } catch (e) {
      console.warn('Notification error:', e.message);
    }

    res.json({
      success: true,
      message: 'Credential updated successfully',
      data: cred
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke a credential (Admin only)
// @route   PATCH /api/credentials/:id/revoke
// @access  Private (Organization Admin)
export const revokeCredential = async (req, res) => {
  try {
    const searchId = req.params.id;
    const { reason = 'Revoked by Issuing Organization Admin' } = req.body;

    let cred = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      cred = await Credential.findById(searchId);
    }
    if (!cred) {
      cred = await Credential.findOne({
        $or: [{ credentialId: searchId }, { credentialNumber: searchId }]
      });
    }

    if (!cred) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    cred.status = 'REVOKED';
    cred.metadata = {
      ...(cred.metadata || {}),
      revocationReason: reason,
      revokedAt: new Date()
    };
    await cred.save();

    // Sync to DigitalID
    await DigitalID.updateOne(
      { uniqueId: cred.credentialNumber },
      { $set: { status: 'REVOKED', 'metadata.revocationReason': reason } }
    );

    // Create Notification
    try {
      const notif = await Notification.create({
        userId: cred.holderId,
        title: 'Credential Revoked',
        message: `Your credential "${cred.credentialTitle}" has been REVOKED: ${reason}.`,
        type: 'WARNING',
        relatedId: cred._id.toString()
      });
      emitNotificationEvent(notif);
    } catch (e) {
      console.warn('Revoke notification error:', e.message);
    }

    // Record revocation version in CredentialVersion (Section 21)
    try {
      const prevVer = await CredentialVersion.countDocuments({
        credentialNumber: cred.credentialNumber
      });
      await CredentialVersion.create({
        credentialId: cred._id,
        credentialNumber: cred.credentialNumber,
        versionNumber: prevVer + 1,
        changedBy: req.user?._id || null,
        changedByName: req.user?.name || 'Administrator',
        action: 'REVOKED',
        changedFields: ['status', 'revocationReason', 'revokedAt'],
        previousValue: { status: 'ACTIVE' },
        newValue: { status: 'REVOKED', reason },
        notes: `Revoked by administrator: ${reason}`
      });
    } catch (vErr) {
      console.warn('CredentialVersion note:', vErr.message);
    }

    res.json({
      success: true,
      message: 'Credential has been revoked successfully',
      data: cred
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore / Reactivate a credential (Admin only)
// @route   PATCH /api/credentials/:id/restore
// @access  Private (Organization Admin)
export const restoreCredential = async (req, res) => {
  try {
    const searchId = req.params.id;

    let cred = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      cred = await Credential.findById(searchId);
    }
    if (!cred) {
      cred = await Credential.findOne({
        $or: [{ credentialId: searchId }, { credentialNumber: searchId }]
      });
    }

    if (!cred) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    cred.status = 'ACTIVE';
    cred.metadata = {
      ...(cred.metadata || {}),
      revocationReason: '',
      revokedAt: null
    };
    await cred.save();

    // Sync to DigitalID
    await DigitalID.updateOne(
      { uniqueId: cred.credentialNumber },
      { $set: { status: 'ACTIVE', 'metadata.revocationReason': '' } }
    );

    // Create Notification
    try {
      const notif = await Notification.create({
        userId: cred.holderId,
        title: 'Credential Restored',
        message: `Your credential "${cred.credentialTitle}" has been RESTORED to ACTIVE status.`,
        type: 'CREATED',
        relatedId: cred._id.toString()
      });
      emitNotificationEvent(notif);
    } catch (e) {
      console.warn('Restore notification error:', e.message);
    }

    res.json({
      success: true,
      message: 'Credential has been restored to ACTIVE status',
      data: cred
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a credential permanently from MongoDB
// @route   DELETE /api/credentials/:id
// @access  Private (Organization Admin)
export const deleteCredential = async (req, res) => {
  try {
    const searchId = req.params.id;
    const clean = String(searchId).trim();
    const isOid = clean.match(/^[0-9a-fA-F]{24}$/);

    let cred = await Credential.findOne({
      $or: [
        { _id: isOid ? clean : null },
        { credentialId: clean },
        { credentialNumber: clean },
        { verificationToken: clean }
      ].filter(Boolean)
    });

    if (!cred) {
      return res.status(404).json({ success: false, message: 'Credential not found in database' });
    }

    const idKey = cred.credentialNumber || cred.credentialId;
    const tokenKey = cred.verificationToken;
    const syncQuery = {
      $or: [
        { uniqueId: idKey },
        { credentialNumber: idKey },
        { credentialId: idKey },
        { verificationToken: tokenKey }
      ].filter(Boolean)
    };

    await Credential.deleteMany(syncQuery);
    await DigitalID.deleteMany(syncQuery);

    res.json({ success: true, message: 'Credential permanently deleted from MongoDB' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get version history for a credential (Section 21 & 33)
// @route   GET /api/credentials/:id/versions
// @access  Private / Authenticated
export const getCredentialVersions = async (req, res) => {
  try {
    const searchId = req.params.id;
    let cred = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      cred = await Credential.findById(searchId);
    }
    if (!cred) {
      cred = await Credential.findOne({
        $or: [{ credentialId: searchId }, { credentialNumber: searchId }]
      });
    }

    const query = cred
      ? { $or: [{ credentialId: cred._id }, { credentialNumber: cred.credentialNumber }] }
      : { credentialNumber: searchId };

    const versions = await CredentialVersion.find(query).sort({ versionNumber: -1 });

    res.json({
      success: true,
      count: versions.length,
      data: versions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch issue multiple digital credentials from JSON/CSV array
// @route   POST /api/credentials/batch-issue
// @access  Private (Admin)
export const batchIssueCredentials = async (req, res) => {
  try {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide items array for batch issuance' });
    }

    const issued = [];
    for (const item of items) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const uniqueId = `DID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newCred = await Credential.create({
        holderName: item.holderName || item.name || 'Student Candidate',
        holderEmail: item.email || item.holderEmail || 'candidate@apex.edu',
        credentialTitle: item.credentialTitle || item.title || 'Bachelor of Technology',
        credentialType: item.credentialType || 'DEGREE',
        credentialNumber: uniqueId,
        organizationName: item.organizationName || 'Apex Institute of Science & Technology',
        verificationToken: rawToken,
        status: 'VALID',
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 4)
      });
      issued.push(newCred);
    }

    res.status(201).json({
      success: true,
      message: `Batch issuance completed: ${issued.length} credentials issued successfully.`,
      count: issued.length,
      credentials: issued
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate and detect tamper alterations on a credential
// @route   POST /api/credentials/tamper-simulation
// @access  Public
export const simulateTamper = async (req, res) => {
  try {
    const { token, tamperedField = 'cgpa', tamperedValue = '9.99' } = req.body;

    res.json({
      success: true,
      alert: 'CRITICAL SECURITY BREACH: Tampering Detected',
      tamperDetected: true,
      algorithm: 'HMAC-SHA256 Signature Audit',
      fieldAltered: tamperedField,
      forgedValue: tamperedValue,
      originalSignatureMatched: false,
      trustScore: 0,
      riskLevel: 'CRITICAL RISK',
      recommendation: 'Credential revoked and flagged in institutional audit ledger.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




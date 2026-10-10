import express from 'express';
import QRCode from 'qrcode';
import DigitalID from '../models/DigitalID.js';

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// @desc    Generate QR code image for a digital ID
// @route   GET /api/qr/generate/:id
router.get('/generate/:id', async (req, res) => {
  try {
    const searchId = req.params.id;
    let doc = await DigitalID.findOne({
      $or: [
        { _id: searchId.match(/^[0-9a-fA-F]{24}$/) ? searchId : null },
        { uniqueId: searchId },
        { verificationToken: searchId }
      ].filter(Boolean)
    });

    const targetPayload = doc ? (doc.qrCodeUrl || `${clientUrl}/verify/${doc.verificationToken}`) : `${clientUrl}/verify/${searchId}`;

    const qrDataUrl = await QRCode.toDataURL(targetPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 340,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    res.json({
      success: true,
      qrDataUrl,
      payload: targetPayload,
      docId: doc?.uniqueId || searchId,
      verificationToken: doc?.verificationToken || searchId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Validate a secure verification token directly
// @route   POST /api/qr/validate-token
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const doc = await DigitalID.findOne({
      $or: [
        { verificationToken: token },
        { uniqueId: token }
      ]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Invalid or forged token', valid: false });
    }

    res.json({
      success: true,
      valid: doc.status === 'ACTIVE',
      status: doc.status,
      docId: doc.uniqueId,
      holder: doc.holderName,
      uniqueId: doc.uniqueId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

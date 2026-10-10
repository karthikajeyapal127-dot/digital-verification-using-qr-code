import express from 'express';
import {
  getAllDigitalIDs,
  getDigitalIDById,
  createDigitalID,
  approveDigitalID,
  rejectDigitalID,
  revokeDigitalID,
  restoreDigitalID,
  deleteDigitalID,
  regenerateQR,
  getQRImage
} from '../controllers/digitalIdController.js';
import { protect, optionalProtect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllDigitalIDs);
router.post('/', optionalProtect, createDigitalID);
router.get('/:id', getDigitalIDById);
router.delete('/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), deleteDigitalID);
router.get('/:id/qr-image', getQRImage);
router.put('/:id/approve', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), approveDigitalID);
router.put('/:id/reject', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), rejectDigitalID);
router.put('/:id/revoke', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), revokeDigitalID);
router.put('/:id/restore', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), restoreDigitalID);
router.post('/:id/regenerate-qr', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), regenerateQR);

export default router;

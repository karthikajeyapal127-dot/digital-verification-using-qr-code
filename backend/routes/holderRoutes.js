import express from 'express';
import {
  createHolder,
  getHolders,
  getHolderById,
  updateHolder,
  deleteHolder
} from '../controllers/credentialHolderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Direct specification endpoints (Section 12: /api/holders)
router.post('/', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), createHolder);
router.get('/', protect, getHolders);
router.get('/:id', protect, getHolderById);
router.put('/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), updateHolder);
router.delete('/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), deleteHolder);

export default router;

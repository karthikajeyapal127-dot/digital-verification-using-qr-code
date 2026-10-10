import express from 'express';
import {
  createCredential,
  getCredentials,
  getCredentialById,
  updateCredential,
  revokeCredential,
  restoreCredential,
  deleteCredential,
  getCredentialVersions,
  batchIssueCredentials,
  simulateTamper
} from '../controllers/credentialController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/batch-issue', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), batchIssueCredentials);
router.post('/tamper-simulation', simulateTamper);
router.post('/', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), createCredential);
router.get('/', protect, getCredentials);
router.get('/:id', protect, getCredentialById);
router.get('/:id/versions', protect, getCredentialVersions);
router.put('/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), updateCredential);
router.patch('/:id/revoke', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), revokeCredential);
router.patch('/:id/restore', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), restoreCredential);
router.delete('/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), deleteCredential);

export default router;


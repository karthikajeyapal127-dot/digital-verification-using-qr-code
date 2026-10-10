import express from 'express';
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from '../controllers/userController.js';
import {
  createHolder,
  getHolders,
  getHolderById,
  updateHolder,
  deleteHolder
} from '../controllers/credentialHolderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

import { getCredentials } from '../controllers/credentialController.js';
import { getVerificationHistory } from '../controllers/verificationController.js';

const router = express.Router();

// Credential Holders endpoints (Section 25)
router.post('/holders', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), createHolder);
router.get('/holders', protect, getHolders);
router.get('/holders/:id', protect, getHolderById);
router.put('/holders/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), updateHolder);
router.delete('/holders/:id', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), deleteHolder);

// Section 33 User REST API
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.get('/credentials', protect, getCredentials);
router.get('/history', protect, getVerificationHistory);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changeUserPassword);

// Standard user management endpoints
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;

import express from 'express';
import {
  getAdminAnalytics,
  getAdminDashboard,
  getAuditLogs,
  getSecurityAlerts,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import {
  getUsers,
  updateUser,
  updateUserStatus
} from '../controllers/userController.js';
import { createHolder } from '../controllers/credentialHolderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict Role Guard: Only ORGANIZATION_ADMIN or ADMIN can access admin management APIs (Section 13 & 14)
router.use(protect);
router.use(authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'));

// Admin Dashboard & Metrics (Section 7, 33)
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);
router.get('/overview', getAdminAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/security-alerts', getSecurityAlerts);
router.get('/system-settings', getSystemSettings);
router.put('/system-settings', updateSystemSettings);

// User Management (Section 14, 33)
router.get('/users', getUsers);
router.post('/users', createHolder);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);

export default router;

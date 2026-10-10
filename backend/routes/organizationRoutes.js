import express from 'express';
import { getOrganizationMe, updateOrganizationMe } from '../controllers/organizationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getOrganizationMe);
router.put('/me', protect, authorizeRoles('ORGANIZATION_ADMIN', 'ADMIN'), updateOrganizationMe);

export default router;

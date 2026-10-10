import express from 'express';
import {
  getDashboardStats,
  getVerificationTrends,
  getCredentialDistribution,
  getDashboardRecent,
  getDashboardAnalytics
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/recent', getDashboardRecent);
router.get('/analytics', getDashboardAnalytics);
router.get('/verification-trends', getVerificationTrends);
router.get('/credential-distribution', getCredentialDistribution);

export default router;

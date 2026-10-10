import express from 'express';
import {
  scanVerification,
  createVerificationRecord,
  getVerificationHistory,
  getVerificationStats,
  getVerificationById,
  verifyByToken
} from '../controllers/verificationController.js';

const router = express.Router();

router.get('/', getVerificationHistory);
router.post('/', createVerificationRecord);
router.post('/scan', scanVerification);
router.get('/history', getVerificationHistory);
router.get('/stats', getVerificationStats);
router.get('/token/:token', verifyByToken);
router.get('/verify/:token', verifyByToken);
router.get('/:id', getVerificationById);

export default router;

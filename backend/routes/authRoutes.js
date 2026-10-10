import express from 'express';
import {
  getSystemStatus,
  setupInitialAdmin,
  registerUser,
  loginUser,
  initiateGoogleOAuth,
  handleGoogleCallback,
  googleTokenLogin,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/system-status', getSystemStatus);
router.post('/setup-admin', setupInitialAdmin);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', initiateGoogleOAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/google', googleTokenLogin);
router.post('/google-oauth', googleTokenLogin);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;

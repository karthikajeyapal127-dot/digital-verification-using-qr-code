import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getEmails,
  sendEmailNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.get('/emails', getEmails);
router.post('/send-email', sendEmailNotification);

export default router;

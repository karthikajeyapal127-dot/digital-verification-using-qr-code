// backend/controllers/supportController.js
import { sendSupportFeedbackEmail } from '../services/emailService.js';

/**
 * @desc    Receive user feedback / support request and email to admin
 * @route   POST /api/support/feedback
 * @access  Public
 */
export const sendFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, message: 'Email and message are required.' });
    }
    const result = await sendSupportFeedbackEmail({ name, email, message });
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });
    }
    return res.status(500).json({ success: false, message: result.error || 'Failed to send feedback email.' });
  } catch (error) {
    console.error('[SupportController] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

import express from 'express';
import {
  generateReport,
  getAllReports,
  getReportById,
  downloadReport
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', generateReport);
router.get('/', getAllReports);
router.get('/:id', getReportById);
router.get('/:id/download', downloadReport);

export default router;

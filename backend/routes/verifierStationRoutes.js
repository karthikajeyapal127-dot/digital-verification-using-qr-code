import express from 'express';
import {
  getStations,
  createStation,
  recordStationScan
} from '../controllers/verifierStationController.js';

const router = express.Router();

router.get('/', getStations);
router.post('/', createStation);
router.post('/:id/scan', recordStationScan);

export default router;

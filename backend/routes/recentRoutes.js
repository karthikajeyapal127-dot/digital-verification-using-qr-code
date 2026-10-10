import express from 'express';
import { getRecentlyAccessed, addRecentlyAccessed } from '../controllers/recentController.js';

const router = express.Router();

router.get('/', getRecentlyAccessed);
router.post('/', addRecentlyAccessed);

export default router;

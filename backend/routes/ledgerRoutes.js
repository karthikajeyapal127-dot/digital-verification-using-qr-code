import express from 'express';
import {
  getLedgerBlocks,
  mineNewBlock,
  verifyMerkleProof
} from '../controllers/ledgerController.js';

const router = express.Router();

router.get('/blocks', getLedgerBlocks);
router.post('/mine', mineNewBlock);
router.post('/verify-proof', verifyMerkleProof);

export default router;

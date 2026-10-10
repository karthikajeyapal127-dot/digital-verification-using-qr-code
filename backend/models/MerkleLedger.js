import mongoose from 'mongoose';

/**
 * MerkleLedger Model
 * Implements cryptographic blockchain-like block ledger for immutable credential verification
 */
const merkleLedgerSchema = new mongoose.Schema({
  blockHeight: {
    type: Number,
    required: true,
    unique: true
  },
  previousBlockHash: {
    type: String,
    required: true
  },
  merkleRoot: {
    type: String,
    required: true
  },
  blockHash: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  validatorNode: {
    type: String,
    default: 'Apex Institutional Root Validator Node #1'
  },
  status: {
    type: String,
    enum: ['FINALIZED', 'PENDING', 'AUDITED'],
    default: 'FINALIZED'
  },
  credentialSignatures: [{
    credentialId: String,
    hash: String,
    holderName: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

const MerkleLedger = mongoose.model('MerkleLedger', merkleLedgerSchema);
export default MerkleLedger;

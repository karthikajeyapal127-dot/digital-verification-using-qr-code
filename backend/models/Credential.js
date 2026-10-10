import mongoose from 'mongoose';
import crypto from 'crypto';
import { calculateIntegrityHash } from '../utils/integrity.js';

const CredentialSchema = new mongoose.Schema(
  {
    credentialId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    holderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    credentialType: {
      type: String,
      required: [true, 'Credential type is required'],
      trim: true
    },
    credentialTitle: {
      type: String,
      required: [true, 'Credential title is required'],
      trim: true
    },
    credentialNumber: {
      type: String,
      required: [true, 'Credential number is required'],
      trim: true,
      index: true
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true
    },
    verificationToken: {
      type: String,
      required: [true, 'Verification token is required'],
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED', 'Active', 'Expired', 'Revoked'],
      default: 'ACTIVE',
      uppercase: true,
      index: true
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: function() { return this.holderId; }
    },
    integrityHash: {
      type: String,
      default: '',
      index: true
    },
    metadata: {
      holderName: { type: String, default: '' },
      holderEmail: { type: String, default: '' },
      holderType: { type: String, default: 'STUDENT' },
      organizationName: { type: String, default: '' },
      department: { type: String, default: '' },
      designation: { type: String, default: '' },
      grade: { type: String, default: '' },
      description: { type: String, default: '' },
      revocationReason: { type: String, default: '' },
      revokedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        // Normalize status
        const s = (ret.status || '').toUpperCase();
        ret.status = s === 'EXPIRED' ? 'EXPIRED' : s === 'REVOKED' ? 'REVOKED' : 'ACTIVE';
        return ret;
      }
    }
  }
);

CredentialSchema.pre('save', function (next) {
  if (!this.userId && this.holderId) {
    this.userId = this.holderId;
  }
  if (!this.integrityHash) {
    try {
      this.integrityHash = calculateIntegrityHash(this);
    } catch (e) {
      // ignore
    }
  }
  next();
});

export default mongoose.models.Credential || mongoose.model('Credential', CredentialSchema, 'credentials');

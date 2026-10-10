import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      default: null,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    // Backwards-compatible field
    digitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DigitalID',
      default: null
    },
    uniqueId: {
      type: String,
      default: ''
    },
    verifierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    verifierName: {
      type: String,
      default: 'Public Verifier'
    },
    verifierOrganization: {
      type: String,
      default: ''
    },
    verificationMethod: {
      type: String,
      enum: ['QR_SCAN', 'VERIFICATION_ID', 'MANUAL_ID'],
      default: 'QR_SCAN',
      uppercase: true
    },
    method: {
      type: String,
      default: 'QR_SCAN'
    },
    result: {
      type: String,
      enum: ['VALID', 'EXPIRED', 'REVOKED', 'INVALID', 'TAMPERED'],
      required: true,
      uppercase: true,
      index: true
    },
    verificationTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    documentName: {
      type: String,
      default: 'Digital Credential'
    },
    verifiedPerson: {
      type: String,
      default: ''
    },
    scannedPayload: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (!ret.verificationId) ret.verificationId = `VRF-${ret._id.toString().slice(-6).toUpperCase()}`;
        ret.outcome = ret.result;
        ret.date = ret.verificationTime ? ret.verificationTime.toISOString().split('T')[0] : '';
        ret.time = ret.verificationTime ? new Date(ret.verificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return ret;
      }
    }
  }
);

export default mongoose.models.Verification || mongoose.model('Verification', VerificationSchema, 'verifications');

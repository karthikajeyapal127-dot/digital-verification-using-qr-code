import mongoose from 'mongoose';

const CredentialVersionSchema = new mongoose.Schema(
  {
    versionId: {
      type: String,
      unique: true,
      index: true
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      required: true,
      index: true
    },
    credentialNumber: {
      type: String,
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    changedByName: {
      type: String,
      default: 'System Administrator'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['CREATED', 'UPDATED', 'EXPIRY_EXTENDED', 'REVOKED', 'STATUS_CHANGE'],
      default: 'CREATED'
    },
    changedFields: [
      {
        type: String
      }
    ],
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-assign versionId before save
CredentialVersionSchema.pre('save', function (next) {
  if (!this.versionId) {
    this.versionId = `VER-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  next();
});

export default mongoose.models.CredentialVersion || mongoose.model('CredentialVersion', CredentialVersionSchema, 'credentialversions');

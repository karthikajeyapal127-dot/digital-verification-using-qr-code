import mongoose from 'mongoose';

const SecurityAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'REPEATED_INVALID_ATTEMPTS',
        'TAMPER_DETECTED',
        'SUSPICIOUS_IP',
        'REVOKED_SCAN_ATTEMPT',
        'EXPIRED_SCAN_ATTEMPT',
        'RATE_LIMIT_EXCEEDED',
        'SECURITY_RISK'
      ],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    message: {
      type: String,
      required: true
    },
    targetId: {
      type: String,
      default: ''
    },
    credentialNumber: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    },
    attemptCount: {
      type: Number,
      default: 1
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['UNRESOLVED', 'INVESTIGATING', 'RESOLVED'],
      default: 'UNRESOLVED',
      index: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Auto-assign alertId before save
SecurityAlertSchema.pre('save', function (next) {
  if (!this.alertId) {
    this.alertId = `ALT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  next();
});

export default mongoose.models.SecurityAlert || mongoose.model('SecurityAlert', SecurityAlertSchema, 'securityalerts');

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    targetId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: 'system'
    },
    details: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'WARNING', 'FAILURE'],
      default: 'SUCCESS'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

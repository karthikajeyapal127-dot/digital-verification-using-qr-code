import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
      sparse: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'CREATED',
        'ISSUED',
        'CREDENTIAL_ISSUED',
        'CREDENTIAL_UPDATED',
        'CREDENTIAL_REVOKED',
        'VERIFIED',
        'REVOKED',
        'EXPIRED',
        'WARNING',
        'GENERAL',
        'SYSTEM',
        'SECURITY',
        'approval',
        'security',
        'verification'
      ],
      default: 'GENERAL'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedId: {
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
        if (!ret.notificationId) ret.notificationId = `NOTIF-${ret._id.toString().slice(-6).toUpperCase()}`;
        return ret;
      }
    }
  }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema, 'notifications');

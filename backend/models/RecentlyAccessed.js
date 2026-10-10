import mongoose from 'mongoose';

const RecentlyAccessedSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    itemType: {
      type: String,
      enum: ['identity', 'verification', 'user', 'module', 'qr'],
      required: true
    },
    itemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'file'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.RecentlyAccessed || mongoose.model('RecentlyAccessed', RecentlyAccessedSchema);

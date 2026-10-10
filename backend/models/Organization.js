import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    organizationType: {
      type: String,
      enum: ['University', 'College', 'Corporation', 'Company', 'Training Institute', 'Event Organization', 'Professional Organization', 'Other'],
      default: 'University'
    },
    email: {
      type: String,
      required: [true, 'Organization email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      uppercase: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema, 'organizations');

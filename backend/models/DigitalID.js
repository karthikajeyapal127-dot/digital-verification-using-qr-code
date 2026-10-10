import mongoose from 'mongoose';

const DigitalIDSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    uniqueId: {
      type: String,
      required: [true, 'Unique ID is required (e.g. 23CS101)'],
      unique: true,
      trim: true
    },
    organization: {
      type: String,
      default: 'Apex Institute of Science & Technology',
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    verificationToken: {
      type: String,
      required: [true, 'Unique verification token is required'],
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING', 'Active', 'Expired', 'Revoked', 'Pending'],
      default: 'ACTIVE',
      uppercase: true
    },
    holderName: {
      type: String,
      default: ''
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    tamperProofHash: {
      type: String,
      default: ''
    },
    issuerCode: {
      type: String,
      default: 'AIST-IND-082'
    },
    grade: {
      type: String,
      default: ''
    },
    digitalSignature: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'Digital Identity'
    },
    holderId: {
      type: String,
      default: ''
    },
    description: {
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
        ret.digitalId = ret.uniqueId;
        ret.qrToken = ret.verificationToken;
        ret.qrCode = ret.qrCodeUrl || ret.verificationToken;
        ret.holder = ret.holderName;
        ret.name = ret.designation ? `${ret.designation} (${ret.department})` : (ret.name || 'Digital Credential');
        ret.validUntil = ret.expiryDate ? (ret.expiryDate instanceof Date ? ret.expiryDate.toISOString().split('T')[0] : String(ret.expiryDate).split('T')[0]) : '';
        const stUpper = (ret.status || '').toUpperCase();
        if (stUpper === 'ACTIVE') ret.status = 'Active';
        else if (stUpper === 'PENDING') ret.status = 'Pending';
        else if (stUpper === 'EXPIRED') ret.status = 'Expired';
        else if (stUpper === 'REVOKED') ret.status = 'Revoked';
        ret.statusCode = stUpper;
        return ret;
      }
    }
  }
);

export default mongoose.models.DigitalID || mongoose.model('DigitalID', DigitalIDSchema, 'digitalids');

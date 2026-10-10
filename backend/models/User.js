import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    googleId: {
      type: String,
      default: null
    },
    accountType: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL'
    },
    role: {
      type: String,
      enum: [
        'ORGANIZATION_ADMIN',
        'CREDENTIAL_HOLDER',
        'ADMIN',
        'USER',
        'VERIFIER',
        'STUDENT',
        'EMPLOYEE',
        'STAFF',
        'MEMBER',
        'PARTICIPANT'
      ],
      default: 'CREDENTIAL_HOLDER',
      uppercase: true,
      index: true
    },
    userType: {
      type: String,
      enum: ['Student', 'Employee', 'Staff', 'Member', 'Participant', 'STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT', 'NONE'],
      default: 'Student'
    },
    holderType: {
      type: String,
      enum: ['STUDENT', 'EMPLOYEE', 'STAFF', 'MEMBER', 'PARTICIPANT', 'NONE'],
      default: 'STUDENT',
      uppercase: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    department: {
      type: String,
      default: '',
      trim: true
    },
    designation: {
      type: String,
      default: '',
      trim: true
    },
    organization: {
      type: String,
      default: 'Apex Institute of Science & Technology',
      trim: true
    },
    organizationName: {
      type: String,
      default: 'Apex Institute of Science & Technology',
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'Active', 'Suspended'],
      default: 'ACTIVE',
      uppercase: true
    },
    avatar: {
      type: String,
      default: ''
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    dob: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'India'
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        ret.id = ret._id.toString();
        if (!ret.userId) ret.userId = ret._id.toString();
        // Normalize role for frontend
        const r = (ret.role || '').toUpperCase();
        if (r === 'ADMIN') ret.role = 'ORGANIZATION_ADMIN';
        else if (r === 'USER' || r === 'STUDENT') ret.role = 'CREDENTIAL_HOLDER';
        ret.isOrgAdmin = ret.role === 'ORGANIZATION_ADMIN';
        ret.isHolder = ret.role === 'CREDENTIAL_HOLDER';
        return ret;
      }
    }
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');

import mongoose from 'mongoose';

/**
 * VerifierStation Model (Implements ER Diagram Verifier entity and assigned_location)
 */
const verifierStationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  stationName: {
    type: String,
    required: true // e.g. "North Gate Security", "Central Library", "Exam Hall B"
  },
  location: {
    type: String,
    required: true
  },
  verifierUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifierName: {
    type: String,
    default: 'Security Officer'
  },
  deviceType: {
    type: String,
    default: 'Optical Laser QR Terminal'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  status: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'BUSY'],
    default: 'ONLINE'
  },
  totalScansToday: {
    type: Number,
    default: 0
  },
  lastScanAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const VerifierStation = mongoose.model('VerifierStation', verifierStationSchema);
export default VerifierStation;

import mongoose from 'mongoose';

/**
 * Report Model (Implements the ER Diagram Report Entity)
 * Attributes from ER Diagram: reportId, reportType, generatedDate, fromDate, toDate
 * Methods: generatePDF, generateExcel
 */
const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: () => `REP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  },
  reportType: {
    type: String,
    required: true,
    enum: ['VERIFICATION_AUDIT', 'ID_CARDS_LEDGER', 'TAMPER_INCIDENTS', 'USER_DIRECTORY', 'SECURITY_SUMMARY'],
    default: 'VERIFICATION_AUDIT'
  },
  title: {
    type: String,
    required: true,
    default: 'Institutional Compliance Verification Report'
  },
  fromDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  toDate: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedByName: {
    type: String,
    default: 'System Administrator'
  },
  totalRecordsCount: {
    type: Number,
    default: 0
  },
  validCount: {
    type: Number,
    default: 0
  },
  tamperedCount: {
    type: Number,
    default: 0
  },
  format: {
    type: String,
    enum: ['EXCEL', 'PDF', 'CSV', 'JSON'],
    default: 'EXCEL'
  },
  cryptographicSeal: {
    type: String,
    default: ''
  },
  dataSnapshot: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;

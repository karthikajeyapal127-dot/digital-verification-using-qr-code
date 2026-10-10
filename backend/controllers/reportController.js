import crypto from 'node:crypto';
import Report from '../models/Report.js';
import Verification from '../models/Verification.js';
import DigitalID from '../models/DigitalID.js';
import User from '../models/User.js';
import SecurityAlert from '../models/SecurityAlert.js';

// @desc    Generate a new Institutional Report (matches ER diagram Report entity)
// @route   POST /api/reports/generate
// @access  Private (Admin / Organization Admin)
export const generateReport = async (req, res) => {
  try {
    const {
      reportType = 'VERIFICATION_AUDIT',
      fromDate,
      toDate,
      format = 'EXCEL'
    } = req.body;

    const start = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = toDate ? new Date(toDate) : new Date();

    let records = [];
    let title = 'Institutional Compliance Verification Report';

    if (reportType === 'VERIFICATION_AUDIT') {
      title = 'Official Verification Audit Logs Report';
      records = await Verification.find({
        createdAt: { $gte: start, $lte: end }
      }).sort({ createdAt: -1 }).limit(500);
    } else if (reportType === 'ID_CARDS_LEDGER') {
      title = 'Digital ID Cards Issuance Ledger';
      records = await DigitalID.find({
        createdAt: { $gte: start, $lte: end }
      }).sort({ createdAt: -1 }).limit(500);
    } else if (reportType === 'TAMPER_INCIDENTS') {
      title = 'Cryptographic Security & Tamper Detection Incident Report';
      records = await SecurityAlert.find({
        createdAt: { $gte: start, $lte: end }
      }).sort({ createdAt: -1 }).limit(500);
    } else if (reportType === 'USER_DIRECTORY') {
      title = 'Credential Holders & User Directory';
      records = await User.find({
        createdAt: { $gte: start, $lte: end }
      }).select('-passwordHash').sort({ createdAt: -1 }).limit(500);
    } else {
      records = await Verification.find().sort({ createdAt: -1 }).limit(100);
    }

    const totalCount = records.length;
    const validCount = records.filter(r => (r.status || r.result || '').toUpperCase() === 'VALID' || (r.status || '').toUpperCase() === 'ACTIVE').length;
    const tamperedCount = records.filter(r => (r.status || r.result || '').toUpperCase() === 'TAMPERED' || (r.status || '').toUpperCase() === 'ALERT').length;

    // Calculate Cryptographic SHA-256 seal for this report
    const reportSeal = crypto.createHash('sha256')
      .update(JSON.stringify({ reportType, totalCount, start, end, timestamp: Date.now() }))
      .digest('hex');

    const newReport = await Report.create({
      reportType,
      title,
      fromDate: start,
      toDate: end,
      generatedBy: req.user?._id || req.user?.id,
      generatedByName: req.user?.name || 'System Administrator',
      totalRecordsCount: totalCount,
      validCount,
      tamperedCount,
      format,
      cryptographicSeal: `0x${reportSeal}`,
      dataSnapshot: records.slice(0, 100)
    });

    res.status(201).json({
      success: true,
      message: `Report ${newReport.reportId} generated successfully.`,
      report: newReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all generated reports history
// @route   GET /api/reports
// @access  Private (Admin)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50);
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private (Admin)
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download CSV/Excel data for a report
// @route   GET /api/reports/:id/download
// @access  Public / Private
export const downloadReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { reportId: req.params.id }]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    let csvContent = 'ID,Record,Status,Timestamp\n';
    if (report.dataSnapshot && report.dataSnapshot.length > 0) {
      report.dataSnapshot.forEach((rec, idx) => {
        const id = rec._id || rec.verificationId || idx + 1;
        const name = (rec.holderName || rec.name || rec.title || 'Record').replace(/,/g, '');
        const stat = rec.status || rec.result || 'ACTIVE';
        const d = rec.createdAt || new Date().toISOString();
        csvContent += `"${id}","${name}","${stat}","${d}"\n`;
      });
    } else {
      csvContent += `"1","No records","OK","${new Date().toISOString()}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

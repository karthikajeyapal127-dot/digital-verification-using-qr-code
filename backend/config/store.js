import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DUMP_FILE = path.join(DATA_DIR, 'db_dump.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Ignore in restricted environments
  }
}

// REAL DATA RULE: Pure empty initial state. No fake users, no fake certificates, no fake stats.
const emptyState = () => ({
  users: [],
  digitalIDs: [],
  verifications: [],
  notifications: [],
  recentlyAccessed: [],
  auditLogs: [],
  emails: []
});

// Helper to load persistent state if dump file exists
function loadState() {
  if (fs.existsSync(DUMP_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DUMP_FILE, 'utf8'));
      return {
        users: Array.isArray(data.users) ? data.users : [],
        digitalIDs: Array.isArray(data.digitalIDs) ? data.digitalIDs : [],
        verifications: Array.isArray(data.verifications) ? data.verifications : [],
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        recentlyAccessed: Array.isArray(data.recentlyAccessed) ? data.recentlyAccessed : [],
        auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
        emails: Array.isArray(data.emails) ? data.emails : []
      };
    } catch (e) {
      console.warn('[Store] Could not parse db_dump.json, initializing clean store.');
    }
  }
  return emptyState();
}

export const store = loadState();

export function saveState() {
  try {
    fs.writeFileSync(DUMP_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Store] Could not save db_dump.json:', err.message);
  }
}

// Automatic Expiration Check: runs against current date
export function checkAutoExpiry() {
  const now = new Date();
  let changed = false;

  store.digitalIDs.forEach((doc) => {
    const validUntilDate = doc.validUntil || doc.expiryDate;
    if (doc.status === 'Active' && validUntilDate) {
      const expiry = new Date(validUntilDate);
      if (!isNaN(expiry.getTime()) && expiry < now) {
        doc.status = 'Expired';
        changed = true;

        // Create real notification for holder
        if (doc.userId) {
          createNotification({
            userId: doc.userId,
            title: 'Digital ID Expired',
            message: `Your Digital ID [${doc.digitalId || doc.id}] has expired as of ${validUntilDate}.`,
            type: 'warning',
            relatedId: doc.id
          });
        }

        // Log audit
        logAuditEvent({
          action: 'AUTO_EXPIRY',
          performedBy: 'SYSTEM_CRON',
          role: 'system',
          targetId: doc.id,
          details: `Digital ID [${doc.digitalId || doc.id}] automatically transitioned to EXPIRED status.`,
          status: 'WARNING'
        });
      }
    }
  });

  if (changed) {
    saveState();
  }
}

// Run expiry check every 5 minutes in background
setInterval(checkAutoExpiry, 5 * 60 * 1000);

// Log audit helper
export function logAuditEvent({ action, performedBy, role = 'user', targetId = '', details, ipAddress = '127.0.0.1', status = 'SUCCESS' }) {
  const logId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
  const entry = {
    id: logId,
    logId,
    action,
    performedBy,
    role,
    targetId,
    details,
    ipAddress,
    status,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(entry);
  saveState();
  return entry;
}

// Push notification helper
export function createNotification({ userId, title, message, type = 'general', relatedId = '' }) {
  const notificationId = `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`;
  const notif = {
    id: notificationId,
    notificationId,
    userId,
    title: title || 'System Notification',
    message,
    type,
    isRead: false,
    relatedId,
    createdAt: new Date().toISOString()
  };
  store.notifications.unshift(notif);
  saveState();
  return notif;
}

// Dispatch institutional email notification helper
export function createEmailNotification({
  to,
  recipientName = 'Member',
  subject,
  digitalId,
  docName = 'Digital Identity Credential',
  qrToken = '',
  issuer = 'Apex Institute of Science & Technology',
  issueDate = new Date().toISOString().split('T')[0],
  expiryDate = '2031-12-31'
}) {
  const emailId = `EML-${Math.floor(1000 + Math.random() * 9000)}`;
  const emailRecord = {
    id: emailId,
    emailId,
    to,
    from: "Registry Office <registry@apex.edu>",
    subject: subject || `Official Digital Verification ID: ${digitalId}`,
    recipientName,
    digitalId,
    docName,
    qrToken: qrToken || digitalId,
    issuer,
    issueDate,
    expiryDate,
    status: 'Active',
    timestamp: new Date().toISOString(),
    isRead: false,
    content: `Dear ${recipientName}, your official credential (${docName}) has been processed and cryptographically registered. Your permanent Verification ID is: ${digitalId}.`
  };

  store.emails.unshift(emailRecord);

  createNotification({
    userId: to,
    title: `Email Sent: ${subject || `ID Issued (${digitalId})`}`,
    message: `Official credentials email sent to ${to} with Verification ID: ${digitalId}.`,
    type: 'approval',
    relatedId: digitalId
  });

  saveState();
  return emailRecord;
}

// Reset store to empty
export function resetDatabase() {
  store.users = [];
  store.digitalIDs = [];
  store.verifications = [];
  store.notifications = [];
  store.recentlyAccessed = [];
  store.auditLogs = [];
  store.emails = [];
  saveState();
  return { success: true, message: 'Database reset to real empty state.' };
}

// Seed the 5 Valid Institutional Users and Credentials (Mandatory Project Requirement)
export function seedValidInstitutionalDatabase() {
  // Pre-hashed bcrypt for Password@123
  const hash = '$2a$10$0k7u0KSmj5H8j89.m0nNkuKkYd07EwN1p9rT1pLgL2lqQ9zG2wL0O';

  store.users = [
    {
      id: 'USR-ADMIN-101',
      userId: 'USR-ADMIN-101',
      name: 'Dr. K. Senthil Nathan',
      email: 'admin@institution.edu',
      password: hash,
      role: 'admin',
      department: 'Office of Academic Registry',
      organization: 'State Institute of Science & Technology',
      phone: '+91 94432 10892',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      createdAt: '2026-01-05T09:00:00.000Z'
    },
    {
      id: 'USR-VRF-202',
      userId: 'USR-VRF-202',
      name: 'Prof. Rajeshwari Raman',
      email: 'verifier@institution.edu',
      password: hash,
      role: 'verifier',
      department: 'Higher Education Accreditation Board',
      organization: 'National Verification Council',
      phone: '+91 98410 44521',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T10:15:00.000Z'
    },
    {
      id: 'USR-STU-303',
      userId: 'USR-STU-303',
      name: 'J. Karthika',
      email: 'student@institution.edu',
      password: hash,
      role: 'user',
      department: 'Computer Science & Engineering',
      organization: 'College of Engineering & Technology',
      phone: '+91 97910 88234',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T08:30:00.000Z'
    },
    {
      id: 'USR-SCH-404',
      userId: 'USR-SCH-404',
      name: 'Anand Kumar Swaminathan',
      email: 'anand.scholar@institution.edu',
      password: hash,
      role: 'user',
      department: 'Artificial Intelligence & Data Science',
      organization: 'Apex Technical University',
      phone: '+91 99401 33412',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      createdAt: '2026-02-15T11:45:00.000Z'
    },
    {
      id: 'USR-SEC-505',
      userId: 'USR-SEC-505',
      name: 'V. Muruganandam',
      email: 'security.inspector@institution.edu',
      password: hash,
      role: 'verifier',
      department: 'Campus Safety & Physical Security Division',
      organization: 'Institutional Security Directorate',
      phone: '+91 91765 99012',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      createdAt: '2026-02-20T14:20:00.000Z'
    }
  ];

  store.digitalIDs = [
    {
      id: 'DID-2026-CSE892',
      digitalId: 'DID-2026-CSE892',
      uniqueId: 'DID-2026-CSE892',
      userId: 'USR-STU-303',
      name: 'Bachelor of Technology in Computer Science & Engineering',
      type: 'Digital Student ID',
      holder: 'J. Karthika',
      holderId: 'CSE-2026-892',
      department: 'Computer Science & Engineering',
      designationOrCourse: 'B.Tech CSE (Honors)',
      organization: 'College of Engineering & Technology',
      issuer: 'College of Engineering & Technology',
      issuerCode: 'CET-IND-082',
      role: 'STUDENT',
      qrCode: 'DID-2026-CSE892',
      qrToken: 'tok_sec_karthika_cse2026',
      issueDate: '2026-01-10',
      validUntil: '2028-06-30',
      expiryDate: '2028-06-30',
      status: 'Active',
      grade: 'Distinction (CGPA 9.4/10)',
      digitalSignature: 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      tamperProofHash: 'e3b0c44298fc1c149afbf4c8996fb924',
      createdAt: '2026-01-10T09:00:00.000Z'
    },
    {
      id: 'DID-2026-AI991',
      digitalId: 'DID-2026-AI991',
      uniqueId: 'DID-2026-AI991',
      userId: 'USR-SCH-404',
      name: 'Master of Technology in Artificial Intelligence',
      type: 'Degree Certificate',
      holder: 'Anand Kumar Swaminathan',
      holderId: 'AI-2026-991',
      department: 'Artificial Intelligence & Data Science',
      designationOrCourse: 'M.Tech AI & Robotics',
      organization: 'Apex Technical University',
      issuer: 'Apex Technical University',
      issuerCode: 'ATU-IND-105',
      role: 'GRADUATE',
      qrCode: 'DID-2026-AI991',
      qrToken: 'tok_sec_anand_ai2026',
      issueDate: '2026-02-15',
      validUntil: '2029-02-15',
      expiryDate: '2029-02-15',
      status: 'Active',
      grade: 'First Class with Distinction',
      digitalSignature: 'SHA256: 4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
      tamperProofHash: 'a89c23f1092837bc9281746201928472',
      createdAt: '2026-02-15T11:45:00.000Z'
    },
    {
      id: 'DID-2024-EXP44',
      digitalId: 'DID-2024-EXP44',
      uniqueId: 'DID-2024-EXP44',
      userId: 'USR-SEC-505',
      name: 'Campus Facility Access Authorization Pass',
      type: 'Access Pass',
      holder: 'R. Vigneshwar',
      holderId: 'FAC-2023-044',
      department: 'Estate Maintenance & Operations',
      designationOrCourse: 'Technical Supervisor',
      organization: 'National Polytechnic Institute',
      issuer: 'National Polytechnic Institute',
      issuerCode: 'NPI-GOV-012',
      role: 'EMPLOYEE',
      qrCode: 'DID-2024-EXP44',
      qrToken: 'tok_sec_vignesh_exp2024',
      issueDate: '2022-01-15',
      validUntil: '2024-01-15',
      expiryDate: '2024-01-15',
      status: 'Expired',
      grade: 'Authorized Facility Pass',
      digitalSignature: 'SHA256: 9e107d9d372bb6826bd81d3542a419d6ec433630611dd32f45f6412128035d8e',
      tamperProofHash: 'f4b3c2d1e0a9876543210fedcba98765',
      createdAt: '2022-01-15T08:00:00.000Z'
    },
    {
      id: 'DID-2026-RVK77',
      digitalId: 'DID-2026-RVK77',
      uniqueId: 'DID-2026-RVK77',
      userId: 'USR-STU-303',
      name: 'Advanced Certificate in Network Security',
      type: 'Professional Certification',
      holder: 'M. Balasubramanian',
      holderId: 'NET-2026-077',
      department: 'Information Technology',
      designationOrCourse: 'Network Security Associate',
      organization: 'State Technical Board',
      issuer: 'State Technical Board',
      issuerCode: 'STB-IND-099',
      role: 'STUDENT',
      qrCode: 'DID-2026-RVK77',
      qrToken: 'tok_sec_bala_rvk2026',
      issueDate: '2026-02-01',
      validUntil: '2027-02-01',
      expiryDate: '2027-02-01',
      status: 'Revoked',
      grade: 'Flagged for Academic Disciplinary Review',
      digitalSignature: 'SHA256: 01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b',
      tamperProofHash: '7a9c8b6d5e4f3a2b1c0d9e8f7a6b5c4d',
      createdAt: '2026-02-01T12:00:00.000Z'
    }
  ];

  store.verifications = [
    {
      id: 'VER-9001',
      verificationId: 'VER-9001',
      digitalId: 'DID-2026-CSE892',
      document: 'Bachelor of Technology in Computer Science & Engineering',
      documentName: 'Bachelor of Technology in Computer Science & Engineering',
      verifiedPerson: 'J. Karthika',
      verifier: 'Prof. Rajeshwari Raman',
      verifierName: 'Prof. Rajeshwari Raman',
      userId: 'USR-VRF-202',
      outcome: 'VALID',
      status: 'Verified',
      method: 'QR SCAN',
      trustScore: 98,
      riskLevel: 'TRUSTED',
      latency: '0.18s',
      ipAddress: '127.0.0.1',
      date: '2026-03-25',
      time: '14:22:10',
      createdAt: '2026-03-25T14:22:10.000Z'
    },
    {
      id: 'VER-9002',
      verificationId: 'VER-9002',
      digitalId: 'DID-2024-EXP44',
      document: 'Campus Facility Access Authorization Pass',
      documentName: 'Campus Facility Access Authorization Pass',
      verifiedPerson: 'R. Vigneshwar',
      verifier: 'V. Muruganandam',
      verifierName: 'V. Muruganandam',
      userId: 'USR-SEC-505',
      outcome: 'EXPIRED',
      status: 'Expired',
      method: 'MANUAL ID',
      trustScore: 35,
      riskLevel: 'WARNING',
      latency: '0.24s',
      ipAddress: '127.0.0.1',
      date: '2026-03-26',
      time: '09:40:15',
      createdAt: '2026-03-26T09:40:15.000Z'
    },
    {
      id: 'VER-9003',
      verificationId: 'VER-9003',
      digitalId: 'DID-2026-RVK77',
      document: 'Advanced Certificate in Network Security',
      documentName: 'Advanced Certificate in Network Security',
      verifiedPerson: 'M. Balasubramanian',
      verifier: 'System Root Authority',
      verifierName: 'System Root Authority',
      userId: 'USR-ADMIN-101',
      outcome: 'REVOKED',
      status: 'Revoked',
      method: 'QR SCAN',
      trustScore: 10,
      riskLevel: 'HIGH RISK',
      latency: '0.12s',
      ipAddress: '127.0.0.1',
      date: '2026-03-27',
      time: '16:05:40',
      createdAt: '2026-03-27T16:05:40.000Z'
    }
  ];

  store.notifications = [
    {
      id: 'NOTIF-1',
      notificationId: 'NOTIF-1',
      userId: 'USR-STU-303',
      title: 'Digital ID Credential Issued',
      message: 'Your official Bachelor of Technology Digital Identity [DID-2026-CSE892] is active and enrolled in the root trust ledger.',
      type: 'approval',
      isRead: false,
      relatedId: 'DID-2026-CSE892',
      createdAt: '2026-01-10T09:05:00.000Z'
    },
    {
      id: 'NOTIF-2',
      notificationId: 'NOTIF-2',
      userId: 'USR-STU-303',
      title: 'Successful Cryptographic Scan',
      message: 'Your Digital ID was successfully verified by Prof. Rajeshwari Raman via Optical Camera QR Scan.',
      type: 'verification',
      isRead: true,
      relatedId: 'DID-2026-CSE892',
      createdAt: '2026-03-25T14:23:00.000Z'
    }
  ];

  store.recentlyAccessed = [
    {
      id: 'REC-1',
      userId: 'USR-STU-303',
      itemType: 'identity',
      itemId: 'DID-2026-CSE892',
      title: 'J. Karthika · B.Tech CSE',
      subtitle: 'DID-2026-CSE892 · Active Credential',
      path: '/digital-id',
      timestamp: new Date().toISOString()
    },
    {
      id: 'REC-2',
      userId: 'USR-VRF-202',
      itemType: 'verification',
      itemId: 'DID-2026-CSE892',
      title: 'Verification Inspection · J. Karthika',
      subtitle: 'VER-9001 · Validated Passed (98% Score)',
      path: '/verify/DID-2026-CSE892',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'REC-3',
      userId: 'USR-ADMIN-101',
      itemType: 'identity',
      itemId: 'DID-2026-AI991',
      title: 'Anand Kumar · M.Tech AI Degree',
      subtitle: 'DID-2026-AI991 · Approved Registry Credential',
      path: '/verify/DID-2026-AI991',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'REC-4',
      userId: 'USR-SEC-505',
      itemType: 'verification',
      itemId: 'DID-2024-EXP44',
      title: 'Facility Gate Interception · R. Vigneshwar',
      subtitle: 'DID-2024-EXP44 · Expired Token Handled',
      path: '/verify/DID-2024-EXP44',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'REC-5',
      userId: 'USR-ADMIN-101',
      itemType: 'verification',
      itemId: 'DID-2026-RVK77',
      title: 'Revocation Audit · M. Balasubramanian',
      subtitle: 'DID-2026-RVK77 · Revoked Integrity Flag',
      path: '/verify/DID-2026-RVK77',
      timestamp: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  saveState();
  return { success: true, count: store.users.length, message: '5 Valid Institutional Profiles and Credentials Loaded.' };
}

// Automatically initialize valid institutional profiles if database has 0 users
if (store.users.length === 0) {
  seedValidInstitutionalDatabase();
}


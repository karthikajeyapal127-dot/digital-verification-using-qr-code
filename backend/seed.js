import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import Organization from './models/Organization.js';
import User from './models/User.js';
import Credential from './models/Credential.js';
import DigitalID from './models/DigitalID.js';
import Verification from './models/Verification.js';
import Notification from './models/Notification.js';

dotenv.config();

const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

async function runSeed() {
  console.log('================================================================');
  console.log('🌱 DATABASE INITIALIZATION: QR-BASED DIGITAL CREDENTIAL PLATFORM');
  console.log('================================================================');

  await connectDB();

  const isReset = process.argv.includes('--clear') || process.argv.includes('--empty');

  if (isReset) {
    console.log('[Seed] Purging all collections in MongoDB to real empty state...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      Credential.deleteMany({}),
      DigitalID.deleteMany({}),
      Verification.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('✓ MongoDB is now completely empty.');
    await closeDB();
    process.exit(0);
  }

  // 1. Seed Organization
  let org = await Organization.findOne({ email: 'admin@apex.edu' });
  if (!org) {
    org = await Organization.create({
      organizationId: 'ORG-APEX-001',
      organizationName: 'Apex Institute of Science & Technology',
      organizationType: 'University',
      email: 'admin@apex.edu',
      phone: '+91 98765 00001',
      address: '100 Tech Innovation Boulevard, Silicon Valley, CA',
      website: 'https://apex.edu',
      logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150',
      status: 'ACTIVE'
    });
    console.log(`✓ Created Organization: ${org.organizationName} (${org.organizationId})`);
  }

  // 2. Seed Users (1 Admin + 5 Credential Holders across types + 1 Verifier)
  const usersToSeed = [
    // Organization Admin
    {
      name: 'Chief Administrator',
      email: 'testadmin@institution.edu',
      password: 'UserSecure@2026',
      role: 'ORGANIZATION_ADMIN',
      holderType: 'NONE',
      department: 'Central Administration',
      designation: 'Director of Certification',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 98765 00001'
    },
    // Credential Holder 1: Student
    {
      name: 'J. Karthika',
      email: 'karthikajeyapal127@gmail.com',
      password: 'StudentPass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'STUDENT',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Candidate',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 98765 43210'
    },
    // Credential Holder 2: Student
    {
      name: 'Alex Harrison Chen',
      email: 'alex.chen@apex.edu',
      password: 'VeriGlass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'STUDENT',
      department: 'Computer Science & Engineering',
      designation: 'Research Scholar',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 91234 56789'
    },
    // Credential Holder 3: Employee
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@apex.edu',
      password: 'EmployeePass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'EMPLOYEE',
      department: 'Artificial Intelligence Research Lab',
      designation: 'Senior Machine Learning Engineer',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 93456 78901'
    },
    // Credential Holder 4: Staff
    {
      name: 'Anita Desai',
      email: 'anita.desai@apex.edu',
      password: 'StaffPass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'STAFF',
      department: 'Academic Registrar & Records',
      designation: 'Assistant Registrar',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 95678 90123'
    },
    // Credential Holder 5: Member
    {
      name: 'Vikramaditya Sengupta',
      email: 'vikram.s@apex.edu',
      password: 'MemberPass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'MEMBER',
      department: 'Alumni Association Board',
      designation: 'Fellow Member',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 94567 11223'
    },
    // Credential Holder 6: Participant
    {
      name: 'Tarun Oberoi',
      email: 'tarun.oberoi@apex.edu',
      password: 'ParticipantPass2026!',
      role: 'CREDENTIAL_HOLDER',
      holderType: 'PARTICIPANT',
      department: 'Global Hackathon & AI Summit',
      designation: 'Hackathon Finalist',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 96789 22334'
    },
    // Public / Authorized Verifier
    {
      name: 'Authorized Verifier',
      email: 'testverifier@institution.edu',
      password: 'UserSecure@2026',
      role: 'VERIFIER',
      holderType: 'NONE',
      department: 'Security & Compliance Gate',
      designation: 'Verification Officer',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+91 98765 00002'
    },
    // Legacy Admin Alias
    {
      name: 'Dr. Evelyn Scott',
      email: 'admin@veriglass.io',
      password: 'AdminPass2026!',
      role: 'ORGANIZATION_ADMIN',
      holderType: 'NONE',
      department: 'Academic Registry & Trust Ledger',
      designation: 'Provost',
      organizationName: 'Apex Institute of Science & Technology',
      phone: '+1 800 555 0199'
    }
  ];

  const userMap = {};

  for (const u of usersToSeed) {
    let existing = await User.findOne({ email: u.email.toLowerCase() });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      existing = await User.create({
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash,
        organizationId: org._id,
        role: u.role,
        holderType: u.holderType,
        department: u.department,
        designation: u.designation,
        organizationName: u.organizationName,
        phone: u.phone,
        status: 'ACTIVE'
      });
      console.log(`✓ Created user: ${u.email} (${u.role})`);
    } else {
      existing.organizationId = org._id;
      existing.role = u.role;
      existing.holderType = u.holderType;
      const matches = await bcrypt.compare(u.password, existing.passwordHash);
      if (!matches) {
        existing.passwordHash = await bcrypt.hash(u.password, 10);
      }
      await existing.save();
    }
    userMap[u.email.toLowerCase()] = existing;
  }

  // 3. Seed Credentials with Real QR Codes
  const karthikaUser = userMap['karthikajeyapal127@gmail.com'];
  const alexUser = userMap['alex.chen@apex.edu'];
  const rahulUser = userMap['rahul.verma@apex.edu'];
  const anitaUser = userMap['anita.desai@apex.edu'];
  const vikramUser = userMap['vikram.s@apex.edu'];
  const tarunUser = userMap['tarun.oberoi@apex.edu'];

  const credentialsToSeed = [
    // 1. Karthika - VALID Active Degree Credential
    {
      holder: karthikaUser,
      credentialType: 'Degree',
      credentialTitle: 'Bachelor of Technology (Honors) in Computer Science',
      credentialNumber: 'CRED-2026-JK127',
      issueDate: new Date('2024-08-01'),
      expiryDate: new Date('2028-06-30'),
      verificationToken: 'tok_sec_karthika_2026',
      status: 'ACTIVE',
      metadata: {
        grade: 'First Class with Distinction',
        department: 'Computer Science & Engineering',
        description: 'Conferred upon successful fulfillment of all degree requirements.'
      }
    },
    // 2. Alex Chen - VALID Active Professional Certificate
    {
      holder: alexUser,
      credentialType: 'Certificate',
      credentialTitle: 'Advanced Deep Learning & Neural Architectures',
      credentialNumber: 'CRED-2026-CSE892',
      issueDate: new Date('2024-06-15'),
      expiryDate: new Date('2028-06-15'),
      verificationToken: 'tok_sec_alex_2026',
      status: 'ACTIVE',
      metadata: {
        grade: 'A+',
        department: 'Computer Science & Engineering',
        description: 'Specialization in Autonomous Systems and Large Language Models.'
      }
    },
    // 3. Rahul Verma - VALID Employee Badge
    {
      holder: rahulUser,
      credentialType: 'Employee ID',
      credentialTitle: 'Senior Machine Learning Specialist',
      credentialNumber: 'CRED-EMP-2026-042',
      issueDate: new Date('2023-01-10'),
      expiryDate: new Date('2027-01-10'),
      verificationToken: 'tok_sec_rahul_emp_2026',
      status: 'ACTIVE',
      metadata: {
        department: 'AI Research Lab',
        description: 'Full-time research appointment with access to tier-3 labs.'
      }
    },
    // 4. Anita Desai - EXPIRED Staff Credential (to test EXPIRED status)
    {
      holder: anitaUser,
      credentialType: 'Staff Pass',
      credentialTitle: 'Interim Registrar Access Credential',
      credentialNumber: 'DVID-2024-EXP88',
      issueDate: new Date('2022-01-10'),
      expiryDate: new Date('2024-01-10'), // Past date
      verificationToken: 'tok_sec_exp_88',
      status: 'EXPIRED',
      metadata: {
        department: 'Academic Registrar & Records',
        description: 'Temporary administrative authorization - expired.'
      }
    },
    // 5. Vikramaditya - REVOKED Credential (to test REVOKED status)
    {
      holder: vikramUser,
      credentialType: 'Membership',
      credentialTitle: 'Executive Advisory Council Fellowship',
      credentialNumber: 'DVID-2026-RVK99',
      issueDate: new Date('2023-05-01'),
      expiryDate: new Date('2027-05-01'),
      verificationToken: 'tok_sec_rvk_12',
      status: 'REVOKED',
      metadata: {
        department: 'Alumni Association Board',
        revocationReason: 'Term completed and executive fellowship officially superseded.',
        revokedAt: new Date('2025-01-15')
      }
    },
    // 6. Tarun Oberoi - VALID Event Participation Certificate
    {
      holder: tarunUser,
      credentialType: 'Certificate',
      credentialTitle: 'Apex Global Hackathon 2026 - First Runner-Up',
      credentialNumber: 'CRED-EVT-2026-HCK',
      issueDate: new Date('2026-02-20'),
      expiryDate: new Date('2030-02-20'),
      verificationToken: 'tok_sec_tarun_evt_2026',
      status: 'ACTIVE',
      metadata: {
        department: 'Innovation & Entrepreneurship',
        description: 'Recognized for outstanding implementation in Decentralized Identity.'
      }
    }
  ];

  for (const c of credentialsToSeed) {
    const verificationUrl = `${clientUrl}/verify/${c.verificationToken}`;
    const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    let existingCred = await Credential.findOne({
      $or: [{ credentialNumber: c.credentialNumber }, { verificationToken: c.verificationToken }]
    });
    if (!existingCred) {
      existingCred = await Credential.create({
        credentialId: `CRD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
        organizationId: org._id,
        holderId: c.holder._id,
        credentialType: c.credentialType,
        credentialTitle: c.credentialTitle,
        credentialNumber: c.credentialNumber,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        verificationToken: c.verificationToken,
        status: c.status,
        qrCodeUrl,
        metadata: {
          ...c.metadata,
          holderName: c.holder.name,
          holderEmail: c.holder.email,
          holderType: c.holder.holderType,
          organizationName: org.organizationName
        }
      });
      console.log(`✓ Seeded Credential: ${c.credentialTitle} [${c.status}]`);
    } else {
      existingCred.credentialNumber = c.credentialNumber;
      existingCred.status = c.status;
      existingCred.qrCodeUrl = qrCodeUrl;
      await existingCred.save();
    }

    // Sync matching DigitalID for backward compatibility with existing tests
    let existingId = await DigitalID.findOne({
      $or: [{ uniqueId: c.credentialNumber }, { verificationToken: c.verificationToken }]
    });
    if (!existingId) {
      await DigitalID.create({
        uniqueId: c.credentialNumber,
        userId: c.holder._id,
        holderName: c.holder.name,
        organization: org.organizationName,
        department: c.metadata.department || c.holder.department,
        designation: c.credentialType,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        status: c.status,
        verificationToken: c.verificationToken,
        qrCodeUrl,
        metadata: {
          credentialId: existingCred._id.toString(),
          credentialTitle: c.credentialTitle
        }
      });
    } else {
      existingId.uniqueId = c.credentialNumber;
      existingId.status = c.status;
      existingId.qrCodeUrl = qrCodeUrl;
      existingId.designation = c.credentialType;
      existingId.metadata = {
        credentialId: existingCred._id.toString(),
        credentialTitle: c.credentialTitle
      };
      await existingId.save();
    }
  }

  // 4. Seed Real Verification History Records
  const verificationsToSeed = [
    {
      uniqueId: 'CRED-2026-JK127',
      verifierName: 'Authorized Verifier',
      verifierOrganization: 'National Credential Clearinghouse',
      verificationMethod: 'QR_SCAN',
      result: 'VALID',
      documentName: 'Bachelor of Technology (Honors) in Computer Science',
      verifiedPerson: 'J. Karthika',
      scannedPayload: 'tok_sec_karthika_2026',
      verificationTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      uniqueId: 'CRED-2026-CSE892',
      verifierName: 'Public Verifier',
      verifierOrganization: 'Tech Talent Global',
      verificationMethod: 'QR_SCAN',
      result: 'VALID',
      documentName: 'Advanced Deep Learning & Neural Architectures',
      verifiedPerson: 'Alex Harrison Chen',
      scannedPayload: 'tok_sec_alex_2026',
      verificationTime: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      uniqueId: 'DVID-2024-EXP88',
      verifierName: 'Security Gate 3',
      verifierOrganization: 'Campus Administration',
      verificationMethod: 'VERIFICATION_ID',
      result: 'EXPIRED',
      documentName: 'Interim Registrar Access Credential',
      verifiedPerson: 'Anita Desai',
      scannedPayload: 'tok_sec_exp_88',
      verificationTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      uniqueId: 'DVID-2026-RVK99',
      verifierName: 'Audit Inspector',
      verifierOrganization: 'Council Operations',
      verificationMethod: 'QR_SCAN',
      result: 'REVOKED',
      documentName: 'Executive Advisory Council Fellowship',
      verifiedPerson: 'Vikramaditya Sengupta',
      scannedPayload: 'tok_sec_rvk_12',
      verificationTime: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ];

  for (const v of verificationsToSeed) {
    const existingV = await Verification.findOne({ scannedPayload: v.scannedPayload });
    if (!existingV) {
      await Verification.create({
        verificationId: `VRF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
        organizationId: org._id,
        uniqueId: v.uniqueId,
        verifierName: v.verifierName,
        verifierOrganization: v.verifierOrganization,
        verificationMethod: v.verificationMethod,
        result: v.result,
        documentName: v.documentName,
        verifiedPerson: v.verifiedPerson,
        scannedPayload: v.scannedPayload,
        verificationTime: v.verificationTime,
        ipAddress: '127.0.0.1'
      });
      console.log(`✓ Seeded Verification: ${v.documentName} [${v.result}]`);
    }
  }

  // 5. Seed Notifications
  const notifs = [
    {
      userId: karthikaUser._id,
      organizationId: org._id,
      title: 'Credential Verified Successfully',
      message: 'Your B.Tech (Honors) credential was successfully verified via QR Scan.',
      type: 'VERIFIED'
    },
    {
      userId: alexUser._id,
      organizationId: org._id,
      title: 'New Credential Issued',
      message: 'Your Advanced Deep Learning credential has been issued by Apex Institute.',
      type: 'CREDENTIAL_ISSUED'
    }
  ];

  for (const n of notifs) {
    const existingN = await Notification.findOne({ userId: n.userId, title: n.title });
    if (!existingN) {
      await Notification.create(n);
    }
  }

  console.log('================================================================');
  console.log('✅ DATABASE INITIALIZATION COMPLETED SUCCESSFULLY');
  console.log('🏢 Organization: Apex Institute of Science & Technology');
  console.log('🛡️ Admin: testadmin@institution.edu / UserSecure@2026');
  console.log('🎓 Holder 1 (Student): karthikajeyapal127@gmail.com / StudentPass2026!');
  console.log('🎓 Holder 2 (Student): alex.chen@apex.edu / VeriGlass2026!');
  console.log('💼 Holder 3 (Employee): rahul.verma@apex.edu / EmployeePass2026!');
  console.log('👔 Holder 4 (Staff): anita.desai@apex.edu / StaffPass2026!');
  console.log('🤝 Holder 5 (Member): vikram.s@apex.edu / MemberPass2026!');
  console.log('🏅 Holder 6 (Participant): tarun.oberoi@apex.edu / ParticipantPass2026!');
  console.log('🔍 Verifier: testverifier@institution.edu / UserSecure@2026');
  console.log('================================================================');

  await closeDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});

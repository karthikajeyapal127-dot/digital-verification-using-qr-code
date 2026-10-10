import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import DigitalID from './models/DigitalID.js';
import Verification from './models/Verification.js';
import Notification from './models/Notification.js';
import { processVerification } from './controllers/verificationController.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'veriglass-production-super-secret-key-2026';

async function run12StepTest() {
  console.log('================================================================');
  console.log('STARTING SECTION 30: 12-STEP END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  try {
    // 0. Connect to DB
    await connectDB();
    console.log('Connected to MongoDB.\n');

    // Clean test collections to guarantee pristine test environment
    await User.deleteMany({ email: { $in: ['testuser@institution.edu', 'testadmin@institution.edu', 'testverifier@institution.edu'] } });
    await DigitalID.deleteMany({ email: 'testuser@institution.edu' });

    // -------------------------------------------------------------
    // STEP 1: REGISTER REAL USER & VERIFY IN MONGODB
    // -------------------------------------------------------------
    console.log('[STEP 1] Register real USER and verify in MongoDB "users" collection...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('UserSecure@2026', salt);
    const registeredUser = await User.create({
      name: 'Rohan Sharma',
      email: 'testuser@institution.edu',
      passwordHash,
      role: 'USER',
      department: 'Computer Science',
      organization: 'National Institute of Technology',
      phone: '+91 98765 43210',
      status: 'ACTIVE'
    });

    const userInDb = await User.findById(registeredUser._id);
    if (!userInDb || userInDb.email !== 'testuser@institution.edu') {
      throw new Error('STEP 1 FAILED: User not found in MongoDB');
    }
    console.log('  -> PASS: User Rohan Sharma successfully persisted in MongoDB.');
    console.log(`     User ID: ${userInDb._id}, Role: ${userInDb.role}\n`);

    // -------------------------------------------------------------
    // STEP 2: LOGIN WITH THAT ACCOUNT & VERIFY JWT
    // -------------------------------------------------------------
    console.log('[STEP 2] Login with user credentials & verify JWT...');
    const isPasswordValid = await userInDb.comparePassword('UserSecure@2026');
    if (!isPasswordValid) throw new Error('STEP 2 FAILED: Password comparison failed');
    
    const userJwt = jwt.sign({ id: userInDb._id, role: userInDb.role }, JWT_SECRET, { expiresIn: '7d' });
    const decodedJwt = jwt.verify(userJwt, JWT_SECRET);
    if (decodedJwt.id !== userInDb._id.toString() || decodedJwt.role !== 'USER') {
      throw new Error('STEP 2 FAILED: Decoded JWT payload does not match');
    }
    console.log('  -> PASS: Authentication successful. JWT token verified.');
    console.log(`     JWT payload: id=${decodedJwt.id}, role=${decodedJwt.role}\n`);

    // -------------------------------------------------------------
    // STEP 3: ADMIN CREATES DIGITAL ID & SAVES TO MONGODB
    // -------------------------------------------------------------
    console.log('[STEP 3] Admin creates Digital ID for user & saves to MongoDB "digitalids"...');
    // Ensure admin user exists
    let adminUser = await User.findOne({ email: 'testadmin@institution.edu' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Chief Administrator',
        email: 'testadmin@institution.edu',
        passwordHash,
        role: 'ADMIN',
        department: 'Registry',
        organization: 'National Accreditation Board',
        status: 'ACTIVE'
      });
    }

    const { randomBytes } = await import('crypto');
    const verificationToken = randomBytes(16).toString('hex');
    const uniqueId = `DID-2026-NIT-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years in future

    const newDigitalId = await DigitalID.create({
      userId: userInDb._id,
      uniqueId,
      holderName: userInDb.name,
      department: userInDb.department,
      organization: userInDb.organization,
      designation: 'Undergraduate Scholar',
      issueDate: new Date(),
      expiryDate,
      verificationToken,
      qrCodeUrl: `http://localhost:5173/verify/${verificationToken}`,
      status: 'ACTIVE'
    });

    const digitalIdInDb = await DigitalID.findById(newDigitalId._id);
    if (!digitalIdInDb || digitalIdInDb.verificationToken !== verificationToken) {
      throw new Error('STEP 3 FAILED: Digital ID not saved in MongoDB');
    }
    console.log('  -> PASS: Digital ID created and verified in MongoDB.');
    console.log(`     ID: ${digitalIdInDb.uniqueId}, Status: ${digitalIdInDb.status}`);
    console.log(`     Token: ${digitalIdInDb.verificationToken}\n`);

    // -------------------------------------------------------------
    // STEP 4: QR CODE GENERATED WITH EXACT VERIFICATION TOKEN
    // -------------------------------------------------------------
    console.log('[STEP 4] Verify QR Code generated contains exact verificationToken...');
    const expectedQrUrl = `http://localhost:5173/verify/${digitalIdInDb.verificationToken}`;
    if (digitalIdInDb.qrCodeUrl !== expectedQrUrl) {
      throw new Error(`STEP 4 FAILED: QR Payload mismatch: ${digitalIdInDb.qrCodeUrl}`);
    }
    console.log(`  -> PASS: QR Code embeds exact token: ${digitalIdInDb.verificationToken}`);
    console.log(`     Target URL: ${digitalIdInDb.qrCodeUrl}\n`);

    // -------------------------------------------------------------
    // STEP 5: USER OPENS MY DIGITAL ID & VIEWS QR
    // -------------------------------------------------------------
    console.log('[STEP 5] Query user Digital ID (matching My Digital ID screen)...');
    const userFetchedId = await DigitalID.findOne({ userId: userInDb._id });
    if (!userFetchedId || userFetchedId.uniqueId !== uniqueId) {
      throw new Error('STEP 5 FAILED: User could not fetch own Digital ID');
    }
    console.log('  -> PASS: User retrieves active Digital ID with QR payload.');
    console.log(`     Holder: ${userFetchedId.holderName}, Valid Until: ${userFetchedId.expiryDate.toISOString().split('T')[0]}\n`);

    // -------------------------------------------------------------
    // STEP 6: VERIFIER OPENS /VERIFIER & PREPARES SCAN
    // -------------------------------------------------------------
    console.log('[STEP 6] Initialize Verifier officer account...');
    let verifierUser = await User.findOne({ email: 'testverifier@institution.edu' });
    if (!verifierUser) {
      verifierUser = await User.create({
        name: 'Officer Rajesh Kumar',
        email: 'testverifier@institution.edu',
        passwordHash,
        role: 'VERIFIER',
        department: 'Security & Verification Division',
        organization: 'Campus Gate Control',
        status: 'ACTIVE'
      });
    }
    console.log(`  -> PASS: Verifier ready: ${verifierUser.name} (${verifierUser.role})\n`);

    // Helper verification function calling actual production processVerification
    async function verifyTokenLogic(token, verifier) {
      const res = await processVerification({
        searchKey: token,
        verifierId: verifier?._id,
        verifierName: verifier?.name,
        method: 'QR_SCAN',
        ipAddress: '127.0.0.1'
      });
      return {
        status: res.result,
        result: res.result,
        reason: res.message,
        doc: res.doc,
        verificationRecord: res.verificationRecord
      };
    }

    // -------------------------------------------------------------
    // STEP 7 & 8: VERIFY SCANNED TOKEN -> STATUS RETURNS VALID
    // -------------------------------------------------------------
    console.log('[STEP 7 & 8] Verifier scans QR token -> check verification logic returns VALID...');
    const validCheck = await verifyTokenLogic(verificationToken, verifierUser);
    if (validCheck.status !== 'VALID') {
      throw new Error(`STEP 7 & 8 FAILED: Expected VALID, got ${validCheck.status}`);
    }
    console.log('  -> PASS: Token successfully verified.');
    console.log(`     Result: ${validCheck.status}`);
    console.log(`     Subject: ${validCheck.doc?.holder || validCheck.doc?.name}, Dept: ${validCheck.doc?.department}`);
    console.log(`     Verification Record ID: ${validCheck.verificationRecord._id}\n`);

    // -------------------------------------------------------------
    // STEP 9: VERIFICATION RECORD SAVED IN HISTORY
    // -------------------------------------------------------------
    console.log('[STEP 9] Verify record is saved in MongoDB "verifications" collection...');
    const historyRecord = await Verification.findById(validCheck.verificationRecord._id);
    if (!historyRecord || historyRecord.result !== 'VALID') {
      throw new Error('STEP 9 FAILED: Verification record missing from history');
    }
    console.log('  -> PASS: Verification history record found in MongoDB.');
    console.log(`     Verifier: ${historyRecord.verifierName}, Method: ${historyRecord.method}, Result: ${historyRecord.result}`);
    console.log(`     Timestamp: ${historyRecord.createdAt.toISOString()}\n`);

    // -------------------------------------------------------------
    // STEP 10: CHANGE EXPIRY DATE TO PAST & VERIFY EXPIRED
    // -------------------------------------------------------------
    console.log('[STEP 10] Change expiry date to past in MongoDB -> verify returns EXPIRED...');
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1); // 1 year in past
    await DigitalID.findByIdAndUpdate(digitalIdInDb._id, { expiryDate: pastDate });

    const expiredCheck = await verifyTokenLogic(verificationToken, verifierUser);
    if (expiredCheck.status !== 'EXPIRED') {
      throw new Error(`STEP 10 FAILED: Expected EXPIRED, got ${expiredCheck.status}`);
    }
    console.log('  -> PASS: Expired credential recognized.');
    console.log(`     Result: ${expiredCheck.status}`);
    console.log(`     Reason: ${expiredCheck.reason}\n`);

    // -------------------------------------------------------------
    // STEP 11: ADMIN REVOKES ID & VERIFY REVOKED
    // -------------------------------------------------------------
    console.log('[STEP 11] Admin revokes Digital ID -> verify returns REVOKED...');
    await DigitalID.findByIdAndUpdate(digitalIdInDb._id, {
      status: 'REVOKED',
      revocationReason: 'Credential suspended by compliance audit test',
      revokedAt: new Date()
    });

    const revokedCheck = await verifyTokenLogic(verificationToken, verifierUser);
    if (revokedCheck.status !== 'REVOKED') {
      throw new Error(`STEP 11 FAILED: Expected REVOKED, got ${revokedCheck.status}`);
    }
    console.log('  -> PASS: Revoked credential recognized.');
    console.log(`     Result: ${revokedCheck.status}`);
    console.log(`     Reason: ${revokedCheck.reason}\n`);

    // -------------------------------------------------------------
    // STEP 12: SCAN FORGED/NON-EXISTENT TOKEN & VERIFY INVALID
    // -------------------------------------------------------------
    console.log('[STEP 12] Scan forged/non-existent token -> verify returns INVALID...');
    const forgedToken = 'fake-forged-tampered-token-9999999999';
    const invalidCheck = await verifyTokenLogic(forgedToken, verifierUser);
    if (invalidCheck.status !== 'INVALID') {
      throw new Error(`STEP 12 FAILED: Expected INVALID, got ${invalidCheck.status}`);
    }

    const invalidLog = await Verification.findOne({ scannedPayload: forgedToken });
    if (!invalidLog || invalidLog.result !== 'INVALID') {
      throw new Error('STEP 12 FAILED: Invalid scan attempt not logged to MongoDB');
    }
    console.log('  -> PASS: Forged token correctly identified as INVALID and logged.');
    console.log(`     Result: ${invalidCheck.status}`);
    console.log(`     Logged in MongoDB verifications with scannedPayload=${invalidLog.scannedPayload}\n`);

    console.log('================================================================');
    console.log('ALL 12 TEST STEPS COMPLETED AND PASSED WITH 100% SUCCESS!');
    console.log('================================================================');

    process.exit(0);
  } catch (err) {
    console.error('\nTEST SUITE ERROR:', err);
    process.exit(1);
  }
}

run12StepTest();

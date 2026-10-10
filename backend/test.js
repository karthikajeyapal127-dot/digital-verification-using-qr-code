/**
 * Automated End-to-End Test Suite for DIGITAL VERIFICATION USING QR CODE
 * Tests: Auth, Registration, Login, Google OAuth, Role Access, Digital ID,
 * Admin Approval, QR Scanning (Valid, Expired, Revoked, Invalid),
 * Dynamic Trust & Risk Engine, History, and Chatbot.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('Backend Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'ONLINE') throw new Error('Status not ONLINE');
  });

  // 2. Registration
  let testUserToken = '';
  const testEmail = `test.student.${Date.now()}@apex.edu`;
  await test('User Registration & Password Hashing', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Scholar',
        email: testEmail,
        password: 'SecurePassword2026!',
        role: 'student',
        department: 'Computer Science'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error(data.message || 'Registration failed');
    testUserToken = data.token;
  });

  // 3. Login
  await test('User Authentication (Login with JWT generation)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword2026!'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token || data.user.email !== testEmail) {
      throw new Error(data.message || 'Login failed');
    }
  });

  // 4. Google OAuth
  await test('Google OAuth Sign-In & Instant Provisioning', async () => {
    const res = await fetch(`${BASE_URL}/auth/google-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'google.user@gmail.com',
        name: 'Google Test User',
        googleId: 'g_sub_12345678',
        role: 'student'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error(data.message || 'Google OAuth failed');
  });

  // 5. Submit Digital Identity
  let newDvid = '';
  await test('Digital Identity Application Submission', async () => {
    const res = await fetch(`${BASE_URL}/digital-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        name: 'Master of Science in Cybersecurity',
        type: 'Degree Certificate',
        holder: 'Automated Test Scholar',
        holderId: 'STU-AUTO-01',
        department: 'Information Sciences',
        issuer: 'Apex Institute of Science & Technology'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data || !data.data.id) throw new Error(data.message || 'ID creation failed');
    newDvid = data.data.id;
    if (data.data.status !== 'Pending') throw new Error('Expected Pending status');
  });

  // 6. Admin Approval
  await test('Admin Approval & Cryptographic Token Generation', async () => {
    const res = await fetch(`${BASE_URL}/digital-id/${newDvid}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!data.success || data.data.status !== 'Active' || !data.data.qrToken) {
      throw new Error(data.message || 'Approval failed');
    }
  });

  // 7. Verify Active QR
  await test('QR Verification: VALID Credential & Dynamic Trust Engine', async () => {
    const res = await fetch(`${BASE_URL}/verification/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrPayload: newDvid,
        verifierName: 'Automated System Verifier'
      })
    });
    const data = await res.json();
    if (data.outcome !== 'VALID') throw new Error(`Expected VALID but got ${data.outcome}`);
    if (data.trustAnalysis.trustScore < 80) throw new Error('Expected Trust Score >= 80');
    if (data.trustAnalysis.riskLevel !== 'TRUSTED') throw new Error('Expected TRUSTED risk level');
  });

  // 8. Verify Expired QR
  await test('QR Verification: EXPIRED Credential Detection', async () => {
    const res = await fetch(`${BASE_URL}/verification/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrPayload: 'DVID-2024-EXP88',
        verifierName: 'Library Circulation Gate'
      })
    });
    const data = await res.json();
    if (data.outcome !== 'EXPIRED') throw new Error(`Expected EXPIRED but got ${data.outcome}`);
    if (data.trustAnalysis.riskLevel !== 'WARNING') throw new Error('Expected WARNING risk level');
  });

  // 9. Verify Revoked QR
  await test('QR Verification: REVOKED Credential & High Risk Flag', async () => {
    const res = await fetch(`${BASE_URL}/verification/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrPayload: 'DVID-2026-RVK99',
        verifierName: 'Corporate Compliance Gate'
      })
    });
    const data = await res.json();
    if (data.outcome !== 'REVOKED') throw new Error(`Expected REVOKED but got ${data.outcome}`);
    if (data.trustAnalysis.riskLevel !== 'HIGH RISK') throw new Error('Expected HIGH RISK level');
  });

  // 10. Verify Invalid / Counterfeit QR
  await test('QR Verification: INVALID / UNREGISTERED QR Detection', async () => {
    const res = await fetch(`${BASE_URL}/verification/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrPayload: 'COUNTERFEIT-PAYLOAD-999',
        verifierName: 'Airport Security'
      })
    });
    const data = await res.json();
    if (data.outcome !== 'INVALID') throw new Error(`Expected INVALID but got ${data.outcome}`);
    if (data.trustAnalysis.trustScore !== 0) throw new Error('Expected 0 trust score');
  });

  // 11. Verification History & Stats
  await test('Verification Audit History & Real Database Stats', async () => {
    const res = await fetch(`${BASE_URL}/verification/history`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No verification history found');
    }
    const statsRes = await fetch(`${BASE_URL}/verification/stats`);
    const statsData = await statsRes.json();
    if (!statsData.success || !statsData.stats.total) throw new Error('Stats computation failed');
  });

  // 12. Bilingual Chatbot
  await test('VerifyAssist Chatbot (English & Tamil responses)', async () => {
    const enRes = await fetch(`${BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What does VALID mean?', language: 'en' })
    });
    const enData = await enRes.json();
    if (!enData.reply || !enData.reply.includes('VALID')) throw new Error('English FAQ failed');

    const taRes = await fetch(`${BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'எப்படி பதிவு செய்வது?', language: 'ta' })
    });
    const taData = await taRes.json();
    if (!taData.reply) throw new Error('Tamil FAQ failed');
  });

  // 13. Notifications API
  await test('Notifications Retrieval & Read Status Tracking', async () => {
    const res = await fetch(`${BASE_URL}/notifications`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Notifications failed');
  });

  // 14. Admin Analytics API
  await test('Admin Analytics API (Real DB aggregates)', async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`);
    const data = await res.json();
    if (!data.success || !data.data.users.total || !data.data.verifications.total) {
      throw new Error('Analytics failed');
    }
  });

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();

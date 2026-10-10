import axios from 'axios';

async function testPhase2Registration() {
  const API_URL = 'http://localhost:5000/api/auth/register';
  console.log('--- Testing Phase 2 User Registration Endpoint ---');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const userData = {
    name: 'Priya Sharma',
    email: testEmail,
    phone: '+91 98765 43210',
    password: 'SecurePassword2026!',
    confirmPassword: 'SecurePassword2026!',
    dob: '2001-08-15',
    gender: 'Female',
    address: 'Flat 4B, Emerald Heights, MG Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    userType: 'Student',
    role: 'CREDENTIAL_HOLDER'
  };

  try {
    // 1. Successful Registration
    console.log(`1. Sending POST /api/auth/register for ${testEmail}...`);
    const res = await axios.post(API_URL, userData);

    console.log('✓ Response Status:', res.status);
    console.log('✓ Success:', res.data.success);
    console.log('✓ Token generated:', Boolean(res.data.token));
    console.log('✓ User Name:', res.data.user.name);
    console.log('✓ User Email:', res.data.user.email);
    console.log('✓ User Type:', res.data.user.userType || res.data.user.holderType);
    console.log('✓ User Role:', res.data.user.role);
    console.log('✓ Security Check: passwordHash exposed?', 'passwordHash' in res.data.user ? 'EXPOSED (FAIL)' : 'NO (PASS)');

    if ('passwordHash' in res.data.user) {
      throw new Error('Security vulnerability: passwordHash returned to client!');
    }

    // 2. Duplicate Registration Test
    console.log('\n2. Testing Duplicate Registration with identical email...');
    try {
      await axios.post(API_URL, userData);
      console.error('✕ Failed: Duplicate registration should have returned error 400!');
      process.exit(1);
    } catch (dupErr) {
      if (dupErr.response && dupErr.response.status === 400) {
        console.log('✓ Duplicate Registration properly rejected with 400 Bad Request');
        console.log('✓ Error message:', dupErr.response.data.message);
      } else {
        throw dupErr;
      }
    }

    // 3. Validation Test: Missing required field
    console.log('\n3. Testing Validation with missing password...');
    try {
      await axios.post(API_URL, {
        name: 'Incomplete User',
        email: `incomplete_${Date.now()}@example.com`,
        phone: '1234567890'
      });
      console.error('✕ Failed: Incomplete registration should have returned 400!');
      process.exit(1);
    } catch (valErr) {
      if (valErr.response && valErr.response.status === 400) {
        console.log('✓ Missing password properly rejected with 400 Bad Request');
        console.log('✓ Error message:', valErr.response.data.message);
      } else {
        throw valErr;
      }
    }

    // 4. Password mismatch test
    console.log('\n4. Testing Password Mismatch...');
    try {
      await axios.post(API_URL, {
        name: 'Mismatch User',
        email: `mismatch_${Date.now()}@example.com`,
        phone: '1234567890',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!'
      });
      console.error('✕ Failed: Password mismatch should have returned 400!');
      process.exit(1);
    } catch (misErr) {
      if (misErr.response && misErr.response.status === 400) {
        console.log('✓ Password mismatch properly rejected with 400 Bad Request');
        console.log('✓ Error message:', misErr.response.data.message);
      } else {
        throw misErr;
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 2 REGISTRATION & MONGODB TESTS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('✕ Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPhase2Registration();

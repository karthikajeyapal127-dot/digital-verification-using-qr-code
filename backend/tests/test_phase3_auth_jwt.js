import axios from 'axios';

async function testPhase3AuthAndJwt() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('=== Testing Phase 3: Email/Password Authentication & JWT Protected Routes ===\n');

  const testEmail = `auth_test_${Date.now()}@example.com`;
  const rawPassword = 'StrongPassword2026!';

  try {
    // Step 1: Create a user
    console.log(`1. Registering test user: ${testEmail}...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Rohan Deshmukh',
      email: testEmail,
      phone: '+91 99887 76655',
      password: rawPassword,
      confirmPassword: rawPassword,
      userType: 'Student',
      role: 'CREDENTIAL_HOLDER',
      dob: '2001-11-20',
      gender: 'Male',
      address: '77 Residency Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India'
    });
    console.log('✓ Registration successful (201 Created)');

    // Step 2: Login with Valid Credentials
    console.log('\n2. Testing POST /api/auth/login with valid credentials...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: rawPassword
    });

    console.log('✓ Login status:', loginRes.status);
    console.log('✓ Login success:', loginRes.data.success);
    console.log('✓ JWT Token generated:', Boolean(loginRes.data.token));
    console.log('✓ Logged in user:', loginRes.data.user.name, `(${loginRes.data.user.email})`);
    console.log('✓ User Type:', loginRes.data.user.userType);
    console.log('✓ User Role:', loginRes.data.user.role);
    console.log('✓ Security check (passwordHash exposed?):', 'passwordHash' in loginRes.data.user ? 'EXPOSED (FAIL)' : 'NO (PASS)');

    if ('passwordHash' in loginRes.data.user) {
      throw new Error('Security flaw: passwordHash returned to client in login response!');
    }

    const authToken = loginRes.data.token;

    // Step 3: Login with Wrong Password
    console.log('\n3. Testing POST /api/auth/login with incorrect password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'CompletelyWrongPassword!'
      });
      console.error('✕ FAIL: Invalid password was accepted!');
      process.exit(1);
    } catch (pwErr) {
      if (pwErr.response && pwErr.response.status === 401) {
        console.log('✓ Correctly rejected with 401 Unauthorized');
        console.log('✓ Error message:', pwErr.response.data.message);
      } else {
        throw pwErr;
      }
    }

    // Step 4: Login with Nonexistent Email
    console.log('\n4. Testing POST /api/auth/login with non-existent email...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: `ghost_${Date.now()}@doesnotexist.com`,
        password: 'SomePassword123!'
      });
      console.error('✕ FAIL: Non-existent email was accepted!');
      process.exit(1);
    } catch (mailErr) {
      if (mailErr.response && mailErr.response.status === 401) {
        console.log('✓ Correctly rejected with 401 Unauthorized');
        console.log('✓ Error message:', mailErr.response.data.message);
      } else {
        throw mailErr;
      }
    }

    // Step 5: Access Protected Route WITH Valid JWT Token (GET /api/auth/me)
    console.log('\n5. Accessing Protected Route (GET /api/auth/me) with valid Bearer token...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('✓ Protected route access status:', meRes.status);
    console.log('✓ Authenticated user profile retrieved:', meRes.data.user.name);
    console.log('✓ User ID matches:', meRes.data.user.id === loginRes.data.user.id);
    console.log('✓ City & State verified:', `${meRes.data.user.city}, ${meRes.data.user.state}`);

    // Step 6: Access Protected Route WITHOUT Token
    console.log('\n6. Accessing Protected Route WITHOUT token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.error('✕ FAIL: Protected route was accessible without token!');
      process.exit(1);
    } catch (noTokenErr) {
      if (noTokenErr.response && noTokenErr.response.status === 401) {
        console.log('✓ Correctly blocked with 401 Unauthorized');
        console.log('✓ Error message:', noTokenErr.response.data.message);
      } else {
        throw noTokenErr;
      }
    }

    // Step 7: Access Protected Route WITH Malformed / Forged Token
    console.log('\n7. Accessing Protected Route with forged / malformed token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: 'Bearer invalid.tampered.jwt.signature.token'
        }
      });
      console.error('✕ FAIL: Tampered token was accepted!');
      process.exit(1);
    } catch (tamperErr) {
      if (tamperErr.response && tamperErr.response.status === 401) {
        console.log('✓ Correctly blocked with 401 Unauthorized');
        console.log('✓ Error message:', tamperErr.response.data.message);
      } else {
        throw tamperErr;
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 3 AUTHENTICATION & JWT TESTS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('✕ Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPhase3AuthAndJwt();

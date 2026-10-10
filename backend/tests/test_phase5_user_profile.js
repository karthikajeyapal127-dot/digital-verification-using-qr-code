import axios from 'axios';

async function testPhase5UserProfile() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('=== Testing Phase 5: User Profile & Live MongoDB Updates ===\n');

  const testEmail = `profile_test_${Date.now()}@example.com`;
  const password = 'ProfilePassword2026!';

  try {
    // 1. Register
    console.log(`1. Creating test user: ${testEmail}...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Ananya Iyer',
      email: testEmail,
      phone: '+91 98888 77777',
      password,
      confirmPassword: password,
      userType: 'Student',
      role: 'CREDENTIAL_HOLDER',
      dob: '2002-04-18',
      gender: 'Female',
      address: 'Old Campus Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India'
    });

    const token = regRes.data.token;
    console.log('✓ User registered and token obtained');

    // 2. Fetch Profile via GET /api/users/profile
    console.log('\n2. Fetching profile from MongoDB via GET /api/users/profile...');
    const getRes = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Profile fetched successfully');
    console.log('✓ Initial City:', getRes.data.data.city);
    console.log('✓ Initial User Type:', getRes.data.data.userType);

    // 3. Update Profile via PUT /api/users/profile
    console.log('\n3. Updating profile in MongoDB via PUT /api/users/profile...');
    const updatePayload = {
      name: 'Ananya Iyer Ph.D.',
      phone: '+91 97777 66666',
      address: 'Advanced Cybernetics Lab, Technology Tower',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      userType: 'Employee',
      dob: '2000-04-18',
      gender: 'Female',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
    };

    const putRes = await axios.put(`${BASE_URL}/users/profile`, updatePayload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Update response status:', putRes.status);
    console.log('✓ Update success:', putRes.data.success);
    console.log('✓ Updated Name:', putRes.data.data.name);
    console.log('✓ Updated City:', putRes.data.data.city);
    console.log('✓ Updated User Type:', putRes.data.data.userType);

    // 4. Verify Persistence in MongoDB by re-fetching
    console.log('\n4. Verifying persistence in MongoDB with fresh GET /api/users/me...');
    const verifyRes = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (verifyRes.data.data.city !== 'Hyderabad' || verifyRes.data.data.name !== 'Ananya Iyer Ph.D.') {
      throw new Error('Database persistence verification failed! MongoDB does not reflect updated values.');
    }

    console.log('✓ Confirmed live MongoDB persistence:');
    console.log('  - Name:', verifyRes.data.data.name);
    console.log('  - Phone:', verifyRes.data.data.phone);
    console.log('  - City:', verifyRes.data.data.city);
    console.log('  - State:', verifyRes.data.data.state);
    console.log('  - User Type:', verifyRes.data.data.userType);
    console.log('  - Address:', verifyRes.data.data.address);

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 5 USER PROFILE & MONGODB UPDATE TESTS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('✕ Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase5UserProfile();

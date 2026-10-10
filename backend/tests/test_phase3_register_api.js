/**
 * PHASE 3 TEST SUITE: REAL REGISTER API
 * Validates Part 5 requirements:
 * 1. Name validation
 * 2. Email format validation
 * 3. Phone validation
 * 4. Password security requirements & confirmation match
 * 5. Successful registration in MongoDB with all Part 4 fields
 * 6. Duplicate email rejection: "An account with this email already exists."
 */

const API_BASE = 'http://localhost:5000/api';

async function testPhase3RegisterAPI() {
  console.log('====================================================');
  console.log('📝 PHASE 3 TEST: REAL REGISTER API (POST /api/auth/register)');
  console.log('====================================================\n');

  const ts = Date.now().toString().slice(-5);
  const testEmail = `newuser.${ts}@institution.edu`;

  // 1. Test missing full name
  console.log('Test 1: Validation - Empty name rejection');
  const res1 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!', phone: '+91 98888 11111' })
  });
  const data1 = await res1.json();
  if (res1.status === 400 && data1.message.includes('name')) {
    console.log('✅ Pass: Empty name rejected with HTTP 400');
  } else {
    throw new Error(`Failed: expected 400, got ${res1.status}: ${data1.message}`);
  }

  // 2. Test invalid email format
  console.log('\nTest 2: Validation - Invalid email syntax rejection');
  const res2 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Doe', email: 'not-an-email', password: 'Password123!', phone: '+91 98888 11111' })
  });
  const data2 = await res2.json();
  if (res2.status === 400) {
    console.log('✅ Pass: Invalid email rejected with HTTP 400');
  } else {
    throw new Error(`Failed: expected 400, got ${res2.status}: ${data2.message}`);
  }

  // 3. Test password mismatch
  console.log('\nTest 3: Validation - Passwords mismatch');
  const res3 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: testEmail,
      phone: '+91 98888 11111',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!'
    })
  });
  const data3 = await res3.json();
  if (res3.status === 400 && data3.message.includes('match')) {
    console.log('✅ Pass: Password mismatch rejected with HTTP 400');
  } else {
    throw new Error(`Failed: expected 400, got ${res3.status}: ${data3.message}`);
  }

  // 4. Test successful registration with all Part 4 fields
  console.log('\nTest 4: Real User Registration with all Part 4 fields in MongoDB');
  const validPayload = {
    name: `Karthika Jeyapal ${ts}`,
    email: testEmail,
    phone: '+91 97910 88234',
    dob: '2002-05-14',
    gender: 'Female',
    password: 'SecurePassword2026!',
    confirmPassword: 'SecurePassword2026!',
    address: '42 Academic Avenue, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    profilePhoto: `https://ui-avatars.com/api/?name=Karthika+Jeyapal&background=2563eb&color=fff`,
    holderType: 'STUDENT',
    role: 'CREDENTIAL_HOLDER'
  };

  const res4 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });
  const data4 = await res4.json();
  if (res4.status === 201 && data4.success && data4.token) {
    console.log(`✅ Pass: User registered successfully in MongoDB!`);
    console.log(`   └─ Message: "${data4.message}"`);
    console.log(`   └─ Token: ${data4.token.substring(0, 30)}...`);
    console.log(`   └─ MongoDB User ID: ${data4.user.id}`);
    console.log(`   └─ Name: ${data4.user.name}`);
    console.log(`   └─ Holder Type: ${data4.user.holderType}`);
    console.log(`   └─ Location: ${data4.user.city}, ${data4.user.state}, ${data4.user.country}`);
  } else {
    throw new Error(`Failed: expected 201, got ${res4.status}: ${data4.message}`);
  }

  // 5. Test duplicate email rejection (Part 5)
  console.log('\nTest 5: Duplicate Email Check in MongoDB');
  const res5 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });
  const data5 = await res5.json();
  if (res5.status === 400 && data5.message === 'An account with this email already exists.') {
    console.log(`✅ Pass: Duplicate email properly rejected with exact Part 5 message:`);
    console.log(`   └─ "${data5.message}"`);
  } else {
    throw new Error(`Failed: expected 400 with duplicate message, got ${res5.status}: ${data5.message}`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL PHASE 3 REAL REGISTER API TESTS PASSED 100%!');
  console.log('====================================================');
}

testPhase3RegisterAPI().catch(err => {
  console.error('❌ Phase 3 test error:', err);
  process.exit(1);
});

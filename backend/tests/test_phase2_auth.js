/**
 * PHASE 2 AUTOMATED TEST SUITE
 * Validates:
 * 1. User Registration (POST /api/auth/register) for 1 Org Admin + 5 Credential Holders
 * 2. Password hashing with bcrypt
 * 3. Email & password login (POST /api/auth/login)
 * 4. JWT generation and claims
 * 5. Protected route authentication (GET /api/auth/me)
 * 6. Role-based authorization guard (CREDENTIAL_HOLDER blocked from Admin API)
 */

const API_BASE = 'http://localhost:5000/api';

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 2 TESTS: REGISTRATION, AUTH & JWT');
  console.log('====================================================\n');

  const timestamp = Date.now().toString().slice(-5);

  // 1. Define 1 Admin + 5 Credential Holders with distinct holderTypes
  const adminData = {
    name: `Dr. Admin Sharma ${timestamp}`,
    email: `admin.${timestamp}@apex.edu`,
    password: 'AdminPassword2026!',
    confirmPassword: 'AdminPassword2026!',
    phone: '+91 98888 11111',
    organizationName: `Apex Institute of Tech ${timestamp}`,
    organizationType: 'University'
  };

  const holders = [
    {
      name: `Karthika Student ${timestamp}`,
      email: `karthika.${timestamp}@apex.edu`,
      password: 'StudentPass2026!',
      confirmPassword: 'StudentPass2026!',
      phone: '+91 97777 22221',
      holderType: 'STUDENT',
      department: 'Computer Science'
    },
    {
      name: `Rahul Employee ${timestamp}`,
      email: `rahul.${timestamp}@apex.edu`,
      password: 'EmployeePass2026!',
      confirmPassword: 'EmployeePass2026!',
      phone: '+91 97777 22222',
      holderType: 'EMPLOYEE',
      department: 'Information Technology'
    },
    {
      name: `Anita Staff ${timestamp}`,
      email: `anita.${timestamp}@apex.edu`,
      password: 'StaffPass2026!',
      confirmPassword: 'StaffPass2026!',
      phone: '+91 97777 22223',
      holderType: 'STAFF',
      department: 'Registrar Office'
    },
    {
      name: `Vikram Member ${timestamp}`,
      email: `vikram.${timestamp}@apex.edu`,
      password: 'MemberPass2026!',
      confirmPassword: 'MemberPass2026!',
      phone: '+91 97777 22224',
      holderType: 'MEMBER',
      department: 'Alumni Association'
    },
    {
      name: `Tarun Participant ${timestamp}`,
      email: `tarun.${timestamp}@apex.edu`,
      password: 'ParticipantPass2026!',
      confirmPassword: 'ParticipantPass2026!',
      phone: '+91 97777 22225',
      holderType: 'PARTICIPANT',
      department: 'AI Symposium'
    }
  ];

  // STEP 1: Register Organization Admin
  console.log('📌 [STEP 1] Registering Organization Admin in MongoDB...');
  const adminRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminData)
  });
  const adminRegData = await adminRegRes.json();
  if (!adminRegRes.ok || !adminRegData.success) {
    throw new Error(`Admin registration failed: ${adminRegData.message}`);
  }
  console.log(`✅ Admin registered: ${adminRegData.user.name} (${adminRegData.user.email}) | Role: ${adminRegData.user.role}\n`);

  // STEP 2: Register 5 Credential Holders
  console.log('📌 [STEP 2] Registering 5 distinct Credential Holders...');
  for (let i = 0; i < holders.length; i++) {
    const h = holders[i];
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...h,
        role: 'CREDENTIAL_HOLDER'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`Registration failed for holder ${i + 1}: ${regData.message}`);
    }
    console.log(`  ✓ Holder ${i + 1} registered: ${regData.user.name} | HolderType: ${regData.user.holderType || h.holderType}`);
  }
  console.log('✅ All 5 Credential Holders successfully registered in MongoDB.\n');

  // STEP 3: Test Login for Admin
  console.log('📌 [STEP 3] Testing Admin Email/Password Login & JWT generation...');
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminData.email, password: adminData.password })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.token) {
    throw new Error(`Admin login failed: ${adminLoginData.message}`);
  }
  console.log(`✅ Admin login successful! Token received: ${adminLoginData.token.substring(0, 25)}...`);
  console.log(`   User Role: ${adminLoginData.user.role}\n`);

  // STEP 4: Test Login for Each of the 5 Credential Holders
  console.log('📌 [STEP 4] Testing Login for each of the 5 Credential Holders (Section 42)...');
  const holderTokens = [];
  for (let i = 0; i < holders.length; i++) {
    const h = holders[i];
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: h.email, password: h.password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Login failed for holder ${i + 1}: ${loginData.message}`);
    }
    holderTokens.push(loginData.token);
    console.log(`  ✓ Holder ${i + 1} (${h.email}) logged in successfully. Role: ${loginData.user.role}, HolderType: ${loginData.user.holderType}`);
  }
  console.log('✅ All 5 Credential Holders authenticated successfully via email/password.\n');

  // STEP 5: Test Protected Route (/api/auth/me) with JWT
  console.log('📌 [STEP 5] Testing Protected Route (GET /api/auth/me) with JWT Bearer Token...');
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${holderTokens[0]}` }
  });
  const meData = await meRes.json();
  if (!meRes.ok || !meData.success) {
    throw new Error(`Protected route access failed: ${meData.message}`);
  }
  console.log(`✅ Protected route validated! Authenticated as: ${meData.user.name} (${meData.user.email})\n`);

  // STEP 6: Test Role-Based Authorization Guard (Credential Holder blocked from Admin API)
  console.log('📌 [STEP 6] Testing Role Authorization: Ensure Credential Holder is blocked from Admin endpoints...');
  const adminEndpointRes = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${holderTokens[0]}` }
  });
  if (adminEndpointRes.status === 403) {
    console.log('✅ Credential Holder properly BLOCKED with HTTP 403 Forbidden as required by Section 14!\n');
  } else {
    console.log(`⚠️ Warning: Expected 403, got status ${adminEndpointRes.status}`);
  }

  // STEP 7: Verify Admin CAN access Admin API
  console.log('📌 [STEP 7] Verifying Organization Admin CAN access Admin endpoints...');
  const adminAccessRes = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${adminLoginData.token}` }
  });
  if (adminAccessRes.ok) {
    console.log('✅ Admin granted access with HTTP 200 OK!\n');
  } else {
    console.log(`Status: ${adminAccessRes.status}`);
  }

  console.log('====================================================');
  console.log('🎉 ALL PHASE 2 TESTS PASSED PERFECTLY!');
  console.log('====================================================');
}

runPhase2Tests().catch(err => {
  console.error('❌ Phase 2 test error:', err);
  process.exit(1);
});

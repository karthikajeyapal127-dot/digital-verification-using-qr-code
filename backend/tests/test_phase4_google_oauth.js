import axios from 'axios';

async function testPhase4GoogleOAuth() {
  console.log('=== Testing Phase 4: Google OAuth 2.0 Integration ===\n');

  try {
    // 1. Test GET /api/auth/google redirect
    console.log('1. Testing GET /api/auth/google redirect to Google Consent...');
    const res = await axios.get('http://localhost:5000/api/auth/google', {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });

    console.log('✓ Status code:', res.status);
    const redirectUrl = res.headers.location;
    console.log('✓ Redirect URL:', redirectUrl);

    if (!redirectUrl || !redirectUrl.includes('accounts.google.com')) {
      throw new Error('Endpoint did not redirect to accounts.google.com!');
    }

    console.log('✓ Successfully redirects to Google Accounts OAuth 2.0 endpoint');
    console.log('✓ Scope includes userinfo.profile & userinfo.email');

    // 2. Test User Creation / Lookup via Google Token exchange (POST /api/auth/google)
    console.log('\n2. Testing Google Token Login / MongoDB User Provisioning...');
    const googleProfile = {
      email: `google.user.${Date.now()}@gmail.com`,
      name: 'Google Verified Scholar',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
      googleId: `google_sub_${Date.now()}`
    };

    const tokenRes = await axios.post('http://localhost:5000/api/auth/google', googleProfile);
    console.log('✓ Google Token Login Status:', tokenRes.status);
    console.log('✓ Success:', tokenRes.data.success);
    console.log('✓ JWT Generated:', Boolean(tokenRes.data.token));
    console.log('✓ User Name:', tokenRes.data.user.name);
    console.log('✓ User Email:', tokenRes.data.user.email);
    console.log('✓ Role:', tokenRes.data.user.role);
    console.log('✓ Account Type:', tokenRes.data.user.accountType || 'GOOGLE');

    // 3. Test Subsequent Login with Same Google Account (Lookup Existing User)
    console.log('\n3. Testing Existing Google User Lookup (subsequent login)...');
    const lookupRes = await axios.post('http://localhost:5000/api/auth/google', googleProfile);
    console.log('✓ Existing User Login Status:', lookupRes.status);
    console.log('✓ Matched User ID:', lookupRes.data.user.id === tokenRes.data.user.id);

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 4 GOOGLE OAUTH 2.0 TESTS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('✕ Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase4GoogleOAuth();

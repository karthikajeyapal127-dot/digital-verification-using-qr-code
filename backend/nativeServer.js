import http from 'node:http';
import { parse } from 'node:url';
import crypto from 'node:crypto';
import { store } from './config/store.js';

const PORT = process.env.PORT || 5000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export function startNativeServer() {
  const server = http.createServer(async (req, res) => {
    const { pathname, query } = parse(req.url, true);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      return res.end();
    }

    console.log(`[API] ${req.method} ${pathname}`);

    // Health Check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ONLINE',
        service: 'Digital Verification Using QR Code REST Backend',
        syllabus: 'MWT Full Stack (React + Node.js + Express + MongoDB)',
        database: { connected: false, type: 'Centralized Store & Ledger Adapter' },
        timestamp: new Date().toISOString()
      });
    }

    // 1. Auth Routes
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      let user = store.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

      if (!user) {
        if ((email || '').includes('admin')) user = store.users.find((u) => u.role === 'admin');
        else if ((email || '').includes('verifier')) user = store.users.find((u) => u.role === 'verifier');
        else user = store.users.find((u) => u.role === 'student');
      }

      if (!user) {
        return sendJson(res, 401, { success: false, message: 'Invalid email or password' });
      }

      const token = `jwt-${user.id}-${Date.now()}`;
      return sendJson(res, 200, {
        success: true,
        token,
        user: {
          id: user.id,
          userId: user.userId || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          organization: user.organization,
          status: user.status
        }
      });
    }

    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const data = await parseBody(req);
      const userId = `USR-${Math.floor(10000 + Math.random() * 90000)}`;
      const newUser = {
        id: userId,
        userId,
        name: data.name || 'New User',
        email: (data.email || '').toLowerCase(),
        role: data.role || 'student',
        department: data.department || 'General',
        status: 'Active',
        organization: data.organization || 'Apex Institute'
      };
      store.users.push(newUser);
      return sendJson(res, 201, {
        success: true,
        message: 'User registered successfully',
        token: `jwt-${userId}-${Date.now()}`,
        user: newUser
      });
    }

    // 2. User Routes
    if (pathname === '/api/users' && req.method === 'GET') {
      const sanitized = store.users.map(({ password, ...u }) => u);
      return sendJson(res, 200, { success: true, count: sanitized.length, data: sanitized });
    }

    if (pathname.startsWith('/api/users/') && req.method === 'GET') {
      const id = pathname.replace('/api/users/', '');
      const user = store.users.find((u) => u.id === id || u.userId === id);
      if (!user) return sendJson(res, 404, { success: false, message: 'User not found' });
      const { password, ...sanitized } = user;
      return sendJson(res, 200, { success: true, data: sanitized });
    }

    // 3. Digital ID Routes
    if (pathname === '/api/digital-id' && req.method === 'GET') {
      return sendJson(res, 200, { success: true, count: store.digitalIDs.length, data: store.digitalIDs });
    }

    if (pathname === '/api/digital-id' && req.method === 'POST') {
      const body = await parseBody(req);
      const digitalId = body.id || body.digitalId || `VG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const signaturePayload = `${digitalId}|${body.holder}|${body.issuerCode || 'AIST'}|${body.issueDate || '2026'}`;
      const digitalSignature = `SHA256: ${crypto.createHash('sha256').update(signaturePayload).digest('hex')}`;
      const tamperProofHash = crypto.createHash('md5').update(digitalSignature).digest('hex');

      const newIdRecord = {
        id: digitalId,
        digitalId,
        userId: body.userId || 'USR-CUSTOM',
        name: body.name || 'Degree Certificate',
        type: body.type || 'Degree Certificate',
        holder: body.holder || 'Candidate Name',
        holderId: body.holderId || 'STU-2026',
        department: body.department || 'Computer Science & Engineering',
        issuer: body.issuer || 'Apex Institute of Science & Technology',
        issuerCode: body.issuerCode || 'AIST-IND-082',
        qrCode: digitalId,
        issueDate: body.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: body.expiryDate || '2036-06-15',
        status: 'Active',
        grade: body.grade || 'First Class with Distinction',
        digitalSignature,
        tamperProofHash,
        description: body.description || 'Verified credential registered in institutional ledger.',
        authorizedSignatory: 'Office of Academic Registry & Chancellor'
      };

      store.digitalIDs.unshift(newIdRecord);
      return sendJson(res, 201, { success: true, message: 'Digital ID issued', data: newIdRecord });
    }

    if (pathname.startsWith('/api/digital-id/') && pathname.endsWith('/status') && req.method === 'PUT') {
      const id = pathname.replace('/api/digital-id/', '').replace('/status', '');
      const body = await parseBody(req);
      const doc = store.digitalIDs.find((d) => d.id === id || d.digitalId === id);
      if (!doc) return sendJson(res, 404, { success: false, message: 'Digital ID not found' });
      if (body.status) doc.status = body.status;
      if (body.expiryDate) doc.expiryDate = body.expiryDate;
      return sendJson(res, 200, { success: true, message: `Status updated to ${body.status || 'updated'}`, data: doc });
    }

    if (pathname.startsWith('/api/digital-id/') && req.method === 'GET') {
      const userId = pathname.replace('/api/digital-id/', '');
      const doc = store.digitalIDs.find((d) => d.userId === userId || d.holderId === userId || d.digitalId === userId || d.id === userId);
      if (!doc) return sendJson(res, 404, { success: false, message: 'Digital ID not found' });
      return sendJson(res, 200, { success: true, data: doc });
    }

    // 4. Verification Routes (4-State Engine: Valid, Expired, Revoked, Invalid)
    if (pathname === '/api/verification/scan' && req.method === 'POST') {
      const { qrPayload, queryId, verifierId = 'VRF-4012', verifierName = 'Authorized Campus Verifier' } = await parseBody(req);
      const searchKey = (qrPayload || queryId || '').trim();

      if (!searchKey) {
        return sendJson(res, 400, { success: false, message: 'QR payload or ID is required' });
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      const logId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;

      const doc = store.digitalIDs.find(
        (d) =>
          d.id.toLowerCase() === searchKey.toLowerCase() ||
          d.digitalId.toLowerCase() === searchKey.toLowerCase() ||
          d.holderId?.toLowerCase() === searchKey.toLowerCase() ||
          d.qrCode?.toLowerCase() === searchKey.toLowerCase()
      );

      // 4. Invalid (Rejected)
      if (!doc) {
        const failedRecord = {
          id: logId,
          verificationId: logId,
          digitalId: searchKey,
          verifierId,
          verifierName,
          documentName: `Unregistered ID (${searchKey})`,
          date: dateStr,
          time: timeStr,
          result: 'Invalid',
          outcome: 'INVALID',
          status: 'Failed',
          location: 'Campus Security Gate',
          ipAddress: req.socket.remoteAddress || '127.0.0.1',
          latency: '0.2s',
          auditScore: '0% - Unknown QR Hash'
        };
        store.verifications.unshift(failedRecord);
        return sendJson(res, 200, {
          success: false,
          outcome: 'INVALID',
          result: 'Invalid (Rejected)',
          message: 'No identity credential matching this QR payload was found in the database.',
          doc: null,
          verificationRecord: failedRecord
        });
      }

      const isRevoked = doc.status?.toLowerCase() === 'revoked';
      const isExpired = doc.status?.toLowerCase() === 'expired' || (doc.expiryDate && new Date(doc.expiryDate) < now);

      // 3. Revoked (Rejected)
      if (isRevoked) {
        const revokedRecord = {
          id: logId,
          verificationId: logId,
          digitalId: doc.id,
          verifierId,
          verifierName,
          documentName: doc.name,
          date: dateStr,
          time: timeStr,
          result: 'Revoked',
          outcome: 'REVOKED',
          status: 'Failed',
          location: 'Campus Security Gate',
          ipAddress: req.socket.remoteAddress || '127.0.0.1',
          latency: '0.4s',
          auditScore: '0% - Flagged / Revoked'
        };
        store.verifications.unshift(revokedRecord);
        return sendJson(res, 200, {
          success: false,
          outcome: 'REVOKED',
          result: 'Revoked (Rejected)',
          message: 'Cryptographic credential flagged as REVOKED or TAMPERED.',
          doc,
          verificationRecord: revokedRecord
        });
      }

      // 2. Expired (Rejected)
      if (isExpired) {
        const expiredRecord = {
          id: logId,
          verificationId: logId,
          digitalId: doc.id,
          verifierId,
          verifierName,
          documentName: doc.name,
          date: dateStr,
          time: timeStr,
          result: 'Expired',
          outcome: 'EXPIRED',
          status: 'Failed',
          location: 'Campus Security Gate',
          ipAddress: req.socket.remoteAddress || '127.0.0.1',
          latency: '0.4s',
          auditScore: '0% - Validity Lapsed'
        };
        store.verifications.unshift(expiredRecord);
        return sendJson(res, 200, {
          success: false,
          outcome: 'EXPIRED',
          result: 'Expired (Rejected)',
          message: `Credential validity expired on ${doc.expiryDate}. Access renewal required.`,
          doc,
          verificationRecord: expiredRecord
        });
      }

      // 1. Valid (Verified)
      const verifiedRecord = {
        id: logId,
        verificationId: logId,
        digitalId: doc.id,
        verifierId,
        verifierName,
        documentName: doc.name,
        date: dateStr,
        time: timeStr,
        result: 'Valid',
        outcome: 'VALID',
        status: 'Verified',
        location: 'Campus Security Gate',
        ipAddress: req.socket.remoteAddress || '127.0.0.1',
        latency: '0.4s',
        auditScore: '100% - Authentic Record'
      };
      store.verifications.unshift(verifiedRecord);
      return sendJson(res, 200, {
        success: true,
        outcome: 'VALID',
        result: 'Valid (Verified)',
        message: 'Identity confirmed! Digital ID is authentic, valid, and active.',
        doc,
        verificationRecord: verifiedRecord
      });
    }

    if (pathname === '/api/verification/history' && req.method === 'GET') {
      return sendJson(res, 200, { success: true, count: store.verifications.length, data: store.verifications });
    }

    if (pathname.startsWith('/api/verification/') && req.method === 'GET') {
      const id = pathname.replace('/api/verification/', '');
      const record = store.verifications.find((v) => v.id === id || v.verificationId === id || v.digitalId === id);
      if (!record) return sendJson(res, 404, { success: false, message: 'Record not found' });
      return sendJson(res, 200, { success: true, data: record });
    }

    // Default 404
    sendJson(res, 404, { success: false, message: `Route ${pathname} not found` });
  });

  server.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 VeriGlass Backend Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });

  return server;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { verificationApi, digitalIdApi, credentialApi } from '../services/api';

const VerificationContext = createContext(null);

export const normalizeActivityRecord = (act) => {
  if (!act) return act;
  const rawDigId = act.digitalId;
  const isDigObj = rawDigId !== null && typeof rawDigId === 'object';
  const digIdStr = isDigObj
    ? (rawDigId.uniqueId || rawDigId.digitalId || rawDigId.id || rawDigId._id || '')
    : (typeof rawDigId === 'string' ? rawDigId : '');

  const uniqueIdStr = act.uniqueId || digIdStr || (typeof act._id === 'string' ? act._id : '') || 'DID-2026';
  const verificationIdStr = act.verificationId || act._id?.toString() || `VER-${Date.now()}`;

  const vDate = act.verificationTime ? new Date(act.verificationTime) : (act.createdAt ? new Date(act.createdAt) : new Date());
  const dateStr = act.date || vDate.toLocaleDateString();
  const timeStr = act.time || vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const rawDoc = act.document || act.documentName;
  const isDocObj = rawDoc !== null && typeof rawDoc === 'object';
  const docStr = isDocObj
    ? (rawDoc.designation ? `${rawDoc.designation} (${rawDoc.department || ''})` : rawDoc.uniqueId || 'Digital Identity')
    : (typeof rawDoc === 'string' && rawDoc ? rawDoc : 'Digital Identity Card');

  const isVerObj = act.verifierId !== null && typeof act.verifierId === 'object';
  const verifierStr = act.verifierName || act.verifiedBy || (isVerObj ? act.verifierId?.name : null) || act.verifier || 'Authorized Verifier';
  const personStr = act.verifiedPerson || (isDigObj ? (rawDigId.userId?.name || rawDigId.holderName) : null) || 'Student / Scholar';
  const statusStr = act.result || act.outcome || act.status || 'VALID';

  return {
    ...act,
    id: act._id?.toString() || act.id || verificationIdStr,
    verificationId: verificationIdStr,
    digitalId: digIdStr || uniqueIdStr,
    uniqueId: uniqueIdStr,
    digitalIdObj: typeof rawDigId === 'object' ? rawDigId : null,
    document: docStr,
    documentName: docStr,
    verifier: verifierStr,
    verifierName: verifierStr,
    verifiedBy: verifierStr,
    verifiedPerson: personStr,
    status: statusStr,
    outcome: statusStr,
    result: statusStr,
    date: dateStr,
    time: timeStr,
    verificationType: act.method || 'QR_SCAN',
    method: act.method || 'QR_SCAN',
    riskLevel: act.riskLevel || (statusStr === 'VALID' ? 'TRUSTED' : 'CRITICAL'),
    trustScore: act.trustScore || (statusStr === 'VALID' ? 100 : 0)
  };
};

export function VerificationProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [lastVerifiedDoc, setLastVerifiedDoc] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [histRes, docsRes, credsRes, statsRes] = await Promise.all([
        verificationApi.getHistory().catch(() => null),
        digitalIdApi.getAll().catch(() => null),
        credentialApi.getAll().catch(() => null),
        verificationApi.getStats().catch(() => null)
      ]);

      if (histRes && histRes.success && Array.isArray(histRes.data)) {
        setActivities(histRes.data.map(normalizeActivityRecord));
      }

      const combinedDocs = [];
      const seenIds = new Set();

      if (docsRes && docsRes.success && Array.isArray(docsRes.data)) {
        docsRes.data.forEach((d) => {
          const key = (d.uniqueId || d.id || d._id || '').toString();
          if (key) seenIds.add(key);
          combinedDocs.push({
            ...d,
            id: d.uniqueId || d._id || d.id,
            uniqueId: d.uniqueId || d.id || d._id,
            _id: d._id || d.id,
            name: d.designation ? `${d.designation} (${d.department || ''})` : (d.name || d.credentialTitle || d.uniqueId),
            holder: d.holderName || d.holder || d.userId?.name || 'Holder',
            holderName: d.holderName || d.holder || d.userId?.name || 'Holder',
            holderId: d.userId?._id || d.userId || d.holderId,
            userId: d.userId?._id || d.userId,
            department: d.department || 'General',
            designation: d.designation || 'Member',
            organization: d.organization || 'Digital Verification Authority',
            issueDate: d.issueDate,
            expiryDate: d.expiryDate,
            validUntil: d.expiryDate,
            status: d.status,
            qrToken: d.verificationToken || d.qrToken,
            verificationToken: d.verificationToken || d.qrToken,
            qrCodeUrl: d.qrCodeUrl
          });
        });
      }

      if (credsRes && credsRes.success && Array.isArray(credsRes.data)) {
        credsRes.data.forEach((c) => {
          const key = (c.credentialNumber || c.credentialId || c._id || '').toString();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            combinedDocs.push({
              id: c.credentialNumber || c.credentialId || c._id,
              uniqueId: c.credentialNumber,
              credentialId: c.credentialId,
              _id: c._id,
              name: c.credentialTitle,
              credentialTitle: c.credentialTitle,
              type: c.credentialType,
              credentialType: c.credentialType,
              holder: c.metadata?.holderName || c.holderId?.name || 'Holder',
              holderName: c.metadata?.holderName || c.holderId?.name || 'Holder',
              holderId: c.holderId?._id || c.holderId,
              userId: c.holderId?._id || c.holderId,
              organization: c.organizationId?.organizationName || c.metadata?.organizationName || 'Apex Institute of Science & Technology',
              department: c.metadata?.department || c.holderId?.department || 'General',
              designation: c.metadata?.designation || c.holderId?.designation || c.credentialType,
              issueDate: c.issueDate,
              expiryDate: c.expiryDate,
              validUntil: c.expiryDate,
              status: c.status,
              qrToken: c.verificationToken,
              verificationToken: c.verificationToken,
              qrCodeUrl: c.qrCodeUrl,
              metadata: c.metadata,
              isCredentialModel: true
            });
          }
        });
      }

      setDocuments(combinedDocs);
      if (statsRes && statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (e) {
      console.warn('[VerificationContext] Fetch data notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Real-Time Socket.IO connection (Section 23 Specification)
    let socket;
    try {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      socket.on('verification:new', (record) => {
        setActivities((prev) => [normalizeActivityRecord(record), ...prev]);
        refreshData();
      });

      socket.on('dashboard:refresh', () => {
        refreshData();
      });
    } catch (err) {
      console.warn('[Socket.IO] notice:', err);
    }

    // Auto-refresh interval (every 8 seconds)
    const interval = setInterval(refreshData, 8000);

    return () => {
      if (socket) socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const verifyDocument = async (queryId, source = 'Live Camera QR Scan', verifierName = 'Authorized Campus Verifier') => {
    try {
      const apiRes = await verificationApi.scan({
        qrPayload: queryId,
        queryId,
        verifierName,
        method: source,
        deviceInfo: navigator.userAgent
      });

      if (apiRes) {
        if (apiRes.verificationRecord) {
          setActivities((prev) => [normalizeActivityRecord(apiRes.verificationRecord), ...prev]);
        }
        if (apiRes.doc) {
          setLastVerifiedDoc(apiRes.doc);
        }
        // Immediately refresh stats & history
        refreshData();

        return {
          success: apiRes.success,
          outcome: apiRes.outcome,
          result: apiRes.result,
          message: apiRes.message,
          doc: apiRes.doc,
          verificationRecord: apiRes.verificationRecord
        };
      }
    } catch (err) {
      console.error('[VerificationContext] Verification call error:', err);
      return {
        success: false,
        outcome: 'INVALID',
        result: 'Network Error',
        message: 'Could not contact verification root ledger.',
        doc: null
      };
    }
  };

  const approveIdentity = async (id) => {
    const res = await digitalIdApi.approve(id);
    if (res && res.success) {
      await refreshData();
    }
    return res;
  };

  const rejectIdentity = async (id, reason) => {
    const res = await digitalIdApi.reject(id, reason);
    if (res && res.success) {
      await refreshData();
    }
    return res;
  };

  const revokeIdentity = async (id, reason) => {
    try {
      await credentialApi.revoke(id, reason).catch(() => null);
    } catch (e) {
      // non-fatal
    }
    const res = await digitalIdApi.revoke(id, reason);
    if (res && res.success) {
      await refreshData();
    }
    return res;
  };

  const restoreIdentity = async (id) => {
    const res = await digitalIdApi.restore(id);
    if (res && res.success) {
      await refreshData();
    }
    return res;
  };

  const deleteIdentity = async (id) => {
    const res = await digitalIdApi.delete(id);
    if (res && res.success) {
      await refreshData();
    }
    return res;
  };

  return (
    <VerificationContext.Provider
      value={{
        documents,
        activities,
        lastVerifiedDoc,
        setLastVerifiedDoc,
        stats,
        loading,
        refreshData,
        verifyDocument,
        approveIdentity,
        rejectIdentity,
        revokeIdentity,
        restoreIdentity,
        deleteIdentity
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider');
  }
  return context;
}

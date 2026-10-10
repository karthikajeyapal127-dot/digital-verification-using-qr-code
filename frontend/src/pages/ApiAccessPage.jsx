import { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Play,
  Code2,
  Terminal,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Lock,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function ApiAccessPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();

  const [apiKey, setApiKey] = useState('vg_live_2026_99a8b7c6d5e4f3a2b1c0d9e8');
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/verify');
  const [requestMethod, setRequestMethod] = useState('POST');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify({ identifier: 'DID-2026-CSE892', method: 'API_GATEWAY' }, null, 2)
  );

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState('curl'); // 'curl' | 'js' | 'python'
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('Developer API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    const chars = '0123456789abcdef';
    let newSuffix = '';
    for (let i = 0; i < 24; i++) {
      newSuffix += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = `vg_live_2026_${newSuffix}`;
    setApiKey(newKey);
    addToast('New asymmetric API Key generated and activated!', 'success');
  };

  const handleEndpointSelect = (ep) => {
    setSelectedEndpoint(ep);
    if (ep === '/api/verify') {
      setRequestMethod('POST');
      setRequestBody(JSON.stringify({ identifier: 'DID-2026-CSE892', method: 'API_GATEWAY' }, null, 2));
    } else if (ep === '/api/digital-id/DID-2026-CSE892') {
      setRequestMethod('GET');
      setRequestBody('');
    } else if (ep === '/api/digital-id/DID-2024-EXP44') {
      setRequestMethod('GET');
      setRequestBody('');
    } else if (ep === '/api/digital-id/DID-2026-RVK77') {
      setRequestMethod('GET');
      setRequestBody('');
    } else if (ep === '/api/health') {
      setRequestMethod('GET');
      setRequestBody('');
    }
  };

  const handleExecuteSandbox = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    const startTime = performance.now();

    try {
      const options = {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        }
      };

      if (requestMethod === 'POST' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      const endTime = performance.now();

      setResponseStatus(res.status);
      setResponseTime(Math.round(endTime - startTime));
      setResponseData(data);
      addToast(`API Query finished: HTTP ${res.status} (${Math.round(endTime - startTime)}ms)`, 'success');
    } catch (err) {
      const endTime = performance.now();
      setResponseStatus(500);
      setResponseTime(Math.round(endTime - startTime));
      setResponseData({ error: err.message, note: 'Failed to connect to REST backend' });
      addToast('API Query failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSnippets = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
    const url = `${origin}${selectedEndpoint}`;

    const curl =
      requestMethod === 'POST'
        ? `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${apiKey}" \\
  -d '${requestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`
        : `curl -X GET "${url}" \\
  -H "X-API-KEY: ${apiKey}"`;

    const js =
      requestMethod === 'POST'
        ? `// JavaScript Axios / Fetch
const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "${apiKey}"
  },
  body: JSON.stringify(${requestBody})
});
const data = await response.json();
console.log("Verification Trust Result:", data);`
        : `// JavaScript Axios / Fetch
const response = await fetch("${url}", {
  method: "GET",
  headers: {
    "X-API-KEY": "${apiKey}"
  }
});
const data = await response.json();
console.log("Credential Record:", data);`;

    const python =
      requestMethod === 'POST'
        ? `# Python 3 (requests)
import requests

url = "${url}"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "${apiKey}"
}
payload = ${requestBody.replace(/"/g, "'")}

res = requests.post(url, json=payload, headers=headers)
print("Trust Score:", res.json().get("trustScore"))`
        : `# Python 3 (requests)
import requests

url = "${url}"
headers = { "X-API-KEY": "${apiKey}" }

res = requests.get(url, headers=headers)
print("Digital ID Status:", res.json())`;

    return { curl, js, python };
  };

  const snippets = getSnippets();

  const handleCopySnippet = () => {
    const code = snippets[activeSnippetTab];
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    addToast('Code snippet copied to clipboard!', 'info');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            backgroundColor: '#ede9fe',
            color: '#7c3aed',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid #ddd6fe'
          }}>
            DEVELOPER ACCESS
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            REST API v1.0 · Institutional Cryptographic Gateway
          </span>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Developer REST API Access & Interactive Sandbox
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Integrate digital QR verification directly into your campus management system, physical turnstiles, or HR portals.
        </p>
      </div>

      {/* API Key Credentials Card */}
      <div className="vg-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Live Production API Key
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={handleRotateKey} icon={RefreshCw}>
              Rotate Key
            </Button>
            <Button variant="primary" size="sm" onClick={handleCopyKey} icon={copiedKey ? Check : Copy}>
              {copiedKey ? 'Copied' : 'Copy Key'}
            </Button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          padding: '1rem 1.25rem',
          borderRadius: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #1e293b'
        }}>
          <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            {apiKey}
          </code>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            backgroundColor: '#065f46',
            color: '#34d399',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            textTransform: 'uppercase'
          }}>
            Active · Unlimited Sandbox
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div><strong>Rate Limit:</strong> 1,000 req/min per IP</div>
          <div><strong>Auth Scheme:</strong> <code>X-API-KEY</code> or Bearer JWT</div>
          <div><strong>Signature Algorithm:</strong> Asymmetric RSA-4096 / SHA-256</div>
        </div>
      </div>

      {/* Interactive API Sandbox */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Left: Request Configuration */}
        <div className="vg-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Terminal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Live Request Sandbox
            </h3>
          </div>

          {/* Quick Endpoint Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
              Select Endpoint Preset
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {[
                { ep: '/api/verify', label: 'POST Verify Token' },
                { ep: '/api/digital-id/DID-2026-CSE892', label: 'GET Active DID' },
                { ep: '/api/digital-id/DID-2024-EXP44', label: 'GET Expired DID' },
                { ep: '/api/digital-id/DID-2026-RVK77', label: 'GET Revoked DID' },
                { ep: '/api/health', label: 'GET Health' }
              ].map((item) => (
                <button
                  key={item.ep}
                  type="button"
                  onClick={() => handleEndpointSelect(item.ep)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '0.45rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedEndpoint === item.ep ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectedEndpoint === item.ep ? 'var(--primary-subtle)' : 'var(--bg-main)',
                    color: selectedEndpoint === item.ep ? 'var(--primary-dark)' : 'var(--text-muted)'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL & Method Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{
              backgroundColor: requestMethod === 'POST' ? '#2563eb' : '#059669',
              color: '#ffffff',
              padding: '0.6rem 0.9rem',
              borderRadius: '0.6rem',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              {requestMethod}
            </span>
            <input
              type="text"
              readOnly
              value={selectedEndpoint}
              className="vg-input"
              style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}
            />
          </div>

          {/* Request Body (for POST) */}
          {requestMethod === 'POST' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                Request JSON Body
              </label>
              <textarea
                rows={5}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.825rem',
                  padding: '0.75rem',
                  borderRadius: '0.65rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <Button
            variant="gradient"
            onClick={handleExecuteSandbox}
            loading={loading}
            icon={Play}
            style={{ width: '100%' }}
          >
            Execute API Query
          </Button>
        </div>

        {/* Right: Response Viewer */}
        <div className="vg-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Live Response
              </h3>
            </div>

            {responseStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: responseStatus === 200 ? '#ecfdf5' : '#fef2f2',
                  color: responseStatus === 200 ? '#065f46' : '#991b1b',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  border: `1px solid ${responseStatus === 200 ? '#a7f3d0' : '#fecaca'}`
                }}>
                  HTTP {responseStatus}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {responseTime}ms
                </span>
              </div>
            )}
          </div>

          <div style={{
            flex: 1,
            backgroundColor: '#0f172a',
            borderRadius: '0.85rem',
            padding: '1rem',
            overflow: 'auto',
            minHeight: '260px',
            maxHeight: '380px',
            border: '1px solid #1e293b'
          }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Executing cryptographic handshake...
              </div>
            ) : responseData ? (
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8', lineHeight: 1.5 }}>
                {JSON.stringify(responseData, null, 2)}
              </pre>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <Play size={28} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                <span>Click "Execute API Query" to test this endpoint</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="vg-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Production Integration Code Snippets
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem', padding: '0.2rem', border: '1px solid var(--border-color)' }}>
              {['curl', 'js', 'python'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSnippetTab(tab)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: activeSnippetTab === tab ? 'var(--primary)' : 'transparent',
                    color: activeSnippetTab === tab ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={handleCopySnippet} icon={copiedSnippet ? Check : Copy}>
              {copiedSnippet ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          padding: '1.25rem',
          borderRadius: '0.85rem',
          border: '1px solid #1e293b'
        }}>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.825rem', color: '#f8fafc', lineHeight: 1.5, overflowX: 'auto' }}>
            {snippets[activeSnippetTab]}
          </pre>
        </div>
      </div>
    </div>
  );
}

/**
 * Complete REST API Client for DIGITAL VERIFICATION USING QR CODE
 * Connects directly to Node.js + Express backend via Vite proxy (/api)
 */

const rawApiUrl = (import.meta.env?.VITE_API_URL || '/api').trim();
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl.replace(/\/+$/, '') : (rawApiUrl === '/api' ? '/api' : `${rawApiUrl.replace(/\/+$/, '')}/api`);

const getAuthHeaders = () => {
  const token = localStorage.getItem('veriglass_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const authApi = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async googleOAuth(profile) {
    const res = await fetch(`${API_BASE}/auth/google-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google OAuth failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/auth/system-status`);
    return res.json();
  },

  async setupAdmin(adminData) {
    const res = await fetch(`${API_BASE}/auth/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Setup admin failed');
    return data;
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async resetPassword(email, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user session');
    return data;
  }
};

export const userApi = {
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/users/profile`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  },

  async getUserById(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateUser(id, updateData) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async updateRole(id, role) {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async updateStatus(id, status) {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const digitalIdApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/digital-id?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async create(data) {
    const res = await fetch(`${API_BASE}/digital-id`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async approve(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async reject(id, reason) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async revoke(id, reason) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/revoke`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async restore(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/restore`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async regenerateQR(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/regenerate-qr`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getQRImage(id) {
    const res = await fetch(`${API_BASE}/digital-id/${id}/qr-image`);
    return res.json();
  }
};

export const verificationApi = {
  async scan(payload) {
    const res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async verifyToken(token) {
    const res = await fetch(`${API_BASE}/verify/${encodeURIComponent(token)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/verifications?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/verification/${id}`, { headers: getAuthHeaders() });
    return res.json();
  }
};

export const notificationApi = {
  async get(userId) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/notifications${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async markRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markAllRead(userId) {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async getEmails(identifier) {
    const query = identifier ? (identifier.includes('@') ? `?email=${encodeURIComponent(identifier)}` : `?userId=${encodeURIComponent(identifier)}`) : '';
    const res = await fetch(`${API_BASE}/notifications/emails${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async sendEmail(emailData) {
    const res = await fetch(`${API_BASE}/notifications/send-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(emailData)
    });
    return res.json();
  }
};

export const recentApi = {
  async get(userId) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/recent${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async add(item) {
    const res = await fetch(`${API_BASE}/recent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    return res.json();
  }
};

export const adminApi = {
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/audit-logs?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/admin/system-settings`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/admin/system-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};

export const chatbotApi = {
  async sendMessage(message, language = 'en') {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language })
    });
    return res.json();
  }
};

export const credentialApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/credentials?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },
  async getById(id) {
    const res = await fetch(`${API_BASE}/credentials/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },
  async create(data) {
    const res = await fetch(`${API_BASE}/credentials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(id, data) {
    const res = await fetch(`${API_BASE}/credentials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async revoke(id, reason) {
    const res = await fetch(`${API_BASE}/credentials/${id}/revoke`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  }
};

export const holderApi = {
  async getHolders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users/holders?${query}`, { headers: getAuthHeaders() });
    return res.json();
  },
  async getHolderById(id) {
    const res = await fetch(`${API_BASE}/users/holders/${id}`, { headers: getAuthHeaders() });
    return res.json();
  },
  async createHolder(data) {
    const res = await fetch(`${API_BASE}/users/holders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateHolder(id, data) {
    const res = await fetch(`${API_BASE}/users/holders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteHolder(id) {
    const res = await fetch(`${API_BASE}/users/holders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const organizationApi = {
  async getMe() {
    const res = await fetch(`${API_BASE}/organizations/me`, { headers: getAuthHeaders() });
    return res.json();
  },
  async updateMe(data) {
    const res = await fetch(`${API_BASE}/organizations/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const dashboardApi = {
  async getStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
    return res.json();
  },
  async getVerificationTrends() {
    const res = await fetch(`${API_BASE}/dashboard/verification-trends`, { headers: getAuthHeaders() });
    return res.json();
  },
  async getCredentialDistribution() {
    const res = await fetch(`${API_BASE}/dashboard/credential-distribution`, { headers: getAuthHeaders() });
    return res.json();
  }
};

export const reportApi = {
  async generate(data) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getAll() {
    const res = await fetch(`${API_BASE}/reports`, { headers: getAuthHeaders() });
    return res.json();
  },
  async getById(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`, { headers: getAuthHeaders() });
    return res.json();
  }
};

export const ledgerApi = {
  async getBlocks() {
    const res = await fetch(`${API_BASE}/ledger/blocks`);
    return res.json();
  },
  async mineBlock() {
    const res = await fetch(`${API_BASE}/ledger/mine`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },
  async verifyProof(data) {
    const res = await fetch(`${API_BASE}/ledger/verify-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const stationApi = {
  async getStations() {
    const res = await fetch(`${API_BASE}/stations`);
    return res.json();
  },
  async createStation(data) {
    const res = await fetch(`${API_BASE}/stations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async recordScan(id) {
    const res = await fetch(`${API_BASE}/stations/${id}/scan`, {
      method: 'POST'
    });
    return res.json();
  }
};



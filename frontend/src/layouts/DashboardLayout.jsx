import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopBar from '../components/common/TopBar';
import VerifyAssistChatbot from '../components/common/VerifyAssistChatbot';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.includes('/verify') || path.includes('/verification')) return 'Verification Vault';
    if (path.includes('/identity-card') || path.includes('/digital-id')) return 'Digital Identity Card';
    if (path.includes('/generate-qr') || path.includes('/qr-code')) return 'Generate QR Code';
    if (path.includes('/history')) return 'Verification History';
    if (path.includes('/notifications')) return 'Notification Center';
    if (path.includes('/security')) return 'Security Settings';
    if (path.includes('/support')) return 'Support & Helpdesk';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'User Profile';
    return 'System Overview';
  };

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-content">
        <TopBar
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          title={getPageTitle(location.pathname)}
          isAdminMode={false}
        />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>
          <Outlet />
        </main>
      </div>
      <VerifyAssistChatbot />
    </div>
  );
}

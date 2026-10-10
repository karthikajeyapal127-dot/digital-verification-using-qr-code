import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/common/AdminSidebar';
import TopBar from '../components/common/TopBar';
import VerifyAssistChatbot from '../components/common/VerifyAssistChatbot';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getAdminPageTitle = (path) => {
    if (path.includes('/admin/users')) return 'User & Authority Directory';
    if (path.includes('/admin/documents')) return 'Digital ID Approvals & Management';
    if (path.includes('/admin/verification')) return 'Global Verification Activity';
    if (path.includes('/admin/analytics')) return 'Security Analytics & Trends';
    if (path.includes('/admin/security')) return 'Audit Trail & PKI Security';
    if (path.includes('/admin/settings')) return 'Enterprise System Settings';
    return 'Admin System Overview';
  };

  return (
    <div className="app-container">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-content">
        <TopBar
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          title={getAdminPageTitle(location.pathname)}
          isAdminMode={true}
        />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>
          <Outlet />
        </main>
      </div>
      <VerifyAssistChatbot />
    </div>
  );
}

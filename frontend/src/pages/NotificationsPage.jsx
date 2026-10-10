import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, AlertTriangle, ShieldCheck, Clock, Mail, Send, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import NotificationCard from '../components/common/NotificationCard';
import EmailNotificationModal from '../components/common/EmailNotificationModal';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useVerification } from '../context/VerificationContext';
import { isDocMatchUser, getDigitalIdString } from '../utils/formatters';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { documents } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'emails' | 'verification' | 'security'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const userEmail = user?.email || '';
  const userDoc = documents.find((d) => isDocMatchUser(d, user)) || documents[0] || null;
  const userDvid = userDoc ? (getDigitalIdString(userDoc)) : 'DID-2026-CSE-9901';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifsRes, emailsRes] = await Promise.all([
        notificationApi.get(user?.id),
        notificationApi.getEmails(userEmail)
      ]);

      if (notifsRes && notifsRes.success && Array.isArray(notifsRes.data)) {
        setNotifications(notifsRes.data);
      }
      if (emailsRes && emailsRes.success && Array.isArray(emailsRes.data)) {
        setEmails(emailsRes.data);
      }
    } catch (e) {
      console.warn('Failed to load notifications or emails:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, userEmail]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast(
      language === 'ta'
        ? `✓ ஐடி நகலெடுக்கப்பட்டது: ${id}`
        : language === 'hi'
          ? `✓ आईडी कॉपी की गई: ${id}`
          : `✓ Copied Verification ID: ${id}`,
      'success'
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmailNotification = async () => {
    setSendingEmail(true);
    try {
      const res = await notificationApi.sendEmail({
        to: userEmail,
        recipientName: user?.name || 'User',
        digitalId: userDvid,
        docName: userDoc?.name || 'Digital Identity Document'
      });
      setSendingEmail(false);
      addToast(
        language === 'ta'
          ? `✓ மின்னஞ்சல் அனுப்பப்பட்டது: ${userEmail} முகவரிக்கு உங்கள் ID அனுப்பப்பட்டது!`
          : language === 'hi'
            ? `✓ ईमेल भेजा गया: ${userEmail} पर आपकी सत्यापन आईडी भेज दी गई है!`
            : `✓ Email sent: Verification ID notification dispatched to ${userEmail}!`,
        'success'
      );
      if (res && res.data) {
        setEmails((prev) => [res.data, ...prev]);
        setSelectedEmail(res.data);
        setShowEmailModal(true);
      }
    } catch (e) {
      setSendingEmail(false);
      addToast('Error sending email: ' + e.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'info');
    } catch (e) {
      addToast('Error marking notifications', 'error');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id || n.notificationId === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      // Non-fatal
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'security') return item.type === 'security' || item.type === 'revocation';
    if (activeFilter === 'verification') return item.type === 'verification';
    return true;
  });

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
            <Bell size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Alerts & Email Dispatch
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            {t('notifications')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {language === 'ta'
              ? 'சரிபார்ப்பு அறிவிப்புகள் மற்றும் மின்னஞ்சல் வழியாக அனுப்பப்பட்ட டிஜிட்டல் ஐடி விபரங்கள்.'
              : language === 'hi'
                ? 'सत्यापन सूचनाएं और ईमेल द्वारा भेजे गए डिजिटल आईडी विवरण।'
                : 'Real-time verification events, credential lifecycle updates, and official email notifications.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={handleSendEmailNotification}
            loading={sendingEmail}
            icon={Send}
            size="sm"
          >
            {language === 'ta' ? 'எனது ID-ஐ மின்னஞ்சலுக்கு அனுப்பு' : language === 'hi' ? 'मेरी आईडी ईमेल पर भेजें' : 'Send ID to My Email'}
          </Button>

          <Button variant="secondary" onClick={handleMarkAllRead} icon={CheckCheck} size="sm">
            {t('markAllRead')}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="vg-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: language === 'ta' ? 'அனைத்து எச்சரிக்கைகள்' : language === 'hi' ? 'सभी सूचनाएं' : 'All Alerts', count: notifications.length },
          { key: 'emails', label: language === 'ta' ? '✉️ இமெயில் அறிவிப்புகள் (Emails)' : language === 'hi' ? '✉️ ईमेल सूचनाएं (Emails)' : '✉️ Official Emails', count: emails.length },
          { key: 'unread', label: language === 'ta' ? 'படிக்காதவை' : language === 'hi' ? 'अपठित' : 'Unread Only', count: notifications.filter((n) => !n.isRead).length },
          { key: 'verification', label: language === 'ta' ? 'சரிபார்ப்புகள்' : language === 'hi' ? 'सत्यापन' : 'Verifications' },
          { key: 'security', label: language === 'ta' ? 'பாதுகாப்பு' : language === 'hi' ? 'सुरक्षा' : 'Security & Risk' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`btn btn-sm ${activeFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                backgroundColor: activeFilter === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--bg-subtle)',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* EMAIL NOTIFICATIONS INBOX VIEW */}
      {activeFilter === 'emails' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {emails.length === 0 ? (
            <div className="vg-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                No email notifications yet
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Click "Send ID to My Email" above to receive an official digital credentials email.
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id || email.emailId}
                className="vg-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: '5px solid var(--primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {email.subject}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        From: {email.from} · To: {email.to}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    {new Date(email.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {email.content}
                </p>

                {/* Prominent Verification ID Bar */}
                <div style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                      Verification ID:
                    </span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-main)' }}>
                      {getDigitalIdString(email.digitalId) || email.uniqueId}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyId(getDigitalIdString(email.digitalId) || email.uniqueId)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      {copiedId === (getDigitalIdString(email.digitalId) || email.uniqueId) ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copiedId === (getDigitalIdString(email.digitalId) || email.uniqueId) ? 'Copied!' : 'Copy ID'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSelectedEmail(email); setShowEmailModal(true); }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>{language === 'ta' ? 'முழு மின்னஞ்சலைக் காண்க' : 'View Full Email'}</span>
                    </button>

                    <Link to="/verify">
                      <button
                        type="button"
                        className="btn btn-subtle btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <QrCode size={13} color="var(--primary)" />
                        <span>Verify In Scanner</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* STANDARD NOTIFICATIONS LIST */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifications.length === 0 ? (
            <div className="vg-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {notifications.length === 0 ? 'No data available yet.' : 'No matching notifications found'}
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                {notifications.length === 0 ? 'Notifications will be generated in real-time when digital IDs are created, verified, or expired.' : 'No notifications matched your active filter.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id || notif.notificationId}
                onClick={() => handleMarkSingleRead(notif.id || notif.notificationId)}
                style={{
                  backgroundColor: notif.isRead ? 'var(--bg-card)' : 'var(--primary-subtle)',
                  border: notif.isRead ? '1px solid var(--border-color)' : '1px solid var(--primary-border)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.75rem',
                  backgroundColor: notif.type === 'verification' ? '#ecfdf5' : notif.type === 'security' || notif.type === 'revocation' ? '#fef2f2' : 'var(--bg-subtle)',
                  color: notif.type === 'verification' ? '#10b981' : notif.type === 'security' || notif.type === 'revocation' ? '#ef4444' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {notif.type === 'verification' ? (
                    <ShieldCheck size={22} />
                  ) : notif.type === 'security' || notif.type === 'revocation' ? (
                    <AlertTriangle size={22} />
                  ) : notif.type === 'approval' ? (
                    <Mail size={22} />
                  ) : (
                    <Bell size={22} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {notif.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {new Date(notif.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '0.35rem',
                        color: 'var(--text-muted)'
                      }}>
                        {notif.type}
                      </span>
                      {!notif.isRead && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>
                          • Unread
                        </span>
                      )}
                    </div>

                    {/* DIRECT COPY DVID BADGE IF PRESENT */}
                    {notif.relatedId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(notif.relatedId);
                        }}
                        style={{
                          backgroundColor: copiedId === notif.relatedId ? '#10b981' : 'var(--bg-subtle)',
                          color: copiedId === notif.relatedId ? '#ffffff' : 'var(--primary)',
                          border: '1px solid var(--border-color)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {copiedId === notif.relatedId ? <Check size={12} /> : <Copy size={12} />}
                        <span>Copy ID: {notif.relatedId}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Email Notification Modal */}
      <EmailNotificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailData={selectedEmail}
        onUseId={(id) => {
          handleCopyId(id);
        }}
      />
    </div>
  );
}

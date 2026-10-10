import { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Search, Filter, Download, CheckCircle2 } from 'lucide-react';
import ActivityTable from '../components/dashboard/ActivityTable';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import { useVerification } from '../context/VerificationContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminVerificationPage() {
  const { activities, stats, refreshData } = useVerification();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVerifications = activities.filter((a) => (a.createdAt && a.createdAt.startsWith(todayStr)) || a.date === todayStr).length;
  const anomaliesCount = activities.filter((a) => a.outcome === 'REVOKED' || a.outcome === 'INVALID' || a.status === 'Revoked' || a.status === 'Invalid').length;
  const validCount = activities.filter((a) => a.outcome === 'VALID' || a.status === 'Verified').length;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {language === 'ta' ? 'உலகளாவிய சரிபார்ப்பு பதிவு' : language === 'hi' ? 'वैश्विक सत्यापन गतिविधि' : 'Global Verification Activity'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {language === 'ta'
              ? 'மையப்படுத்தப்பட்ட தரவுத்தளத்தில் இருந்து நேரடி சரிபார்ப்பு தகவல்கள்.'
              : language === 'hi'
                ? 'केंद्रीकृत डेटाबेस से वास्तविक समय सत्यापन लॉग।'
                : 'Live cryptographic query feeds and audit telemetry from the central MongoDB database.'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            refreshData();
            addToast('Verification telemetry refreshed.', 'info');
          }}
          icon={Activity}
        >
          {language === 'ta' ? 'புதுப்பி' : language === 'hi' ? 'रीफ़्रेश' : 'Refresh Telemetry'}
        </Button>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Today's Verifications"
          value={todayVerifications.toString()}
          change={todayVerifications > 0 ? "Actual queries today" : "0 today"}
          changeType="positive"
          icon={Activity}
          color="blue"
          subtitle="Real queries recorded today"
        />
        <StatCard
          title="Authentic Passed"
          value={validCount.toString()}
          change={`${activities.length > 0 ? ((validCount / activities.length) * 100).toFixed(0) : 0}% authentic`}
          changeType="positive"
          icon={CheckCircle2}
          color="emerald"
          subtitle="Cryptographically verified"
        />
        <StatCard
          title="Anomalies Flagged"
          value={anomaliesCount.toString()}
          change={anomaliesCount > 0 ? "Tampered / Revoked" : "0 alerts"}
          changeType={anomaliesCount > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="rose"
          subtitle="Rejected or revoked attempts"
        />
      </div>

      <ActivityTable activities={activities} title="Live Global Verification Log" pageSize={8} />
    </div>
  );
}

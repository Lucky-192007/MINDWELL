import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  'Unlimited journals',
  'Advanced analytics',
  'Export data (PDF/JSON)',
  'Priority support',
  'Ad-free experience',
];

const PremiumPage = () => {
  const [billing, setBilling] = useState('monthly');
  const { user } = useAuth();

  return (
    <AppLayout title="Premium" subtitle="Unlock your best self with MindWell Premium.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['monthly', 'yearly'].map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            style={{
              padding: '8px 20px',
              borderRadius: 16,
              border: 'none',
              background: billing === b ? 'var(--accent)' : 'var(--bg-elevated)',
              color: billing === b ? 'white' : 'var(--text-secondary)',
              fontSize: 14,
              textTransform: 'capitalize',
            }}
          >
            {b} {b === 'yearly' && '(Save 20%)'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 680 }}>
        <div className="card" style={{ padding: 28, border: '1.5px solid var(--accent)' }}>
          <span style={{ fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 10 }}>Most Popular</span>
          <h2 style={{ margin: '12px 0 0' }}>Premium</h2>
          <p style={{ margin: '4px 0 20px' }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>₹{billing === 'monthly' ? '199' : '1,910'}</span>
            <span style={{ color: 'var(--text-secondary)' }}> /{billing === 'monthly' ? 'month' : 'year'}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {FEATURES.map((f) => (
              <span key={f} style={{ fontSize: 14 }}>✓ {f}</span>
            ))}
          </div>
          <button
            style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontSize: 15 }}
            disabled={user?.isPremium}
          >
            {user?.isPremium ? 'Already Premium ✓' : 'Upgrade Now'}
          </button>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ margin: '0 0 0' }}>Basic</h2>
          <p style={{ margin: '4px 0 20px' }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>₹0</span>
            <span style={{ color: 'var(--text-secondary)' }}> /month</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            <span>✓ Daily journaling</span>
            <span>✓ Basic mood tracking</span>
            <span>✓ Breathing exercises</span>
            <span>✓ Last 30 days history</span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 24, maxWidth: 500 }}>
        Payment integration isn't wired up in this build — this screen is the pricing UI only.
        To actually flip a real account to premium, update the <code>isPremium</code> flag on the user in MongoDB.
      </p>
    </AppLayout>
  );
};

export default PremiumPage;

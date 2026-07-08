const StatCard = ({ icon, label, value, sublabel, accent }) => (
  <div className="card" style={{ padding: 20, flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{label}</p>
        <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          {value}
        </p>
        {sublabel && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>{sublabel}</p>}
      </div>
      <span
        style={{
          fontSize: 20,
          width: 40,
          height: 40,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: accent || 'var(--accent-soft)',
        }}
      >
        {icon}
      </span>
    </div>
  </div>
);

export default StatCard;

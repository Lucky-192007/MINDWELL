import { useState, useEffect } from 'react';

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BreathingClock = ({ technique, active, onActivate }) => {
  const phases = technique.phases;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);

  // Stop and reset whenever this card stops being the active one
  useEffect(() => {
    if (!active) {
      setPhaseIndex(0);
      setSecondsLeft(phases[0].duration);
    }
  }, [active, phases]);

  useEffect(() => {
    if (!active) return;
    if (secondsLeft <= 0) {
      const next = (phaseIndex + 1) % phases.length;
      if (next === 0) setCycles((c) => c + 1);
      setPhaseIndex(next);
      setSecondsLeft(phases[next].duration);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, active, phaseIndex, phases]);

  const current = phases[phaseIndex];
  const progress = active ? (current.duration - secondsLeft) / current.duration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div>
        <h4 style={{ margin: 0, textAlign: 'center' }}>{technique.name}</h4>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 200 }}>
          {technique.description}
        </p>
      </div>

      <div style={{ position: 'relative', width: 170, height: 170 }}>
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle cx="85" cy="85" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="12" />
          <circle
            cx="85" cy="85" r={RADIUS} fill="none"
            stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 85 85)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{active ? current.label : 'Ready?'}</span>
          <span style={{ fontSize: 24, fontWeight: 600 }}>0:{String(secondsLeft).padStart(2, '0')}</span>
        </div>
      </div>

      <button
        onClick={onActivate}
        style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--accent)', color: 'white', border: 'none', fontSize: 16 }}
      >
        {active ? '❙❙' : '▶'}
      </button>

      <div style={{ display: 'flex', gap: 10, fontSize: 11.5, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {phases.map((p, i) => (
          <span key={i} style={{ fontWeight: active && phaseIndex === i ? 700 : 400, color: active && phaseIndex === i ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {p.label}
          </span>
        ))}
      </div>

      {cycles > 0 && <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)' }}>🌿 {cycles} cycle{cycles > 1 ? 's' : ''}</p>}
    </div>
  );
};

export default BreathingClock;

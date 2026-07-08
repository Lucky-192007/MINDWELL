import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';

const TECHNIQUES = [
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'Calms the nervous system and helps with falling asleep.',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by athletes and first responders to stay steady under pressure.',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'A steady 5-5 rhythm that balances heart rate and mood.',
    phases: [
      { label: 'Inhale', duration: 5 },
      { label: 'Exhale', duration: 5 },
    ],
  },
  {
    id: 'calm',
    name: 'Deep Calm',
    description: 'A longer exhale to activate the body\'s relaxation response.',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 2 },
      { label: 'Exhale', duration: 6 },
    ],
  },
];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BreathingPage = () => {
  const [techniqueId, setTechniqueId] = useState(TECHNIQUES[0].id);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const technique = TECHNIQUES.find((t) => t.id === techniqueId);
  const phases = technique.phases;
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      const next = (phaseIndex + 1) % phases.length;
      if (next === 0) setCyclesCompleted((c) => c + 1);
      setPhaseIndex(next);
      setSecondsLeft(phases[next].duration);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, running, phaseIndex, phases]);

  const current = phases[phaseIndex];
  const progress = running ? (current.duration - secondsLeft) / current.duration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const toggle = () => {
    if (!running) { setPhaseIndex(0); setSecondsLeft(phases[0].duration); }
    setRunning(!running);
  };

  const switchTechnique = (id) => {
    setRunning(false);
    setTechniqueId(id);
    setPhaseIndex(0);
    setCyclesCompleted(0);
    const t = TECHNIQUES.find((t) => t.id === id);
    setSecondsLeft(t.phases[0].duration);
  };

  return (
    <AppLayout title="Breathing Exercise" subtitle="Relax your mind and body.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TECHNIQUES.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTechnique(t.id)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 12,
                border: t.id === techniqueId ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: t.id === techniqueId ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14.5, color: t.id === techniqueId ? 'var(--accent)' : 'var(--text-primary)' }}>{t.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>{t.description}</p>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>{technique.name}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{technique.description}</p>
          </div>

          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="14" />
              <circle
                cx="110" cy="110" r={RADIUS} fill="none"
                stroke="var(--accent)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 500 }}>{running ? current.label : 'Ready?'}</span>
              <span style={{ fontSize: 30, fontWeight: 600 }}>0:{String(secondsLeft).padStart(2, '0')}</span>
            </div>
          </div>

          <button
            onClick={toggle}
            style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: 'white', border: 'none', fontSize: 20 }}
          >
            {running ? '❙❙' : '▶'}
          </button>

          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            {phases.map((p, i) => (
              <span key={i} style={{ fontWeight: running && phaseIndex === i ? 700 : 400, color: running && phaseIndex === i ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {p.label}
              </span>
            ))}
          </div>

          {cyclesCompleted > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              🌿 {cyclesCompleted} cycle{cyclesCompleted > 1 ? 's' : ''} completed
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BreathingPage;

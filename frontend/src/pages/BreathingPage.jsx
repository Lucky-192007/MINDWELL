import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import BreathingClock from '../components/BreathingClock';

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
    description: "A longer exhale to activate the body's relaxation response.",
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 2 },
      { label: 'Exhale', duration: 6 },
    ],
  },
];

const BreathingPage = () => {
  const [activeId, setActiveId] = useState(null);

  return (
    <AppLayout title="Breathing Exercise" subtitle="Pick a rhythm and follow the circle.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {TECHNIQUES.map((t) => (
          <BreathingClock
            key={t.id}
            technique={t}
            active={activeId === t.id}
            onActivate={() => setActiveId(activeId === t.id ? null : t.id)}
          />
        ))}
      </div>
    </AppLayout>
  );
};

export default BreathingPage;

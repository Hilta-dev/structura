import { useEffect } from 'react';
import { usePlaygroundStore } from '../store/usePlaygroundStore';

const SPEED_OPTIONS = [0.5, 1, 2, 4];

const btn: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          28,
  height:         28,
  border:         '1px solid var(--border)',
  borderRadius:   'var(--r-sm)',
  background:     'var(--surface-2)',
  color:          'var(--text)',
  fontSize:       12,
  cursor:         'pointer',
  flexShrink:     0,
  transition:     'background 0.1s',
};

export default function Timeline() {
  const steps       = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);
  const isPlaying   = usePlaygroundStore((s) => s.isPlaying);
  const speed       = usePlaygroundStore((s) => s.speed);
  const next        = usePlaygroundStore((s) => s.next);
  const prev        = usePlaygroundStore((s) => s.prev);
  const goTo        = usePlaygroundStore((s) => s.goTo);
  const play        = usePlaygroundStore((s) => s.play);
  const pause       = usePlaygroundStore((s) => s.pause);
  const setSpeed    = usePlaygroundStore((s) => s.setSpeed);

  const total = steps.length;
  const atEnd = total === 0 || currentStep >= total - 1;

  useEffect(() => {
    if (!isPlaying) return;
    const ms = 1000 / speed;
    const id = setInterval(() => next(), ms);
    return () => clearInterval(id);
  }, [isPlaying, speed, next]);

  const disabled = (cond: boolean): React.CSSProperties =>
    cond ? { opacity: 0.3, cursor: 'default' } : {};

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Label */}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', flexShrink: 0 }}>
        Time Machine
      </span>

      {/* Prev */}
      <button
        onClick={prev}
        disabled={total === 0 || currentStep === 0}
        style={{ ...btn, ...disabled(total === 0 || currentStep === 0) }}
        title="Previous step"
      >
        ◀
      </button>

      {/* Play / Pause */}
      <button
        onClick={isPlaying ? pause : play}
        disabled={total === 0 || atEnd}
        style={{ ...btn, ...disabled(total === 0 || atEnd), background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--accent-text)' }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Next */}
      <button
        onClick={next}
        disabled={total === 0 || atEnd}
        style={{ ...btn, ...disabled(total === 0 || atEnd) }}
        title="Next step"
      >
        ▶|
      </button>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={currentStep}
        onChange={(e) => goTo(Number(e.target.value))}
        disabled={total === 0}
        style={{ flex: 1, accentColor: 'var(--accent)', cursor: total === 0 ? 'default' : 'pointer' }}
      />

      {/* Step counter */}
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, minWidth: 72, textAlign: 'right' }}>
        {total === 0 ? 'No steps' : `${currentStep + 1} / ${total}`}
      </span>

      {/* Speed */}
      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        style={{
          background:   'var(--surface-2)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          color:        'var(--text)',
          fontSize:     11,
          padding:      '3px 6px',
          cursor:       'pointer',
        }}
      >
        {SPEED_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}×</option>
        ))}
      </select>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useLinkedListStore } from '../store/useLinkedListStore';
import { insertHeadTutor } from '../lessons/insertHeadTutor';

type StructureId = 'linkedlist' | 'stack' | 'queue';
type Props = { structureId: StructureId; label: string };

// ── Shared micro-styles ───────────────────────────────────────────────────
const panelHeader: React.CSSProperties = {
  padding:       '10px 14px 8px',
  borderBottom:  '1px solid var(--border)',
  fontSize:      10,
  fontWeight:    700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color:         'var(--text-dim)',
  flexShrink:    0,
};

const sectionLabel: React.CSSProperties = {
  fontSize:      10,
  fontWeight:    700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color:         'var(--text-dim)',
};

const card: React.CSSProperties = {
  background:    'var(--surface-2)',
  border:        '1px solid var(--border)',
  borderRadius:  'var(--r-md)',
  padding:       '12px 14px',
};

const primaryBtn: React.CSSProperties = {
  display:       'block',
  width:         '100%',
  background:    'var(--accent)',
  border:        '1px solid var(--accent)',
  borderRadius:  'var(--r-sm)',
  color:         'var(--accent-text)',
  fontSize:      12,
  fontWeight:    600,
  padding:       '7px 12px',
  cursor:        'pointer',
  textAlign:     'center',
};

const ghostBtn: React.CSSProperties = {
  display:       'block',
  width:         '100%',
  background:    'transparent',
  border:        '1px solid var(--border)',
  borderRadius:  'var(--r-sm)',
  color:         'var(--text-muted)',
  fontSize:      12,
  padding:       '7px 12px',
  cursor:        'pointer',
  textAlign:     'center',
};

const backBtn: React.CSSProperties = {
  display:       'inline-flex',
  alignItems:    'center',
  gap:           4,
  background:    'transparent',
  border:        'none',
  color:         'var(--text-muted)',
  fontSize:      11,
  cursor:        'pointer',
  padding:       0,
};

const disabledCard: React.CSSProperties = {
  background:    'var(--surface-2)',
  border:        '1px dashed var(--border)',
  borderRadius:  'var(--r-md)',
  padding:       '12px 14px',
  opacity:       0.45,
};

// ── Linked-list tutor panel ───────────────────────────────────────────────
const STEP_NAMES = ['Ready', 'Allocate', 'Link next', 'Move head'];

type CardMode = 'insight' | 'explain' | 'hint';

function LLTutorPanel() {
  const walkSteps = useLinkedListStore((s) => s.walkSteps);
  const walkIndex = useLinkedListStore((s) => s.walkIndex);

  const [mode, setMode] = useState<CardMode>('insight');

  // Reset to insight whenever the step changes
  useEffect(() => { setMode('insight'); }, [walkIndex]);

  const active  = walkSteps.length > 0;
  const stepNum = active ? walkIndex + 1 : 1;
  const stepName = active ? (STEP_NAMES[walkIndex] ?? '') : STEP_NAMES[0];
  const entry   = insertHeadTutor[active ? walkIndex : 0];

  // Card header label & body text depending on mode
  const cardChip = mode === 'insight'
    ? `CONTEXT  /  LIST · STEP ${stepNum}`
    : mode === 'explain'
    ? `EXPLAINED  /  STEP ${stepNum}`
    : `HINT  /  STEP ${stepNum}`;

  const cardBody = mode === 'insight'
    ? entry.insight
    : mode === 'explain'
    ? entry.explain
    : entry.hint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Panel header */}
      <div style={panelHeader}>03 / Your learning partner</div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            Make it click.
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Small hints. Real understanding.
          </span>
        </div>

        {/* Context chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            ...sectionLabel,
            background:    'var(--surface-2)',
            border:        '1px solid var(--border)',
            borderRadius:  'var(--r-sm)',
            padding:       '2px 8px',
            whiteSpace:    'nowrap',
          }}>
            {cardChip}
          </span>
          {mode !== 'insight' && (
            <button style={backBtn} onClick={() => setMode('insight')}>
              ← Back to current step
            </button>
          )}
        </div>

        {/* Step label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Step insight
          </span>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Step name badge */}
            <span style={{
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'var(--accent)',
            }}>
              {stepName}
            </span>
            {/* Card body */}
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>
              {cardBody}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={primaryBtn} onClick={() => setMode('explain')}>
            Explain this step
          </button>
          <button style={ghostBtn} onClick={() => setMode('hint')}>
            Give me a hint
          </button>
        </div>

        {/* Predict card — always disabled */}
        <div style={disabledCard}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Ready to predict the next step?
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
            Test your intuition →
          </p>
        </div>

        {/* Footer */}
        <span style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', marginTop: 'auto', paddingTop: 4 }}>
          Scripted tutor preview · Not live AI
        </span>

      </div>
    </div>
  );
}

// ── Generic placeholder ────────────────────────────────────────────────────
function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={panelHeader}>03 / Your Learning Partner</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-dim)' }}>
          ✦
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Context cards, hints, and step insights will appear here.
        </span>
        <div style={{ marginTop: 8, padding: '6px 14px', background: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--accent-text)' }}>
          Coming soon
        </div>
      </div>
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────
export default function RightPanel({ structureId, label }: Props) {
  if (structureId === 'linkedlist') return <LLTutorPanel />;
  return <PlaceholderPanel label={label} />;
}

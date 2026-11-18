import { useEffect, useRef, useState } from 'react';
import { useLinkedListStore } from '../store/useLinkedListStore';
import { insertHeadTutor } from '../lessons/insertHeadTutor';
import type { TutorRequest } from '../../api/tutor';

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
type AiSource = 'ai' | 'scripted' | 'offline';

type AiSlot = {
  loading: boolean;
  text:    string;       // what to show in the card
  source:  AiSource;
};

const IDLE_SLOT: AiSlot = { loading: false, text: '', source: 'scripted' };

function LLTutorPanel() {
  const walkSteps = useLinkedListStore((s) => s.walkSteps);
  const walkIndex = useLinkedListStore((s) => s.walkIndex);

  const [mode, setMode]       = useState<CardMode>('insight');
  const [explainSlot, setExplainSlot] = useState<AiSlot>(IDLE_SLOT);
  const [hintSlot,    setHintSlot]    = useState<AiSlot>(IDLE_SLOT);

  // Reset everything when the step changes (Next / Back / Replay)
  useEffect(() => {
    setMode('insight');
    setExplainSlot(IDLE_SLOT);
    setHintSlot(IDLE_SLOT);
  }, [walkIndex]);

  // Abort controller ref so we can cancel an in-flight request
  const abortRef = useRef<AbortController | null>(null);

  const active   = walkSteps.length > 0;
  const stepIdx  = active ? walkIndex : 0;
  const stepNum  = stepIdx + 1;
  const stepName = STEP_NAMES[stepIdx] ?? '';
  const entry    = insertHeadTutor[stepIdx];

  // Derive list values and new value from the walk steps
  const listValues: number[] = (() => {
    if (!active || walkSteps.length === 0) return [];
    // step 0 view is the original list; collect node data values in head order
    const step0View = walkSteps[0].view;
    if (step0View.kind !== 'linkedList') return [];
    const nodes = step0View.nodes;
    const result: number[] = [];
    let cur = step0View.head;
    while (cur !== null) {
      const node = nodes.find((n) => n.id === cur!);
      if (!node) break;
      result.push(node.data);
      cur = node.next;
    }
    return result;
  })();

  const newValue: number = (() => {
    if (!active || walkSteps.length < 2) return 0;
    const step1View = walkSteps[1].view;
    if (step1View.kind !== 'linkedList') return 0;
    // new node is in step1 but not step0
    const step0Ids = new Set(
      walkSteps[0].view.kind === 'linkedList'
        ? walkSteps[0].view.nodes.map((n) => n.id)
        : [],
    );
    const newNode = step1View.nodes.find((n) => !step0Ids.has(n.id));
    return newNode?.data ?? 0;
  })();

  // ── AI fetch ─────────────────────────────────────────────────────────────
  async function fetchAI(reqMode: 'explain' | 'hint') {
    const setSlot = reqMode === 'explain' ? setExplainSlot : setHintSlot;
    const fallback = reqMode === 'explain' ? entry.explain : entry.hint;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Client-side 8s timeout
    const timer = setTimeout(() => controller.abort(), 8_000);

    setSlot({ loading: true, text: '', source: 'scripted' });

    const currentStep = active ? walkSteps[stepIdx] : null;
    const payload: TutorRequest = {
      mode:            reqMode,
      stepIndex:       stepIdx,
      stepName,
      listValues,
      newValue,
      codeLine:        currentStep?.codeLine ?? 1,
      stepExplanation: (currentStep?.explanation ?? '').slice(0, 300),
    };

    try {
      const res = await fetch('/api/tutor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { text?: string; error?: string };
      if (data.error || !data.text) throw new Error(data.error ?? 'empty');

      setSlot({ loading: false, text: data.text, source: 'ai' });
    } catch {
      clearTimeout(timer);
      setSlot({ loading: false, text: fallback, source: 'offline' });
    }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const slot: AiSlot = mode === 'explain' ? explainSlot
                     : mode === 'hint'    ? hintSlot
                     : IDLE_SLOT;

  const cardChip = mode === 'insight'
    ? `CONTEXT  /  LIST · STEP ${stepNum}`
    : mode === 'explain'
    ? `EXPLAINED  /  STEP ${stepNum}`
    : `HINT  /  STEP ${stepNum}`;

  // For insight: always scripted. For explain/hint: ai text, or scripted/offline fallback.
  let cardBody: string;
  if (mode === 'insight') {
    cardBody = entry.insight;
  } else if (slot.loading) {
    cardBody = '';   // show spinner instead
  } else if (slot.text) {
    cardBody = slot.text;
  } else {
    cardBody = mode === 'explain' ? entry.explain : entry.hint;
  }

  // Footer: show AI credit only if the visible mode's slot came from AI
  const footerText = slot.source === 'ai' && mode !== 'insight'
    ? 'Live AI tutor · Muse Spark'
    : slot.source === 'offline' && mode !== 'insight'
    ? 'Offline tutor'
    : 'Scripted tutor preview · Not live AI';

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* Context chip + back link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            ...sectionLabel,
            background:   'var(--surface-2)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding:      '2px 8px',
            whiteSpace:   'nowrap',
          }}>
            {cardChip}
          </span>
          {mode !== 'insight' && (
            <button style={backBtn} onClick={() => setMode('insight')}>
              ← Back to current step
            </button>
          )}
        </div>

        {/* Step insight card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Step insight
          </span>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              {stepName}
            </span>
            {slot.loading ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.65, fontStyle: 'italic' }}>
                Thinking…
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                {cardBody}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={{ ...primaryBtn, opacity: slot.loading ? 0.6 : 1, cursor: slot.loading ? 'default' : 'pointer' }}
            disabled={slot.loading}
            onClick={() => { setMode('explain'); fetchAI('explain'); }}
          >
            Explain this step
          </button>
          <button
            style={{ ...ghostBtn, opacity: slot.loading ? 0.6 : 1, cursor: slot.loading ? 'default' : 'pointer' }}
            disabled={slot.loading}
            onClick={() => { setMode('hint'); fetchAI('hint'); }}
          >
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
          {footerText}
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

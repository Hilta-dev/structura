import { useEffect, useRef, useState } from 'react';
import { useLinkedListStore } from '../store/useLinkedListStore';

// ── Demo preset: 12 → 27 → 36 ────────────────────────────────────────────
const DEMO_VALUES = [12, 27, 36];
const DEFAULT_VAL = 42;

// ── Step chip labels ──────────────────────────────────────────────────────
const STEP_LABELS = ['Ready', 'Allocate', 'Link next', 'Move head'];

// ── Style constants ───────────────────────────────────────────────────────
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' };

const dimLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--text-dim)', flexShrink: 0,
};

const inputSt: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', color: 'var(--text)',
  fontSize: 12, padding: '4px 8px', outline: 'none', width: 64,
};

const primaryBtn: React.CSSProperties = {
  background: 'var(--accent)', border: '1px solid var(--accent)',
  borderRadius: 'var(--r-sm)', color: 'var(--accent-text)',
  fontSize: 12, fontWeight: 600, padding: '4px 12px',
  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
};

const ghostBtn: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', color: 'var(--text-muted)',
  fontSize: 12, padding: '4px 10px',
  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
};

const divider: React.CSSProperties = {
  width: 1, height: 20, background: 'var(--border)', flexShrink: 0,
};

function stepBadge(active: boolean): React.CSSProperties {
  return {
    fontSize: 11, fontWeight: active ? 700 : 400,
    padding: '2px 10px', borderRadius: 'var(--r-sm)',
    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    cursor: 'pointer', whiteSpace: 'nowrap',
  };
}

// ── Component ─────────────────────────────────────────────────────────────
export default function InsertHeadWalkthrough() {
  const [inputVal, setInputVal] = useState(String(DEFAULT_VAL));

  const store       = useLinkedListStore();
  const walkSteps   = useLinkedListStore((s) => s.walkSteps);
  const walkIndex   = useLinkedListStore((s) => s.walkIndex);
  const walkPlaying = useLinkedListStore((s) => s.walkPlaying);

  const active  = walkSteps.length > 0;
  const total   = walkSteps.length;
  const atEnd   = active && walkIndex >= total - 1;
  const atStart = !active || walkIndex === 0;

  const counters = active ? (walkSteps[walkIndex]?.counters ?? { visited: 0, changes: 0 }) : { visited: 0, changes: 0 };

  // Load demo on first mount
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    loadDemo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance when playing
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!walkPlaying) return;
    intervalRef.current = setInterval(() => store.walkNext(), 900);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [walkPlaying, store]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function loadDemo() {
    store.clear();
    for (const v of DEMO_VALUES) store.doInsertAtEnd(v);
  }

  function resetExample() {
    loadDemo();
    setInputVal(String(DEFAULT_VAL));
  }

  function runInsertion() {
    const n = parseInt(inputVal, 10);
    if (isNaN(n)) return;
    store.startInsertHeadWalkthrough(n);
  }

  function handlePlay() {
    if (atEnd) {
      store.walkGoTo(0);
      // slight delay so the UI updates to step 0 before playing starts
      setTimeout(() => store.walkToggle(), 50);
    } else {
      store.walkToggle();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Row 1: input + action buttons + complexity */}
      <div style={row}>
        <span style={dimLabel}>Try an operation</span>

        <input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runInsertion()}
          style={inputSt}
        />

        <button onClick={runInsertion} style={primaryBtn}>
          + Insert {inputVal || '…'} at head
        </button>

        <button onClick={resetExample} style={ghostBtn}>
          ↺ Reset example
        </button>

        <span style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', flexShrink: 0 }}>
          <span>TIME&nbsp;&nbsp;O(1)</span>
          <span>SPACE&nbsp;&nbsp;O(1)</span>
        </span>
      </div>

      {/* Row 2: time machine */}
      <div style={{ ...row, gap: 6 }}>

        {/* Step chips — always shown once a walkthrough has been started */}
        {active && STEP_LABELS.map((lbl, i) => (
          <button key={lbl} onClick={() => store.walkGoTo(i)} style={stepBadge(i === walkIndex)}>
            {lbl}
          </button>
        ))}

        {active && <span style={divider} />}

        {/* Transport */}
        {!active && (
          <span style={{ ...dimLabel, fontStyle: 'italic' }}>
            Insert a value to begin walkthrough.
          </span>
        )}

        {active && (
          <>
            {atStart
              ? <span style={{ ...ghostBtn, opacity: 0.35, cursor: 'default' }}>At start</span>
              : <button onClick={() => store.walkBack()} style={ghostBtn}>← Back</button>
            }

            <button onClick={handlePlay} style={primaryBtn}>
              {walkPlaying ? '⏸ Pause' : atEnd ? '↺ Replay' : '▶ Play'}
            </button>

            <button
              onClick={() => store.walkNext()}
              disabled={atEnd}
              style={{ ...ghostBtn, opacity: atEnd ? 0.35 : 1, cursor: atEnd ? 'default' : 'pointer' }}
            >
              Next →
            </button>

            <span style={divider} />

            <span style={{ ...dimLabel, whiteSpace: 'nowrap' }}>
              Step {walkIndex + 1} / {total}
            </span>

            <span style={divider} />

            {/* Counters — increased readability */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                Nodes visited
              </span>
              <strong style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{counters.visited}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                Pointer changes
              </span>
              <strong style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{counters.changes}</strong>
            </div>
          </>
        )}

        {/* Colour legend */}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#c2b2fd', display: 'inline-block' }} />
            new node
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#5a6b48', display: 'inline-block' }} />
            existing
          </span>
        </span>
      </div>
    </div>
  );
}

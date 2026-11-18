//caption part — StepCaption component shown at the bottom of the 3D scene area

import { useEffect, useRef, useState } from 'react';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { useLinkedListStore } from '../store/useLinkedListStore';
import {
  inferOperationName,
  stackChips,
  queueChips,
  linkedListChips,
} from './stepCaptionUtils';
import type { Chip } from './stepCaptionUtils';

type Structure = 'linkedlist' | 'stack' | 'queue';

type Props = { structure: Structure };

// ── Animated text hook ──────────────────────────────────────────────────────
// Returns the opacity to apply; triggers a 150 ms fade when `key` changes.
function useFadeKey(key: string): number {
  const [opacity, setOpacity] = useState(1);
  const prevKey = useRef(key);

  useEffect(() => {
    if (key === prevKey.current) return;
    prevKey.current = key;

    // respect prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    setOpacity(0);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpacity(1));
    });
    return () => cancelAnimationFrame(id);
  }, [key]);

  return opacity;
}

// ── Chip element ────────────────────────────────────────────────────────────
function ChipEl({ chip, error }: { chip: Chip; error: boolean }) {
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          4,
        background:   'rgba(255,255,255,0.05)',
        border:       error ? '1px solid var(--error)' : '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        padding:      '2px 8px',
        fontSize:     11,
        fontFamily:   'var(--font-mono)',
        whiteSpace:   'nowrap',
      }}
    >
      <span style={{ color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {chip.label}
      </span>
      <span style={{ color: error ? 'var(--error)' : 'var(--accent)', fontWeight: 700 }}>
        {chip.value}
      </span>
    </span>
  );
}

// ── Stack / Queue caption (uses usePlaygroundStore) ─────────────────────────
function PlaygroundCaption({ structure }: { structure: 'stack' | 'queue' }) {
  const steps       = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);
  const pseudocode  = usePlaygroundStore((s) => s.pseudocode);

  const total = steps.length;
  const step  = total > 0 ? steps[currentStep] : null;

  const explanation  = step?.explanation  ?? '';
  const errorMsg     = step?.error        ?? null;
  const isError      = errorMsg !== null;
  const displayText  = errorMsg ?? explanation;

  const operationName = inferOperationName(pseudocode, structure === 'stack' ? 'Stack' : 'Queue');

  const chips: Chip[] = step
    ? (structure === 'stack' ? stackChips(step) : queueChips(step))
    : [];

  const fadeKey = `${currentStep}:${displayText}`;
  const opacity = useFadeKey(fadeKey);

  if (total === 0) return null;

  return (
    <CaptionCard
      stepNum={currentStep + 1}
      total={total}
      operationName={operationName}
      displayText={displayText}
      isError={isError}
      chips={chips}
      opacity={opacity}
    />
  );
}

// ── Linked-list caption (uses useLinkedListStore) ───────────────────────────
function LinkedListCaption() {
  const walkSteps = useLinkedListStore((s) => s.walkSteps);
  const walkIndex = useLinkedListStore((s) => s.walkIndex);
  const pseudocode = useLinkedListStore((s) => s.pseudocode);

  const total = walkSteps.length;
  const step  = total > 0 ? walkSteps[walkIndex] : null;

  const explanation  = step?.explanation  ?? '';
  const errorMsg     = step?.error        ?? null;
  const isError      = errorMsg !== null;
  const displayText  = errorMsg ?? explanation;

  const operationName = pseudocode.length > 0
    ? inferOperationName(pseudocode, 'Insert at Head')
    : 'Insert at Head';

  const chips: Chip[] = step ? linkedListChips(step) : [];

  const fadeKey = `${walkIndex}:${displayText}`;
  const opacity = useFadeKey(fadeKey);

  if (total === 0) return null;

  return (
    <CaptionCard
      stepNum={walkIndex + 1}
      total={total}
      operationName={operationName}
      displayText={displayText}
      isError={isError}
      chips={chips}
      opacity={opacity}
    />
  );
}

// ── Shared card UI ──────────────────────────────────────────────────────────
type CardProps = {
  stepNum:       number;
  total:         number;
  operationName: string;
  displayText:   string;
  isError:       boolean;
  chips:         Chip[];
  opacity:       number;
};

function CaptionCard({
  stepNum,
  total,
  operationName,
  displayText,
  isError,
  chips,
  opacity,
}: CardProps) {
  const accentColor = isError ? 'var(--error)' : 'var(--accent)';
  const borderColor = isError ? 'var(--error)'  : 'var(--border)';

  return (
    <div
      //caption part — card container
      style={{
        margin:        '0 12px 10px',
        background:    'var(--surface-1)',
        border:        `1px solid ${borderColor}`,
        borderRadius:  'var(--r-md)',
        padding:       '12px 16px',
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
        transition:    'opacity 0.15s ease',
        opacity,
      }}
    >
      {/* Top row: step badge + operation name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          //caption part — step badge
          style={{
            fontSize:     11,
            fontWeight:   700,
            letterSpacing:'0.07em',
            textTransform:'uppercase',
            color:        accentColor,
            background:   isError ? 'var(--error-dim)' : 'var(--accent-dim)',
            border:       `1px solid ${accentColor}`,
            borderRadius: 'var(--r-sm)',
            padding:      '1px 7px',
            whiteSpace:   'nowrap',
          }}
        >
          Step {stepNum} / {total}
        </span>
        <span
          //caption part — operation name
          style={{
            fontSize:   12,
            fontWeight: 600,
            color:      'var(--text-muted)',
            letterSpacing: '0.03em',
          }}
        >
          {operationName}
        </span>
      </div>

      {/* Main explanation text */}
      <p
        //caption part — explanation text
        style={{
          margin:     0,
          fontSize:   19,
          fontWeight: 600,
          lineHeight: 1.45,
          color:      isError ? 'var(--error)' : 'var(--text)',
        }}
      >
        {displayText}
      </p>

      {/* State chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {chips.map((c) => (
            <ChipEl key={c.label} chip={c} error={isError} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root export ─────────────────────────────────────────────────────────────
export default function StepCaption({ structure }: Props) {
  if (structure === 'linkedlist') return <LinkedListCaption />;
  return <PlaygroundCaption structure={structure} />;
}

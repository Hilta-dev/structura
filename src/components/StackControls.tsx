import { useState } from 'react';
import { push, pop, peek } from '../engine/stack';
import type { StackItem } from '../engine/stack';
import type { StackView } from '../engine/types';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { pushPseudocode, popPseudocode, peekPseudocode } from '../lessons/stackPseudocode';

const EXAMPLE_VALUES = [5, 2, 3, 9, 8];
const SIZE_OPTIONS   = Array.from({ length: 10 }, (_, i) => i + 3);

const inputStyle: React.CSSProperties = {
  background:   'var(--surface-2)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color:        'var(--text)',
  fontSize:     12,
  padding:      '4px 8px',
  outline:      'none',
};

const primaryBtn: React.CSSProperties = {
  background:   'var(--accent)',
  border:       '1px solid var(--accent)',
  borderRadius: 'var(--r-sm)',
  color:        'var(--accent-text)',
  fontSize:     12,
  fontWeight:   600,
  padding:      '4px 12px',
  cursor:       'pointer',
  flexShrink:   0,
};

const ghostBtn: React.CSSProperties = {
  background:   'var(--surface-2)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color:        'var(--text-muted)',
  fontSize:     12,
  padding:      '4px 10px',
  cursor:       'pointer',
  flexShrink:   0,
};

export default function StackControls() {
  const [items, setItems]           = useState<StackItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  const capacity  = usePlaygroundStore((s) => s.capacity);
  const loadSteps = usePlaygroundStore((s) => s.loadSteps);
  const play      = usePlaygroundStore((s) => s.play);
  const setCapacity = usePlaygroundStore((s) => s.setCapacity);

  function commitOperation(steps: ReturnType<typeof push>, pseudocode: readonly string[]) {
    loadSteps(steps, pseudocode);
    play();
    const last = steps[steps.length - 1];
    if (!last.error) setItems((last.view as StackView).items);
  }

  function pushValues(values: number[], cap: number, startItems: StackItem[]): ReturnType<typeof push> {
    let current = startItems;
    let allSteps: ReturnType<typeof push> = [];
    for (const val of values) {
      const result = push(current, cap, val);
      allSteps = [...allSteps, ...result];
      const last = result[result.length - 1];
      if (last.error) break;
      current = (last.view as StackView).items;
    }
    return allSteps;
  }

  function handlePush() {
    const values = inputValue.split(/[\s,]+/).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
    if (values.length === 0) return;
    const allSteps = pushValues(values, capacity, items);
    loadSteps(allSteps, pushPseudocode);
    play();
    const finalLast = allSteps[allSteps.length - 1];
    if (!finalLast.error) setItems((finalLast.view as StackView).items);
    setInputValue('');
  }

  function handlePop()  { commitOperation(pop(items, capacity),  popPseudocode);  }
  function handlePeek() { commitOperation(peek(items, capacity), peekPseudocode); }
  function handleClear() { setItems([]); loadSteps([], []); }

  function handleExample() {
    const allSteps = pushValues(EXAMPLE_VALUES, capacity, []);
    loadSteps(allSteps, pushPseudocode);
    play();
    const finalLast = allSteps[allSteps.length - 1];
    if (!finalLast.error) setItems((finalLast.view as StackView).items);
  }

  function handleSizeChange(newCap: number) {
    setItems([]);
    setCapacity(newCap);
    loadSteps([], []);
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {/* Section label */}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: 4 }}>
        Try an operation
      </span>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handlePush()}
        placeholder="value(s)"
        style={{ ...inputStyle, width: 100 }}
      />

      <button onClick={handlePush}    style={primaryBtn}>Push</button>
      <button onClick={handlePop}     style={ghostBtn}>Pop</button>
      <button onClick={handlePeek}    style={ghostBtn}>Peek</button>
      <button onClick={handleExample} style={ghostBtn}>Example</button>
      <button onClick={handleClear}   style={{ ...ghostBtn, color: 'var(--text-dim)' }}>Clear</button>

      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
        Size
        <select
          value={capacity}
          onChange={(e) => handleSizeChange(Number(e.target.value))}
          style={inputStyle}
        >
          {SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      {items.length === 0 && (
        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          Type a number and press Push.
        </span>
      )}

      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
        {items.length} / {capacity}
      </span>
    </div>
  );
}

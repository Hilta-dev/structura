import { useState } from 'react';
import { enqueue, dequeue, peek, isEmpty } from '../engine/queue';
import type { QueueItem } from '../engine/queue';
import type { QueueView } from '../engine/types';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import {
  enqueuePseudocode,
  dequeuePseudocode,
  peekPseudocode,
  isEmptyPseudocode,
} from '../lessons/queuePseudocode';

const EXAMPLE_VALUES = [4, 7, 2, 9, 1];
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

export default function QueueControls() {
  const [items, setItems]           = useState<QueueItem[]>([]);
  const [front, setFront]           = useState(0);
  const [rear,  setRear]            = useState(-1);
  const [inputValue, setInputValue] = useState('');

  const capacity    = usePlaygroundStore((s) => s.capacity);
  const loadSteps   = usePlaygroundStore((s) => s.loadSteps);
  const play        = usePlaygroundStore((s) => s.play);
  const setCapacity = usePlaygroundStore((s) => s.setCapacity);

  function commitOp(steps: ReturnType<typeof enqueue>, pseudocode: readonly string[]) {
    loadSteps(steps, pseudocode);
    play();
    const last = steps[steps.length - 1];
    if (!last.error) {
      const v = last.view as QueueView;
      setItems(v.items);
      setFront(v.front);
      setRear(v.rear);
    }
  }

  function handleEnqueue() {
    const values = inputValue.split(/[\s,]+/).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
    if (values.length === 0) return;
    // chain multiple enqueues into one step sequence
    let curItems = items;
    let curFront = front;
    let curRear  = rear;
    let allSteps: ReturnType<typeof enqueue> = [];
    for (const val of values) {
      const result = enqueue(curItems, curFront, curRear, capacity, val);
      allSteps = [...allSteps, ...result];
      const last = result[result.length - 1];
      if (last.error) break;
      const v = last.view as QueueView;
      curItems = v.items;
      curFront = v.front;
      curRear  = v.rear;
    }
    loadSteps(allSteps, enqueuePseudocode);
    play();
    const finalLast = allSteps[allSteps.length - 1];
    if (!finalLast.error) {
      const v = finalLast.view as QueueView;
      setItems(v.items);
      setFront(v.front);
      setRear(v.rear);
    }
    setInputValue('');
  }

  function handleDequeue() { commitOp(dequeue(items, front, rear, capacity), dequeuePseudocode); }
  function handlePeek()    { commitOp(peek(items, front, rear, capacity),    peekPseudocode);    }
  function handleIsEmpty() { commitOp(isEmpty(items, front, rear, capacity), isEmptyPseudocode); }

  function handleExample() {
    let curItems: QueueItem[] = [];
    let curFront = 0;
    let curRear  = -1;
    let allSteps: ReturnType<typeof enqueue> = [];
    for (const val of EXAMPLE_VALUES) {
      const result = enqueue(curItems, curFront, curRear, capacity, val);
      allSteps = [...allSteps, ...result];
      const last = result[result.length - 1];
      if (last.error) break;
      const v = last.view as QueueView;
      curItems = v.items;
      curFront = v.front;
      curRear  = v.rear;
    }
    loadSteps(allSteps, enqueuePseudocode);
    play();
    const finalLast = allSteps[allSteps.length - 1];
    if (!finalLast.error) {
      const v = finalLast.view as QueueView;
      setItems(v.items);
      setFront(v.front);
      setRear(v.rear);
    }
  }

  function handleClear() {
    setItems([]);
    setFront(0);
    setRear(-1);
    loadSteps([], []);
  }

  function handleSizeChange(newCap: number) {
    setItems([]);
    setFront(0);
    setRear(-1);
    setCapacity(newCap);
    loadSteps([], []);
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: 4 }}>
        Try an operation
      </span>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
        placeholder="value(s)"
        style={{ ...inputStyle, width: 100 }}
      />

      <button onClick={handleEnqueue}  style={primaryBtn}>Enqueue</button>
      <button onClick={handleDequeue}  style={ghostBtn}>Dequeue</button>
      <button onClick={handlePeek}     style={ghostBtn}>Peek</button>
      <button onClick={handleIsEmpty}  style={ghostBtn}>isEmpty</button>
      <button onClick={handleExample}  style={ghostBtn}>Example</button>
      <button onClick={handleClear}    style={{ ...ghostBtn, color: 'var(--text-dim)' }}>Clear</button>

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
          Type a number and press Enqueue.
        </span>
      )}

      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
        {items.length} / {capacity}
      </span>
    </div>
  );
}

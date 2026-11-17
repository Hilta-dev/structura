import { useState } from 'react';
import { useLinkedListStore, getAddress, getAddressMap } from '../store/useLinkedListStore';

const SIZE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 3);

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
  padding:      '4px 10px',
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

const dangerBtn: React.CSSProperties = {
  background:   'var(--surface-2)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color:        'var(--chip-red-text)',
  fontSize:     12,
  padding:      '4px 10px',
  cursor:       'pointer',
  flexShrink:   0,
};

export default function LinkedListControls() {
  const [valueInput, setValueInput] = useState('');
  const [posInput,   setPosInput]   = useState('');

  const store          = useLinkedListStore();
  const listState      = useLinkedListStore((s) => s.listState);
  const capacity       = useLinkedListStore((s) => s.capacity);
  const message        = useLinkedListStore((s) => s.message);
  const traverseResult = useLinkedListStore((s) => s.traverseResult);
  const findResult     = useLinkedListStore((s) => s.findResult);

  let length = 0;
  let cur = listState.head;
  while (cur !== null) {
    const node = listState.nodes.find((n) => n.id === cur!);
    if (!node) break;
    length++;
    cur = node.next;
  }

  function parseValues(): number[] {
    return valueInput.split(/[\s,]+/).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
  }
  function parseSingle(): number | null {
    const n = parseInt(valueInput, 10);
    return isNaN(n) ? null : n;
  }
  function parsePos(): number | null {
    const n = parseInt(posInput, 10);
    return isNaN(n) ? null : n;
  }

  function handleInsertBeginning() {
    const values = parseValues();
    if (values.length === 0) return;
    for (const v of values) store.doInsertAtBeginning(v);
    setValueInput('');
  }
  function handleInsertEnd() {
    const values = parseValues();
    if (values.length === 0) return;
    for (const v of values) store.doInsertAtEnd(v);
    setValueInput('');
  }
  function handleInsertAfter() {
    const pos = parsePos();
    const val = parseSingle();
    if (pos === null || val === null) return;
    store.doInsertAfterPosition(pos, val);
    setValueInput('');
  }
  function handleDeleteAtPos() {
    const pos = parsePos();
    if (pos === null) return;
    store.doDeleteAtPosition(pos);
  }
  function handleFind() {
    const val = parseSingle();
    if (val === null) return;
    store.doFind(val);
  }

  const isError = message && (message.includes('empty') || message.includes('full') || message.includes('Invalid'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        {/* Label */}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: 4 }}>
          Try an operation
        </span>

        <input
          type="text"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInsertEnd()}
          placeholder="value(s)"
          style={{ ...inputStyle, width: 90 }}
        />
        <input
          type="number"
          value={posInput}
          onChange={(e) => setPosInput(e.target.value)}
          placeholder="pos"
          style={{ ...inputStyle, width: 56 }}
        />

        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insert:</span>
        <button onClick={handleInsertBeginning} style={primaryBtn}>↑ Beginning</button>
        <button onClick={handleInsertEnd}       style={primaryBtn}>↓ End</button>
        <button onClick={handleInsertAfter}     style={ghostBtn}>After pos</button>

        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delete:</span>
        <button onClick={() => store.doDeleteAtBeginning()} style={dangerBtn}>↑ Beginning</button>
        <button onClick={() => store.doDeleteAtEnd()}       style={dangerBtn}>↓ End</button>
        <button onClick={handleDeleteAtPos}                 style={dangerBtn}>At pos</button>

        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Explore:</span>
        <button onClick={() => store.doTraverse()} style={ghostBtn}>Traverse</button>
        <button onClick={handleFind}               style={ghostBtn}>Find</button>

        <button onClick={() => store.example()} style={ghostBtn}>Example</button>
        <button onClick={() => store.clear()}   style={{ ...ghostBtn, color: 'var(--text-dim)' }}>Clear</button>

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
          Size
          <select value={capacity} onChange={(e) => store.setCapacity(Number(e.target.value))} style={inputStyle}>
            {SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
          {length} / {capacity}
          {listState.head !== null && (
            <span style={{ marginLeft: 8 }}>head = {getAddressMap().get(listState.head) ?? getAddress(listState.head)}</span>
          )}
          {listState.head === null && <span style={{ marginLeft: 8 }}>head = NULL</span>}
        </span>
      </div>

      {/* Feedback line */}
      {(message || traverseResult || findResult) && (
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          {message && (
            <span style={{ color: isError ? 'var(--chip-red-text)' : 'var(--text-muted)' }}>{message}</span>
          )}
          {traverseResult && (
            <span style={{ color: 'var(--accent)' }}>Traverse: {traverseResult}</span>
          )}
          {findResult && (
            <span style={{ color: findResult.includes('Found') ? 'var(--accent)' : 'var(--text-muted)' }}>{findResult}</span>
          )}
        </div>
      )}
    </div>
  );
}

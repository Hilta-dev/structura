import { useState } from 'react';
import { push, pop, peek } from '../engine/stack';
import type { StackItem } from '../engine/stack';
import type { StackView } from '../engine/types';
import { usePlaygroundStore } from '../store/usePlaygroundStore';

const CAPACITY = 8;

export default function StackControls() {
  const [items, setItems] = useState<StackItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const loadSteps = usePlaygroundStore((s) => s.loadSteps);

  function commitOperation(steps: ReturnType<typeof push>) {
    loadSteps(steps);
    const last = steps[steps.length - 1];
    // only update items when the operation succeeded (no error)
    if (!last.error) {
      setItems((last.view as StackView).items);
    }
  }

  function handlePush() {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    commitOperation(push(items, CAPACITY, val));
    setInputValue('');
  }

  function handlePop() {
    commitOperation(pop(items, CAPACITY));
  }

  function handlePeek() {
    commitOperation(peek(items, CAPACITY));
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handlePush()}
        placeholder="value"
        className="w-24 rounded bg-gray-700 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handlePush}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 active:bg-blue-700"
      >
        Push
      </button>
      <button
        onClick={handlePop}
        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 active:bg-red-700"
      >
        Pop
      </button>
      <button
        onClick={handlePeek}
        className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-500 active:bg-yellow-700"
      >
        Peek
      </button>
      <span className="ml-auto text-xs text-gray-400">
        {items.length} / {CAPACITY}
      </span>
    </div>
  );
}

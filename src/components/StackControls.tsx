import { useState } from 'react';
import { push, pop, peek } from '../engine/stack';
import type { StackItem } from '../engine/stack';
import type { StackView } from '../engine/types';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { pushPseudocode, popPseudocode, peekPseudocode } from '../lessons/stackPseudocode';

const EXAMPLE_VALUES = [5, 2, 3, 9, 8];
const SIZE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 3); // 3–12

export default function StackControls() {
  const [items, setItems] = useState<StackItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const capacity = usePlaygroundStore((s) => s.capacity);
  const loadSteps = usePlaygroundStore((s) => s.loadSteps);
  const play = usePlaygroundStore((s) => s.play);
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
    const values = inputValue
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n));
    if (values.length === 0) return;
    const allSteps = pushValues(values, capacity, items);
    loadSteps(allSteps, pushPseudocode);
    play();
    const finalLast = allSteps[allSteps.length - 1];
    if (!finalLast.error) setItems((finalLast.view as StackView).items);
    setInputValue('');
  }

  function handlePop() {
    commitOperation(pop(items, capacity), popPseudocode);
  }

  function handlePeek() {
    commitOperation(peek(items, capacity), peekPseudocode);
  }

  function handleClear() {
    setItems([]);
    loadSteps([], []);
  }

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
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handlePush()}
        placeholder="e.g. 5 2 3 9"
        className="w-36 rounded bg-gray-700 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <button
        onClick={handleExample}
        className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-500 active:bg-purple-700"
      >
        Example
      </button>
      <button
        onClick={handleClear}
        className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-500 active:bg-gray-700"
      >
        Clear
      </button>

      <label className="flex items-center gap-1.5 text-xs text-gray-300 ml-2">
        Size
        <select
          value={capacity}
          onChange={(e) => handleSizeChange(Number(e.target.value))}
          className="rounded bg-gray-700 px-2 py-1 text-white text-sm focus:outline-none"
        >
          {SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      {items.length === 0 && (
        <span className="text-xs text-gray-500 italic">
          Type a number and press Push to begin.
        </span>
      )}
      <span className="ml-auto text-xs text-gray-400">
        {items.length} / {capacity}
      </span>
    </div>
  );
}

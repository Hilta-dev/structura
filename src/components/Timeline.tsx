import { useEffect } from 'react';
import { usePlaygroundStore } from '../store/usePlaygroundStore';

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export default function Timeline() {
  const steps = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);
  const isPlaying = usePlaygroundStore((s) => s.isPlaying);
  const speed = usePlaygroundStore((s) => s.speed);
  const next = usePlaygroundStore((s) => s.next);
  const prev = usePlaygroundStore((s) => s.prev);
  const goTo = usePlaygroundStore((s) => s.goTo);
  const play = usePlaygroundStore((s) => s.play);
  const pause = usePlaygroundStore((s) => s.pause);
  const setSpeed = usePlaygroundStore((s) => s.setSpeed);

  const total = steps.length;
  const atEnd = total === 0 || currentStep >= total - 1;

  // advance one step per interval when playing
  useEffect(() => {
    if (!isPlaying) return;
    const ms = 1000 / speed;
    const id = setInterval(() => next(), ms);
    return () => clearInterval(id);
  }, [isPlaying, speed, next]);

  return (
    <div className="flex items-center gap-3 text-white text-sm">
      <button
        onClick={prev}
        disabled={total === 0 || currentStep === 0}
        className="rounded bg-gray-600 px-3 py-1 hover:bg-gray-500 disabled:opacity-40"
      >
        ◀
      </button>

      <button
        onClick={isPlaying ? pause : play}
        disabled={total === 0 || atEnd}
        className="rounded bg-gray-600 px-3 py-1 hover:bg-gray-500 disabled:opacity-40"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <button
        onClick={next}
        disabled={total === 0 || atEnd}
        className="rounded bg-gray-600 px-3 py-1 hover:bg-gray-500 disabled:opacity-40"
      >
        ▶|
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={currentStep}
        onChange={(e) => goTo(Number(e.target.value))}
        disabled={total === 0}
        className="flex-1 accent-blue-500"
      />

      <span className="w-24 text-right text-gray-300">
        {total === 0 ? 'No steps' : `Step ${currentStep + 1} of ${total}`}
      </span>

      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="rounded bg-gray-700 px-2 py-1 text-sm focus:outline-none"
      >
        {SPEED_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>
    </div>
  );
}

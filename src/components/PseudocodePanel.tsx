import { usePlaygroundStore } from '../store/usePlaygroundStore';

export default function PseudocodePanel() {
  const pseudocode = usePlaygroundStore((s) => s.pseudocode);
  const steps = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);

  const activeLine = steps[currentStep]?.codeLine ?? -1;
  const explanation = steps[currentStep]?.explanation ?? '';

  if (pseudocode.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 w-72 rounded-lg bg-gray-800/90 backdrop-blur p-4 text-sm text-gray-200 flex flex-col gap-3">
      <ol className="font-mono text-xs leading-6 list-none space-y-0.5">
        {pseudocode.map((line, i) => {
          const lineNumber = i + 1; // pseudocode is 1-based
          const isActive = lineNumber === activeLine;
          return (
            <li
              key={i}
              className={`flex gap-2 rounded px-1 ${isActive ? 'bg-yellow-500/20 text-yellow-300 font-semibold' : 'text-gray-400'}`}
            >
              <span className="w-5 text-right shrink-0 select-none opacity-50">{lineNumber}</span>
              <span>{line}</span>
            </li>
          );
        })}
      </ol>

      {explanation && (
        <p className="text-xs text-gray-300 border-t border-gray-700 pt-2 leading-5">
          {explanation}
        </p>
      )}
    </div>
  );
}

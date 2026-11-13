import { useState } from 'react';

export default function HowToPlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 flex items-center justify-center"
        aria-label="How to play"
      >
        ?
      </button>

      {open && (
        <div className="absolute top-14 right-4 w-80 rounded-lg bg-gray-800/95 backdrop-blur p-4 text-sm text-gray-200 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">How to use Structura</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white leading-none text-lg"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <ul className="space-y-2 text-gray-300 text-xs leading-5 list-disc list-inside">
            <li>Type one or more numbers (e.g. 5 2 3 9) and press Push.</li>
            <li>Press Play or Next to watch each step.</li>
            <li>The highlighted line shows which pseudocode line is running.</li>
            <li>Pop removes the top item. Peek looks at it without removing.</li>
          </ul>

          <div>
            <p className="text-xs font-semibold text-white mb-2">Key terms</p>
            <dl className="space-y-1.5 text-xs text-gray-300">
              <div><dt className="inline font-medium text-gray-100">Stack</dt><dd className="inline"> — a collection where you can only add or remove from one end (the top).</dd></div>
              <div><dt className="inline font-medium text-gray-100">LIFO</dt><dd className="inline"> — Last In, First Out. The last item you pushed is the first one popped.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Top</dt><dd className="inline"> — the index of the highest occupied slot in the stack.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Push</dt><dd className="inline"> — add a new item onto the top of the stack.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Pop</dt><dd className="inline"> — remove and return the item at the top.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Peek</dt><dd className="inline"> — look at the top item without removing it.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Overflow</dt><dd className="inline"> — trying to push when the stack is already full.</dd></div>
              <div><dt className="inline font-medium text-gray-100">Underflow</dt><dd className="inline"> — trying to pop or peek when the stack is empty.</dd></div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}

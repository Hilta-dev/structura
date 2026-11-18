import type { Step, QueueView } from './types';

export type QueueItem = { id: string; value: number };

// helpers

let _nextId = 0;
/** Reset the internal id counter – call only from tests. */
export function _resetId(): void {
  _nextId = 0;
}

function newId(): string {
  return String(++_nextId);
}

function view(
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
): QueueView {
  return { kind: 'queue', items, front, rear, capacity };
}

function step(
  id: number,
  codeLine: number,
  explanation: string,
  highlights: string[],
  counters: { visited: number; changes: number },
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
  error?: string,
): Step {
  return {
    id,
    codeLine,
    explanation,
    highlights,
    counters,
    ...(error !== undefined ? { error } : {}),
    view: view(items, front, rear, capacity),
  };
}

/**
 * Add `value` to the rear of the queue.
 * codeLine numbers reference enqueuePseudocode in src/lessons/queuePseudocode.ts.
 */
export function enqueue(
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
  value: number,
): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter enqueue
  steps.push(
    step(id++, 1, `Call enqueue with data = ${value}.`, ['rear'], { visited: 0, changes: 0 }, items, front, rear, capacity),
  );

  // line 2 – check if rear == size - 1 (queue full)
  steps.push(
    step(id++, 2, `Check: rear (${rear}) == size - 1 (${capacity - 1})?`, ['rear'], { visited: 1, changes: 0 }, items, front, rear, capacity),
  );

  if (items.length >= capacity) {
    // line 3 – display "Queue is full!"
    steps.push(
      step(id++, 3, 'Queue is full!', ['rear'], { visited: 1, changes: 0 }, items, front, rear, capacity, 'queue overflow'),
    );
    return steps;
  }

  // line 5 – rear++
  const newRear = rear + 1;
  steps.push(
    step(id++, 5, `rear++ → rear is now ${newRear}.`, ['rear'], { visited: 1, changes: 0 }, items, front, newRear, capacity),
  );

  // line 6 – queue[rear] = data; build new items array (no mutation)
  const newItems: QueueItem[] = [...items, { id: newId(), value }];
  steps.push(
    step(id++, 6, `queue[rear] = ${value}. Element inserted at rear.`, ['rear'], { visited: 1, changes: 1 }, newItems, front, newRear, capacity),
  );

  // line 8 – end of enqueue
  steps.push(
    step(id++, 8, `enqueue complete. Queue now has ${newItems.length} item(s). Front = ${front}, Rear = ${newRear}.`, [], { visited: 1, changes: 1 }, newItems, front, newRear, capacity),
  );

  return steps;
}

/**
 * Remove and return the front item of the queue as a series of Steps.
 * codeLine numbers reference dequeuePseudocode in src/lessons/queuePseudocode.ts.
 */
export function dequeue(
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter dequeue
  steps.push(
    step(id++, 1, 'Call dequeue.', ['front'], { visited: 0, changes: 0 }, items, front, rear, capacity),
  );

  // line 2 – check if front > rear (queue empty)
  steps.push(
    step(id++, 2, `Check: front (${front}) > rear (${rear})?`, ['front'], { visited: 1, changes: 0 }, items, front, rear, capacity),
  );

  if (items.length === 0) {
    // line 3 – display "Queue is empty!"
    steps.push(
      step(id++, 3, 'Queue is empty!', ['front'], { visited: 1, changes: 0 }, items, front, rear, capacity, 'queue underflow'),
    );
    return steps;
  }

  const frontItem = items[0];

  // line 5 – dequeuedElement = queue[front]
  steps.push(
    step(id++, 5, `dequeuedElement = queue[front] = ${frontItem.value}.`, ['front'], { visited: 2, changes: 0 }, items, front, rear, capacity),
  );

  // line 6 – front++; build new items array (no mutation)
  const newFront = front + 1;
  const newItems: QueueItem[] = items.slice(1);
  steps.push(
    step(id++, 6, `front++ → front is now ${newFront}. Element removed from front.`, ['front'], { visited: 2, changes: 1 }, newItems, newFront, rear, capacity),
  );

  // line 7 – display dequeued element
  steps.push(
    step(id++, 7, `The dequeued element is: ${frontItem.value}. Queue now has ${newItems.length} item(s).`, [], { visited: 2, changes: 1 }, newItems, newFront, rear, capacity),
  );

  return steps;
}

/**
 * Inspect the front item without removing it.
 * codeLine numbers reference peekPseudocode in src/lessons/queuePseudocode.ts.
 */
export function peek(
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter peek
  steps.push(
    step(id++, 1, 'Call peek.', ['front'], { visited: 0, changes: 0 }, items, front, rear, capacity),
  );

  // line 2 – check if front > rear (queue empty)
  steps.push(
    step(id++, 2, `Check: front (${front}) > rear (${rear})?`, ['front'], { visited: 1, changes: 0 }, items, front, rear, capacity),
  );

  if (items.length === 0) {
    // line 3 – display "Queue is empty!"
    steps.push(
      step(id++, 3, 'Queue is empty!', ['front'], { visited: 1, changes: 0 }, items, front, rear, capacity, 'queue underflow'),
    );
    return steps;
  }

  const frontItem = items[0];

  // line 5 – display front element (no change to items)
  steps.push(
    step(id++, 5, `Front element is: queue[front] = ${frontItem.value}.`, ['front'], { visited: 1, changes: 0 }, items, front, rear, capacity),
  );

  return steps;
}

/**
 * Check whether the queue is empty.
 * codeLine numbers reference isEmptyPseudocode in src/lessons/queuePseudocode.ts.
 */
export function isEmpty(
  items: QueueItem[],
  front: number,
  rear: number,
  capacity: number,
): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter procedure
  steps.push(
    step(id++, 1, 'Call IS_EMPTY.', ['front', 'rear'], { visited: 0, changes: 0 }, items, front, rear, capacity),
  );

  const empty = items.length === 0;

  // line 2 – evaluate and return
  steps.push(
    step(id++, 2, `Queue size is ${items.length}. IS_EMPTY returns ${empty}.`, ['front', 'rear'], { visited: 1, changes: 0 }, items, front, rear, capacity),
  );

  return steps;
}

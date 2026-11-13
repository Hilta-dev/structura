import type { Step, StackView } from './types';

export type StackItem = { id: string; value: number };

// helpers

let _nextId = 0;
/** Reset the internal id counter – call only from tests. */
export function _resetId(): void {
  _nextId = 0;
}

function newId(): string {
  return String(++_nextId);
}

function view(items: StackItem[], capacity: number): StackView {
  return { kind: 'stack', items, capacity };
}

function step(
  id: number,
  codeLine: number,
  explanation: string,
  highlights: string[],
  counters: { visited: number; changes: number },
  items: StackItem[],
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
    view: view(items, capacity),
  };
}

/**
 * Push `value` onto the stack.
 * codeLine numbers reference pushPseudocode in src/lessons/stackPseudocode.ts.
 */
export function push(
  items: StackItem[],
  capacity: number,
  value: number,
): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter procedure
  steps.push(
    step(id++, 1, `Call PUSH with value ${value}.`, ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check overflow
  steps.push(
    step(id++, 2, `Check if stack is full (size ${items.length} of ${capacity}).`, ['top', 'capacity'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length >= capacity) {
    // line 3 – overflow error
    steps.push(
      step(id++, 3, `Stack is full. Cannot push ${value}.`, ['top', 'capacity'], { visited: 1, changes: 0 }, items, capacity, 'stack overflow'),
    );
    return steps;
  }

  // line 5 – increment top
  steps.push(
    step(id++, 5, `Increment top pointer from ${items.length} to ${items.length + 1}.`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  // line 6 – write value; build new items array (no mutation)
  const newItems: StackItem[] = [...items, { id: newId(), value }];
  steps.push(
    step(id++, 6, `Write ${value} at the new top position.`, ['top'], { visited: 1, changes: 1 }, newItems, capacity),
  );

  // line 7 – done
  steps.push(
    step(id++, 7, `PUSH complete. Stack now has ${newItems.length} item(s).`, [], { visited: 1, changes: 1 }, newItems, capacity),
  );

  return steps;
}

/**
 * Remove and return the top item of the stack as a series of Steps.
 * codeLine numbers reference popPseudocode in src/lessons/stackPseudocode.ts.
 */
export function pop(items: StackItem[], capacity: number): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter procedure
  steps.push(
    step(id++, 1, 'Call POP.', ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check underflow
  steps.push(
    step(id++, 2, `Check if stack is empty (size ${items.length}).`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length === 0) {
    // line 3 – underflow error
    steps.push(
      step(id++, 3, 'Stack is empty. Cannot pop.', ['top'], { visited: 1, changes: 0 }, items, capacity, 'stack underflow'),
    );
    return steps;
  }

  const topItem = items[items.length - 1];

  // line 5 – read value
  steps.push(
    step(id++, 5, `Read value ${topItem.value} from the top.`, ['top'], { visited: 2, changes: 0 }, items, capacity),
  );

  // line 6 – decrement top; build new items array (no mutation)
  const newItems: StackItem[] = items.slice(0, -1);
  steps.push(
    step(id++, 6, `Decrement top pointer from ${items.length} to ${newItems.length}.`, ['top'], { visited: 2, changes: 1 }, newItems, capacity),
  );

  // line 7 – return
  steps.push(
    step(id++, 7, `POP complete. Removed ${topItem.value}. Stack now has ${newItems.length} item(s).`, [], { visited: 2, changes: 1 }, newItems, capacity),
  );

  return steps;
}

/**
 * Inspect the top item without removing it.
 * codeLine numbers reference peekPseudocode in src/lessons/stackPseudocode.ts.
 */
export function peek(items: StackItem[], capacity: number): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter procedure
  steps.push(
    step(id++, 1, 'Call PEEK.', ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check underflow
  steps.push(
    step(id++, 2, `Check if stack is empty (size ${items.length}).`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length === 0) {
    // line 3 – underflow error
    steps.push(
      step(id++, 3, 'Stack is empty. Nothing to peek.', ['top'], { visited: 1, changes: 0 }, items, capacity, 'stack underflow'),
    );
    return steps;
  }

  const topItem = items[items.length - 1];

  // line 5 – return value (no change to items)
  steps.push(
    step(id++, 5, `Top value is ${topItem.value}. Stack is unchanged.`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  return steps;
}

/**
 * Check whether the stack is empty.
 * codeLine numbers reference isEmptyPseudocode in src/lessons/stackPseudocode.ts.
 */
export function isEmpty(items: StackItem[], capacity: number): Step[] {
  const steps: Step[] = [];
  let id = 0;

  // line 1 – enter procedure
  steps.push(
    step(id++, 1, 'Call IS_EMPTY.', ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  const empty = items.length === 0;

  // line 2 – evaluate and return
  steps.push(
    step(id++, 2, `Stack size is ${items.length}. IS_EMPTY returns ${empty}.`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  return steps;
}

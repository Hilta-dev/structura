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

  // line 1 – enter push
  steps.push(
    step(id++, 1, `Call push with data = ${value}.`, ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check if top == size - 1 (stack full)
  const top = items.length - 1;
  steps.push(
    step(id++, 2, `Check: top (${top}) == size - 1 (${capacity - 1})?`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length >= capacity) {
    // line 3 – display "Stack is full!"
    steps.push(
      step(id++, 3, 'Stack is full!', ['top'], { visited: 1, changes: 0 }, items, capacity, 'stack overflow'),
    );
    return steps;
  }

  // line 5 – top++
  steps.push(
    step(id++, 5, `top++ → top is now ${items.length}.`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  // line 6 – stack[top] = data; build new items array (no mutation)
  const newItems: StackItem[] = [...items, { id: newId(), value }];
  steps.push(
    step(id++, 6, `stack[top] = ${value}. Element inserted at top.`, ['top'], { visited: 1, changes: 1 }, newItems, capacity),
  );

  // line 8 – end of push
  steps.push(
    step(id++, 8, `push complete. Stack now has ${newItems.length} item(s).`, [], { visited: 1, changes: 1 }, newItems, capacity),
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

  // line 1 – enter pop
  steps.push(
    step(id++, 1, 'Call pop.', ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check if top == -1 (stack empty)
  const top = items.length - 1;
  steps.push(
    step(id++, 2, `Check: top (${top}) == -1?`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length === 0) {
    // line 3 – display "Stack is empty!"
    steps.push(
      step(id++, 3, 'Stack is empty!', ['top'], { visited: 1, changes: 0 }, items, capacity, 'stack underflow'),
    );
    return steps;
  }

  const topItem = items[items.length - 1];

  // line 5 – poppedElement = stack[top]
  steps.push(
    step(id++, 5, `poppedElement = stack[top] = ${topItem.value}.`, ['top'], { visited: 2, changes: 0 }, items, capacity),
  );

  // line 6 – top--; build new items array (no mutation)
  const newItems: StackItem[] = items.slice(0, -1);
  steps.push(
    step(id++, 6, `top-- → top is now ${newItems.length - 1}.`, ['top'], { visited: 2, changes: 1 }, newItems, capacity),
  );

  // line 7 – display popped element
  steps.push(
    step(id++, 7, `The popped element is: ${topItem.value}. Stack now has ${newItems.length} item(s).`, [], { visited: 2, changes: 1 }, newItems, capacity),
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

  // line 1 – enter peek
  steps.push(
    step(id++, 1, 'Call peek.', ['top'], { visited: 0, changes: 0 }, items, capacity),
  );

  // line 2 – check if top == -1 (stack empty)
  const top = items.length - 1;
  steps.push(
    step(id++, 2, `Check: top (${top}) == -1?`, ['top'], { visited: 1, changes: 0 }, items, capacity),
  );

  if (items.length === 0) {
    // line 3 – display "Stack is empty!"
    steps.push(
      step(id++, 3, 'Stack is empty!', ['top'], { visited: 1, changes: 0 }, items, capacity, 'stack underflow'),
    );
    return steps;
  }

  const topItem = items[items.length - 1];

  // line 5 – display top element (no change to items)
  steps.push(
    step(id++, 5, `Top element is: stack[top] = ${topItem.value}.`, ['top'], { visited: 1, changes: 0 }, items, capacity),
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

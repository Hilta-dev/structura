//caption part — pure logic helpers for StepCaption (no React, fully testable)

import type { Step, StackView, QueueView, LinkedListView } from '../engine/types';

// ── Operation name ─────────────────────────────────────────────────────────

/**
 * Derive a human-readable operation name from the first pseudocode line.
 * e.g. "push(data){" → "Push"
 *      "procedure IS_EMPTY(stack)" → "IS_EMPTY"
 *      "DISPLAY …" → falls back to firstWord of step explanation
 */
export function inferOperationName(
  pseudocode: readonly string[],
  fallback: string,
): string {
  if (pseudocode.length === 0) return fallback;
  const first = pseudocode[0].trim();

  // matches "funcName(" at start, e.g. "push(data){"
  const funcMatch = first.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (funcMatch) {
    const name = funcMatch[1];
    // capitalise first letter for readability
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // matches "procedure NAME(" or "procedure NAME" at start
  const procMatch = first.match(/^procedure\s+([A-Za-z_][A-Za-z0-9_]*)/i);
  if (procMatch) return procMatch[1].toUpperCase();

  return fallback;
}

// ── Chip data ──────────────────────────────────────────────────────────────

export type Chip = { label: string; value: string };

/** Chips for the Stack tab, derived from the current step's StackView. */
export function stackChips(step: Step): Chip[] {
  if (step.view.kind !== 'stack') return [];
  const v = step.view as StackView;
  const top = v.items.length - 1;
  return [
    { label: 'TOP',      value: String(top) },
    { label: 'SIZE',     value: String(v.items.length) },
    { label: 'CAPACITY', value: String(v.capacity) },
  ];
}

/** Chips for the Queue tab, derived from the current step's QueueView. */
export function queueChips(step: Step): Chip[] {
  if (step.view.kind !== 'queue') return [];
  const v = step.view as QueueView;
  return [
    { label: 'FRONT',    value: String(v.front) },
    { label: 'REAR',     value: String(v.rear) },
    { label: 'SIZE',     value: String(v.items.length) },
    { label: 'CAPACITY', value: String(v.capacity) },
  ];
}

/** Chips for the Linked-list tab, derived from the current step's LinkedListView. */
export function linkedListChips(step: Step): Chip[] {
  if (step.view.kind !== 'linkedList') return [];
  const v = step.view as LinkedListView;
  const length = v.nodes.length;

  // find the tail: the node whose next is null
  const tailNode = v.nodes.find((n) => n.next === null);
  const headNode = v.nodes.find((n) => n.id === v.head);

  const headVal = headNode ? String(headNode.data) : 'null';
  const tailVal = tailNode ? String(tailNode.data) : 'null';

  return [
    { label: 'HEAD',   value: headVal },
    { label: 'TAIL',   value: tailVal },
    { label: 'LENGTH', value: String(length) },
  ];
}

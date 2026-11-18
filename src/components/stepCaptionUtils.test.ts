import { describe, expect, it } from 'vitest';
import { inferOperationName, stackChips, queueChips, linkedListChips } from './stepCaptionUtils';
import type { Step } from '../engine/types';

// ── helpers ────────────────────────────────────────────────────────────────

function stackStep(overrides: Partial<Step> = {}): Step {
  return {
    id: 0,
    codeLine: 1,
    explanation: 'test',
    highlights: [],
    counters: { visited: 0, changes: 0 },
    view: { kind: 'stack', items: [{ id: '1', value: 10 }], capacity: 5 },
    ...overrides,
  };
}

function queueStep(overrides: Partial<Step> = {}): Step {
  return {
    id: 0,
    codeLine: 1,
    explanation: 'test',
    highlights: [],
    counters: { visited: 0, changes: 0 },
    view: { kind: 'queue', items: [{ id: '1', value: 20 }], front: 0, rear: 0, capacity: 6 },
    ...overrides,
  };
}

function linkedListStep(overrides: Partial<Step> = {}): Step {
  return {
    id: 0,
    codeLine: 1,
    explanation: 'test',
    highlights: [],
    counters: { visited: 0, changes: 0 },
    view: {
      kind: 'linkedList',
      head: 'n1',
      nodes: [
        { id: 'n1', data: 5, next: 'n2' },
        { id: 'n2', data: 10, next: null },
      ],
      capacity: 8,
    },
    ...overrides,
  };
}

// ── inferOperationName ─────────────────────────────────────────────────────

describe('inferOperationName', () => {
  it('extracts function name from "push(data){"', () => {
    expect(inferOperationName(['push(data){'], 'fallback')).toBe('Push');
  });

  it('extracts function name from "pop(){"', () => {
    expect(inferOperationName(['pop(){'], 'fallback')).toBe('Pop');
  });

  it('extracts function name from "peek(){"', () => {
    expect(inferOperationName(['peek(){'], 'fallback')).toBe('Peek');
  });

  it('extracts function name from "enqueue(data){"', () => {
    expect(inferOperationName(['enqueue(data){'], 'fallback')).toBe('Enqueue');
  });

  it('extracts function name from "dequeue(){"', () => {
    expect(inferOperationName(['dequeue(){'], 'fallback')).toBe('Dequeue');
  });

  it('extracts IS_EMPTY from procedure line', () => {
    expect(inferOperationName(['procedure IS_EMPTY(stack)'], 'fallback')).toBe('IS_EMPTY');
  });

  it('returns fallback when pseudocode is empty', () => {
    expect(inferOperationName([], 'Stack')).toBe('Stack');
  });

  it('returns fallback when first line has no function pattern', () => {
    expect(inferOperationName(['DISPLAY "Enter the data"'], 'Insert at Head')).toBe('Insert at Head');
  });

  it('capitalises the first letter', () => {
    expect(inferOperationName(['myFunc(arg){'], 'x')).toBe('MyFunc');
  });
});

// ── stackChips ────────────────────────────────────────────────────────────

describe('stackChips', () => {
  it('returns top, size, capacity chips', () => {
    const chips = stackChips(stackStep());
    const labels = chips.map((c) => c.label);
    expect(labels).toEqual(['TOP', 'SIZE', 'CAPACITY']);
  });

  it('top is items.length - 1', () => {
    const step = stackStep(); // 1 item → top = 0
    expect(stackChips(step).find((c) => c.label === 'TOP')?.value).toBe('0');
  });

  it('size equals items.length', () => {
    const step = stackStep(); // 1 item
    expect(stackChips(step).find((c) => c.label === 'SIZE')?.value).toBe('1');
  });

  it('capacity comes from view.capacity', () => {
    const step = stackStep(); // capacity 5
    expect(stackChips(step).find((c) => c.label === 'CAPACITY')?.value).toBe('5');
  });

  it('top is -1 when stack is empty', () => {
    const step = stackStep({ view: { kind: 'stack', items: [], capacity: 4 } });
    expect(stackChips(step).find((c) => c.label === 'TOP')?.value).toBe('-1');
  });

  it('returns empty array for non-stack view', () => {
    const step = queueStep();
    expect(stackChips(step)).toEqual([]);
  });
});

// ── queueChips ────────────────────────────────────────────────────────────

describe('queueChips', () => {
  it('returns front, rear, size, capacity chips', () => {
    const chips = queueChips(queueStep());
    const labels = chips.map((c) => c.label);
    expect(labels).toEqual(['FRONT', 'REAR', 'SIZE', 'CAPACITY']);
  });

  it('front comes from view.front', () => {
    expect(queueChips(queueStep()).find((c) => c.label === 'FRONT')?.value).toBe('0');
  });

  it('rear comes from view.rear', () => {
    expect(queueChips(queueStep()).find((c) => c.label === 'REAR')?.value).toBe('0');
  });

  it('size equals items.length', () => {
    expect(queueChips(queueStep()).find((c) => c.label === 'SIZE')?.value).toBe('1');
  });

  it('capacity comes from view.capacity', () => {
    expect(queueChips(queueStep()).find((c) => c.label === 'CAPACITY')?.value).toBe('6');
  });

  it('rear is -1 for a fresh empty queue', () => {
    const step = queueStep({
      view: { kind: 'queue', items: [], front: 0, rear: -1, capacity: 5 },
    });
    expect(queueChips(step).find((c) => c.label === 'REAR')?.value).toBe('-1');
  });

  it('returns empty array for non-queue view', () => {
    const step = stackStep();
    expect(queueChips(step)).toEqual([]);
  });
});

// ── linkedListChips ───────────────────────────────────────────────────────

describe('linkedListChips', () => {
  it('returns head, tail, length chips', () => {
    const chips = linkedListChips(linkedListStep());
    const labels = chips.map((c) => c.label);
    expect(labels).toEqual(['HEAD', 'TAIL', 'LENGTH']);
  });

  it('head value is the data of the head node', () => {
    expect(linkedListChips(linkedListStep()).find((c) => c.label === 'HEAD')?.value).toBe('5');
  });

  it('tail value is the data of the node with next = null', () => {
    expect(linkedListChips(linkedListStep()).find((c) => c.label === 'TAIL')?.value).toBe('10');
  });

  it('length equals nodes.length', () => {
    expect(linkedListChips(linkedListStep()).find((c) => c.label === 'LENGTH')?.value).toBe('2');
  });

  it('head and tail are "null" for an empty list', () => {
    const step = linkedListStep({
      view: { kind: 'linkedList', head: null, nodes: [], capacity: 8 },
    });
    const chips = linkedListChips(step);
    expect(chips.find((c) => c.label === 'HEAD')?.value).toBe('null');
    expect(chips.find((c) => c.label === 'TAIL')?.value).toBe('null');
  });

  it('single-node list: head and tail are the same node data', () => {
    const step = linkedListStep({
      view: {
        kind: 'linkedList',
        head: 'n1',
        nodes: [{ id: 'n1', data: 42, next: null }],
        capacity: 8,
      },
    });
    const chips = linkedListChips(step);
    expect(chips.find((c) => c.label === 'HEAD')?.value).toBe('42');
    expect(chips.find((c) => c.label === 'TAIL')?.value).toBe('42');
  });

  it('returns empty array for non-linkedList view', () => {
    const step = stackStep();
    expect(linkedListChips(step)).toEqual([]);
  });
});

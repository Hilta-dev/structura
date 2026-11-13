import { beforeEach, describe, expect, it } from 'vitest';
import { _resetId, isEmpty, peek, pop, push } from './stack';
import type { StackView } from './types';

function stackView(step: { view: unknown }): StackView {
  return step.view as StackView;
}

beforeEach(() => {
  _resetId();
});

// ---------------------------------------------------------------------------
// push
// ---------------------------------------------------------------------------

describe('push', () => {
  it('adds a step sequence ending with the new item on top', () => {
    const steps = push([], 3, 10);
    const last = steps[steps.length - 1];
    const v = stackView(last);
    expect(v.items).toHaveLength(1);
    expect(v.items[0].value).toBe(10);
    expect(v.capacity).toBe(3);
  });

  it('top is always the last element', () => {
    const first = push([], 3, 1);
    const topAfterFirst = stackView(first[first.length - 1]).items;
    const second = push(topAfterFirst, 3, 2);
    const topAfterSecond = stackView(second[second.length - 1]).items;
    expect(topAfterSecond[topAfterSecond.length - 1].value).toBe(2);
  });

  it('does not mutate the input array', () => {
    const original = [{ id: '1', value: 5 }];
    push(original, 3, 99);
    expect(original).toHaveLength(1);
  });

  it('returns stack overflow error when full', () => {
    const full = [{ id: '1', value: 1 }, { id: '2', value: 2 }];
    const steps = push(full, 2, 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('stack overflow');
    // view must still show the unchanged stack
    expect(stackView(last).items).toHaveLength(2);
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = push([], 3, 7);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('every step view has the correct capacity', () => {
    const steps = push([], 5, 42);
    steps.forEach(s => expect(stackView(s).capacity).toBe(5));
  });

  it('codeLine 1 is the entry step', () => {
    const steps = push([], 3, 1);
    expect(steps[0].codeLine).toBe(1);
  });

  it('overflow step points to codeLine 3', () => {
    const steps = push([{ id: '1', value: 1 }], 1, 2);
    const last = steps[steps.length - 1];
    expect(last.codeLine).toBe(3);
    expect(last.error).toBe('stack overflow');
  });
});

// ---------------------------------------------------------------------------
// pop
// ---------------------------------------------------------------------------

describe('pop', () => {
  it('removes the top item', () => {
    const items = [{ id: '1', value: 10 }, { id: '2', value: 20 }];
    const steps = pop(items, 3);
    const last = steps[steps.length - 1];
    expect(stackView(last).items).toHaveLength(1);
    expect(stackView(last).items[0].value).toBe(10);
  });

  it('does not mutate the input array', () => {
    const items = [{ id: '1', value: 5 }];
    pop(items, 3);
    expect(items).toHaveLength(1);
  });

  it('returns stack underflow error on empty stack', () => {
    const steps = pop([], 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('stack underflow');
  });

  it('underflow step points to codeLine 3', () => {
    const steps = pop([], 3);
    const last = steps[steps.length - 1];
    expect(last.codeLine).toBe(3);
  });

  it('assigns sequential step ids starting at 0', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = pop(items, 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('explanation mentions the removed value', () => {
    const items = [{ id: '1', value: 42 }];
    const steps = pop(items, 3);
    const last = steps[steps.length - 1];
    expect(last.explanation).toContain('42');
  });

  it('counters track visited and changes', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = pop(items, 3);
    const last = steps[steps.length - 1];
    expect(last.counters.changes).toBe(1);
    expect(last.counters.visited).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// peek
// ---------------------------------------------------------------------------

describe('peek', () => {
  it('returns the top value without removing it', () => {
    const items = [{ id: '1', value: 7 }, { id: '2', value: 99 }];
    const steps = peek(items, 3);
    const last = steps[steps.length - 1];
    // items unchanged
    expect(stackView(last).items).toHaveLength(2);
    expect(stackView(last).items[1].value).toBe(99);
    expect(last.counters.changes).toBe(0);
  });

  it('does not mutate the input array', () => {
    const items = [{ id: '1', value: 5 }];
    peek(items, 3);
    expect(items).toHaveLength(1);
  });

  it('returns stack underflow error on empty stack', () => {
    const steps = peek([], 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('stack underflow');
    expect(last.codeLine).toBe(3);
  });

  it('explanation mentions the top value', () => {
    const items = [{ id: '1', value: 55 }];
    const steps = peek(items, 3);
    const last = steps[steps.length - 1];
    expect(last.explanation).toContain('55');
  });

  it('assigns sequential step ids starting at 0', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = peek(items, 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });
});

// ---------------------------------------------------------------------------
// isEmpty
// ---------------------------------------------------------------------------

describe('isEmpty', () => {
  it('returns two steps for an empty stack, last explanation says true', () => {
    const steps = isEmpty([], 3);
    expect(steps).toHaveLength(2);
    expect(steps[1].explanation).toContain('true');
  });

  it('returns two steps for a non-empty stack, last explanation says false', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = isEmpty(items, 3);
    expect(steps).toHaveLength(2);
    expect(steps[1].explanation).toContain('false');
  });

  it('never sets an error', () => {
    const steps = isEmpty([], 3);
    steps.forEach(s => expect(s.error).toBeUndefined());
  });

  it('no changes counter is ever incremented', () => {
    const steps = isEmpty([{ id: '1', value: 1 }], 3);
    steps.forEach(s => expect(s.counters.changes).toBe(0));
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = isEmpty([], 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });
});

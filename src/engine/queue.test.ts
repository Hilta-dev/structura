import { beforeEach, describe, expect, it } from 'vitest';
import { _resetId, dequeue, enqueue, isEmpty, peek } from './queue';
import type { QueueView } from './types';

function queueView(step: { view: unknown }): QueueView {
  return step.view as QueueView;
}

beforeEach(() => {
  _resetId();
});

describe('enqueue', () => {
  it('adds a step sequence ending with the new item at rear', () => {
    const steps = enqueue([], 0, -1, 3, 10);
    const last = steps[steps.length - 1];
    const v = queueView(last);
    expect(v.items).toHaveLength(1);
    expect(v.items[0].value).toBe(10);
    expect(v.capacity).toBe(3);
  });

  it('rear index advances with each enqueue', () => {
    const first = enqueue([], 0, -1, 3, 1);
    const v1 = queueView(first[first.length - 1]);
    expect(v1.rear).toBe(0);

    const second = enqueue(v1.items, v1.front, v1.rear, 3, 2);
    const v2 = queueView(second[second.length - 1]);
    expect(v2.rear).toBe(1);
    expect(v2.items[v2.items.length - 1].value).toBe(2);
  });

  it('front index stays unchanged during enqueue', () => {
    const steps = enqueue([], 0, -1, 3, 5);
    const last = steps[steps.length - 1];
    expect(queueView(last).front).toBe(0);
  });

  it('does not mutate the input array', () => {
    const original = [{ id: '1', value: 5 }];
    enqueue(original, 0, 0, 3, 99);
    expect(original).toHaveLength(1);
  });

  it('returns queue overflow error when full', () => {
    const full = [{ id: '1', value: 1 }, { id: '2', value: 2 }];
    const steps = enqueue(full, 0, 1, 2, 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('queue overflow');
    expect(queueView(last).items).toHaveLength(2);
  });

  it('overflow step points to codeLine 3', () => {
    const steps = enqueue([{ id: '1', value: 1 }], 0, 0, 1, 2);
    const last = steps[steps.length - 1];
    expect(last.codeLine).toBe(3);
    expect(last.error).toBe('queue overflow');
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = enqueue([], 0, -1, 3, 7);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('every step view has the correct capacity', () => {
    const steps = enqueue([], 0, -1, 5, 42);
    steps.forEach(s => expect(queueView(s).capacity).toBe(5));
  });

  it('codeLine 1 is the entry step', () => {
    const steps = enqueue([], 0, -1, 3, 1);
    expect(steps[0].codeLine).toBe(1);
  });

  it('explanation on final step mentions front and rear', () => {
    const steps = enqueue([], 0, -1, 3, 7);
    const last = steps[steps.length - 1];
    expect(last.explanation).toContain('Front');
    expect(last.explanation).toContain('Rear');
  });
});

describe('dequeue', () => {
  it('removes the front item (FIFO)', () => {
    const items = [{ id: '1', value: 10 }, { id: '2', value: 20 }];
    const steps = dequeue(items, 0, 1, 3);
    const last = steps[steps.length - 1];
    // first item (10) should be gone; only 20 remains
    expect(queueView(last).items).toHaveLength(1);
    expect(queueView(last).items[0].value).toBe(20);
  });

  it('front index advances after dequeue', () => {
    const items = [{ id: '1', value: 10 }, { id: '2', value: 20 }];
    const steps = dequeue(items, 0, 1, 3);
    const last = steps[steps.length - 1];
    expect(queueView(last).front).toBe(1);
  });

  it('rear index stays unchanged during dequeue', () => {
    const items = [{ id: '1', value: 10 }];
    const steps = dequeue(items, 0, 0, 3);
    const last = steps[steps.length - 1];
    expect(queueView(last).rear).toBe(0);
  });

  it('does not mutate the input array', () => {
    const items = [{ id: '1', value: 5 }];
    dequeue(items, 0, 0, 3);
    expect(items).toHaveLength(1);
  });

  it('returns queue underflow error on empty queue', () => {
    const steps = dequeue([], 0, -1, 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('queue underflow');
  });

  it('underflow step points to codeLine 3', () => {
    const steps = dequeue([], 0, -1, 3);
    const last = steps[steps.length - 1];
    expect(last.codeLine).toBe(3);
  });

  it('assigns sequential step ids starting at 0', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = dequeue(items, 0, 0, 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('explanation mentions the dequeued value', () => {
    const items = [{ id: '1', value: 42 }];
    const steps = dequeue(items, 0, 0, 3);
    const last = steps[steps.length - 1];
    expect(last.explanation).toContain('42');
    expect(last.explanation).toContain('dequeued element');
  });

  it('counters track visited and changes', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = dequeue(items, 0, 0, 3);
    const last = steps[steps.length - 1];
    expect(last.counters.changes).toBe(1);
    expect(last.counters.visited).toBeGreaterThan(0);
  });

  it('every step view has the correct capacity', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = dequeue(items, 0, 0, 5);
    steps.forEach(s => expect(queueView(s).capacity).toBe(5));
  });
});

describe('FIFO order', () => {
  it('dequeues in first-in-first-out order after multiple enqueues', () => {
    // enqueue 1, 2, 3 in order
    let items: { id: string; value: number }[] = [];
    let front = 0;
    let rear = -1;
    const cap = 8;

    for (const v of [1, 2, 3]) {
      const steps = enqueue(items, front, rear, cap, v);
      const last = queueView(steps[steps.length - 1]);
      items = last.items;
      front = last.front;
      rear = last.rear;
    }

    // dequeue three times and collect the removed values
    const dequeued: number[] = [];
    for (let i = 0; i < 3; i++) {
      const steps = dequeue(items, front, rear, cap);
      // the dequeued value is the front before dequeue
      dequeued.push(items[0].value);
      const last = queueView(steps[steps.length - 1]);
      items = last.items;
      front = last.front;
      rear = last.rear;
    }

    expect(dequeued).toEqual([1, 2, 3]);
  });
});

describe('peek', () => {
  it('returns the front value without removing it', () => {
    const items = [{ id: '1', value: 7 }, { id: '2', value: 99 }];
    const steps = peek(items, 0, 1, 3);
    const last = steps[steps.length - 1];
    // items unchanged – still 2 elements, front still 7
    expect(queueView(last).items).toHaveLength(2);
    expect(queueView(last).items[0].value).toBe(7);
    expect(last.counters.changes).toBe(0);
  });

  it('front and rear are unchanged after peek', () => {
    const items = [{ id: '1', value: 7 }];
    const steps = peek(items, 0, 0, 3);
    const last = steps[steps.length - 1];
    expect(queueView(last).front).toBe(0);
    expect(queueView(last).rear).toBe(0);
  });

  it('does not mutate the input array', () => {
    const items = [{ id: '1', value: 5 }];
    peek(items, 0, 0, 3);
    expect(items).toHaveLength(1);
  });

  it('returns queue underflow error on empty queue', () => {
    const steps = peek([], 0, -1, 3);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('queue underflow');
    expect(last.codeLine).toBe(3);
  });

  it('explanation mentions the front value', () => {
    const items = [{ id: '1', value: 55 }];
    const steps = peek(items, 0, 0, 3);
    const last = steps[steps.length - 1];
    expect(last.explanation).toContain('55');
    expect(last.explanation).toContain('Front element');
  });

  it('assigns sequential step ids starting at 0', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = peek(items, 0, 0, 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('every step view has the correct capacity', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = peek(items, 0, 0, 5);
    steps.forEach(s => expect(queueView(s).capacity).toBe(5));
  });
});

describe('isEmpty', () => {
  it('returns two steps for an empty queue, last explanation says true', () => {
    const steps = isEmpty([], 0, -1, 3);
    expect(steps).toHaveLength(2);
    expect(steps[1].explanation).toContain('true');
  });

  it('returns two steps for a non-empty queue, last explanation says false', () => {
    const items = [{ id: '1', value: 1 }];
    const steps = isEmpty(items, 0, 0, 3);
    expect(steps).toHaveLength(2);
    expect(steps[1].explanation).toContain('false');
  });

  it('never sets an error', () => {
    const steps = isEmpty([], 0, -1, 3);
    steps.forEach(s => expect(s.error).toBeUndefined());
  });

  it('no changes counter is ever incremented', () => {
    const steps = isEmpty([{ id: '1', value: 1 }], 0, 0, 3);
    steps.forEach(s => expect(s.counters.changes).toBe(0));
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = isEmpty([], 0, -1, 3);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('every step view has the correct capacity', () => {
    const steps = isEmpty([], 0, -1, 5);
    steps.forEach(s => expect(queueView(s).capacity).toBe(5));
  });
});

describe('immutability across operations', () => {
  it('enqueue does not modify the items array passed in', () => {
    const original = [{ id: '1', value: 1 }, { id: '2', value: 2 }];
    const copy = [...original];
    enqueue(original, 0, 1, 5, 3);
    expect(original).toEqual(copy);
  });

  it('dequeue does not modify the items array passed in', () => {
    const original = [{ id: '1', value: 1 }, { id: '2', value: 2 }];
    const copy = [...original];
    dequeue(original, 0, 1, 5);
    expect(original).toEqual(copy);
  });

  it('peek does not modify the items array passed in', () => {
    const original = [{ id: '1', value: 1 }];
    const copy = [...original];
    peek(original, 0, 0, 5);
    expect(original).toEqual(copy);
  });
});

describe('capacity on every step', () => {
  it('enqueue overflow path still carries capacity on all steps', () => {
    const full = [{ id: '1', value: 1 }, { id: '2', value: 2 }];
    const steps = enqueue(full, 0, 1, 2, 3);
    steps.forEach(s => expect(queueView(s).capacity).toBe(2));
  });

  it('dequeue underflow path still carries capacity on all steps', () => {
    const steps = dequeue([], 0, -1, 4);
    steps.forEach(s => expect(queueView(s).capacity).toBe(4));
  });

  it('peek underflow path still carries capacity on all steps', () => {
    const steps = peek([], 0, -1, 4);
    steps.forEach(s => expect(queueView(s).capacity).toBe(4));
  });
});

describe('sequential ids across all operations', () => {
  it('each operation restarts ids from 0 independently', () => {
    const s1 = enqueue([], 0, -1, 3, 1);
    const s2 = enqueue([], 0, -1, 3, 2);
    expect(s1[0].id).toBe(0);
    expect(s2[0].id).toBe(0);
  });
});

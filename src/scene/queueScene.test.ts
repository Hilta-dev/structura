import { describe, expect, it } from 'vitest';
import type { QueueView } from '../engine/types';

//pure helpers extracted from QueueScene logic (kept in-sync manually)

const SLOT_W = 1.4;
const GAP    = 0.12;

function slotX(i: number, capacity: number): number {
  const totalW = capacity * SLOT_W + (capacity - 1) * GAP;
  return -totalW / 2 + i * (SLOT_W + GAP) + SLOT_W / 2;
}

function dur(base: number, speed: number): number {
  return Math.round(base / Math.max(0.1, speed));
}

//true slot index for item at position i in the items array
function trueSlot(front: number, i: number): number {
  return front + i;
}

//ghost slot on dequeue: the slot that became empty = prevView.front
function ghostSlot(prevFront: number): number {
  return prevFront;
}

//determine if a slot index is in the dequeued range
function isDequeued(slotIndex: number, front: number): boolean {
  return slotIndex < front;
}

//rear chip x when rear >= 0
function rearChipX(rear: number, capacity: number): number {
  return slotX(rear, capacity);
}

//rear chip x when rear == -1: just left of slot 0
function rearMinusOneX(capacity: number): number {
  return slotX(0, capacity) - SLOT_W - GAP;
}

describe('slotX', () => {
  it('slot 0 is left of centre for capacity > 1', () => {
    expect(slotX(0, 4)).toBeLessThan(0);
  });

  it('slot capacity-1 is right of centre for capacity > 1', () => {
    expect(slotX(3, 4)).toBeGreaterThan(0);
  });

  it('single-slot queue centres at 0', () => {
    expect(slotX(0, 1)).toBeCloseTo(0);
  });

  it('slot spacing equals SLOT_W + GAP', () => {
    const diff = slotX(1, 4) - slotX(0, 4);
    expect(diff).toBeCloseTo(SLOT_W + GAP);
  });

  it('slots are symmetric around 0 for even capacity', () => {
    expect(slotX(0, 4)).toBeCloseTo(-slotX(3, 4));
  });
});

describe('dur — speed scaling', () => {
  it('speed 1 returns base unchanged', () => {
    expect(dur(400, 1)).toBe(400);
  });

  it('speed 2 halves the duration', () => {
    expect(dur(400, 2)).toBe(200);
  });

  it('speed 0.5 doubles the duration', () => {
    expect(dur(400, 0.5)).toBe(800);
  });

  it('speed 0 is clamped to 0.1 so duration does not blow up', () => {
    expect(dur(400, 0)).toBe(4000);
  });

  it('rounds to nearest integer', () => {
    expect(Number.isInteger(dur(300, 7))).toBe(true);
  });
});

describe('trueSlot — item-to-array-index mapping', () => {
  it('first item of a fresh queue sits at slot 0', () => {
    expect(trueSlot(0, 0)).toBe(0);
  });

  it('after one dequeue (front=1), first remaining item is at slot 1', () => {
    expect(trueSlot(1, 0)).toBe(1);
  });

  it('after two dequeues (front=2), second item is at slot 3', () => {
    expect(trueSlot(2, 1)).toBe(3);
  });

  it('items are contiguous from front onwards', () => {
    const front = 3;
    const slots = [0, 1, 2].map((i) => trueSlot(front, i));
    expect(slots).toEqual([3, 4, 5]);
  });
});

describe('ghostSlot — dequeue ghost position', () => {
  it('ghost appears at the previous front slot', () => {
    expect(ghostSlot(0)).toBe(0);
  });

  it('after earlier dequeues the ghost is at the new previous front', () => {
    expect(ghostSlot(2)).toBe(2);
  });
});

describe('isDequeued — slot classification', () => {
  it('slot 0 is dequeued when front is 1', () => {
    expect(isDequeued(0, 1)).toBe(true);
  });

  it('slot 1 is dequeued when front is 2', () => {
    expect(isDequeued(1, 2)).toBe(true);
  });

  it('slot equal to front is not dequeued', () => {
    expect(isDequeued(2, 2)).toBe(false);
  });

  it('no slots are dequeued when front is 0', () => {
    for (let i = 0; i < 5; i++) expect(isDequeued(i, 0)).toBe(false);
  });
});

describe('rearChipX', () => {
  it('rear chip at slot 0 equals slotX(0, capacity)', () => {
    expect(rearChipX(0, 5)).toBeCloseTo(slotX(0, 5));
  });

  it('rear chip at last slot equals slotX(capacity-1, capacity)', () => {
    expect(rearChipX(4, 5)).toBeCloseTo(slotX(4, 5));
  });
});

describe('rearMinusOneX', () => {
  it('rear=-1 chip is strictly left of slot 0', () => {
    expect(rearMinusOneX(5)).toBeLessThan(slotX(0, 5));
  });

  it('rear=-1 chip is exactly one slot+gap to the left of slot 0', () => {
    expect(rearMinusOneX(5)).toBeCloseTo(slotX(0, 5) - SLOT_W - GAP);
  });
});

describe('QueueView slot derivation — integration scenarios', () => {
  //simulate: enqueue(10), enqueue(20), dequeue()
  //final QueueView: items=[{20}], front=1, rear=1, capacity=5

  const view: QueueView = {
    kind: 'queue',
    items: [{ id: '2', value: 20 }],
    front: 1,
    rear: 1,
    capacity: 5,
  };

  it('the single remaining item maps to slot 1 (front=1, i=0)', () => {
    const slot = trueSlot(view.front, 0);
    expect(slot).toBe(1);
  });

  it('slot 0 is classified as dequeued', () => {
    expect(isDequeued(0, view.front)).toBe(true);
  });

  it('FRONT chip is at slotX(1, 5)', () => {
    expect(slotX(view.front, view.capacity)).toBeCloseTo(slotX(1, 5));
  });

  it('REAR chip is at slotX(1, 5)', () => {
    expect(rearChipX(view.rear, view.capacity)).toBeCloseTo(slotX(1, 5));
  });

  it('after a further enqueue(30) REAR chip moves to slot 2', () => {
    expect(rearChipX(2, view.capacity)).toBeCloseTo(slotX(2, 5));
  });
});

describe('full-check flash conditions', () => {
  it('isFull is true when items.length >= capacity', () => {
    const isFull = (items: { id: string; value: number }[], capacity: number) =>
      items.length >= capacity;
    expect(isFull([{ id: '1', value: 1 }, { id: '2', value: 2 }], 2)).toBe(true);
  });

  it('isFull is false when there is room', () => {
    const isFull = (items: { id: string; value: number }[], capacity: number) =>
      items.length >= capacity;
    expect(isFull([{ id: '1', value: 1 }], 3)).toBe(false);
  });

  it('isFullCheckLine is true only for codeLine 2 on a non-enqueue step', () => {
    const isFullCheckLine = (codeLine: number, isEnqueueStep: boolean, viewKind: string) =>
      !isEnqueueStep && codeLine === 2 && viewKind === 'queue';
    expect(isFullCheckLine(2, false, 'queue')).toBe(true);
    expect(isFullCheckLine(2, true,  'queue')).toBe(false);
    expect(isFullCheckLine(1, false, 'queue')).toBe(false);
    expect(isFullCheckLine(2, false, 'stack')).toBe(false);
  });

  it('isInsertLine is true only for codeLine 6 on an enqueue step', () => {
    const isInsertLine = (codeLine: number, isEnqueueStep: boolean) =>
      codeLine === 6 && isEnqueueStep;
    expect(isInsertLine(6, true)).toBe(true);
    expect(isInsertLine(6, false)).toBe(false);
    expect(isInsertLine(5, true)).toBe(false);
  });
});

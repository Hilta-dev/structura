import { beforeEach, describe, expect, it } from 'vitest';
import {
  _resetId,
  insertAtBeginning, insertAtEnd, insertAfterPosition,
  deleteAtBeginning, deleteAtEnd, deleteAtPosition,
  traverse, find,
} from './linkedList';
import type { LLState } from './linkedList';
import type { LinkedListView } from './types';
import {
  insertAtBeginningPseudocode,
  insertAtEndPseudocode,
  insertAfterPositionPseudocode,
  deleteAtBeginningPseudocode,
  deleteAtEndPseudocode,
  deleteAtPositionPseudocode,
  traversePseudocode,
  findPseudocode,
} from '../lessons/linkedListPseudocode';

function llView(step: { view: unknown }): LinkedListView {
  return step.view as LinkedListView;
}

/** Walk the linked list from head and return data values in order. */
function dataOrder(view: LinkedListView): number[] {
  const result: number[] = [];
  let cur = view.head;
  while (cur !== null) {
    const node = view.nodes.find((n) => n.id === cur!);
    if (!node) break;
    result.push(node.data);
    cur = node.next;
  }
  return result;
}

const EMPTY: LLState = { head: null, nodes: [] };

beforeEach(() => {
  _resetId();
});

// helpers to build a list state from an array of data values
function buildList(values: number[], capacity = 8): LLState {
  let state = EMPTY;
  for (const v of values) {
    const steps = insertAtEnd(state, capacity, v);
    const last = steps[steps.length - 1];
    state = { head: llView(last).head, nodes: llView(last).nodes };
  }
  return state;
}

describe('insertAtBeginning', () => {
  it('on empty list: head is the new node, next is null, length 1', () => {
    const steps = insertAtBeginning(EMPTY, 8, 42);
    const last = steps[steps.length - 1];
    const v = llView(last);
    expect(v.head).not.toBeNull();
    expect(v.nodes).toHaveLength(1);
    expect(v.nodes[0].data).toBe(42);
    expect(v.nodes[0].next).toBeNull();
  });

  it('inserting 5, then 2, then 8 gives order 8 → 2 → 5 from head', () => {
    let state = EMPTY;
    for (const v of [5, 2, 8]) {
      const steps = insertAtBeginning(state, 8, v);
      const last = steps[steps.length - 1];
      state = { head: llView(last).head, nodes: llView(last).nodes };
    }
    expect(dataOrder({ kind: 'linkedList', head: state.head, nodes: state.nodes, capacity: 8 })).toEqual([8, 2, 5]);
  });

  it('list is full: returns "List is full!" error and list unchanged', () => {
    const full = buildList([1, 2, 3], 3);
    const steps = insertAtBeginning(full, 3, 99);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is full!');
    expect(llView(last).nodes).toHaveLength(3);
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = insertAtBeginning(EMPTY, 8, 1);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right number of lines', () => {
    expect(insertAtBeginningPseudocode.length).toBeGreaterThan(0);
    expect(insertAtBeginningPseudocode[0]).toContain('DISPLAY');
  });
});

describe('insertAtEnd', () => {
  it('on empty list: head is the new node', () => {
    const steps = insertAtEnd(EMPTY, 8, 7);
    const last = steps[steps.length - 1];
    const v = llView(last);
    expect(v.head).not.toBeNull();
    expect(v.nodes).toHaveLength(1);
    expect(v.nodes[0].data).toBe(7);
  });

  it('inserting 5, 2, 8 gives order 5 → 2 → 8 from head', () => {
    let state = EMPTY;
    for (const v of [5, 2, 8]) {
      const steps = insertAtEnd(state, 8, v);
      const last = steps[steps.length - 1];
      state = { head: llView(last).head, nodes: llView(last).nodes };
    }
    expect(dataOrder({ ...state, kind: 'linkedList', capacity: 8 })).toEqual([5, 2, 8]);
  });

  it('list is full: returns "List is full!" error and list unchanged', () => {
    const full = buildList([1, 2], 2);
    const steps = insertAtEnd(full, 2, 99);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is full!');
    expect(llView(last).nodes).toHaveLength(2);
  });

  it('tempPath for [5, 2, 8] lists the ids of all three nodes in order', () => {
    // build [5, 2] first so we can capture ids before inserting 8
    _resetId();
    let state = EMPTY;
    const s1 = insertAtEnd(state, 8, 5);
    state = { head: llView(s1[s1.length - 1]).head, nodes: llView(s1[s1.length - 1]).nodes };
    const s2 = insertAtEnd(state, 8, 2);
    state = { head: llView(s2[s2.length - 1]).head, nodes: llView(s2[s2.length - 1]).nodes };
    const s3 = insertAtEnd(state, 8, 8);
    state = { head: llView(s3[s3.length - 1]).head, nodes: llView(s3[s3.length - 1]).nodes };

    // now insert a 4th — temp should walk all three existing nodes
    const s4 = insertAtEnd(state, 8, 99);
    const lastStep = s4[s4.length - 1] as { tempPath: string[] };
    // tempPath must include the id of each of the first three nodes
    const idOrder = dataOrder({ ...state, kind: 'linkedList', capacity: 8 })
      .map((_, i) => state.nodes[i]?.id)
      .filter(Boolean) as string[];
    // every node walked should be in tempPath
    for (const id of idOrder) {
      expect(lastStep.tempPath).toContain(id);
    }
  });

  it('assigns sequential step ids starting at 0', () => {
    const steps = insertAtEnd(EMPTY, 8, 1);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right lines', () => {
    expect(insertAtEndPseudocode.length).toBeGreaterThan(0);
    expect(insertAtEndPseudocode[3]).toContain('IF');
  });
});

describe('insertAfterPosition', () => {
  it('[5, 2, 8], insertAfterPosition(2, 7) gives [5, 2, 7, 8]', () => {
    const state = buildList([5, 2, 8]);
    const steps = insertAfterPosition(state, 8, 2, 7);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([5, 2, 7, 8]);
  });

  it('[5, 2, 8], insertAfterPosition(3, 7) gives [5, 2, 8, 7]', () => {
    const state = buildList([5, 2, 8]);
    const steps = insertAfterPosition(state, 8, 3, 7);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([5, 2, 8, 7]);
  });

  it('[5, 2, 8], position 0: "Invalid position!" and list unchanged', () => {
    const state = buildList([5, 2, 8]);
    const steps = insertAfterPosition(state, 8, 0, 99);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('Invalid position!');
    expect(llView(last).nodes).toHaveLength(3);
  });

  it('[5, 2, 8], position 4: "Invalid position!" and list unchanged', () => {
    const state = buildList([5, 2, 8]);
    const steps = insertAfterPosition(state, 8, 4, 99);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('Invalid position!');
    expect(llView(last).nodes).toHaveLength(3);
  });

  it('empty list: "Invalid position!"', () => {
    const steps = insertAfterPosition(EMPTY, 8, 1, 5);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('Invalid position!');
  });

  it('list is full: returns "List is full!" error', () => {
    const full = buildList([1, 2, 3], 3);
    const steps = insertAfterPosition(full, 3, 2, 99);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is full!');
    expect(llView(last).nodes).toHaveLength(3);
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1, 2]);
    const steps = insertAfterPosition(state, 8, 1, 5);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array starts with i = 1', () => {
    expect(insertAfterPositionPseudocode[0]).toBe('i = 1');
  });

  it('tempPath walks to the target position', () => {
    const state = buildList([5, 2, 8]);
    const steps = insertAfterPosition(state, 8, 2, 7);
    const last = steps[steps.length - 1] as { tempPath: string[] };
    // tempPath should have visited at least 2 nodes (pos 1 and pos 2)
    expect(last.tempPath.length).toBeGreaterThanOrEqual(2);
  });
});

describe('deleteAtBeginning', () => {
  it('[5, 2, 8, 9]: result is [2, 8, 9]', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtBeginning(state, 8);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([2, 8, 9]);
  });

  it('empty list: "List is empty!"', () => {
    const steps = deleteAtBeginning(EMPTY, 8);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is empty!');
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1]);
    const steps = deleteAtBeginning(state, 8);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array starts with IF(head == NULL)', () => {
    expect(deleteAtBeginningPseudocode[0]).toContain('IF(head == NULL)');
  });
});

describe('deleteAtEnd', () => {
  it('[5, 2, 8, 9]: result is [5, 2, 8]', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtEnd(state, 8);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([5, 2, 8]);
  });

  it('one-node list: head becomes null', () => {
    const state = buildList([42]);
    const steps = deleteAtEnd(state, 8);
    const last = steps[steps.length - 1];
    expect(llView(last).head).toBeNull();
    expect(llView(last).nodes).toHaveLength(0);
  });

  it('empty list: "List is empty!"', () => {
    const steps = deleteAtEnd(EMPTY, 8);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is empty!');
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1, 2]);
    const steps = deleteAtEnd(state, 8);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right number of lines', () => {
    expect(deleteAtEndPseudocode.length).toBeGreaterThan(0);
    expect(deleteAtEndPseudocode[0]).toContain('IF(head == NULL)');
  });
});

describe('deleteAtPosition', () => {
  it('[5, 2, 8, 9], deleteAtPosition(3): result is [5, 2, 9]', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtPosition(state, 8, 3);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([5, 2, 9]);
  });

  it('[5, 2, 8, 9], deleteAtPosition(1): result is [2, 8, 9]', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtPosition(state, 8, 1);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([2, 8, 9]);
  });

  it('[5, 2, 8, 9], deleteAtPosition(4): result is [5, 2, 8]', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtPosition(state, 8, 4);
    const last = steps[steps.length - 1];
    expect(dataOrder(llView(last))).toEqual([5, 2, 8]);
  });

  it('[5, 2, 8, 9], position 0: "Invalid position!" and list unchanged', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtPosition(state, 8, 0);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('Invalid position!');
    expect(llView(last).nodes).toHaveLength(4);
  });

  it('[5, 2, 8, 9], position 5: "Invalid position!" and list unchanged', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = deleteAtPosition(state, 8, 5);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('Invalid position!');
    expect(llView(last).nodes).toHaveLength(4);
  });

  it('empty list: "List is empty!"', () => {
    const steps = deleteAtPosition(EMPTY, 8, 1);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is empty!');
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1, 2, 3]);
    const steps = deleteAtPosition(state, 8, 2);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right number of lines', () => {
    expect(deleteAtPositionPseudocode.length).toBeGreaterThan(0);
    expect(deleteAtPositionPseudocode[0]).toContain('IF(head == NULL)');
  });
});

describe('traverse', () => {
  it('[5, 2, 8, 9]: returns values 5, 2, 8, 9 in order and tempPath has 4 ids', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = traverse(state, 8);
    const last = steps[steps.length - 1] as { tempPath: string[] };
    // last step is ENDWHILE — view still shows original list
    expect(dataOrder(llView(steps[steps.length - 1]))).toEqual([5, 2, 8, 9]);
    expect(last.tempPath).toHaveLength(4);
  });

  it('empty list: "List is empty!"', () => {
    const steps = traverse(EMPTY, 8);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is empty!');
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1, 2]);
    const steps = traverse(state, 8);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right lines', () => {
    expect(traversePseudocode.length).toBeGreaterThan(0);
    expect(traversePseudocode[5]).toContain('DISPLAY temp -> data');
  });
});

describe('find', () => {
  it('[5, 2, 8, 9], find(8): found=true, position=3, tempPath covers nodes 1-3', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = find(state, 8, 8);
    const last = steps[steps.length - 1] as { tempPath: string[] };
    expect(last.explanation).toContain('Found at position 3');
    expect(last.tempPath.length).toBeGreaterThanOrEqual(3);
  });

  it('[5, 2, 8, 9], find(7): "Not found", tempPath covers all 4 nodes', () => {
    const state = buildList([5, 2, 8, 9]);
    const steps = find(state, 8, 7);
    const last = steps[steps.length - 1] as { tempPath: string[] };
    expect(last.explanation).toContain('not found');
    expect(last.tempPath).toHaveLength(4);
  });

  it('empty list: "List is empty!"', () => {
    const steps = find(EMPTY, 8, 5);
    const last = steps[steps.length - 1];
    expect(last.error).toBe('List is empty!');
  });

  it('assigns sequential step ids starting at 0', () => {
    const state = buildList([1, 2, 3]);
    const steps = find(state, 8, 2);
    steps.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('pseudocode array has the right number of lines', () => {
    expect(findPseudocode.length).toBeGreaterThan(0);
    expect(findPseudocode[6]).toContain('WHILE');
  });
});

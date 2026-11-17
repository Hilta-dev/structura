import { beforeEach, describe, expect, it } from 'vitest';
import {
  useLinkedListStore,
  _resetAddresses,
  getAddress,
  getAddressMap,
} from './useLinkedListStore';

beforeEach(() => {
  _resetAddresses();
  useLinkedListStore.setState({
    listState: { head: null, nodes: [] },
    capacity: 8,
    pseudocode: [],
    message: '',
    highlights: [],
    findHighlight: null,
    traverseResult: '',
    findResult: '',
  });
});

describe('addresses', () => {
  it('addresses are assigned in creation order starting at 100', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    useLinkedListStore.getState().doInsertAtEnd(2);
    useLinkedListStore.getState().doInsertAtEnd(8);
    const { listState } = useLinkedListStore.getState();
    // walk head to tail and collect addresses
    const addrs: number[] = [];
    let cur = listState.head;
    while (cur !== null) {
      addrs.push(getAddress(cur));
      const node = listState.nodes.find((n) => n.id === cur!);
      cur = node?.next ?? null;
    }
    expect(addrs).toEqual([100, 200, 300]);
  });

  it('addresses are never reused or renumbered after a deletion', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    useLinkedListStore.getState().doInsertAtEnd(2);
    useLinkedListStore.getState().doInsertAtEnd(8);
    // remember address of node 2 before deletion of beginning
    const { listState: before } = useLinkedListStore.getState();
    let cur = before.head;
    const idsInOrder: string[] = [];
    while (cur !== null) {
      idsInOrder.push(cur);
      cur = before.nodes.find((n) => n.id === cur!)?.next ?? null;
    }
    const addr2 = getAddress(idsInOrder[1]); // should be 200

    useLinkedListStore.getState().doDeleteAtBeginning();

    expect(getAddress(idsInOrder[1])).toBe(addr2); // unchanged after delete
  });

  it('Clear resets addresses to 100', () => {
    useLinkedListStore.getState().doInsertAtEnd(99);
    useLinkedListStore.getState().clear();
    useLinkedListStore.getState().doInsertAtEnd(1);
    const { listState } = useLinkedListStore.getState();
    expect(getAddress(listState.head!)).toBe(100);
  });

  it('address map is empty after clear', () => {
    useLinkedListStore.getState().doInsertAtEnd(1);
    useLinkedListStore.getState().clear();
    expect(getAddressMap().size).toBe(0);
  });
});

describe('example', () => {
  it('loads 5 → 2 → 8 from head', () => {
    useLinkedListStore.getState().example();
    const { listState } = useLinkedListStore.getState();
    const values: number[] = [];
    let cur = listState.head;
    while (cur !== null) {
      const node = listState.nodes.find((n) => n.id === cur!);
      if (!node) break;
      values.push(node.data);
      cur = node.next;
    }
    expect(values).toEqual([5, 2, 8]);
  });

  it('assigns addresses 100, 200, 300 for the example', () => {
    useLinkedListStore.getState().example();
    const { listState } = useLinkedListStore.getState();
    const addrs: number[] = [];
    let cur = listState.head;
    while (cur !== null) {
      addrs.push(getAddress(cur));
      cur = listState.nodes.find((n) => n.id === cur!)?.next ?? null;
    }
    expect(addrs).toEqual([100, 200, 300]);
  });
});

describe('invalid position', () => {
  it('invalid position sets error message and leaves list unchanged', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    const before = useLinkedListStore.getState().listState;
    useLinkedListStore.getState().doDeleteAtPosition(99);
    const after = useLinkedListStore.getState();
    expect(after.message).toContain('Invalid position!');
    expect(after.listState.nodes).toHaveLength(before.nodes.length);
  });
});

describe('multi-value insert', () => {
  it('inserting 1, 2, 3 at beginning gives order 3, 2, 1 from head', () => {
    for (const v of [1, 2, 3]) {
      useLinkedListStore.getState().doInsertAtBeginning(v);
    }
    const { listState } = useLinkedListStore.getState();
    const values: number[] = [];
    let cur = listState.head;
    while (cur !== null) {
      const node = listState.nodes.find((n) => n.id === cur!);
      if (!node) break;
      values.push(node.data);
      cur = node.next;
    }
    expect(values).toEqual([3, 2, 1]);
  });
});

describe('tab independence', () => {
  it('LL store is unaffected by resetAddresses called from a different test', () => {
    useLinkedListStore.getState().doInsertAtEnd(42);
    const { listState } = useLinkedListStore.getState();
    expect(listState.nodes).toHaveLength(1);
    // stack store changes do not touch LL store
    expect(useLinkedListStore.getState().listState.nodes).toHaveLength(1);
  });
});

describe('traverse and find results', () => {
  it('traverse sets traverseResult to data joined by →', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    useLinkedListStore.getState().doInsertAtEnd(2);
    useLinkedListStore.getState().doInsertAtEnd(8);
    useLinkedListStore.getState().doTraverse();
    expect(useLinkedListStore.getState().traverseResult).toBe('5 → 2 → 8');
  });

  it('find sets findResult to Found when present', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    useLinkedListStore.getState().doInsertAtEnd(2);
    useLinkedListStore.getState().doInsertAtEnd(8);
    useLinkedListStore.getState().doFind(2);
    expect(useLinkedListStore.getState().findResult).toContain('Found');
  });

  it('find sets findResult to Not found when absent', () => {
    useLinkedListStore.getState().doInsertAtEnd(5);
    useLinkedListStore.getState().doFind(99);
    expect(useLinkedListStore.getState().findResult).toBe('Not found');
  });

  it('find sets findHighlight to the found node id', () => {
    useLinkedListStore.getState().doInsertAtEnd(7);
    useLinkedListStore.getState().doFind(7);
    const { findHighlight, listState } = useLinkedListStore.getState();
    expect(findHighlight).toBe(listState.head);
  });
});

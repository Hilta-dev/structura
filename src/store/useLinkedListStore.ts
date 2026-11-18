import { create } from 'zustand';
import {
  insertAtBeginning,
  insertAtEnd,
  insertAfterPosition,
  deleteAtBeginning,
  deleteAtEnd,
  deleteAtPosition,
  traverse,
  find,
} from '../engine/linkedList';
import type { LLState } from '../engine/linkedList';
import type { LinkedListView } from '../engine/types';
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

// address helpers – fake 100-based addresses per node id
let _addressCounter = 100;
const _addressMap: Map<string, number> = new Map();

export function _resetAddresses(): void {
  _addressCounter = 100;
  _addressMap.clear();
}

export function getAddress(nodeId: string): number {
  if (!_addressMap.has(nodeId)) {
    _addressMap.set(nodeId, _addressCounter);
    _addressCounter += 100;
  }
  return _addressMap.get(nodeId)!;
}

export function getAddressMap(): ReadonlyMap<string, number> {
  return _addressMap;
}

type LLStep = ReturnType<typeof insertAtBeginning>[number];

type LLStoreState = {
  listState: LLState;
  capacity: number;
  pseudocode: readonly string[];
  message: string;
  // ids of nodes to highlight (visited by temp)
  highlights: string[];
  // id of the specifically found node (null if not a find result)
  findHighlight: string | null;
  traverseResult: string;
  findResult: string;
  // walkthrough: the steps of one operation, shown one at a time
  walkSteps: LLStep[];
  walkIndex: number;
  // the list as it was before the walkthrough started, so Replay can start again
  walkBase: LLState | null;
  walkPlaying: boolean;
};

type LLStoreActions = {
  setCapacity: (cap: number) => void;
  clear: () => void;
  example: () => void;
  doInsertAtBeginning: (data: number) => void;
  doInsertAtEnd: (data: number) => void;
  doInsertAfterPosition: (position: number, data: number) => void;
  doDeleteAtBeginning: () => void;
  doDeleteAtEnd: () => void;
  doDeleteAtPosition: (position: number) => void;
  doTraverse: () => void;
  doFind: (x: number) => void;
  startInsertHeadWalkthrough: (data: number) => void;
  walkGoTo: (index: number) => void;
  walkNext: () => void;
  walkBack: () => void;
  walkToggle: () => void;
};

const EMPTY: LLState = { head: null, nodes: [] };

const WALK_OFF: Pick<LLStoreState, 'walkSteps' | 'walkIndex' | 'walkBase' | 'walkPlaying'> = {
  walkSteps: [],
  walkIndex: 0,
  walkBase: null,
  walkPlaying: false,
};

// the id of the node being inserted in the current walkthrough (null if none)
export function selectWalkNewNodeId(s: LLStoreState): string | null {
  return s.walkSteps.length > 1 ? s.walkSteps[1].highlights[0] ?? null : null;
}

function applyFinal(
  steps: LLStep[],
  pseudocode: readonly string[],
): Partial<LLStoreState> {
  const last = steps[steps.length - 1];
  const v = last.view as LinkedListView;
  return {
    listState: { head: v.head, nodes: v.nodes },
    pseudocode,
    message: last.error ?? last.explanation,
    highlights: [],
    findHighlight: null,
    traverseResult: '',
    findResult: '',
    ...WALK_OFF,
  };
}

function showStep(
  steps: LLStep[],
  index: number,
  pseudocode: readonly string[],
): Partial<LLStoreState> {
  const s = steps[index];
  const v = s.view as LinkedListView;
  return {
    walkIndex: index,
    listState: { head: v.head, nodes: v.nodes },
    pseudocode,
    message: s.error ?? s.explanation,
    highlights: [],
    findHighlight: null,
    traverseResult: '',
    findResult: '',
  };
}

function assignAddresses(state: LLState): void {
  state.nodes.forEach((n) => getAddress(n.id));
}

export const useLinkedListStore = create<LLStoreState & LLStoreActions>((set, get) => ({
  listState: EMPTY,
  capacity: 8,
  pseudocode: [],
  message: '',
  highlights: [],
  findHighlight: null,
  traverseResult: '',
  findResult: '',
  ...WALK_OFF,

  setCapacity: (cap) => {
    _resetAddresses();
    set({ capacity: cap, listState: EMPTY, pseudocode: [], message: '', highlights: [], findHighlight: null, traverseResult: '', findResult: '', ...WALK_OFF });
  },

  clear: () => {
    _resetAddresses();
    set({ listState: EMPTY, pseudocode: [], message: '', highlights: [], findHighlight: null, traverseResult: '', findResult: '', ...WALK_OFF });
  },

  example: () => {
    _resetAddresses();
    const cap = get().capacity;
    // insert 5, 2, 8 via insertAtEnd to get the lecture list in order
    let state = EMPTY;
    for (const v of [5, 2, 8]) {
      const steps = insertAtEnd(state, cap, v);
      const last = steps[steps.length - 1];
      const view = last.view as LinkedListView;
      if (!last.error) state = { head: view.head, nodes: view.nodes };
    }
    assignAddresses(state);
    set({
      listState: state,
      pseudocode: insertAtEndPseudocode,
      message: 'Example loaded: 5 → 2 → 8',
      highlights: [],
      findHighlight: null,
      traverseResult: '',
      findResult: '',
      ...WALK_OFF,
    });
  },

  doInsertAtBeginning: (data) => {
    const { listState, capacity } = get();
    const steps = insertAtBeginning(listState, capacity, data);
    const last = steps[steps.length - 1];
    if (!last.error) assignAddresses(last.view as LinkedListView);
    set(applyFinal(steps, insertAtBeginningPseudocode));
  },

  doInsertAtEnd: (data) => {
    const { listState, capacity } = get();
    const steps = insertAtEnd(listState, capacity, data);
    const last = steps[steps.length - 1];
    if (!last.error) assignAddresses(last.view as LinkedListView);
    set(applyFinal(steps, insertAtEndPseudocode));
  },

  doInsertAfterPosition: (position, data) => {
    const { listState, capacity } = get();
    const steps = insertAfterPosition(listState, capacity, position, data);
    const last = steps[steps.length - 1];
    if (!last.error) assignAddresses(last.view as LinkedListView);
    set(applyFinal(steps, insertAfterPositionPseudocode));
  },

  doDeleteAtBeginning: () => {
    const { listState, capacity } = get();
    const steps = deleteAtBeginning(listState, capacity);
    set(applyFinal(steps, deleteAtBeginningPseudocode));
  },

  doDeleteAtEnd: () => {
    const { listState, capacity } = get();
    const steps = deleteAtEnd(listState, capacity);
    set(applyFinal(steps, deleteAtEndPseudocode));
  },

  doDeleteAtPosition: (position) => {
    const { listState, capacity } = get();
    const steps = deleteAtPosition(listState, capacity, position);
    set(applyFinal(steps, deleteAtPositionPseudocode));
  },

  doTraverse: () => {
    const { listState, capacity } = get();
    const steps = traverse(listState, capacity);
    const last = steps[steps.length - 1];
    const v = last.view as LinkedListView;
    let result = '';
    if (!last.error) {
      const parts: string[] = [];
      let cur = v.head;
      while (cur !== null) {
        const node = v.nodes.find((n) => n.id === cur!);
        if (!node) break;
        parts.push(String(node.data));
        cur = node.next;
      }
      result = parts.join(' → ');
    }
    // highlight all nodes as visited
    const visitedIds = !last.error ? v.nodes.map((n) => n.id) : [];
    set({
      ...applyFinal(steps, traversePseudocode),
      highlights: visitedIds,
      traverseResult: result,
    });
  },

  doFind: (x) => {
    const { listState, capacity } = get();
    const steps = find(listState, capacity, x);
    const last = steps[steps.length - 1];
    const tempPath = (last as { tempPath?: string[] }).tempPath ?? [];
    const isFound = !last.error && last.explanation.includes('Found at position');
    const foundNodeId = isFound ? tempPath[tempPath.length - 1] : null;
    const findResult = last.error
      ? ''
      : isFound
      ? last.explanation
      : 'Not found';
    set({
      ...applyFinal(steps, findPseudocode),
      highlights: tempPath,
      findHighlight: foundNodeId,
      findResult,
    });
  },

  startInsertHeadWalkthrough: (data) => {
    const { walkBase, walkSteps, listState, capacity } = get();
    // if a walkthrough is already showing, start again from the list before it
    const base = walkSteps.length > 0 && walkBase ? walkBase : listState;
    const steps = insertAtBeginning(base, capacity, data);
    const final = steps[steps.length - 1];
    if (!final.error) assignAddresses(final.view as LinkedListView);
    set({
      walkSteps: steps,
      walkBase: base,
      walkPlaying: false,
      ...showStep(steps, 0, insertAtBeginningPseudocode),
    });
  },

  walkGoTo: (index) => {
    const { walkSteps, pseudocode } = get();
    if (walkSteps.length === 0) return;
    const i = Math.max(0, Math.min(index, walkSteps.length - 1));
    const atEnd = i === walkSteps.length - 1;
    set({
      ...showStep(walkSteps, i, pseudocode),
      ...(atEnd ? { walkPlaying: false } : {}),
    });
  },

  walkNext: () => get().walkGoTo(get().walkIndex + 1),

  walkBack: () => get().walkGoTo(get().walkIndex - 1),

  walkToggle: () => {
    const { walkSteps, walkIndex, walkPlaying } = get();
    if (walkSteps.length === 0) return;
    if (walkPlaying) {
      set({ walkPlaying: false });
      return;
    }
    if (walkIndex >= walkSteps.length - 1) get().walkGoTo(0);
    set({ walkPlaying: true });
  },
}));
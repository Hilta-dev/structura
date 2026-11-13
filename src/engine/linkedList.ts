import type { Step, LinkedListView, LinkedListNode } from './types';

export type { LinkedListNode };
export type LLState = { head: string | null; nodes: LinkedListNode[] };

// helpers

let _nextId = 0;
/** Reset the internal id counter – call only from tests. */
export function _resetId(): void {
  _nextId = 0;
}

function newId(): string {
  return String(++_nextId);
}

function listLength(state: LLState): number {
  let count = 0;
  let cur = state.head;
  while (cur !== null) {
    cur = state.nodes.find((n) => n.id === cur!)?.next ?? null;
    count++;
  }
  return count;
}

function view(state: LLState, capacity: number): LinkedListView {
  return { kind: 'linkedList', head: state.head, nodes: state.nodes, capacity };
}

function step(
  id: number,
  codeLine: number,
  explanation: string,
  highlights: string[],
  counters: { visited: number; changes: number },
  tempPath: string[],
  state: LLState,
  capacity: number,
  error?: string,
): Step & { tempPath: string[] } {
  return {
    id,
    codeLine,
    explanation,
    highlights,
    counters,
    tempPath,
    ...(error !== undefined ? { error } : {}),
    view: view(state, capacity),
  };
}

type LLStep = Step & { tempPath: string[] };

/** Insert a new node at the beginning of the list. */
export function insertAtBeginning(
  state: LLState,
  capacity: number,
  data: number,
): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – display prompt
  steps.push(step(id++, 1, 'Insert at beginning.', [], { visited: 0, changes: 0 }, [], state, capacity));

  if (listLength(state) >= capacity) {
    steps.push(step(id++, 1, 'List is full!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is full!'));
    return steps;
  }

  // line 2 – create newNode with data
  const newNode: LinkedListNode = { id: newId(), data, next: state.head };
  steps.push(step(id++, 2, `newNode -> data = ${data}.`, [newNode.id], { visited: 0, changes: 0 }, [], state, capacity));

  // line 3 – newNode -> next = head
  steps.push(step(id++, 3, `newNode -> next = head (${state.head ?? 'NULL'}).`, [newNode.id], { visited: 0, changes: 0 }, [], state, capacity));

  // line 4 – head = newNode
  const newState: LLState = {
    head: newNode.id,
    nodes: [newNode, ...state.nodes],
  };
  steps.push(step(id++, 4, `head = newNode. head is now ${newNode.id} (data=${data}).`, [newNode.id], { visited: 0, changes: 1 }, [], newState, capacity));

  return steps;
}

/** Insert a new node at the end of the list. */
export function insertAtEnd(
  state: LLState,
  capacity: number,
  data: number,
): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – display prompt
  steps.push(step(id++, 1, 'Insert at end.', [], { visited: 0, changes: 0 }, [], state, capacity));

  if (listLength(state) >= capacity) {
    steps.push(step(id++, 1, 'List is full!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is full!'));
    return steps;
  }

  // line 2 – create newNode
  const newNode: LinkedListNode = { id: newId(), data, next: null };
  steps.push(step(id++, 2, `newNode -> data = ${data}.`, [newNode.id], { visited: 0, changes: 0 }, [], state, capacity));

  // line 3 – newNode -> next = NULL
  steps.push(step(id++, 3, 'newNode -> next = NULL.', [newNode.id], { visited: 0, changes: 0 }, [], state, capacity));

  // line 4 – IF head == NULL
  steps.push(step(id++, 4, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 5 – head = newNode (empty list)
    const newState: LLState = { head: newNode.id, nodes: [newNode] };
    steps.push(step(id++, 5, `head = newNode. head is now ${newNode.id} (data=${data}).`, [newNode.id], { visited: 0, changes: 1 }, [], newState, capacity));
    return steps;
  }

  // line 7 – temp = head
  const tempPath: string[] = [];
  let tempId = state.head;
  tempPath.push(tempId);
  steps.push(step(id++, 7, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  // line 8/9 – walk to last node
  let tempNode = state.nodes.find((n) => n.id === tempId)!;
  while (tempNode.next !== null) {
    // line 8 – check temp -> next != NULL
    steps.push(step(id++, 8, `temp -> next = ${tempNode.next}, not NULL. Continue.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 9 – temp = temp -> next
    tempId = tempNode.next;
    tempPath.push(tempId);
    tempNode = state.nodes.find((n) => n.id === tempId)!;
    steps.push(step(id++, 9, `temp = temp -> next (node ${tempId}, data=${tempNode.data}).`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  // line 10 – ENDWHILE (temp -> next == NULL)
  steps.push(step(id++, 10, `temp -> next = NULL. End of list reached at node ${tempId}.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 11 – temp -> next = newNode
  const newNodes = state.nodes.map((n) => n.id === tempId ? { ...n, next: newNode.id } : n);
  newNodes.push(newNode);
  const newState: LLState = { head: state.head, nodes: newNodes };
  steps.push(step(id++, 11, `temp -> next = newNode. ${newNode.id} (data=${data}) added at end.`, [tempId, newNode.id], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));

  return steps;
}

/** Insert a new node after the node at the given 1-based position. */
export function insertAfterPosition(
  state: LLState,
  capacity: number,
  position: number,
  data: number,
): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;
  const len = listLength(state);

  // line 1 – i = 1
  steps.push(step(id++, 1, 'i = 1.', [], { visited: 0, changes: 0 }, [], state, capacity));

  // line 2/3 – display / get position
  steps.push(step(id++, 2, 'Display prompt for position.', [], { visited: 0, changes: 0 }, [], state, capacity));
  steps.push(step(id++, 3, `position = ${position}.`, [], { visited: 0, changes: 0 }, [], state, capacity));

  // line 4 – IF invalid position
  steps.push(step(id++, 4, `Check: position (${position}) > listLength (${len}) OR position < 1?`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (position < 1 || position > len) {
    // line 5 – invalid
    steps.push(step(id++, 5, 'Invalid position!', [], { visited: 0, changes: 0 }, [], state, capacity, 'Invalid position!'));
    return steps;
  }

  if (listLength(state) >= capacity) {
    steps.push(step(id++, 5, 'List is full!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is full!'));
    return steps;
  }

  // line 7 – temp = head
  const tempPath: string[] = [];
  let tempId = state.head!;
  tempPath.push(tempId);
  let i = 1;
  steps.push(step(id++, 7, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  // line 8/9/10 – walk to position
  while (i < position) {
    const cur = state.nodes.find((n) => n.id === tempId)!;
    // line 8 – check i < position
    steps.push(step(id++, 8, `i (${i}) < position (${position}). Continue.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 9 – temp = temp -> next
    tempId = cur.next!;
    tempPath.push(tempId);
    // line 10 – i = i + 1
    i++;
    steps.push(step(id++, 9, `temp = temp -> next (node ${tempId}).`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    steps.push(step(id++, 10, `i = ${i}.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  // line 11 – ENDWHILE
  steps.push(step(id++, 11, `i (${i}) == position (${position}). End WHILE.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 12/13 – get new node data
  const tempNode = state.nodes.find((n) => n.id === tempId)!;
  const newNode: LinkedListNode = { id: newId(), data, next: tempNode.next };
  steps.push(step(id++, 12, 'Display prompt for data.', [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  steps.push(step(id++, 13, `newNode -> data = ${data}.`, [newNode.id], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 14 – newNode -> next = temp -> next
  steps.push(step(id++, 14, `newNode -> next = temp -> next (${tempNode.next ?? 'NULL'}).`, [newNode.id], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 15 – temp -> next = newNode
  const newNodes = state.nodes.map((n) => n.id === tempId ? { ...n, next: newNode.id } : n);
  newNodes.push(newNode);
  const newState: LLState = { head: state.head, nodes: newNodes };
  steps.push(step(id++, 15, `temp -> next = newNode. ${newNode.id} (data=${data}) inserted after position ${position}.`, [tempId, newNode.id], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));

  return steps;
}

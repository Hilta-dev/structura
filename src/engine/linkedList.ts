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

/** Delete the node at the beginning of the list. */
export function deleteAtBeginning(state: LLState, capacity: number): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – check empty
  steps.push(step(id++, 1, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 2 – list is empty
    steps.push(step(id++, 2, 'List is empty!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is empty!'));
    return steps;
  }

  const tempId = state.head;
  const tempNode = state.nodes.find((n) => n.id === tempId)!;

  // line 4 – temp = head
  steps.push(step(id++, 4, `temp = head (node ${tempId}, data=${tempNode.data}).`, [tempId], { visited: 1, changes: 0 }, [tempId], state, capacity));

  // line 5 – head = head -> next
  const newHead = tempNode.next;
  steps.push(step(id++, 5, `head = head -> next (${newHead ?? 'NULL'}).`, newHead ? [newHead] : [], { visited: 1, changes: 0 }, [tempId], state, capacity));

  // line 6 – free temp
  const newNodes = state.nodes.filter((n) => n.id !== tempId);
  const newState: LLState = { head: newHead, nodes: newNodes };
  steps.push(step(id++, 6, `Node ${tempId} (data=${tempNode.data}) deleted.`, [], { visited: 1, changes: 1 }, [tempId], newState, capacity));

  return steps;
}

/** Delete the node at the end of the list. */
export function deleteAtEnd(state: LLState, capacity: number): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – check empty
  steps.push(step(id++, 1, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 2 – list is empty
    steps.push(step(id++, 2, 'List is empty!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is empty!'));
    return steps;
  }

  // line 4 – temp = head
  const tempPath: string[] = [];
  let tempId = state.head;
  tempPath.push(tempId);
  steps.push(step(id++, 4, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  let prevId: string | null = null;
  let tempNode = state.nodes.find((n) => n.id === tempId)!;

  // line 5-8 – walk to last node
  while (tempNode.next !== null) {
    // line 5 – check temp -> next != NULL
    steps.push(step(id++, 5, `temp -> next = ${tempNode.next}, not NULL. Continue.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 6 – prevNode = temp
    prevId = tempId;
    steps.push(step(id++, 6, `prevNode = temp (node ${prevId}).`, [prevId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 7 – temp = temp -> next
    tempId = tempNode.next;
    tempPath.push(tempId);
    tempNode = state.nodes.find((n) => n.id === tempId)!;
    steps.push(step(id++, 7, `temp = temp -> next (node ${tempId}, data=${tempNode.data}).`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  // line 8 – ENDWHILE
  steps.push(step(id++, 8, `temp -> next = NULL. Last node is ${tempId} (data=${tempNode.data}).`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 9 – IF temp == head (single node)
  steps.push(step(id++, 9, `Check: temp == head? (${tempId} == ${state.head}?)`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  let newState: LLState;
  if (tempId === state.head) {
    // line 10 – head = NULL
    newState = { head: null, nodes: [] };
    steps.push(step(id++, 10, 'Only one node. head = NULL.', [], { visited: 1, changes: 1 }, [...tempPath], newState, capacity));
  } else {
    // line 12 – prevNode -> next = NULL
    const newNodes = state.nodes
      .filter((n) => n.id !== tempId)
      .map((n) => n.id === prevId ? { ...n, next: null } : n);
    newState = { head: state.head, nodes: newNodes };
    steps.push(step(id++, 12, `prevNode (${prevId}) -> next = NULL.`, prevId ? [prevId] : [], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));
  }

  // line 14 – free temp
  steps.push(step(id++, 14, `Node ${tempId} (data=${tempNode.data}) deleted.`, [], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));

  return steps;
}

/** Delete the node at the given 1-based position. */
export function deleteAtPosition(state: LLState, capacity: number, position: number): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;
  const len = listLength(state);

  // line 1 – check empty
  steps.push(step(id++, 1, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 2 – list is empty
    steps.push(step(id++, 2, 'List is empty!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is empty!'));
    return steps;
  }

  // line 4/5 – display / get position
  steps.push(step(id++, 4, 'Display prompt for position.', [], { visited: 0, changes: 0 }, [], state, capacity));
  steps.push(step(id++, 5, `position = ${position}.`, [], { visited: 0, changes: 0 }, [], state, capacity));

  // line 6 – check invalid
  steps.push(step(id++, 6, `Check: position (${position}) > listLength (${len}) OR position < 1?`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (position < 1 || position > len) {
    // line 7 – invalid
    steps.push(step(id++, 7, 'Invalid position!', [], { visited: 0, changes: 0 }, [], state, capacity, 'Invalid position!'));
    return steps;
  }

  // line 8 – ELSEIF position == 1 → delegate
  steps.push(step(id++, 8, `Check: position == 1? (${position} == 1?)`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (position === 1) {
    // line 9 – call deleteAtBeginning
    steps.push(step(id++, 9, 'position == 1, calling deleteAtBeginning().', [], { visited: 0, changes: 0 }, [], state, capacity));
    const subSteps = deleteAtBeginning(state, capacity);
    return [...steps, ...subSteps];
  }

  // line 11 – i = 1
  let i = 1;
  steps.push(step(id++, 11, 'i = 1.', [], { visited: 0, changes: 0 }, [], state, capacity));

  // line 12 – temp = head
  const tempPath: string[] = [];
  let tempId = state.head;
  tempPath.push(tempId);
  steps.push(step(id++, 12, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  // line 13-15 – walk to node BEFORE position
  while (i < position - 1) {
    const cur = state.nodes.find((n) => n.id === tempId)!;
    steps.push(step(id++, 13, `i (${i}) < position - 1 (${position - 1}). Continue.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    tempId = cur.next!;
    tempPath.push(tempId);
    i++;
    steps.push(step(id++, 14, `temp = temp -> next (node ${tempId}).`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    steps.push(step(id++, 15, `i = ${i}.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  // line 16 – ENDWHILE
  steps.push(step(id++, 16, `i (${i}) == position - 1 (${position - 1}). End WHILE.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 17 – nextNode = temp -> next (the node to delete)
  const tempNode = state.nodes.find((n) => n.id === tempId)!;
  const nextId = tempNode.next!;
  const nextNode = state.nodes.find((n) => n.id === nextId)!;
  steps.push(step(id++, 17, `nextNode = temp -> next (node ${nextId}, data=${nextNode.data}).`, [nextId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 18 – temp -> next = nextNode -> next
  const afterNextId = nextNode.next;
  const newNodes = state.nodes
    .filter((n) => n.id !== nextId)
    .map((n) => n.id === tempId ? { ...n, next: afterNextId } : n);
  const newState: LLState = { head: state.head, nodes: newNodes };
  steps.push(step(id++, 18, `temp -> next = nextNode -> next (${afterNextId ?? 'NULL'}).`, [tempId], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));

  // line 19 – free nextNode
  steps.push(step(id++, 19, `Node ${nextId} (data=${nextNode.data}) at position ${position} deleted.`, [], { visited: tempPath.length, changes: 1 }, [...tempPath], newState, capacity));

  return steps;
}

/** Traverse the list and return all data values in order. */
export function traverse(state: LLState, capacity: number): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – check empty
  steps.push(step(id++, 1, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 2 – list is empty
    steps.push(step(id++, 2, 'List is empty!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is empty!'));
    return steps;
  }

  // line 4 – temp = head
  const tempPath: string[] = [];
  let tempId: string | null = state.head;
  tempPath.push(tempId);
  steps.push(step(id++, 4, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  // line 5-7 – walk and display
  let tempNode = state.nodes.find((n) => n.id === tempId)!;
  while (tempId !== null) {
    // line 5 – check temp != NULL
    steps.push(step(id++, 5, `temp != NULL. Continue.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 6 – display data
    steps.push(step(id++, 6, `Display temp -> data = ${tempNode.data}.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 7 – temp = temp -> next
    const nextId = tempNode.next;
    tempId = nextId;
    if (tempId !== null) {
      tempPath.push(tempId);
      tempNode = state.nodes.find((n) => n.id === tempId!)!;
    }
    steps.push(step(id++, 7, `temp = temp -> next (${tempId ?? 'NULL'}).`, tempId ? [tempId] : [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  // line 8 – ENDWHILE (temp == NULL)
  steps.push(step(id++, 8, 'temp == NULL. Traversal complete.', [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  return steps;
}

/** Find x in the list and return its 1-based position. */
export function find(state: LLState, capacity: number, x: number): LLStep[] {
  const steps: LLStep[] = [];
  let id = 0;

  // line 1 – check empty
  steps.push(step(id++, 1, `Check: head == NULL? (head is ${state.head ?? 'NULL'})`, [], { visited: 0, changes: 0 }, [], state, capacity));

  if (state.head === null) {
    // line 2 – list is empty
    steps.push(step(id++, 2, 'List is empty!', [], { visited: 0, changes: 0 }, [], state, capacity, 'List is empty!'));
    return steps;
  }

  // line 4-6 – temp = head, position = 1, found = FALSE
  let tempId: string | null = state.head;
  let position = 1;
  let found = false;
  const tempPath: string[] = [];
  tempPath.push(tempId);
  steps.push(step(id++, 4, `temp = head (node ${tempId}).`, [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));
  steps.push(step(id++, 5, 'position = 1.', [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));
  steps.push(step(id++, 6, 'found = FALSE.', [tempId], { visited: 1, changes: 0 }, [...tempPath], state, capacity));

  // line 7-13 – search loop
  while (tempId !== null && !found) {
    const tempNode = state.nodes.find((n) => n.id === tempId!)!;
    // line 7 – check while condition
    steps.push(step(id++, 7, `temp != NULL AND found == FALSE. Check data.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    // line 8 – IF temp -> data == x
    steps.push(step(id++, 8, `temp -> data (${tempNode.data}) == x (${x})?`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

    if (tempNode.data === x) {
      // line 9 – found = TRUE
      found = true;
      steps.push(step(id++, 9, `Match! found = TRUE at position ${position}.`, [tempId], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    } else {
      // line 11 – temp = temp -> next
      const nextId = tempNode.next;
      tempId = nextId;
      if (tempId !== null) {
        tempPath.push(tempId);
      }
      position++;
      steps.push(step(id++, 11, `No match. temp = temp -> next (${tempId ?? 'NULL'}).`, tempId ? [tempId] : [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
      // line 12 – position = position + 1
      steps.push(step(id++, 12, `position = ${position}.`, tempId ? [tempId] : [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
    }
  }

  // line 14 – ENDWHILE
  steps.push(step(id++, 14, `End WHILE. found = ${found}.`, [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));

  // line 15 – final result
  if (found) {
    // line 16
    steps.push(step(id++, 16, `Found at position ${position}.`, [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  } else {
    // line 18
    steps.push(step(id++, 18, `x = ${x} not found in list.`, [], { visited: tempPath.length, changes: 0 }, [...tempPath], state, capacity));
  }

  return steps;
}

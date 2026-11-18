export type ListView = { kind: 'list' };

export type LinkedListNode = { id: string; data: number; next: string | null };
export type LinkedListView = {
  kind: 'linkedList';
  head: string | null;
  nodes: LinkedListNode[];
  capacity: number;
};
export type StackView = {
  kind: 'stack';
  items: { id: string; value: number }[];
  capacity: number;
};
export type QueueView = {
  kind: 'queue';
  items: { id: string; value: number }[];
  front: number;
  rear: number;
  capacity: number;
};

export type Step = {
  id: number;
  codeLine: number;
  explanation: string;
  highlights: string[];
  counters: { visited: number; changes: number };
  error?: string;
  view: ListView | StackView | QueueView | LinkedListView;
};

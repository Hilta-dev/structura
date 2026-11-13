export type ListView = { kind: 'list' };
export type StackView = {
  kind: 'stack';
  items: { id: string; value: number }[];
  capacity: number;
};
export type QueueView = { kind: 'queue' };

export type Step = {
  id: number;
  codeLine: number;
  explanation: string;
  highlights: string[];
  counters: { visited: number; changes: number };
  error?: string;
  view: ListView | StackView | QueueView;
};

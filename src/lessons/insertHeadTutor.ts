export type TutorEntry = {
  insight: string;
  explain: string;
  hint:    string;
};

export const insertHeadTutor: readonly TutorEntry[] = [
  {
    // step 0 — Ready
    insight: 'The head is your entry point. Start here, then watch how inserting 42 changes just two references.',
    explain: 'Head is the entry point to the list. Every operation starts there. Inserting at head changes only two references, so it stays O(1).',
    hint:    'Look at the list. Which node does head point to?',
  },
  {
    // step 1 — Allocate
    insight: 'The new node exists, but nothing points to it yet. The original chain is untouched.',
    explain: 'Allocate makes room for a new node and sets its next to null. It is in memory, but nothing points to it yet, so the list cannot reach it.',
    hint:    'Is anything pointing at the new node yet? Follow the arrows from head.',
  },
  {
    // step 2 — Link next
    insight: 'Connect before you redirect. Giving 42 a next reference first keeps the old chain within reach.',
    explain: 'Think of head as the front door. First, give 42 a door to the old first node: new.next ← head. Only then move the front door: head ← new. If you moved head first, you could lose the only reference to 12.',
    hint:    'Which should change first: head, or the new node\'s next?',
  },
  {
    // step 3 — Move head
    insight: 'Now start at head: 42 → 12 → 27 → 36 → null. All four nodes are reachable.',
    explain: 'Now head points to 42, and 42 points to 12. Follow head → 42 → 12 → 27 → 36 → null. Nothing was lost.',
    hint:    'Start at head and follow next. Can you reach every node?',
  },
];

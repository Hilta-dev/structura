// Course-style pseudocode for queue operations.
// codeLine values in queue.ts refer to 1-based line numbers within each array.

export const enqueuePseudocode: readonly string[] = [
  'enqueue(data){',                                      // 1
  '  IF(rear == size - 1) THEN //check if the queue is full', // 2
  '    DISPLAY "Queue is full!"',                        // 3
  '  ELSE',                                              // 4
  '    rear++ //move rear pointer forward',              // 5
  '    queue[rear] = data //insert element at rear',     // 6
  '  ENDIF',                                             // 7
  '}',                                                   // 8
];

export const dequeuePseudocode: readonly string[] = [
  'dequeue(){',                                          // 1
  '  IF(front > rear) THEN //check if the queue is empty', // 2
  '    DISPLAY "Queue is empty!"',                       // 3
  '  ELSE',                                              // 4
  '    dequeuedElement = queue[front]',                  // 5
  '    front++ //move front pointer forward',            // 6
  '    DISPLAY "The dequeued element is: " + dequeuedElement', // 7
  '  ENDIF',                                             // 8
  '}',                                                   // 9
];

export const peekPseudocode: readonly string[] = [
  'peek(){',                                             // 1
  '  IF(front > rear) THEN //check if the queue is empty', // 2
  '    DISPLAY "Queue is empty!"',                       // 3
  '  ELSE',                                              // 4
  '    DISPLAY "Front element is: " + queue[front] //display front element', // 5
  '  ENDIF',                                             // 6
  '}',                                                   // 7
];

export const isEmptyPseudocode: readonly string[] = [
  'procedure IS_EMPTY(queue)',   // 1
  '  return front > rear',       // 2
  'end procedure',               // 3
];

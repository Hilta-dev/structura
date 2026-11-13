// Course-style pseudocode for stack operations.
// codeLine values in stack.ts refer to 1-based line numbers within each array.

export const pushPseudocode: readonly string[] = [
  'push(data){',                              // 1
  '  IF(top == size - 1) THEN //check if the stack is full', // 2
  '    DISPLAY "Stack is full!"',             // 3
  '  ELSE',                                   // 4
  '    top++ //move top up by one',           // 5
  '    stack[top] = data //insert element in stack', // 6
  '  ENDIF',                                  // 7
  '}',                                        // 8
];

export const popPseudocode: readonly string[] = [
  'pop(){',                                   // 1
  '  IF(top == -1) THEN //check if the stack is empty', // 2
  '    DISPLAY "Stack is empty!"',            // 3
  '  ELSE',                                   // 4
  '    poppedElement = stack[top]',           // 5
  '    top-- //remove top element',           // 6
  '    DISPLAY "The popped element is: " + poppedElement', // 7
  '  ENDIF',                                  // 8
  '}',                                        // 9
];

export const peekPseudocode: readonly string[] = [
  'peek(){',                                  // 1
  '  IF(top == -1) THEN //check if the stack is empty', // 2
  '    DISPLAY "Stack is empty!"',            // 3
  '  ELSE',                                   // 4
  '    DISPLAY "Top element is: " + stack[top] //display top element', // 5
  '  ENDIF',                                  // 6
  '}',                                        // 7
];

export const isEmptyPseudocode: readonly string[] = [
  'procedure IS_EMPTY(stack)',       // 1
  '  return top == -1',             // 2
  'end procedure',                  // 3
];

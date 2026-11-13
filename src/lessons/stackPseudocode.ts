// Course-style pseudocode for stack operations.
// codeLine values in stack.ts refer to 1-based line numbers within each array.

export const pushPseudocode: readonly string[] = [
  'procedure PUSH(stack, value)',   // 1
  '  if stack.size = stack.capacity then', // 2
  '    error "stack overflow"',     // 3
  '  end if',                       // 4
  '  stack.top ← stack.top + 1',   // 5
  '  stack[stack.top] ← value',    // 6
  'end procedure',                  // 7
];

export const popPseudocode: readonly string[] = [
  'procedure POP(stack)',            // 1
  '  if stack.top = 0 then',        // 2
  '    error "stack underflow"',    // 3
  '  end if',                       // 4
  '  value ← stack[stack.top]',    // 5
  '  stack.top ← stack.top - 1',   // 6
  '  return value',                 // 7
  'end procedure',                  // 8
];

export const peekPseudocode: readonly string[] = [
  'procedure PEEK(stack)',           // 1
  '  if stack.top = 0 then',        // 2
  '    error "stack underflow"',    // 3
  '  end if',                       // 4
  '  return stack[stack.top]',     // 5
  'end procedure',                  // 6
];

export const isEmptyPseudocode: readonly string[] = [
  'procedure IS_EMPTY(stack)',       // 1
  '  return stack.top = 0',         // 2
  'end procedure',                  // 3
];

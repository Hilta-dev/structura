// Course-style pseudocode for singly linked list operations.
// codeLine values in linkedList.ts refer to 1-based line numbers within each array.

export const insertAtBeginningPseudocode: readonly string[] = [
  'DISPLAY "Enter the data you want to insert"',  // 1
  'GET newNode -> data',                           // 2
  'newNode -> next = head',                        // 3
  'head = newNode',                                // 4
];

export const insertAtEndPseudocode: readonly string[] = [
  'DISPLAY "Enter the data you want to insert"',  // 1
  'GET newNode -> data',                           // 2
  'newNode -> next = NULL',                        // 3
  'IF(head == NULL) THEN',                         // 4
  '   head = newNode',                             // 5
  'ELSE',                                          // 6
  '   temp = head',                                // 7
  '   WHILE(temp -> next != NULL)',                // 8
  '      temp = temp -> next',                     // 9
  '   ENDWHILE',                                   // 10
  '   temp -> next = newNode',                     // 11
  'ENDIF',                                         // 12
];

export const insertAfterPositionPseudocode: readonly string[] = [
  'i = 1',                                                              // 1
  'DISPLAY "Enter the position to insert the data"',                   // 2
  'GET position',                                                       // 3
  'IF(position > listLength OR position < 1) THEN',                    // 4
  '   DISPLAY "Invalid position!"',                                    // 5
  'ELSE',                                                               // 6
  '   temp = head',                                                     // 7
  '   WHILE(i < position)',                                             // 8
  '      temp = temp -> next',                                          // 9
  '      i = i + 1',                                                    // 10
  '   ENDWHILE',                                                        // 11
  '   DISPLAY "Enter the data you want to insert"',                    // 12
  '   GET newNode -> data',                                             // 13
  '   newNode -> next = temp -> next',                                  // 14
  '   temp -> next = newNode',                                          // 15
  'ENDIF',                                                              // 16
];

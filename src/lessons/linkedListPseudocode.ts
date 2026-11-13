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

export const deleteAtBeginningPseudocode: readonly string[] = [
  'IF(head == NULL) THEN',                                      // 1
  '   DISPLAY "List is empty!"',                               // 2
  'ELSE',                                                       // 3
  '   temp = head',                                            // 4
  '   head = head -> next',                                    // 5
  '   temp = free //completely delete node (free(temp))',      // 6
  'ENDIF',                                                      // 7
];

export const deleteAtEndPseudocode: readonly string[] = [
  'IF(head == NULL) THEN',                                      // 1
  '   DISPLAY "List is empty!"',                               // 2
  'ELSE',                                                       // 3
  '   temp = head',                                            // 4
  '   WHILE(temp -> next != NULL)',                            // 5
  '      prevNode = temp',                                     // 6
  '      temp = temp -> next',                                 // 7
  '   ENDWHILE',                                               // 8
  '   IF(temp == head) THEN',                                  // 9
  '      head = NULL',                                         // 10
  '   ELSE',                                                   // 11
  '      prevNode -> next = NULL',                             // 12
  '   ENDIF',                                                  // 13
  '   temp = free //completely delete node (free(temp))',      // 14
  'ENDIF',                                                      // 15
];

export const deleteAtPositionPseudocode: readonly string[] = [
  'IF(head == NULL) THEN',                                              // 1
  '   DISPLAY "List is empty!"',                                       // 2
  'ELSE',                                                               // 3
  '   DISPLAY "Enter position where you want to delete"',              // 4
  '   GET position',                                                   // 5
  '   IF(position > listLength OR position < 1) THEN',                // 6
  '      DISPLAY "Invalid position!"',                                 // 7
  '   ELSEIF(position == 1) THEN',                                     // 8
  '      deleteAtBeginning()',                                         // 9
  '   ELSE',                                                           // 10
  '      i = 1',                                                       // 11
  '      temp = head',                                                 // 12
  '      WHILE(i < position - 1)',                                     // 13
  '         temp = temp -> next',                                      // 14
  '         i = i + 1',                                                // 15
  '      ENDWHILE',                                                    // 16
  '      nextNode = temp -> next',                                     // 17
  '      temp -> next = nextNode -> next',                             // 18
  '      nextNode = free //completely delete node (free(nextNode))',   // 19
  '   ENDIF',                                                          // 20
  'ENDIF',                                                              // 21
];

export const traversePseudocode: readonly string[] = [
  'IF(head == NULL) THEN',                     // 1
  '   DISPLAY "List is empty!"',              // 2
  'ELSE',                                      // 3
  '   temp = head',                           // 4
  '   WHILE(temp != NULL)',                   // 5
  '      DISPLAY temp -> data',              // 6
  '      temp = temp -> next',               // 7
  '   ENDWHILE',                              // 8
  'ENDIF',                                    // 9
];

export const findPseudocode: readonly string[] = [
  'IF(head == NULL) THEN',                              // 1
  '   DISPLAY "List is empty!"',                       // 2
  'ELSE',                                               // 3
  '   temp = head',                                    // 4
  '   position = 1',                                   // 5
  '   found = FALSE',                                  // 6
  '   WHILE(temp != NULL AND found == FALSE)',         // 7
  '      IF(temp -> data == x) THEN',                 // 8
  '         found = TRUE',                             // 9
  '      ELSE',                                        // 10
  '         temp = temp -> next',                      // 11
  '         position = position + 1',                  // 12
  '      ENDIF',                                       // 13
  '   ENDWHILE',                                       // 14
  '   IF(found == TRUE) THEN',                        // 15
  '      DISPLAY "Found at position", position',      // 16
  '   ELSE',                                           // 17
  '      DISPLAY "Not found"',                        // 18
  '   ENDIF',                                          // 19
  'ENDIF',                                             // 20
];

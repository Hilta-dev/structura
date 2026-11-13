# STRUCTURA rules

A 3D playground for lists, stacks and queues, with an AI tutor.

## Layers (never mix them)
- engine/ is pure TypeScript. It knows nothing about React or Three.js.
- store/ (Zustand) holds steps, currentStep, isPlaying, speed.
- scene/ and components/ only draw the current step. No logic in them.
- Rewind means going to an earlier step. Never re-run an operation.

## Rules
- Every operation returns a list of Step objects (see src/engine/types.ts).
- The AI explains only. The engine is the source of truth.
- The AI key lives only in api/tutor.ts. Never in the frontend. Never committed.
- Keep inputs small (8 to 10 items).
- Write Vitest tests for every engine function.
- Pseudocode is course-style and hand-written. It is not executed.

## Working style
- One small piece at a time. Run it. Commit it.
- Do not rewrite whole files. Change only what is needed.

- Comments: plain short // comments only, and only where the code is not obvious.
  No decorative banners or divider lines (no // ------ or // ======).
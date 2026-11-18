import { beforeEach, describe, expect, it } from 'vitest';
import { usePlaygroundStore } from './usePlaygroundStore';
import type { Step } from '../engine/types';

function makeStep(id: number): Step {
  return {
    id,
    codeLine: 1,
    explanation: `step ${id}`,
    highlights: [],
    counters: { visited: 0, changes: 0 },
    view: { kind: 'stack', items: [], capacity: 3 },
  };
}

const steps = [makeStep(0), makeStep(1), makeStep(2)];

beforeEach(() => {
  usePlaygroundStore.setState({ steps: [], pseudocode: [], capacity: 8, currentStep: 0, isPlaying: false, speed: 1 });
});

describe('loadSteps', () => {
  it('replaces steps and resets currentStep to 0', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    const s = usePlaygroundStore.getState();
    expect(s.steps).toHaveLength(3);
    expect(s.currentStep).toBe(0);
  });

  it('stores the pseudocode array', () => {
    const pseudo = ['line one', 'line two'];
    usePlaygroundStore.getState().loadSteps(steps, pseudo);
    expect(usePlaygroundStore.getState().pseudocode).toEqual(pseudo);
  });

  it('stops playback', () => {
    usePlaygroundStore.setState({ isPlaying: true });
    usePlaygroundStore.getState().loadSteps(steps, []);
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
  });
});

describe('next', () => {
  it('advances currentStep by 1', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().currentStep).toBe(1);
  });

  it('does not go past the last step', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 2 });
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().currentStep).toBe(2);
  });

  it('sets isPlaying to false when reaching the last step', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 1, isPlaying: true });
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().currentStep).toBe(2);
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
  });

  it('sets isPlaying to false when already on the last step', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 2, isPlaying: true });
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
  });

  it('keeps isPlaying true when not yet at the last step', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 0, isPlaying: true });
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().isPlaying).toBe(true);
  });
});

describe('prev', () => {
  it('goes back by 1', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 2 });
    usePlaygroundStore.getState().prev();
    expect(usePlaygroundStore.getState().currentStep).toBe(1);
  });

  it('does not go below 0', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.setState({ currentStep: 0 });
    usePlaygroundStore.getState().prev();
    expect(usePlaygroundStore.getState().currentStep).toBe(0);
  });
});

describe('goTo', () => {
  it('jumps to the given index', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.getState().goTo(2);
    expect(usePlaygroundStore.getState().currentStep).toBe(2);
  });

  it('clamps to 0 when given a negative index', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.getState().goTo(-5);
    expect(usePlaygroundStore.getState().currentStep).toBe(0);
  });

  it('clamps to the last index when given an out-of-range index', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.getState().goTo(99);
    expect(usePlaygroundStore.getState().currentStep).toBe(2);
  });
});

describe('play / pause', () => {
  it('play sets isPlaying to true', () => {
    usePlaygroundStore.getState().play();
    expect(usePlaygroundStore.getState().isPlaying).toBe(true);
  });

  it('pause sets isPlaying to false', () => {
    usePlaygroundStore.setState({ isPlaying: true });
    usePlaygroundStore.getState().pause();
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
  });
});

describe('setSpeed', () => {
  it('updates speed', () => {
    usePlaygroundStore.getState().setSpeed(2);
    expect(usePlaygroundStore.getState().speed).toBe(2);
  });

  it('accepts fractional speeds', () => {
    usePlaygroundStore.getState().setSpeed(0.5);
    expect(usePlaygroundStore.getState().speed).toBe(0.5);
  });
});

describe('setCapacity', () => {
  it('updates capacity', () => {
    usePlaygroundStore.getState().setCapacity(5);
    expect(usePlaygroundStore.getState().capacity).toBe(5);
  });

  it('leaves steps and other state untouched', () => {
    usePlaygroundStore.getState().loadSteps(steps, []);
    usePlaygroundStore.getState().setCapacity(10);
    expect(usePlaygroundStore.getState().steps).toHaveLength(3);
    expect(usePlaygroundStore.getState().capacity).toBe(10);
  });
});

describe('queue steps (QueueView)', () => {
  function makeQueueStep(id: number): Step {
    return {
      id,
      codeLine: 1,
      explanation: `queue step ${id}`,
      highlights: ['front'],
      counters: { visited: 0, changes: 0 },
      view: { kind: 'queue', items: [], front: 0, rear: -1, capacity: 5 },
    };
  }

  it('loadSteps accepts queue-view steps', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1)];
    usePlaygroundStore.getState().loadSteps(qSteps, ['enqueue(data){', '}']);
    const s = usePlaygroundStore.getState();
    expect(s.steps).toHaveLength(2);
    expect(s.steps[0].view.kind).toBe('queue');
  });

  it('next advances through queue steps', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1), makeQueueStep(2)];
    usePlaygroundStore.getState().loadSteps(qSteps, []);
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().currentStep).toBe(1);
  });

  it('prev goes back through queue steps', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1)];
    usePlaygroundStore.getState().loadSteps(qSteps, []);
    usePlaygroundStore.setState({ currentStep: 1 });
    usePlaygroundStore.getState().prev();
    expect(usePlaygroundStore.getState().currentStep).toBe(0);
  });

  it('pseudocode is stored alongside queue steps', () => {
    const pseudo = ['enqueue(data){', '  IF(rear == size - 1) THEN'];
    const qSteps = [makeQueueStep(0)];
    usePlaygroundStore.getState().loadSteps(qSteps, pseudo);
    expect(usePlaygroundStore.getState().pseudocode).toEqual(pseudo);
  });

  it('loading new queue steps resets currentStep to 0', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1)];
    usePlaygroundStore.getState().loadSteps(qSteps, []);
    usePlaygroundStore.setState({ currentStep: 1 });
    usePlaygroundStore.getState().loadSteps([makeQueueStep(0)], []);
    expect(usePlaygroundStore.getState().currentStep).toBe(0);
  });

  it('play sets isPlaying true for queue steps', () => {
    usePlaygroundStore.getState().loadSteps([makeQueueStep(0), makeQueueStep(1)], []);
    usePlaygroundStore.getState().play();
    expect(usePlaygroundStore.getState().isPlaying).toBe(true);
  });

  it('pause stops playback for queue steps', () => {
    usePlaygroundStore.getState().loadSteps([makeQueueStep(0), makeQueueStep(1)], []);
    usePlaygroundStore.getState().play();
    usePlaygroundStore.getState().pause();
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
  });

  it('goTo clamps within queue step bounds', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1), makeQueueStep(2)];
    usePlaygroundStore.getState().loadSteps(qSteps, []);
    usePlaygroundStore.getState().goTo(99);
    expect(usePlaygroundStore.getState().currentStep).toBe(2);
  });

  it('next stops at last queue step and clears isPlaying', () => {
    const qSteps = [makeQueueStep(0), makeQueueStep(1)];
    usePlaygroundStore.getState().loadSteps(qSteps, []);
    usePlaygroundStore.setState({ currentStep: 0, isPlaying: true });
    usePlaygroundStore.getState().next();
    expect(usePlaygroundStore.getState().isPlaying).toBe(false);
    expect(usePlaygroundStore.getState().currentStep).toBe(1);
  });
});

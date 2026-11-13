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
  usePlaygroundStore.setState({ steps: [], pseudocode: [], currentStep: 0, isPlaying: false, speed: 1 });
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

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import StackScene from './scene/StackScene';
import { usePlaygroundStore } from './store/usePlaygroundStore';
import { push } from './engine/stack';
import type { StackItem } from './engine/stack';

// DEMO – load three pushes and show the final step; remove when controls exist
function useDemo() {
  const loadSteps = usePlaygroundStore((s) => s.loadSteps);
  const goTo = usePlaygroundStore((s) => s.goTo);

  useEffect(() => {
    const capacity = 5;
    let items: StackItem[] = [];
    let allSteps = push(items, capacity, 10);
    items = (allSteps[allSteps.length - 1].view as { items: StackItem[] }).items;
    const s2 = push(items, capacity, 20);
    allSteps = [...allSteps, ...s2];
    items = (s2[s2.length - 1].view as { items: StackItem[] }).items;
    const s3 = push(items, capacity, 30);
    allSteps = [...allSteps, ...s3];
    loadSteps(allSteps);
    goTo(allSteps.length - 1);
  }, [loadSteps, goTo]);
}

export default function App() {
  useDemo();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <StackScene />
      </Canvas>
    </div>
  );
}

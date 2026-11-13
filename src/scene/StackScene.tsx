import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import type { StackView } from '../engine/types';

const BLOCK_H = 0.9;
const BLOCK_W = 1.8;
const BLOCK_D = 1.8;
const GAP = 0.05;
const BASE_H = 0.15;

const COLOR_DEFAULT = '#60a5fa';
const COLOR_HIGHLIGHT = '#fbbf24';
const COLOR_BASE = '#7a7a8a';
const COLOR_ERROR = '#f87171';

function StackBlock({
  value,
  index,
  highlighted,
}: {
  value: number;
  index: number;
  highlighted: boolean;
}) {
  const y = BASE_H + index * (BLOCK_H + GAP) + BLOCK_H / 2;
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={highlighted ? COLOR_HIGHLIGHT : COLOR_DEFAULT} />
      </mesh>
      {/* value label on front face */}
      <Text
        position={[0, 0, BLOCK_D / 2 + 0.01]}
        fontSize={0.38}
        color="#ffffff"
        font={undefined}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {String(value)}
      </Text>
    </group>
  );
}

// Stack total height: BASE_H + capacity * (BLOCK_H + GAP)
// Camera target: midpoint of that height
// Camera distance: scales with capacity
function CameraRig() {
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera; controls: unknown };
  const capacity = usePlaygroundStore((s) => s.capacity);
  const targetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const stackH = BASE_H + capacity * (BLOCK_H + GAP);
    const midY = stackH / 2;
    const dist = 3 + capacity * 0.9;
    camera.position.set(0, midY, dist);
    camera.lookAt(0, midY, 0);
    targetRef.current.set(0, midY, 0);
  }, [capacity, camera]);

  // keep OrbitControls target in sync after capacity change
  useFrame(() => {
    const ctrl = controls as { target?: THREE.Vector3; update?: () => void } | null;
    if (ctrl?.target) {
      ctrl.target.lerp(targetRef.current, 0.15);
    }
  });

  return null;
}

function StackBase() {
  return (
    <mesh position={[0, BASE_H / 2, 0]}>
      <boxGeometry args={[BLOCK_W + 0.1, BASE_H, BLOCK_D + 0.1]} />
      <meshStandardMaterial color={COLOR_BASE} />
    </mesh>
  );
}

export default function StackScene() {
  const steps = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);

  const step = steps[currentStep];
  const view = (step?.view.kind === 'stack' ? step.view : null) as StackView | null;
  const highlights = new Set(step?.highlights ?? []);
  const errorY = BASE_H + (view?.capacity ?? 8) * (BLOCK_H + GAP) + 0.6;

  return (
    <>
      <CameraRig />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-4, 6, -3]} intensity={0.5} />
      <OrbitControls makeDefault />

      <StackBase />

      {view?.items.map((item, i) => (
        <StackBlock
          key={item.id}
          value={item.value}
          index={i}
          highlighted={highlights.has(item.id)}
        />
      ))}

      {step?.error && (
        <Text
          position={[0, errorY, 0]}
          fontSize={0.3}
          color={COLOR_ERROR}
          anchorX="center"
          anchorY="middle"
        >
          {step.error}
        </Text>
      )}
    </>
  );
}

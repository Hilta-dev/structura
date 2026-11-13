import { Text, OrbitControls } from '@react-three/drei';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import type { StackView } from '../engine/types';

const BLOCK_H = 0.9;
const BLOCK_W = 1.8;
const BLOCK_D = 1.8;
const GAP = 0.05;
const BASE_H = 0.15;

const COLOR_DEFAULT = '#4f86c6';
const COLOR_HIGHLIGHT = '#f5a623';
const COLOR_BASE = '#555555';
const COLOR_ERROR = '#e53e3e';

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
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {String(value)}
      </Text>
    </group>
  );
}

function StackBase({ capacity }: { capacity: number }) {
  const totalH = capacity * (BLOCK_H + GAP);
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
  if (!step || step.view.kind !== 'stack') return null;

  const view = step.view as StackView;
  const highlights = new Set(step.highlights);

  const errorY = BASE_H + view.capacity * (BLOCK_H + GAP) + 0.6;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <OrbitControls />

      <StackBase capacity={view.capacity} />

      {view.items.map((item, i) => (
        <StackBlock
          key={item.id}
          value={item.value}
          index={i}
          highlighted={highlights.has(item.id)}
        />
      ))}

      {step.error && (
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

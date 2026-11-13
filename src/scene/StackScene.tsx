import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
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

// y position for block at given stack index
function blockY(index: number) {
  return BASE_H + index * (BLOCK_H + GAP) + BLOCK_H / 2;
}

// A block that drops in from above (push animation)
function PushBlock({
  value,
  index,
  highlighted,
}: {
  value: number;
  index: number;
  highlighted: boolean;
}) {
  const y = blockY(index);
  const { posY } = useSpring({
    from: { posY: y + BLOCK_H * 3 },
    to: { posY: y },
    config: { tension: 320, friction: 20, duration: 380 },
  });
  return (
    <animated.group position-x={0} position-y={posY} position-z={0}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={highlighted ? COLOR_HIGHLIGHT : COLOR_DEFAULT} />
      </mesh>
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
    </animated.group>
  );
}

// A block that pulses once (peek animation)
function PeekBlock({
  value,
  index,
  highlighted,
}: {
  value: number;
  index: number;
  highlighted: boolean;
}) {
  const y = blockY(index);
  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      await next({ scale: 1.12 });
      await next({ scale: 1 });
    },
    config: { tension: 400, friction: 14, duration: 200 },
  });
  return (
    <animated.group position={[0, y, 0]} scale={scale}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={highlighted ? COLOR_HIGHLIGHT : COLOR_DEFAULT} />
      </mesh>
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
    </animated.group>
  );
}

// A ghost block that lifts and fades (pop animation)
function PopGhost({ value, index }: { value: number; index: number }) {
  const y = blockY(index);
  const { posY, opacity } = useSpring({
    from: { posY: y, opacity: 1 },
    to: { posY: y + BLOCK_H * 3, opacity: 0 },
    config: { tension: 180, friction: 20, duration: 400 },
  });
  return (
    <animated.group position-x={0} position-y={posY} position-z={0}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <animated.meshStandardMaterial
          color={COLOR_DEFAULT}
          transparent
          opacity={opacity}
        />
      </mesh>
      <animated.group scale={1}>
        <Text
          position={[0, 0, BLOCK_D / 2 + 0.01]}
          fontSize={0.38}
          color="#ffffff"
          font={undefined}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          fillOpacity={0.6}
        >
          {String(value)}
        </Text>
      </animated.group>
    </animated.group>
  );
}

// A plain static block (no animation)
function StaticBlock({
  value,
  index,
  highlighted,
}: {
  value: number;
  index: number;
  highlighted: boolean;
}) {
  const y = blockY(index);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={highlighted ? COLOR_HIGHLIGHT : COLOR_DEFAULT} />
      </mesh>
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

// Wrapper that picks the right animation per block
function StackBlock({
  value,
  index,
  highlighted,
  animateAs,
}: {
  value: number;
  index: number;
  highlighted: boolean;
  animateAs: 'push' | 'peek' | 'static';
}) {
  if (animateAs === 'push') return <PushBlock value={value} index={index} highlighted={highlighted} />;
  if (animateAs === 'peek') return <PeekBlock value={value} index={index} highlighted={highlighted} />;
  return <StaticBlock value={value} index={index} highlighted={highlighted} />;
}

// Shaking group for error state
function ShakeGroup({ children, active }: { children: React.ReactNode; active: boolean }) {
  const { x } = useSpring({
    from: { x: 0 },
    to: active
      ? async (next) => {
          for (let i = 0; i < 4; i++) {
            await next({ x: i % 2 === 0 ? 0.18 : -0.18 });
          }
          await next({ x: 0 });
        }
      : { x: 0 },
    reset: active,
    config: { tension: 1200, friction: 10, duration: 60 },
  });
  return <animated.group position-x={x} position-y={0} position-z={0}>{children}</animated.group>;
}

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

type GhostItem = { id: string; value: number; index: number };

export default function StackScene() {
  const steps = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);

  const step = steps[currentStep];
  const prevStep = steps[currentStep - 1];

  const view = (step?.view.kind === 'stack' ? step.view : null) as StackView | null;
  const prevView = (prevStep?.view.kind === 'stack' ? prevStep.view : null) as StackView | null;

  const highlights = new Set(step?.highlights ?? []);
  const errorY = BASE_H + (view?.capacity ?? 8) * (BLOCK_H + GAP) + 0.6;

  // determine which animation applies to each visible block
  const prevIds = new Set(prevView?.items.map((i) => i.id) ?? []);
  const currentIds = new Set(view?.items.map((i) => i.id) ?? []);

  const isPopStep = prevView && view && prevView.items.length > view.items.length;
  const isPushStep = prevView && view && view.items.length > prevView.items.length;
  const isPeekStep = !isPushStep && !isPopStep && highlights.size > 0 && !step?.error;

  // ghost block for pop: the item that was just removed
  const ghostItem: GhostItem | null = isPopStep
    ? (() => {
        const removed = prevView!.items.find((i) => !currentIds.has(i.id));
        if (!removed) return null;
        return { id: removed.id, value: removed.value, index: prevView!.items.length - 1 };
      })()
    : null;

  // key that changes when we want the pop ghost / shake to retrigger
  const ghostKey = ghostItem ? `${ghostItem.id}-${currentStep}` : 'none';
  const shakeKey = step?.error ? `error-${currentStep}` : 'ok';

  return (
    <>
      <CameraRig />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-4, 6, -3]} intensity={0.5} />
      <OrbitControls makeDefault />

      <StackBase />

      <ShakeGroup key={shakeKey} active={!!step?.error}>
        {view?.items.map((item, i) => {
          const isNew = !prevIds.has(item.id);
          const animateAs: 'push' | 'peek' | 'static' =
            isPushStep && isNew
              ? 'push'
              : isPeekStep && highlights.has(item.id)
              ? 'peek'
              : 'static';
          return (
            <StackBlock
              key={item.id}
              value={item.value}
              index={i}
              highlighted={highlights.has(item.id)}
              animateAs={animateAs}
            />
          );
        })}
      </ShakeGroup>

      {ghostItem && (
        <PopGhost key={ghostKey} value={ghostItem.value} index={ghostItem.index} />
      )}

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

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import type { StackView } from '../engine/types';
import {
  COLOR_NODE, COLOR_NODE_EMISSIVE,
  COLOR_NEW,  COLOR_NEW_EMISSIVE,
  COLOR_FOUND,COLOR_FOUND_EMISSIVE,
  COLOR_BASE,
  COLOR_TEXT, COLOR_TEXT_ON_LIME,
  COLOR_CHIP_BG,
  COLOR_ERROR,
} from './sceneColors';

const BLOCK_H = 0.9;
const BLOCK_W = 1.8;
const BLOCK_D = 1.8;
const GAP     = 0.05;
const BASE_H  = 0.15;

function blockY(index: number) {
  return BASE_H + index * (BLOCK_H + GAP) + BLOCK_H / 2;
}

type BlockColor = 'default' | 'new' | 'highlight';

function blockColors(c: BlockColor): { color: string; emissive: string } {
  if (c === 'new')       return { color: COLOR_NEW,   emissive: COLOR_NEW_EMISSIVE };
  if (c === 'highlight') return { color: COLOR_FOUND,  emissive: COLOR_FOUND_EMISSIVE };
  return                        { color: COLOR_NODE,  emissive: COLOR_NODE_EMISSIVE };
}

function BlockMesh({
  colorKind,
  transparent,
  opacity,
}: {
  colorKind: BlockColor;
  transparent?: boolean;
  opacity?: number;
}) {
  const { color, emissive } = blockColors(colorKind);
  if (transparent && opacity !== undefined) {
    return (
      <animated.meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.4}
        transparent
        opacity={opacity as unknown as number}
      />
    );
  }
  return <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} />;
}

function BlockLabel({ value, fillOpacity }: { value: number; fillOpacity?: number }) {
  return (
    <Text
      position={[0, 0, BLOCK_D / 2 + 0.01]}
      fontSize={0.38}
      color={COLOR_TEXT}
      font={undefined}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor="#000000"
      fillOpacity={fillOpacity ?? 1}
    >
      {String(value)}
    </Text>
  );
}

function PushBlock({ value, index, colorKind }: { value: number; index: number; colorKind: BlockColor }) {
  const y = blockY(index);
  const { posY } = useSpring({
    from: { posY: y + BLOCK_H * 3 },
    to:   { posY: y },
    config: { tension: 320, friction: 20, duration: 380 },
  });
  return (
    <animated.group position-x={0} position-y={posY} position-z={0}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <BlockMesh colorKind={colorKind} />
      </mesh>
      <BlockLabel value={value} />
    </animated.group>
  );
}

function PeekBlock({ value, index, colorKind }: { value: number; index: number; colorKind: BlockColor }) {
  const y = blockY(index);
  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => { await next({ scale: 1.12 }); await next({ scale: 1 }); },
    config: { tension: 400, friction: 14, duration: 200 },
  });
  return (
    <animated.group position={[0, y, 0]} scale={scale}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <BlockMesh colorKind={colorKind} />
      </mesh>
      <BlockLabel value={value} />
    </animated.group>
  );
}

function PopGhost({ value, index }: { value: number; index: number }) {
  const y = blockY(index);
  const { posY, opacity } = useSpring({
    from: { posY: y, opacity: 1 },
    to:   { posY: y + BLOCK_H * 3, opacity: 0 },
    config: { tension: 180, friction: 20, duration: 400 },
  });
  return (
    <animated.group position-x={0} position-y={posY} position-z={0}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <BlockMesh colorKind="default" transparent opacity={opacity as unknown as number} />
      </mesh>
      <BlockLabel value={value} fillOpacity={0.6} />
    </animated.group>
  );
}

function StaticBlock({ value, index, colorKind }: { value: number; index: number; colorKind: BlockColor }) {
  const y = blockY(index);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <BlockMesh colorKind={colorKind} />
      </mesh>
      <BlockLabel value={value} />
    </group>
  );
}

function StackBlock({
  value, index, colorKind, animateAs,
}: {
  value: number; index: number; colorKind: BlockColor; animateAs: 'push' | 'peek' | 'static';
}) {
  if (animateAs === 'push') return <PushBlock value={value} index={index} colorKind={colorKind} />;
  if (animateAs === 'peek') return <PeekBlock value={value} index={index} colorKind={colorKind} />;
  return <StaticBlock value={value} index={index} colorKind={colorKind} />;
}

function ShakeGroup({ children, active }: { children: React.ReactNode; active: boolean }) {
  const { x } = useSpring({
    from: { x: 0 },
    to: active
      ? async (next) => {
          for (let i = 0; i < 4; i++) await next({ x: i % 2 === 0 ? 0.18 : -0.18 });
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
    const midY   = stackH / 2;
    const dist   = 3 + capacity * 0.9;
    camera.position.set(0, midY, dist);
    camera.lookAt(0, midY, 0);
    targetRef.current.set(0, midY, 0);
  }, [capacity, camera]);

  useFrame(() => {
    const ctrl = controls as { target?: THREE.Vector3; update?: () => void } | null;
    if (ctrl?.target) ctrl.target.lerp(targetRef.current, 0.15);
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

/** Lime chip label: "top →" or "push ↓" rendered as a flat plane + text. */
function TopLabel({ y }: { y: number }) {
  return (
    <group position={[BLOCK_W / 2 + 0.5, y, BLOCK_D / 2]}>
      <mesh>
        <planeGeometry args={[0.9, 0.28]} />
        <meshBasicMaterial color={COLOR_CHIP_BG} />
      </mesh>
      <Text fontSize={0.16} color={COLOR_TEXT_ON_LIME} anchorX="center" anchorY="middle" position={[0, 0, 0.001]}>
        top →
      </Text>
    </group>
  );
}

type GhostItem = { id: string; value: number; index: number };

export default function StackScene() {
  const steps       = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);

  const step     = steps[currentStep];
  const prevStep = steps[currentStep - 1];

  const view     = (step?.view.kind === 'stack'     ? step.view     : null) as StackView | null;
  const prevView = (prevStep?.view.kind === 'stack' ? prevStep.view : null) as StackView | null;

  const highlights = new Set(step?.highlights ?? []);
  const errorY     = BASE_H + (view?.capacity ?? 8) * (BLOCK_H + GAP) + 0.6;

  const prevIds    = new Set(prevView?.items.map((i) => i.id) ?? []);
  const currentIds = new Set(view?.items.map((i) => i.id) ?? []);

  const isPopStep  = prevView && view && prevView.items.length > view.items.length;
  const isPushStep = prevView && view && view.items.length > prevView.items.length;
  const isPeekStep = !isPushStep && !isPopStep && highlights.size > 0 && !step?.error;

  const ghostItem: GhostItem | null = isPopStep
    ? (() => {
        const removed = prevView!.items.find((i) => !currentIds.has(i.id));
        if (!removed) return null;
        return { id: removed.id, value: removed.value, index: prevView!.items.length - 1 };
      })()
    : null;

  const ghostKey = ghostItem ? `${ghostItem.id}-${currentStep}` : 'none';
  const shakeKey = step?.error ? `error-${currentStep}` : 'ok';

  const topIndex = (view?.items.length ?? 0) - 1;

  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 8, 5]}  intensity={1.4} />
      <directionalLight position={[-4, 4, -3]} intensity={0.4} />
      <OrbitControls makeDefault />

      <StackBase />

      <ShakeGroup key={shakeKey} active={!!step?.error}>
        {view?.items.map((item, i) => {
          const isNew = isPushStep && !prevIds.has(item.id);
          const isHighlighted = isPeekStep && highlights.has(item.id);
          const colorKind: BlockColor = isNew ? 'new' : isHighlighted ? 'highlight' : 'default';
          const animateAs: 'push' | 'peek' | 'static' =
            isNew ? 'push' : isHighlighted ? 'peek' : 'static';
          return (
            <StackBlock
              key={item.id}
              value={item.value}
              index={i}
              colorKind={colorKind}
              animateAs={animateAs}
            />
          );
        })}
      </ShakeGroup>

      {ghostItem && (
        <PopGhost key={ghostKey} value={ghostItem.value} index={ghostItem.index} />
      )}

      {/* "top →" lime chip beside the topmost block */}
      {topIndex >= 0 && view && (
        <TopLabel y={blockY(topIndex)} />
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

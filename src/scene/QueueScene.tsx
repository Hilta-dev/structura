import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import type { QueueView } from '../engine/types';
import {
  COLOR_NODE, COLOR_NODE_EMISSIVE,
  COLOR_NEW,  COLOR_NEW_EMISSIVE,
  COLOR_FOUND, COLOR_FOUND_EMISSIVE,
  COLOR_BASE,
  COLOR_TEXT, COLOR_TEXT_ON_LIME,
  COLOR_CHIP_BG,
  COLOR_ERROR,
} from './sceneColors';

//layout constants
const SLOT_W  = 1.4;
const SLOT_H  = 1.0;
const SLOT_D  = 1.4;
const GAP     = 0.12;
const BASE_H  = 0.15;

//x position for true array slot index i
function slotX(i: number, capacity: number): number {
  const totalW = capacity * SLOT_W + (capacity - 1) * GAP;
  return -totalW / 2 + i * (SLOT_W + GAP) + SLOT_W / 2;
}

//duration in ms scaled by playback speed
function dur(base: number, speed: number): number {
  return Math.round(base / Math.max(0.1, speed));
}

type BlockColor = 'default' | 'new' | 'highlight';

function blockColors(c: BlockColor): { color: string; emissive: string } {
  if (c === 'new')       return { color: COLOR_NEW,   emissive: COLOR_NEW_EMISSIVE };
  if (c === 'highlight') return { color: COLOR_FOUND,  emissive: COLOR_FOUND_EMISSIVE };
  return                        { color: COLOR_NODE,  emissive: COLOR_NODE_EMISSIVE };
}

function BlockLabel({ value }: { value: number }) {
  return (
    <Text
      position={[0, 0, SLOT_D / 2 + 0.01]}
      fontSize={0.32}
      color={COLOR_TEXT}
      font={undefined}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor="#000000"
    >
      {String(value)}
    </Text>
  );
}

//enqueue line 6: new box drops in from above
function DropBlock({ value, x, speed }: { value: number; x: number; speed: number }) {
  const y = BASE_H + SLOT_H / 2;
  const d = dur(380, speed);
  const { posY } = useSpring({
    from: { posY: y + SLOT_H * 4 },
    to:   { posY: y },
    config: { duration: d },
  });
  return (
    <animated.group position-x={x} position-y={posY} position-z={0}>
      <mesh>
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <meshStandardMaterial color={COLOR_NEW} emissive={COLOR_NEW_EMISSIVE} emissiveIntensity={0.4} />
      </mesh>
      <BlockLabel value={value} />
    </animated.group>
  );
}

//dequeue ghost: slides out to the left and fades
function DequeueGhost({ value, x }: { value: number; x: number }) {
  const y = BASE_H + SLOT_H / 2;
  const { posX, opacity } = useSpring({
    from: { posX: x, opacity: 1 },
    to:   { posX: x - SLOT_W * 4, opacity: 0 },
    config: { tension: 180, friction: 20, duration: 400 },
  });
  return (
    <animated.group position-x={posX} position-y={y} position-z={0}>
      <mesh>
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <animated.meshStandardMaterial
          color={COLOR_NODE}
          emissive={COLOR_NODE_EMISSIVE}
          emissiveIntensity={0.4}
          transparent
          opacity={opacity as unknown as number}
        />
      </mesh>
    </animated.group>
  );
}

//peek: pulse scale on front item
function PeekBlock({ value, x }: { value: number; x: number }) {
  const y = BASE_H + SLOT_H / 2;
  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => { await next({ scale: 1.12 }); await next({ scale: 1 }); },
    config: { tension: 400, friction: 14, duration: 200 },
  });
  return (
    <animated.group position={[x, y, 0]} scale={scale}>
      <mesh>
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <meshStandardMaterial color={COLOR_FOUND} emissive={COLOR_FOUND_EMISSIVE} emissiveIntensity={0.4} />
      </mesh>
      <BlockLabel value={value} />
    </animated.group>
  );
}

function StaticBlock({ value, x, colorKind }: { value: number; x: number; colorKind: BlockColor }) {
  const y = BASE_H + SLOT_H / 2;
  const { color, emissive } = blockColors(colorKind);
  return (
    <group position={[x, y, 0]}>
      <mesh>
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} />
      </mesh>
      <BlockLabel value={value} />
    </group>
  );
}

//plain empty slot outline
function EmptySlot({ x }: { x: number }) {
  const y = BASE_H + SLOT_H / 2;
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
      <meshStandardMaterial color="#2a2f3a" emissive="#111418" emissiveIntensity={0.3} />
    </mesh>
  );
}

//slot that was dequeued: same outline + faint "dequeued" label
function DequeuedSlot({ x, index }: { x: number; index: number }) {
  const y = BASE_H + SLOT_H / 2;
  return (
    <group>
      <mesh position={[x, y, 0]}>
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <meshStandardMaterial color="#1e2028" emissive="#0a0c10" emissiveIntensity={0.2} />
      </mesh>
      <Text
        position={[x, y, SLOT_D / 2 + 0.01]}
        fontSize={0.11}
        color="#3a3f50"
        anchorX="center"
        anchorY="middle"
      >
        {`[${index}]\ndequeued`}
      </Text>
    </group>
  );
}

//index label below each slot
function SlotIndex({ x, index }: { x: number; index: number }) {
  return (
    <Text
      position={[x, BASE_H - 0.28, SLOT_D / 2 + 0.01]}
      fontSize={0.18}
      color="#454d63"
      anchorX="center"
      anchorY="middle"
    >
      {String(index)}
    </Text>
  );
}

//shake group for error animation
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

//FRONT chip above a slot
function FrontLabel({ x }: { x: number }) {
  return (
    <group position={[x, BASE_H + SLOT_H + 0.38, SLOT_D / 2]}>
      <mesh>
        <planeGeometry args={[1.0, 0.28]} />
        <meshBasicMaterial color={COLOR_CHIP_BG} />
      </mesh>
      <Text fontSize={0.14} color={COLOR_TEXT_ON_LIME} anchorX="center" anchorY="middle" position={[0, 0, 0.001]}>
        FRONT ↓
      </Text>
    </group>
  );
}

//REAR chip — springy x so it hops when rear++ fires (line 5)
function RearLabel({ targetX, speed }: { targetX: number; speed: number }) {
  const d = dur(300, speed);
  const { x } = useSpring({
    to: { x: targetX },
    config: { duration: d, easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
  });
  return (
    <animated.group position-x={x} position-y={BASE_H + SLOT_H + 0.38} position-z={SLOT_D / 2}>
      <mesh>
        <planeGeometry args={[1.0, 0.28]} />
        <meshBasicMaterial color="#7c5cd8" />
      </mesh>
      <Text fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.001]}>
        REAR ↓
      </Text>
    </animated.group>
  );
}

//rear=-1 chip: sits just left of slot 0
function RearMinusOneLabel({ capacity }: { capacity: number }) {
  const x = slotX(0, capacity) - SLOT_W - GAP;
  return (
    <group position={[x, BASE_H + SLOT_H + 0.38, SLOT_D / 2]}>
      <mesh>
        <planeGeometry args={[1.3, 0.28]} />
        <meshBasicMaterial color="#7c5cd8" />
      </mesh>
      <Text fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.001]}>
        rear = -1
      </Text>
    </group>
  );
}

//full-check flash on line 2: flashes rear slot + shows occupied band briefly
function FullCheckFlash({
  capacity, front, rear, isFull, speed,
}: {
  capacity: number; front: number; rear: number; isFull: boolean; speed: number;
}) {
  const d = dur(500, speed);
  const flashColor = isFull ? '#7a1010' : '#1a4a1a';
  const flashEmissive = isFull ? '#3a0505' : '#0a2a0a';

  //flash opacity: appear then fade
  const { op } = useSpring({
    from: { op: 0.85 },
    to:   { op: 0 },
    config: { duration: d },
  });

  //last slot highlight (the slot being checked)
  const lastSlotX = slotX(capacity - 1, capacity);
  const y = BASE_H + SLOT_H / 2;

  //occupied band between front and rear (only if queue has items)
  const hasOccupied = rear >= front && rear >= 0;
  const bandLeft  = slotX(front, capacity) - SLOT_W / 2;
  const bandRight = slotX(rear, capacity)  + SLOT_W / 2;
  const bandW     = bandRight - bandLeft;
  const bandCX    = (bandLeft + bandRight) / 2;

  return (
    <animated.group renderOrder={1}>
      {/* flash last slot */}
      <animated.mesh position={[lastSlotX, y, 0.01]}>
        <boxGeometry args={[SLOT_W + 0.08, SLOT_H + 0.08, SLOT_D + 0.08]} />
        <animated.meshStandardMaterial
          color={flashColor}
          emissive={flashEmissive}
          emissiveIntensity={0.6}
          transparent
          opacity={op as unknown as number}
          depthWrite={false}
        />
      </animated.mesh>

      {/* occupied band between front and rear */}
      {hasOccupied && bandW > 0 && (
        <animated.mesh position={[bandCX, y, 0.02]}>
          <boxGeometry args={[bandW, SLOT_H + 0.12, SLOT_D + 0.12]} />
          <animated.meshStandardMaterial
            color="#7c5cd8"
            emissive="#3a1a7a"
            emissiveIntensity={0.3}
            transparent
            opacity={op as unknown as number}
            depthWrite={false}
          />
        </animated.mesh>
      )}

      {/* "occupied" text label above the band */}
      {hasOccupied && bandW > 0 && (
        <Text
          position={[bandCX, BASE_H + SLOT_H + 0.72, SLOT_D / 2]}
          fontSize={0.14}
          color="#9b7ee8"
          anchorX="center"
          anchorY="middle"
        >
          occupied
        </Text>
      )}
    </animated.group>
  );
}

function QueueBase({ capacity }: { capacity: number }) {
  const totalW = capacity * SLOT_W + (capacity - 1) * GAP + 0.2;
  return (
    <mesh position={[0, BASE_H / 2, 0]}>
      <boxGeometry args={[totalW, BASE_H, SLOT_D + 0.1]} />
      <meshStandardMaterial color={COLOR_BASE} />
    </mesh>
  );
}

function CameraRig() {
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera; controls: unknown };
  const capacity = usePlaygroundStore((s) => s.capacity);
  const targetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const midY = BASE_H + SLOT_H / 2;
    const dist = 2.5 + capacity * 0.6;
    camera.position.set(0, midY + 1, dist);
    camera.lookAt(0, midY, 0);
    targetRef.current.set(0, midY, 0);
  }, [capacity, camera]);

  useFrame(() => {
    const ctrl = controls as { target?: THREE.Vector3; update?: () => void } | null;
    if (ctrl?.target) ctrl.target.lerp(targetRef.current, 0.15);
  });

  return null;
}

type GhostItem = { id: string; value: number; slotIndex: number };

export default function QueueScene() {
  const steps       = usePlaygroundStore((s) => s.steps);
  const currentStep = usePlaygroundStore((s) => s.currentStep);
  const speed       = usePlaygroundStore((s) => s.speed);

  const step     = steps[currentStep];
  const prevStep = steps[currentStep - 1];

  const view     = (step?.view.kind     === 'queue' ? step.view     : null) as QueueView | null;
  const prevView = (prevStep?.view.kind === 'queue' ? prevStep.view : null) as QueueView | null;

  const capacity = view?.capacity ?? usePlaygroundStore.getState().capacity;
  const front    = view?.front ?? 0;
  const rear     = view?.rear  ?? -1;

  const codeLine = step?.codeLine ?? -1;

  const prevIds    = new Set(prevView?.items.map((i) => i.id) ?? []);
  const currentIds = new Set(view?.items.map((i) => i.id) ?? []);

  //dequeue: front item was removed (item count dropped)
  const isDequeueStep = prevView != null && view != null && prevView.items.length > view.items.length;
  //enqueue: new item added (item count grew)
  const isEnqueueStep = prevView != null && view != null && view.items.length > prevView.items.length;
  //peek: highlights set, no structural change, no error
  const isPeekStep    = !isEnqueueStep && !isDequeueStep && (step?.highlights.length ?? 0) > 0 && !step?.error;

  //line 2 full-check flash (content: IF(rear == size - 1))
  const isFullCheckLine = isEnqueueStep === false && codeLine === 2 && step?.view.kind === 'queue';
  //line 5 rear++ (the REAR chip springs to new position via RearLabel's spring)
  //line 6 insert: render DropBlock instead of static
  const isInsertLine    = codeLine === 6 && isEnqueueStep;

  //ghost slot on dequeue: the slot that just became empty = prevView.front
  const ghostItem: GhostItem | null = isDequeueStep && prevView
    ? (() => {
        const removed = prevView.items.find((i) => !currentIds.has(i.id));
        if (!removed) return null;
        return { id: removed.id, value: removed.value, slotIndex: prevView.front };
      })()
    : null;

  const ghostKey = ghostItem ? `${ghostItem.id}-${currentStep}` : 'none';
  const shakeKey = step?.error ? `error-${currentStep}` : 'ok';

  //key for FullCheckFlash so it re-mounts and re-plays on each line-2 visit
  const flashKey = isFullCheckLine ? `flash-${currentStep}` : 'no-flash';

  const errorY = BASE_H + SLOT_H + 0.9;

  //x position for the REAR chip (springs to new position automatically)
  const rearChipX = rear >= 0 ? slotX(rear, capacity) : slotX(0, capacity) - SLOT_W - GAP;

  //determine if queue is full for the full-check flash colour
  const isFull = view ? view.items.length >= capacity : false;

  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 8, 5]}  intensity={1.4} />
      <directionalLight position={[-4, 4, -3]} intensity={0.4} />
      <OrbitControls makeDefault />

      <QueueBase capacity={capacity} />

      {/* slot outlines and index labels */}
      {Array.from({ length: capacity }, (_, i) => (
        <group key={`slot-${i}`}>
          {i < front ? (
            //dequeued slots
            <DequeuedSlot x={slotX(i, capacity)} index={i} />
          ) : (
            //empty or future slot
            <EmptySlot x={slotX(i, capacity)} />
          )}
          <SlotIndex x={slotX(i, capacity)} index={i} />
        </group>
      ))}

      {/* full-check flash on enqueue line 2 */}
      {isFullCheckLine && (
        <FullCheckFlash
          key={flashKey}
          capacity={capacity}
          front={front}
          rear={rear}
          isFull={isFull}
          speed={speed}
        />
      )}

      <ShakeGroup key={shakeKey} active={!!step?.error}>
        {view?.items.map((item, i) => {
          //true array slot = front + i
          const trueSlot = front + i;
          const x = slotX(trueSlot, capacity);
          const isNew = isEnqueueStep && !prevIds.has(item.id);
          const isHighlighted = isPeekStep && i === 0;

          if (isNew && isInsertLine) {
            //line 6: drop from above
            return <DropBlock key={item.id} value={item.value} x={x} speed={speed} />;
          }
          if (isNew) {
            //earlier enqueue steps (line 1 / 5): show statically at correct slot
            return <StaticBlock key={item.id} value={item.value} x={x} colorKind="new" />;
          }
          if (isHighlighted) {
            return <PeekBlock key={item.id} value={item.value} x={x} />;
          }
          return <StaticBlock key={item.id} value={item.value} x={x} colorKind="default" />;
        })}
      </ShakeGroup>

      {ghostItem && (
        <DequeueGhost
          key={ghostKey}
          value={ghostItem.value}
          x={slotX(ghostItem.slotIndex, capacity)}
        />
      )}

      {/* FRONT chip: above front slot when queue is non-empty */}
      {view && view.items.length > 0 && (
        <FrontLabel x={slotX(front, capacity)} />
      )}

      {/* REAR chip: springs to rear's true slot; special label when rear = -1 */}
      {view && rear >= 0 && (
        <RearLabel key="rear-chip" targetX={rearChipX} speed={speed} />
      )}
      {view && rear === -1 && (
        <RearMinusOneLabel capacity={capacity} />
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

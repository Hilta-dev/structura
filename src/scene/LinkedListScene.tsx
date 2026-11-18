import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLinkedListStore, getAddress } from '../store/useLinkedListStore';
import type { LinkedListView, LinkedListNode } from '../engine/types';
import {
  COLOR_NODE,     COLOR_NODE_EMISSIVE,
  COLOR_NEW,      COLOR_NEW_EMISSIVE,
  COLOR_VISITED,  COLOR_VISITED_EMISSIVE,
  COLOR_FOUND,    COLOR_FOUND_EMISSIVE,
  COLOR_PTR,      COLOR_PTR_NEW,
  COLOR_ARROW,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DIM,
  COLOR_TEXT_ON_LIME,
  COLOR_CHIP_BG,
  COLOR_ERROR,
} from './sceneColors';

// ── Geometry constants ───────────────────────────────────────────────────
const NODE_H = 0.8;
const NODE_D = 0.8;
const DATA_W = 1.0;
const PTR_W  = 1.0;
const NODE_W = DATA_W + PTR_W;
const GAP    = 1.2;
const STEP   = NODE_W + GAP;

function nodeX(index: number): number { return index * STEP; }

/** Format a numeric address as hex: 100 → 0x64, 200 → 0xC8 */
function fmtAddr(raw: number | string): string {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (isNaN(n)) return String(raw);
  return '0x' + n.toString(16).toUpperCase();
}

type NodeKind = 'default' | 'new' | 'visited' | 'found';

function nodeBodyColor(kind: NodeKind): string {
  if (kind === 'new')     return COLOR_NEW;
  if (kind === 'visited') return COLOR_VISITED;
  if (kind === 'found')   return COLOR_FOUND;
  return COLOR_NODE;
}
function nodeBodyEmissive(kind: NodeKind): string {
  if (kind === 'new')     return COLOR_NEW_EMISSIVE;
  if (kind === 'visited') return COLOR_VISITED_EMISSIVE;
  if (kind === 'found')   return COLOR_FOUND_EMISSIVE;
  return COLOR_NODE_EMISSIVE;
}
function nodePtrColor(kind: NodeKind): string {
  return kind === 'new' ? COLOR_PTR_NEW : COLOR_PTR;
}

// ── LLNode ───────────────────────────────────────────────────────────────
function LLNode({
  node,
  index,
  kind,
  nextAddress,
  prevNodeIds,
}: {
  node: LinkedListNode;
  index: number;
  kind: NodeKind;
  nextAddress: string;
  prevNodeIds: Set<string>;
}) {
  const x       = nodeX(index);
  const address = fmtAddr(getAddress(node.id));
  const isNew   = !prevNodeIds.has(node.id);

  // pointer text: dim purple for existing nodes, brighter for new
  const ptrTextColor = isNew ? '#c2b2fd' : COLOR_TEXT_MUTED;
  // "null" in dim grey
  const nextText   = nextAddress === 'NULL' ? 'null' : nextAddress;
  const nextColor  = nextAddress === 'NULL' ? COLOR_TEXT_DIM : ptrTextColor;

  return (
    <group position={[x, 0, 0]}>
      {/* data cell */}
      <mesh position={[-PTR_W / 2, 0, 0]}>
        <boxGeometry args={[DATA_W, NODE_H, NODE_D]} />
        <meshStandardMaterial
          color={nodeBodyColor(kind)}
          emissive={nodeBodyEmissive(kind)}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text
        position={[-PTR_W / 2, 0, NODE_D / 2 + 0.01]}
        fontSize={0.28}
        color={COLOR_TEXT}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000"
      >
        {String(node.data)}
      </Text>

      {/* pointer cell */}
      <mesh position={[DATA_W / 2, 0, 0]}>
        <boxGeometry args={[PTR_W, NODE_H, NODE_D]} />
        <meshStandardMaterial
          color={nodePtrColor(kind)}
          emissive={nodeBodyEmissive(kind)}
          emissiveIntensity={0.25}
        />
      </mesh>
      <Text
        position={[DATA_W / 2, 0, NODE_D / 2 + 0.01]}
        fontSize={0.17}
        color={nextColor}
        anchorX="center"
        anchorY="middle"
      >
        {nextText}
      </Text>

      {/* hex address label below node */}
      <Text
        position={[0, -NODE_H / 2 - 0.25, 0]}
        fontSize={0.17}
        color={COLOR_TEXT_MUTED}
        anchorX="center"
        anchorY="middle"
      >
        {address}
      </Text>
    </group>
  );
}

// ── Arrow (lime) ─────────────────────────────────────────────────────────
function Arrow({ fromIndex }: { fromIndex: number }) {
  const startX = nodeX(fromIndex) + DATA_W / 2 + PTR_W / 2 + 0.05;
  const endX   = nodeX(fromIndex + 1) - NODE_W / 2 - 0.05;
  const midX   = (startX + endX) / 2;
  const length = endX - startX;

  return (
    <group position={[midX, 0, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.07, 0.07]} />
        <meshBasicMaterial color={COLOR_ARROW} />
      </mesh>
      <mesh position={[length / 2 + 0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.26, 6]} />
        <meshBasicMaterial color={COLOR_ARROW} />
      </mesh>
    </group>
  );
}

function Arrowhead({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.13, 0.26, 6]} />
      <meshBasicMaterial color={COLOR_ARROW} />
    </mesh>
  );
}

// ── Head box (lime chip) ──────────────────────────────────────────────────
function HeadBox({ headAddress }: { headAddress: string }) {
  const boxX      = -STEP - 0.4;
  const arrowStart = boxX + 0.6;
  const arrowEnd  = -NODE_W / 2 - 0.08;
  const midX      = (arrowStart + arrowEnd) / 2;
  const shaftLen  = arrowEnd - arrowStart - 0.2;
  const dispAddr  = headAddress === 'NULL' ? 'null' : fmtAddr(headAddress);

  return (
    <group>
      {/* lime chip box */}
      <mesh position={[boxX, 0, 0]}>
        <boxGeometry args={[1.1, NODE_H, NODE_D]} />
        <meshBasicMaterial color={COLOR_CHIP_BG} />
      </mesh>
      <Text
        position={[boxX, 0.15, NODE_D / 2 + 0.01]}
        fontSize={0.17}
        color={COLOR_TEXT_ON_LIME}
        anchorX="center"
        anchorY="middle"
      >
        head
      </Text>
      <Text
        position={[boxX, -0.1, NODE_D / 2 + 0.01]}
        fontSize={0.19}
        color={COLOR_TEXT_ON_LIME}
        anchorX="center"
        anchorY="middle"
      >
        {dispAddr}
      </Text>
      {/* lime arrow shaft */}
      {shaftLen > 0 && (
        <mesh position={[midX, 0, 0]}>
          <boxGeometry args={[shaftLen, 0.07, 0.07]} />
          <meshBasicMaterial color={COLOR_ARROW} />
        </mesh>
      )}
      <Arrowhead x={arrowEnd} y={0} />
    </group>
  );
}

// ── Camera ────────────────────────────────────────────────────────────────
function LLCameraRig({ nodeCount }: { nodeCount: number }) {
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera; controls: unknown };
  const targetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const count  = Math.max(nodeCount, 1);
    const totalW = STEP + count * STEP;
    const midX   = (totalW - STEP) / 2 - STEP * 0.5;
    const dist   = 2 + totalW * 0.65;
    camera.position.set(midX, 0, dist);
    camera.lookAt(midX, 0, 0);
    targetRef.current.set(midX, 0, 0);
  }, [nodeCount, camera]);

  useFrame(() => {
    const ctrl = controls as { target?: THREE.Vector3; update?: () => void } | null;
    if (ctrl?.target) ctrl.target.lerp(targetRef.current, 0.15);
  });

  return null;
}

// ── Scene root ────────────────────────────────────────────────────────────
export default function LinkedListScene() {
  const listState     = useLinkedListStore((s) => s.listState);
  const highlights    = useLinkedListStore((s) => s.highlights);
  const findHighlight = useLinkedListStore((s) => s.findHighlight);
  const message       = useLinkedListStore((s) => s.message);
  const walkSteps     = useLinkedListStore((s) => s.walkSteps);
  const walkIndex     = useLinkedListStore((s) => s.walkIndex);

  // During a walkthrough the step's highlights[0] is the new-node id — use
  // that directly so purple appears as soon as Allocate is shown.
  // Outside a walkthrough fall back to the prev-render frame-diff heuristic.
  const walkActive   = walkSteps.length > 0;
  const walkNewId    = walkActive ? (walkSteps[walkIndex]?.highlights[0] ?? null) : null;

  const prevNodeIdsRef = useRef<Set<string>>(new Set());
  const prevNodeIds    = prevNodeIdsRef.current;
  const currentIds     = new Set(listState.nodes.map((n) => n.id));

  const view: LinkedListView = {
    kind:     'linkedList',
    head:     listState.head,
    nodes:    listState.nodes,
    capacity: 8,
  };

  const ordered: LinkedListNode[] = [];
  let cur = view.head;
  while (cur !== null) {
    const node = view.nodes.find((n) => n.id === cur!);
    if (!node) break;
    ordered.push(node);
    cur = node.next;
  }

  const highlightSet = new Set(highlights);
  const isError = message.includes('!') && (
    message.includes('empty') || message.includes('full') || message.includes('Invalid')
  );

  const headAddress = view.head !== null ? String(getAddress(view.head)) : 'NULL';

  useEffect(() => {
    prevNodeIdsRef.current = currentIds;
  });

  return (
    <>
      <LLCameraRig nodeCount={ordered.length} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 8, 5]}   intensity={1.4} />
      <directionalLight position={[-4, 4, -3]}  intensity={0.4} />
      <OrbitControls makeDefault />

      <HeadBox headAddress={headAddress} />

      {ordered.map((node, i) => {
        const isNewNode  = walkActive
          ? node.id === walkNewId
          : !prevNodeIds.has(node.id);
        const isFound    = node.id === findHighlight;
        const isVisited  = !isFound && !isNewNode && highlightSet.has(node.id);
        const kind: NodeKind = isNewNode ? 'new'
          : isFound   ? 'found'
          : isVisited ? 'visited'
          : 'default';

        const nextAddress = node.next !== null
          ? String(getAddress(node.next))
          : 'NULL';

        return (
          <group key={node.id}>
            <LLNode
              node={node}
              index={i}
              kind={kind}
              nextAddress={nextAddress}
              prevNodeIds={walkActive ? new Set() : prevNodeIds}
            />
            {i < ordered.length - 1 && <Arrow fromIndex={i} />}
          </group>
        );
      })}

      {/* "null" terminator after last node */}
      {ordered.length > 0 && (
        <Text
          position={[nodeX(ordered.length - 1) + NODE_W / 2 + GAP * 0.5, 0, NODE_D / 2 + 0.01]}
          fontSize={0.22}
          color={COLOR_TEXT_DIM}
          anchorX="center"
          anchorY="middle"
        >
          null
        </Text>
      )}

      {/* tail label */}
      {ordered.length > 0 && (
        <Text
          position={[nodeX(ordered.length - 1), -NODE_H / 2 - 0.55, 0]}
          fontSize={0.17}
          color={COLOR_TEXT_MUTED}
          anchorX="center"
          anchorY="middle"
        >
          tail
        </Text>
      )}

      {/* error overlay */}
      {isError && (
        <Text
          position={[nodeX(Math.max(ordered.length - 1, 0)) / 2, NODE_H + 0.6, 0]}
          fontSize={0.3}
          color={COLOR_ERROR}
          anchorX="center"
          anchorY="middle"
        >
          {message}
        </Text>
      )}
    </>
  );
}

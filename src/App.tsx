import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StackScene from './scene/StackScene';
import LinkedListScene from './scene/LinkedListScene';
import QueueScene from './scene/QueueScene';
import StackControls from './components/StackControls';
import QueueControls from './components/QueueControls';
import InsertHeadWalkthrough from './components/InsertHeadWalkthrough';
import Timeline from './components/Timeline';
import PseudocodePanel from './components/PseudocodePanel';
import StepCaption from './components/StepCaption';
import RightPanel from './components/RightPanel';
import { useLinkedListStore } from './store/useLinkedListStore';
import { usePlaygroundStore } from './store/usePlaygroundStore';

type NavTab = 'playground' | 'predict' | 'bughunter' | 'practice';
type Structure = 'linkedlist' | 'stack' | 'queue';

function LLPseudocodePanel() {
  const pseudocode  = useLinkedListStore((s) => s.pseudocode);
  const message     = useLinkedListStore((s) => s.message);
  const walkSteps   = useLinkedListStore((s) => s.walkSteps);
  const walkIndex   = useLinkedListStore((s) => s.walkIndex);
  // During a walkthrough, highlight the pseudocode line for the current step.
  const activeLine  = walkSteps.length > 0
    ? (walkSteps[walkIndex]?.codeLine ?? -1)
    : -1;
  return <PseudocodePanel pseudocode={pseudocode} activeLine={activeLine} explanation={message} />;
}

const NAV_TABS: { id: NavTab; label: string; disabled?: boolean }[] = [
  { id: 'playground', label: 'Playground' },
  { id: 'predict',    label: 'Predict',     disabled: true },
  { id: 'bughunter',  label: 'Bug Hunter',  disabled: true },
  { id: 'practice',   label: 'Practice',    disabled: true },
];

const STRUCTURES: { id: Structure; label: string; disabled?: boolean }[] = [
  { id: 'linkedlist', label: 'Linked list' },
  { id: 'stack',      label: 'Stack' },
  { id: 'queue',      label: 'Queue' },
];

export default function App() {
  const [navTab, setNavTab]       = useState<NavTab>('playground');
  const [structure, setStructure] = useState<Structure>('linkedlist');

  const structureLabel = STRUCTURES.find((s) => s.id === structure)?.label ?? '';

  function handleStructureChange(id: Structure) {
    if (id === structure) return;
    setStructure(id);
    // reset the shared playground store when switching tabs
    usePlaygroundStore.getState().loadSteps([], []);
  }

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}
      className="flex flex-col w-screen h-screen overflow-hidden"
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}
        className="flex items-center gap-6 px-5 h-11 shrink-0 z-20"
      >
        <span
          style={{ color: 'var(--text)', letterSpacing: '0.12em', fontWeight: 700, fontSize: 13 }}
          className="uppercase tracking-widest select-none"
        >
          STRUCTURA
        </span>

        <nav className="flex items-center gap-1">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              disabled={t.disabled}
              onClick={() => !t.disabled && setNavTab(t.id)}
              style={{
                color:            t.disabled ? 'var(--text-dim)' : navTab === t.id ? 'var(--text)' : 'var(--text-muted)',
                background:       navTab === t.id && !t.disabled ? 'var(--surface-2)' : 'transparent',
                borderRadius:     'var(--r-sm)',
                fontWeight:       navTab === t.id && !t.disabled ? 600 : 400,
                fontSize:         12,
                padding:          '3px 10px',
                cursor:           t.disabled ? 'default' : 'pointer',
                border:           'none',
                transition:       'color 0.15s, background 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Sub-header: page title + structure switcher ──────────────────── */}
      <div
        style={{
          background:   'var(--surface-1)',
          borderBottom: '1px solid var(--border)',
        }}
        className="flex items-center justify-between px-5 h-10 shrink-0 z-10"
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          The Playground
        </span>

        <div className="flex items-center gap-1">
          {STRUCTURES.map((s) => (
            <button
              key={s.id}
              disabled={s.disabled}
              onClick={() => !s.disabled && handleStructureChange(s.id)}
              style={{
                color:        s.disabled ? 'var(--text-dim)' : structure === s.id ? 'var(--text)' : 'var(--text-muted)',
                background:   structure === s.id && !s.disabled ? 'var(--accent-dim)' : 'transparent',
                border:       structure === s.id && !s.disabled ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: 'var(--r-sm)',
                fontWeight:   structure === s.id && !s.disabled ? 600 : 400,
                fontSize:     12,
                padding:      '2px 10px',
                cursor:       s.disabled ? 'default' : 'pointer',
                transition:   'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Three-column body ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT PANEL: pseudocode ───────────────────────────────────── */}
        <aside
          style={{
            width: 280,
            minWidth: 220,
            background: 'var(--surface-1)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {structure === 'linkedlist' && <LLPseudocodePanel />}
          {structure === 'stack'      && <PseudocodePanel />}
          {structure === 'queue'      && <PseudocodePanel />}
        </aside>

        {/* ── MIDDLE PANEL: 3D scene + timeline ───────────────────────── */}
        <main
          style={{ background: 'var(--bg)' }}
          className="flex flex-col flex-1 min-w-0 relative"
        >
          {/* 3D canvas area — flex-1 so it fills remaining space above caption */}
          <div className="relative flex-1 min-h-0">
            <div className={`absolute inset-0 ${structure === 'linkedlist' ? '' : 'hidden'}`}>
              <Canvas camera={{ fov: 50 }}>
                <LinkedListScene />
              </Canvas>
            </div>
            <div className={`absolute inset-0 ${structure === 'stack' ? '' : 'hidden'}`}>
              <Canvas camera={{ fov: 50 }}>
                <StackScene />
              </Canvas>
            </div>
            <div className={`absolute inset-0 ${structure === 'queue' ? '' : 'hidden'}`}>
              <Canvas camera={{ fov: 50 }}>
                <QueueScene />
              </Canvas>
            </div>
          </div>

          {/* caption part — StepCaption sits between the 3D scene and the controls bar */}
          <StepCaption structure={structure} />

          {/* Controls + timeline bar at bottom */}
          <div
            style={{
              background:   'var(--surface-1)',
              borderTop:    '1px solid var(--border)',
            }}
          >
            {/* Operation controls */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              {structure === 'linkedlist' && <InsertHeadWalkthrough />}
              {structure === 'stack'      && <StackControls />}
              {structure === 'queue'      && <QueueControls />}
            </div>

            {/* Timeline for stack and queue */}
            {(structure === 'stack' || structure === 'queue') && (
              <div style={{ padding: '8px 14px' }}>
                <Timeline />
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL: learning partner ───────────────────────────── */}
        <aside
          style={{
            width: 260,
            minWidth: 220,
            background: 'var(--surface-1)',
            borderLeft: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <RightPanel structureId={structure} label={structureLabel} />
        </aside>
      </div>
    </div>
  );
}

import { usePlaygroundStore } from '../store/usePlaygroundStore';

type Props = {
  pseudocode?: readonly string[];
  activeLine?: number;
  explanation?: string;
};

export default function PseudocodePanel(props: Props) {
  const storePseudocode = usePlaygroundStore((s) => s.pseudocode);
  const steps           = usePlaygroundStore((s) => s.steps);
  const currentStep     = usePlaygroundStore((s) => s.currentStep);

  const pseudocode  = props.pseudocode  ?? storePseudocode;
  const activeLine  = props.activeLine  ?? (steps[currentStep]?.codeLine ?? -1);
  const explanation = props.explanation ?? (steps[currentStep]?.explanation ?? '');

  if (pseudocode.length === 0) return null;

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        height:         '100%',
        overflow:       'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding:      '10px 14px 8px',
          borderBottom: '1px solid var(--border)',
          fontSize:     10,
          fontWeight:   700,
          letterSpacing:'0.1em',
          textTransform:'uppercase',
          color:        'var(--text-dim)',
          flexShrink:   0,
        }}
      >
        01 / Pseudocode
      </div>

      {/* Code listing */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: '22px' }}>
          {pseudocode.map((line, i) => {
            const lineNumber = i + 1;
            const isActive   = lineNumber === activeLine;
            return (
              <li
                key={i}
                style={{
                  display:        'flex',
                  gap:            8,
                  borderRadius:   'var(--r-sm)',
                  //pseudocode highlight: thicker left border + brighter background for active line
                  padding:        isActive ? '2px 4px 2px 8px' : '2px 4px',
                  borderLeft:     isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  background:     isActive ? 'rgba(199,243,107,0.14)' : 'transparent',
                  color:          isActive ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight:     isActive ? 700 : 400,
                }}
              >
                <span style={{ width: 20, textAlign: 'right', flexShrink: 0, opacity: isActive ? 0.7 : 0.35, userSelect: 'none' }}>
                  {lineNumber}
                </span>
                <span>{line}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Explanation removed — StepCaption in the scene area shows this prominently */}
    </div>
  );
}

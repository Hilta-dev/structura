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
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: '20px' }}>
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
                  padding:        '1px 4px',
                  background:     isActive ? 'var(--active-line-bg)' : 'transparent',
                  color:          isActive ? 'var(--active-line-text)' : 'var(--text-muted)',
                  fontWeight:     isActive ? 600 : 400,
                }}
              >
                <span style={{ width: 20, textAlign: 'right', flexShrink: 0, opacity: 0.4, userSelect: 'none' }}>
                  {lineNumber}
                </span>
                <span>{line}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Explanation */}
      {explanation && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding:   '10px 14px',
            fontSize:  11,
            color:     'var(--text-muted)',
            lineHeight: 1.6,
            flexShrink: 0,
          }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}

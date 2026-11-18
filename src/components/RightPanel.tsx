type Props = { structure: string };

export default function RightPanel({ structure }: Props) {
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        overflow:      'hidden',
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
        03 / Your Learning Partner
      </div>

      {/* Placeholder body */}
      <div
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            10,
          padding:        '24px 20px',
          textAlign:      'center',
        }}
      >
        <div
          style={{
            width:        48,
            height:       48,
            borderRadius: '50%',
            background:   'var(--surface-2)',
            border:       '1px solid var(--border)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     20,
            color:        'var(--text-dim)',
          }}
        >
          ✦
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {structure}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Context cards, hints, and step insights will appear here.
        </span>
        <div
          style={{
            marginTop:    8,
            padding:      '6px 14px',
            background:   'var(--accent)',
            border:       '1px solid var(--accent)',
            borderRadius: 'var(--r-sm)',
            fontSize:     11,
            color:        'var(--accent-text)',
          }}
        >
          Coming soon
        </div>
      </div>
    </div>
  );
}

export default function SafetyBanner({ redFlag, onDismiss }) {
  if (!redFlag || !redFlag.is_urgent) return null;

  return (
    <div 
      style={{
        background: 'rgba(239, 68, 68, 0.18)',
        border: '2px solid #ef4444',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 0 25px rgba(239, 68, 68, 0.35)',
        backdropFilter: 'blur(10px)',
        animation: 'pulseGlow 2s infinite ease-in-out',
        position: 'relative'
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🚨</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#fca5a5', fontSize: '1rem', fontWeight: '800', letterSpacing: '0.04em', margin: 0 }}>
              {redFlag.title || '⚠ URGENT SYMPTOM PATTERN DETECTED'}
            </h3>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <p style={{ color: '#fee2e2', fontSize: '0.875rem', margin: '0.4rem 0 0.6rem', lineHeight: 1.5 }}>
            {redFlag.message}
          </p>

          {redFlag.flagged_reasons && redFlag.flagged_reasons.length > 0 && (
            <ul style={{ margin: '0 0 0.6rem 1.2rem', color: '#fca5a5', fontSize: '0.8rem' }}>
              {redFlag.flagged_reasons.map((reason, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{reason}</li>
              ))}
            </ul>
          )}

          <div 
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              borderLeft: '3px solid #ef4444',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: '600'
            }}
          >
            <strong>Action Required:</strong> {redFlag.action_recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

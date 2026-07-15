export default function Results({ result, onReset }) {
  if (!result) return null;

  const { risk_level, risk_score } = result;
  
  // Convert score to percentage
  const percentage = Math.round(risk_score * 100);

  return (
    <div className="result-card">
      <h2>Analysis Complete</h2>
      
      <div className={`score-circle risk-${risk_level.split(' ')[0]}`}>
        {percentage}%
      </div>
      
      <h3 style={{ marginBottom: '1.5rem' }}>{risk_level}</h3>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        This is an AI-generated preliminary assessment and should not replace professional medical advice.
      </p>
      
      <button onClick={onReset} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
        New Assessment
      </button>
    </div>
  );
}

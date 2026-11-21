export default function CompleteHealthScan({
  cardioResult,
  neuroResult,
  labResult,
  sanityLevel,
  heartRate,
  onNavigateModule
}) {
  const cardioScore = cardioResult ? (cardioResult.risk_percentage || Math.round((cardioResult.risk_score || 0) * 100)) : null;
  const neuroScore = neuroResult ? Math.round(neuroResult.concern_score || 0) : null;
  const labScore = labResult ? labResult.data_completeness_pct : null;

  return (
    <div className="complete-scan-panel">
      <div className="scan-header">
        <div className="header-icon">🧭</div>
        <div>
          <h2>Integrated Health Scan Matrix</h2>
          <p>Holistic multi-domain risk evaluation across cardiovascular, neurological, metabolic, and lab biomarkers</p>
        </div>
      </div>

      {/* 4 Multi-Domain Pillar Cards */}
      <div className="pillars-grid">
        {/* Pillar 1: Cardiovascular Risk */}
        <div className="pillar-card">
          <div className="pillar-top">
            <span className="pillar-emoji">❤️</span>
            <span className="pillar-name">Cardiovascular</span>
            <span className={`pillar-badge ${cardioResult?.risk_level?.toLowerCase() || 'unscreened'}`}>
              {cardioResult ? cardioResult.risk_level : 'Not Evaluated'}
            </span>
          </div>

          <div className="pillar-meter-wrap">
            <div className="meter-val">
              {cardioScore !== null ? `${cardioScore}% Risk` : '---'}
            </div>
            <div className="meter-track">
              <div 
                className="meter-bar cardio-bar"
                style={{ width: `${cardioScore !== null ? cardioScore : 0}%` }}
              />
            </div>
          </div>

          <p className="pillar-desc">
            {cardioResult 
              ? `Calculated using calibrated Logistic Regression (${cardioResult.model_version || 'v2.1'}). Resting HR: ${heartRate} BPM.`
              : 'Provide age, blood pressure, cholesterol, and symptoms to evaluate.'}
          </p>

          <button 
            type="button" 
            className="pillar-action-btn"
            onClick={() => onNavigateModule('cardio')}
          >
            {cardioResult ? 'Review Cardio Data' : 'Start Cardio Screening'}
          </button>
        </div>

        {/* Pillar 2: Neurological Index */}
        <div className="pillar-card">
          <div className="pillar-top">
            <span className="pillar-emoji">🧠</span>
            <span className="pillar-name">Neurological Index</span>
            <span className={`pillar-badge ${neuroResult?.concern_level?.toLowerCase() || 'unscreened'}`}>
              {neuroResult ? neuroResult.concern_level : 'Not Evaluated'}
            </span>
          </div>

          <div className="pillar-meter-wrap">
            <div className="meter-val">
              {neuroScore !== null ? `${neuroScore}/100 Index` : '---'}
            </div>
            <div className="meter-track">
              <div 
                className="meter-bar neuro-bar"
                style={{ width: `${neuroScore !== null ? neuroScore : 0}%` }}
              />
            </div>
          </div>

          <p className="pillar-desc">
            {neuroResult
              ? `Domain analysis across ${Object.keys(neuroResult.domain_breakdown || {}).length} neural categories. Flagged: ${neuroResult.flagged_symptoms?.length || 0} signs.`
              : 'Screen for cognitive, motor, sensory, headache, and sleep indicators.'}
          </p>

          <button 
            type="button" 
            className="pillar-action-btn"
            onClick={() => onNavigateModule('neuro')}
          >
            {neuroResult ? 'Review Neuro Assessment' : 'Start Neuro Assessment'}
          </button>
        </div>

        {/* Pillar 3: Lab Completeness */}
        <div className="pillar-card">
          <div className="pillar-top">
            <span className="pillar-emoji">🧪</span>
            <span className="pillar-name">Biomarker Completeness</span>
            <span className={`pillar-badge ${labScore > 75 ? 'optimal' : labScore > 0 ? 'partial' : 'unscreened'}`}>
              {labScore !== null ? `${labScore}% Mapped` : 'No Lab File'}
            </span>
          </div>

          <div className="pillar-meter-wrap">
            <div className="meter-val">
              {labScore !== null ? `${labScore}% Complete` : '0%'}
            </div>
            <div className="meter-track">
              <div 
                className="meter-bar lab-bar"
                style={{ width: `${labScore !== null ? labScore : 0}%` }}
              />
            </div>
          </div>

          <p className="pillar-desc">
            {labResult
              ? `Parsed ${labResult.biomarkers_recognized?.length || 0} recognized clinical biomarkers from ${labResult.filename}.`
              : 'Upload a standard .CSV lab report to auto-populate patient biomarkers.'}
          </p>

          <button 
            type="button" 
            className="pillar-action-btn"
            onClick={() => onNavigateModule('labs')}
          >
            {labResult ? 'View Lab Report' : 'Upload Lab CSV'}
          </button>
        </div>

        {/* Pillar 4: Neural Coherence & Sanity */}
        <div className="pillar-card">
          <div className="pillar-top">
            <span className="pillar-emoji">✨</span>
            <span className="pillar-name">Metabolic &amp; Coherence</span>
            <span className={`pillar-badge ${sanityLevel < 40 ? 'critical' : sanityLevel < 70 ? 'moderate' : 'optimal'}`}>
              {sanityLevel >= 70 ? 'Coherent' : sanityLevel >= 40 ? 'Depleted' : 'Critical Horror'}
            </span>
          </div>

          <div className="pillar-meter-wrap">
            <div className="meter-val">
              {Math.round(sanityLevel)}% Sanity
            </div>
            <div className="meter-track">
              <div 
                className="meter-bar sanity-bar"
                style={{ width: `${Math.round(sanityLevel)}%` }}
              />
            </div>
          </div>

          <p className="pillar-desc">
            Vitals modulated by Minecraft survival nutrition, fast foods, potions, and horror mod darkness triggers.
          </p>

          <button 
            type="button" 
            className="pillar-action-btn"
            onClick={() => onNavigateModule('ai_scan')}
          >
            Open AI Companion
          </button>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="scan-footer-banner">
        <span className="info-icon">🛡️</span>
        <div>
          <strong>Strict Non-Diagnostic Advisory:</strong> This integrated risk matrix provides statistical screening models and should never supersede formal in-person evaluation by a qualified medical professional.
        </div>
      </div>
    </div>
  );
}

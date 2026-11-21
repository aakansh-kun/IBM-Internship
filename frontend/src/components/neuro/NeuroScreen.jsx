import { useState } from 'react';
import SafetyBanner from '../medical/SafetyBanner';

export default function NeuroScreen({
  neuroResult,
  loading,
  onSubmit,
  onExplainAI
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);
  const [configuringSymptom, setConfiguringSymptom] = useState(null); // When setting severity/duration
  
  // Selected Symptoms Array: [{ id, name, severity, duration, frequency }]
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  // Global Qualifiers
  const [sleepHours, setSleepHours] = useState(7.0);
  const [hasSuddenOnset, setHasSuddenOnset] = useState(false);
  const [showTelemetryInsteadOfResult, setShowTelemetryInsteadOfResult] = useState(false);

  // Symptom Catalog grouped by category
  const symptomCatalog = {
    cognitive: {
      name: 'Cognitive',
      icon: '🧠',
      items: [
        { id: 'memory_difficulty', name: 'Memory Difficulty / Forgetfulness' },
        { id: 'confusion', name: 'Acute Mental Confusion' },
        { id: 'concentration_problems', name: 'Concentration Deficit' },
        { id: 'brain_fog', name: 'Brain Fog / Cognitive Latency' }
      ]
    },
    motor: {
      name: 'Motor',
      icon: '⚡',
      items: [
        { id: 'tremor', name: 'Involuntary Tremor / Shaking' },
        { id: 'weakness', name: 'Unilateral Motor Weakness' },
        { id: 'coordination_difficulty', name: 'Coordination Difficulty / Ataxia' },
        { id: 'balance_problems', name: 'Gait & Balance Instability' }
      ]
    },
    sensory: {
      name: 'Sensory',
      icon: '👁️',
      items: [
        { id: 'numbness', name: 'Focal Numbness / Loss of Sensation' },
        { id: 'tingling', name: 'Paresthesia / Pins & Needles' },
        { id: 'vision_disturbance', name: 'Visual Disturbance / Blurring' },
        { id: 'photophobia', name: 'Photophobia (Light Sensitivity)' }
      ]
    },
    sleep: {
      name: 'Sleep',
      icon: '🌙',
      items: [
        { id: 'insomnia', name: 'Sleep Onset Insomnia' },
        { id: 'excessive_sleepiness', name: 'Daytime Somnolence' },
        { id: 'fragmented_sleep', name: 'Fragmented Frequent Wakings' }
      ]
    },
    headache: {
      name: 'Headache',
      icon: '✦',
      items: [
        { id: 'migraine', name: 'Throbbing Migraine' },
        { id: 'aura', name: 'Visual Aura / Scotoma' },
        { id: 'thunderclap_headache', name: 'Thunderclap Sudden Severe Headache' },
        { id: 'recurring_headache', name: 'Frequent Tension Headache' }
      ]
    },
    other: {
      name: 'Other',
      icon: '+',
      items: [
        { id: 'dizziness', name: 'Dizziness / Vertigo' },
        { id: 'nausea_neuro', name: 'Neurogenic Nausea' },
        { id: 'speech_difficulty', name: 'Expressive Speech Slurring' }
      ]
    }
  };

  // Start configuring a symptom
  const handleStartAddSymptom = (item) => {
    setConfiguringSymptom({
      id: item.id,
      name: item.name,
      severity: 'Moderate',
      duration: 'Days',
      frequency: 'Occasional'
    });
    setActiveCategoryModal(null);
  };

  // Confirm and save configured symptom
  const handleSaveConfiguredSymptom = () => {
    if (!configuringSymptom) return;
    const existingIndex = selectedSymptoms.findIndex(s => s.id === configuringSymptom.id);
    if (existingIndex >= 0) {
      const copy = [...selectedSymptoms];
      copy[existingIndex] = configuringSymptom;
      setSelectedSymptoms(copy);
    } else {
      setSelectedSymptoms([...selectedSymptoms, configuringSymptom]);
    }
    setConfiguringSymptom(null);
  };

  const handleRemoveSymptom = (id) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id));
  };

  const handleRunScreening = (e) => {
    e.preventDefault();
    setShowTelemetryInsteadOfResult(false);
    onSubmit({
      symptoms: selectedSymptoms.map(s => s.id),
      severity: selectedSymptoms.some(s => s.severity === 'Severe') ? 'Severe' : 'Moderate',
      duration: 'Days',
      frequency: 'Occasional',
      sleep_hours: sleepHours,
      has_sudden_onset: hasSuddenOnset
    });
  };

  // Filter all symptoms when searching
  const allFlattened = Object.values(symptomCatalog).flatMap(c => c.items);
  const searchResults = searchTerm.trim() 
    ? allFlattened.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const concernIndex = neuroResult?.concern_index || 0;
  const concernTier = neuroResult?.concern_tier || 'Baseline';
  const showResult = neuroResult && !showTelemetryInsteadOfResult;

  return (
    <div className="focused-medical-shell">
      {/* Red-Flag Emergency Banner */}
      {neuroResult?.red_flag && (
        <SafetyBanner redFlag={neuroResult.red_flag} />
      )}

      <div className="medical-card-frame">
        {/* Card Header */}
        <div className="card-header-bar">
          <div>
            <h2 className="card-headline">
              <span>🧠</span>
              <span>Neuro Scan</span>
            </h2>
            <p className="card-subheadline">Tell us what you are experiencing to screen neurological symptom patterns</p>
          </div>

          <div className="card-status-indicator">
            <span className={`status-dot ${loading ? 'status-calibrating' : neuroResult ? 'status-done' : 'status-ready'}`} />
            <span>{loading ? 'ANALYZING...' : neuroResult ? 'SCAN COMPLETE' : 'READY'}</span>
          </div>
        </div>

        {/* 2-Panel Layout */}
        <div className="cardio-two-panel-grid">
          {/* LEFT PANEL: Clean Search & Progressive Categories */}
          <div className="panel-left-form">
            <form onSubmit={handleRunScreening} className="active-tab-content">
              {/* Search Bar */}
              <div className="neuro-search-container">
                <input
                  type="text"
                  placeholder="🔍 Search symptoms..."
                  className="clean-text-input neuro-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Instant Search Dropdown if typing */}
                {searchResults.length > 0 && (
                  <div className="search-results-floating-card">
                    {searchResults.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className="search-result-row-btn"
                        onClick={() => {
                          handleStartAddSymptom(item);
                          setSearchTerm('');
                        }}
                      >
                        <span>+</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories Row */}
              <div className="categories-section-wrap">
                <div className="section-label">Categories</div>
                <div className="categories-grid-pills">
                  {Object.entries(symptomCatalog).map(([catKey, cat]) => (
                    <button
                      key={catKey}
                      type="button"
                      className="category-pill-btn"
                      onClick={() => setActiveCategoryModal(catKey)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Symptoms List */}
              <div className="selected-symptoms-section">
                <div className="section-label">
                  Selected Symptoms {selectedSymptoms.length > 0 ? `(${selectedSymptoms.length})` : ''}
                </div>

                {selectedSymptoms.length === 0 ? (
                  <p className="no-symptoms-note">No symptoms selected. Pick a category or search above.</p>
                ) : (
                  <div className="symptoms-compact-rows">
                    {selectedSymptoms.map((sym) => (
                      <div key={sym.id} className="symptom-compact-row">
                        <span className="sym-name">{sym.name}</span>
                        <span className={`sym-severity-badge sev-${sym.severity.toLowerCase()}`}>
                          {sym.severity}
                        </span>
                        <button
                          type="button"
                          className="chip-remove-x"
                          onClick={() => handleRemoveSymptom(sym.id)}
                          title="Remove symptom"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="form-submit-row">
                <button
                  type="submit"
                  className="primary-scan-action-btn btn-neuro-accent"
                  disabled={loading}
                >
                  <span>{loading ? 'Computing Neural Signals...' : 'RUN NEURO SCAN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: Live Neural Telemetry OR In-Place Concern Result */}
          <div className="panel-right-telemetry">
            {!showResult ? (
              /* BEFORE SCAN: LIVE NEURAL TELEMETRY */
              <div className="telemetry-vitals-view">
                <div className="telemetry-header">
                  <span className="live-indicator-dot dot-purple" />
                  <span className="telemetry-header-title">SLEEP &amp; ONSET</span>
                </div>

                {/* Sleep Hours Slider */}
                <div className="clean-input-box" style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Nightly Sleep</label>
                    <span style={{ color: sleepHours < 6 ? '#f87171' : '#34d399', fontWeight: '800', fontSize: '0.85rem' }}>
                      {sleepHours}h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="clean-range-slider"
                  />
                </div>

                {/* Sudden Onset Checkbox */}
                <div style={{ marginTop: '1rem' }}>
                  <label className="clean-checkbox-label">
                    <input
                      type="checkbox"
                      checked={hasSuddenOnset}
                      onChange={(e) => setHasSuddenOnset(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
                      Acute Instantaneous Onset (Symptoms appeared suddenly)
                    </span>
                  </label>
                </div>

                {neuroResult && (
                  <button
                    type="button"
                    className="view-toggle-link-btn"
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => setShowTelemetryInsteadOfResult(false)}
                  >
                    View Last Concern Result →
                  </button>
                )}
              </div>
            ) : (
              /* AFTER SCAN: NEUROLOGICAL CONCERN INDEX IN SAME SPACE */
              <div className="telemetry-result-view">
                <div className="telemetry-header">
                  <span className="telemetry-header-title">NEURO CONCERN</span>
                  <button
                    type="button"
                    className="view-toggle-link-btn"
                    onClick={() => setShowTelemetryInsteadOfResult(true)}
                  >
                    Vitals
                  </button>
                </div>

                {/* Concern Score & Tier */}
                <div className="risk-hero-box">
                  <span className={`risk-hero-percentage concern-${concernTier.toLowerCase()}`}>
                    {concernIndex}%
                  </span>
                  <span className={`risk-badge-tier tier-neuro-${concernTier.toLowerCase()}`}>
                    {concernTier.toUpperCase()}
                  </span>
                </div>

                {/* Clean Segmented Meter */}
                <div className="clean-risk-meter-track">
                  <div 
                    className="clean-risk-meter-fill"
                    style={{
                      width: `${Math.max(4, Math.min(100, concernIndex))}%`,
                      background: concernIndex > 65 
                        ? '#ef4444' 
                        : concernIndex > 35 
                          ? '#a855f7' 
                          : '#38bdf8'
                    }}
                  />
                </div>

                {/* Pattern Notes */}
                <div className="signals-compact-box">
                  <div className="signals-label">Identified pattern</div>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                    {neuroResult.potential_patterns?.[0] || 'Symptom distribution within baseline range.'}
                  </p>
                </div>

                {/* Explain with AI Action */}
                <button
                  type="button"
                  className="clean-ai-explain-btn"
                  onClick={() => onExplainAI(neuroResult)}
                >
                  ✨ Explain with AI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP 1: CATEGORY DRAWER / MODAL */}
      {activeCategoryModal && (
        <div className="symptom-popover-backdrop" onClick={() => setActiveCategoryModal(null)}>
          <div className="symptom-category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="popover-search-row">
              <span className="modal-category-title">
                {symptomCatalog[activeCategoryModal]?.icon} {symptomCatalog[activeCategoryModal]?.name} Symptoms
              </span>
              <button
                type="button"
                className="popover-close-btn"
                onClick={() => setActiveCategoryModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-items-list">
              {symptomCatalog[activeCategoryModal]?.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className="category-symptom-row-btn"
                  onClick={() => handleStartAddSymptom(item)}
                >
                  <span>+</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: CONFIGURE SYMPTOM QUALIFIERS MODAL */}
      {configuringSymptom && (
        <div className="symptom-popover-backdrop" onClick={() => setConfiguringSymptom(null)}>
          <div className="symptom-qualifier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="popover-search-row">
              <span className="modal-category-title">{configuringSymptom.name}</span>
              <button
                type="button"
                className="popover-close-btn"
                onClick={() => setConfiguringSymptom(null)}
              >
                ✕
              </button>
            </div>

            {/* Severity Radio/Buttons */}
            <div className="qualifier-field-block">
              <label>Severity</label>
              <div className="clean-segmented-row">
                {['Mild', 'Moderate', 'Severe'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    className={`clean-seg-pill ${configuringSymptom.severity === sev ? 'seg-pill-active' : ''}`}
                    onClick={() => setConfiguringSymptom(prev => ({ ...prev, severity: sev }))}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="qualifier-field-block">
              <label>Duration</label>
              <div className="clean-segmented-row">
                {['Hours', 'Days', 'Weeks'].map(dur => (
                  <button
                    key={dur}
                    type="button"
                    className={`clean-seg-pill ${configuringSymptom.duration === dur ? 'seg-pill-active' : ''}`}
                    onClick={() => setConfiguringSymptom(prev => ({ ...prev, duration: dur }))}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Symptom */}
            <button
              type="button"
              className="primary-scan-action-btn btn-neuro-accent"
              style={{ marginTop: '1rem' }}
              onClick={handleSaveConfiguredSymptom}
            >
              Add Symptom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

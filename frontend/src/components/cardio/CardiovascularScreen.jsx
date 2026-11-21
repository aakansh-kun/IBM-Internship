import { useState } from 'react';
import SafetyBanner from '../medical/SafetyBanner';

export default function CardiovascularScreen({
  formData,
  setFormData,
  prediction,
  loading,
  onSubmit,
  onExplainAI
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'vitals' | 'labs' | 'symptoms'
  const [isSymptomPopoverOpen, setIsSymptomPopoverOpen] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [showVitalsInsteadOfResult, setShowVitalsInsteadOfResult] = useState(false);

  const availableSymptoms = [
    { id: 'chest_pain', label: 'Chest Pain / Pressure', group: 'Common' },
    { id: 'shortness_of_breath', label: 'Shortness of Breath', group: 'Common' },
    { id: 'palpitations', label: 'Palpitations / Fluttering', group: 'Common' },
    { id: 'dizziness', label: 'Dizziness / Lightheadedness', group: 'Common' },
    { id: 'radiating_arm_pain', label: 'Radiating Arm Discomfort', group: 'Other' },
    { id: 'jaw_pain', label: 'Jaw or Neck Discomfort', group: 'Other' },
    { id: 'fatigue', label: 'Unusual Exertional Fatigue', group: 'Other' },
    { id: 'sweating', label: 'Diaphoresis (Cold Sweats)', group: 'Other' },
    { id: 'nausea', label: 'Nausea or Dyspepsia', group: 'Other' }
  ];

  const selectedSymptoms = formData.symptoms || [];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSymptom = (symId) => {
    if (!selectedSymptoms.includes(symId)) {
      const next = [...selectedSymptoms, symId];
      setFormData(prev => ({ ...prev, symptoms: next }));
    }
  };

  const handleRemoveSymptom = (symId) => {
    const next = selectedSymptoms.filter(s => s !== symId);
    setFormData(prev => ({ ...prev, symptoms: next }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowVitalsInsteadOfResult(false);
    onSubmit(formData);
  };

  const filteredSymptoms = availableSymptoms.filter(s => 
    s.label.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  const riskPct = prediction?.risk_percentage || 0;
  const riskTier = prediction?.risk_level || 'Low';

  const showRisk = prediction && !showVitalsInsteadOfResult;

  return (
    <div className="focused-medical-shell">
      {/* Red-Flag Safety Alert Banner */}
      {prediction?.red_flag && (
        <SafetyBanner redFlag={prediction.red_flag} />
      )}

      {/* Main Single Card Container */}
      <div className="medical-card-frame">
        {/* Card Header */}
        <div className="card-header-bar">
          <div>
            <h2 className="card-headline">
              <span>❤️</span>
              <span>Cardio Scan</span>
            </h2>
            <p className="card-subheadline">Screen cardiovascular indicators using calibrated clinical models</p>
          </div>

          <div className="card-status-indicator">
            <span className={`status-dot ${loading ? 'status-calibrating' : prediction ? 'status-done' : 'status-ready'}`} />
            <span>{loading ? 'CALIBRATING...' : prediction ? 'SCAN COMPLETE' : 'READY'}</span>
          </div>
        </div>

        {/* 2-Panel Layout: Left = 65% (Tabs + Form), Right = 35% (Vitals or Risk) */}
        <div className="cardio-two-panel-grid">
          {/* LEFT PANEL: Progressive Disclosure Form */}
          <div className="panel-left-form">
            {/* Section Tabs (Only 1 open at a time) */}
            <nav className="form-subnav-tabs" aria-label="Cardio Input Sections">
              <button
                type="button"
                className={`form-tab-btn ${activeTab === 'profile' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeTab === 'vitals' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('vitals')}
              >
                Vitals
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeTab === 'labs' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('labs')}
              >
                Labs
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeTab === 'symptoms' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('symptoms')}
              >
                Symptoms {selectedSymptoms.length > 0 && `(${selectedSymptoms.length})`}
              </button>
            </nav>

            <form onSubmit={handleFormSubmit} className="active-tab-content">
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <div className="tab-pane-fields">
                  <div className="compact-two-col">
                    <div className="clean-input-box">
                      <label htmlFor="cardio-age">Age</label>
                      <input
                        type="number"
                        id="cardio-age"
                        className="clean-text-input"
                        value={formData.age || 45}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10) || 0)}
                        min="18"
                        max="110"
                        required
                      />
                    </div>

                    <div className="clean-input-box">
                      <label htmlFor="cardio-sex">Biological Sex</label>
                      <select
                        id="cardio-sex"
                        className="clean-text-input"
                        value={formData.sex}
                        onChange={(e) => handleInputChange('sex', parseInt(e.target.value, 10))}
                      >
                        <option value={1}>Male (XY)</option>
                        <option value={0}>Female (XX)</option>
                      </select>
                    </div>
                  </div>

                  <div className="compact-two-col">
                    <div className="clean-input-box">
                      <label htmlFor="cardio-height">Height (cm)</label>
                      <input
                        type="number"
                        id="cardio-height"
                        className="clean-text-input"
                        value={formData.height_cm || 175}
                        onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || 0)}
                        min="90"
                        max="240"
                      />
                    </div>

                    <div className="clean-input-box">
                      <label htmlFor="cardio-weight">Weight (kg)</label>
                      <input
                        type="number"
                        id="cardio-weight"
                        className="clean-text-input"
                        value={formData.weight_kg || 74}
                        onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || 0)}
                        min="30"
                        max="250"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VITALS */}
              {activeTab === 'vitals' && (
                <div className="tab-pane-fields">
                  <div className="compact-two-col">
                    <div className="clean-input-box">
                      <label htmlFor="cardio-sys">Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        id="cardio-sys"
                        className="clean-text-input"
                        value={formData.resting_bp || 120}
                        onChange={(e) => handleInputChange('resting_bp', parseInt(e.target.value, 10) || 0)}
                        min="70"
                        max="240"
                        required
                      />
                    </div>

                    <div className="clean-input-box">
                      <label htmlFor="cardio-dia">Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        id="cardio-dia"
                        className="clean-text-input"
                        value={formData.diastolic_bp || 80}
                        onChange={(e) => handleInputChange('diastolic_bp', parseInt(e.target.value, 10) || 0)}
                        min="40"
                        max="150"
                      />
                    </div>
                  </div>

                  <div className="compact-two-col">
                    <div className="clean-input-box">
                      <label htmlFor="cardio-hr">Resting Pulse (BPM)</label>
                      <input
                        type="number"
                        id="cardio-hr"
                        className="clean-text-input"
                        value={formData.resting_hr || 75}
                        onChange={(e) => handleInputChange('resting_hr', parseInt(e.target.value, 10) || 0)}
                        min="40"
                        max="220"
                        required
                      />
                    </div>

                    <div className="lifestyle-checkbox-wrap">
                      <label className="clean-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.smoking || false}
                          onChange={(e) => handleInputChange('smoking', e.target.checked)}
                        />
                        <span>Tobacco Smoker</span>
                      </label>
                      <label className="clean-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.family_history || false}
                          onChange={(e) => handleInputChange('family_history', e.target.checked)}
                        />
                        <span>Family History CVD</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LABS */}
              {activeTab === 'labs' && (
                <div className="tab-pane-fields">
                  <div className="compact-two-col">
                    <div className="clean-input-box">
                      <label htmlFor="cardio-chol">Total Cholesterol (mg/dL)</label>
                      <input
                        type="number"
                        id="cardio-chol"
                        className="clean-text-input"
                        value={formData.cholesterol || 205}
                        onChange={(e) => handleInputChange('cholesterol', parseInt(e.target.value, 10) || 0)}
                        min="80"
                        max="550"
                      />
                    </div>

                    <div className="clean-input-box">
                      <label htmlFor="cardio-ldl">LDL Cholesterol (mg/dL)</label>
                      <input
                        type="number"
                        id="cardio-ldl"
                        className="clean-text-input"
                        value={formData.ldl || 115}
                        onChange={(e) => handleInputChange('ldl', parseInt(e.target.value, 10) || 0)}
                        min="30"
                        max="350"
                      />
                    </div>
                  </div>

                  <div className="clean-input-box" style={{ maxWidth: '300px' }}>
                    <label htmlFor="cardio-glucose">Fasting Glucose (mg/dL)</label>
                    <input
                      type="number"
                      id="cardio-glucose"
                      className="clean-text-input"
                      value={formData.glucose || 95}
                      onChange={(e) => handleInputChange('glucose', parseInt(e.target.value, 10) || 0)}
                      min="40"
                      max="400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SYMPTOMS (Progressive Searchable Selector) */}
              {activeTab === 'symptoms' && (
                <div className="tab-pane-fields">
                  <div className="symptoms-header-line">
                    <span className="section-label">Reported Symptoms</span>
                    <button
                      type="button"
                      className="add-symptom-trigger-btn"
                      onClick={() => setIsSymptomPopoverOpen(true)}
                    >
                      + Add Symptom
                    </button>
                  </div>

                  {/* Selected Symptom Chips */}
                  <div className="selected-symptoms-list">
                    {selectedSymptoms.length === 0 ? (
                      <p className="no-symptoms-note">No symptoms currently selected.</p>
                    ) : (
                      selectedSymptoms.map(symId => {
                        const match = availableSymptoms.find(s => s.id === symId);
                        return (
                          <span key={symId} className="selected-symptom-chip">
                            <span>{match?.label || symId}</span>
                            <button
                              type="button"
                              className="chip-remove-x"
                              onClick={() => handleRemoveSymptom(symId)}
                              title="Remove symptom"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Popover / Dropdown for Adding Symptoms */}
                  {isSymptomPopoverOpen && (
                    <div className="symptom-popover-card">
                      <div className="popover-search-row">
                        <input
                          type="text"
                          placeholder="Search symptoms..."
                          className="popover-search-input"
                          value={symptomSearch}
                          onChange={(e) => setSymptomSearch(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="popover-close-btn"
                          onClick={() => setIsSymptomPopoverOpen(false)}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="popover-items-list">
                        {filteredSymptoms.map(item => {
                          const isSelected = selectedSymptoms.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`popover-item-btn ${isSelected ? 'item-selected' : ''}`}
                              onClick={() => {
                                if (isSelected) handleRemoveSymptom(item.id);
                                else handleAddSymptom(item.id);
                              }}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button: Fixed at bottom of Form Column */}
              <div className="form-submit-row">
                <button
                  type="submit"
                  className="primary-scan-action-btn"
                  disabled={loading}
                >
                  <span>{loading ? 'Evaluating Model...' : 'RUN CARDIO SCAN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: In-Place Live Vitals OR Result Transition */}
          <div className="panel-right-telemetry">
            {!showRisk ? (
              /* BEFORE SCAN: LIVE VITALS */
              <div className="telemetry-vitals-view">
                <div className="telemetry-header">
                  <span className="live-indicator-dot" />
                  <span className="telemetry-header-title">LIVE VITALS</span>
                </div>

                {/* Heart Rate & Pulse Wave */}
                <div className="bpm-hero-unit">
                  <span className="pulsing-heart-glyph">❤️</span>
                  <div className="bpm-number-wrap">
                    <span className="bpm-huge-val">{formData.resting_hr || 75}</span>
                    <span className="bpm-unit-text">BPM</span>
                  </div>
                </div>

                {/* Animated ECG Waveform */}
                <div className="clean-ecg-box">
                  <svg className="clean-ecg-svg" viewBox="0 0 200 36" preserveAspectRatio="none">
                    <path d="M 0 18 L 38 18 L 46 6 L 54 30 L 62 10 L 70 24 L 78 18 L 130 18 L 138 6 L 146 30 L 154 10 L 162 24 L 200 18" />
                  </svg>
                </div>

                {/* Key Numbers Stack */}
                <div className="telemetry-metrics-stack">
                  <div className="telemetry-stat-row">
                    <span className="stat-label">Blood Pressure</span>
                    <span className="stat-val">{formData.resting_bp || 120} / {formData.diastolic_bp || 80} mmHg</span>
                  </div>
                  <div className="telemetry-stat-row">
                    <span className="stat-label">Cholesterol</span>
                    <span className="stat-val">{formData.cholesterol || 205} mg/dL</span>
                  </div>
                  <div className="telemetry-stat-row">
                    <span className="stat-label">Fasting Glucose</span>
                    <span className="stat-val">{formData.glucose || 95} mg/dL</span>
                  </div>
                </div>

                {prediction && (
                  <button
                    type="button"
                    className="view-toggle-link-btn"
                    onClick={() => setShowVitalsInsteadOfResult(false)}
                  >
                    View Last Scan Result →
                  </button>
                )}
              </div>
            ) : (
              /* AFTER SCAN: CARDIO RISK IN SAME SPACE */
              <div className="telemetry-result-view">
                <div className="telemetry-header">
                  <span className="telemetry-header-title">CARDIO RISK</span>
                  <button
                    type="button"
                    className="view-toggle-link-btn"
                    onClick={() => setShowVitalsInsteadOfResult(true)}
                  >
                    Vitals
                  </button>
                </div>

                {/* Score Number & Tier */}
                <div className="risk-hero-box">
                  <span className={`risk-hero-percentage risk-${riskTier.toLowerCase()}`}>
                    {riskPct}%
                  </span>
                  <span className={`risk-badge-tier tier-${riskTier.toLowerCase()}`}>
                    {riskTier.toUpperCase()}
                  </span>
                </div>

                {/* Segmented Meter */}
                <div className="clean-risk-meter-track">
                  <div 
                    className="clean-risk-meter-fill"
                    style={{
                      width: `${Math.max(4, Math.min(100, riskPct))}%`,
                      background: riskPct > 65 
                        ? '#ef4444' 
                        : riskPct > 35 
                          ? '#f59e0b' 
                          : '#10b981'
                    }}
                  />
                </div>

                {/* Top Signals */}
                <div className="signals-compact-box">
                  <div className="signals-label">Risk factors</div>
                  {prediction.important_features && prediction.important_features.length > 0 ? (
                    <ul className="signals-list">
                      {prediction.important_features.slice(0, 2).map((item, idx) => (
                        <li key={idx}>
                          <span className="signal-arrow-up">↑</span>
                          <span>{item.feature}: {item.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="signal-none">No acute elevating risk biomarkers.</p>
                  )}
                </div>

                {/* Protective */}
                <div className="signals-compact-box">
                  <div className="signals-label">Protective</div>
                  {prediction.protective_features && prediction.protective_features.length > 0 ? (
                    <ul className="signals-list">
                      {prediction.protective_features.slice(0, 1).map((f, idx) => (
                        <li key={idx}>
                          <span className="signal-arrow-down">↓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="signal-none">Maintain healthy lifestyle habits.</p>
                  )}
                </div>

                {/* Explain with AI Action */}
                <button
                  type="button"
                  className="clean-ai-explain-btn"
                  onClick={() => onExplainAI(prediction)}
                >
                  ✨ Explain with AI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

const CARDIAC_PRESETS = {
  optimal: {
    label: '✨ Golden Apple (Optimal Baseline)',
    data: {
      age: 26,
      sex: 0,
      cp: 3,
      trestbps: 115,
      chol: 175,
      fbs: 0,
      restecg: 0,
      thalach: 175,
      exang: 0,
      oldpeak: 0.0
    }
  },
  moderate: {
    label: '🧪 Poison II (Hypertensive Burden)',
    data: {
      age: 52,
      sex: 1,
      cp: 1,
      trestbps: 138,
      chol: 235,
      fbs: 0,
      restecg: 1,
      thalach: 140,
      exang: 0,
      oldpeak: 1.4
    }
  },
  wither: {
    label: '💀 Wither III (Acute Ischemic Decay)',
    data: {
      age: 67,
      sex: 1,
      cp: 0,
      trestbps: 168,
      chol: 298,
      fbs: 1,
      restecg: 2,
      thalach: 94,
      exang: 1,
      oldpeak: 3.4
    }
  }
};

export default function CardiacChamber({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  result, 
  onReset 
}) {
  const [activePreset, setActivePreset] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'oldpeak' ? parseFloat(value) || 0 : parseInt(value, 10) || 0
    }));
  };

  const applyPreset = (key) => {
    setActivePreset(key);
    setFormData(CARDIAC_PRESETS[key].data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Determine cardiac effect breakdown
  const isHighRisk = result && result.risk_score > 0.7;
  const isModRisk = result && result.risk_score > 0.4 && result.risk_score <= 0.7;

  return (
    <div className="minecraft-gui-panel">
      {/* Chamber Header */}
      <div className="chamber-header">
        <div className="chamber-title-group">
          <h2>
            <span>🫀</span>
            <span>Cardiovascular Chamber</span>
          </h2>
          <p>Real-time hemodynamic telemetry, arterial decay analysis, and myocardial infarction risk stratification.</p>
        </div>
        <div className="chamber-status-chip" style={{ color: isHighRisk ? '#ff2a2a' : isModRisk ? '#f59e0b' : '#10b981' }}>
          <span>●</span>
          <span>{result ? `Status: ${result.risk_level}` : 'Status: Calibrated & Ready'}</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(CARDIAC_PRESETS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className="chamber-tab-btn"
            style={{ 
              padding: '0.45rem 0.9rem', 
              fontSize: '0.8rem',
              borderColor: activePreset === key ? 'var(--redstone-crimson)' : undefined
            }}
            onClick={() => applyPreset(key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Monitor Grid: Left live ECG & BPM, Right inputs */}
      <div className="cardiac-monitor-grid">
        {/* Live ECG Vitals Card */}
        <div className="cardiac-heart-card">
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>
            Telemetry Monitor
          </div>

          <div className="live-bpm-display">
            <span className="bpm-number">{formData.thalach}</span>
            <span className="bpm-unit">BPM</span>
          </div>

          {/* Animated SVG ECG Wave */}
          <svg className="ecg-wave-svg" viewBox="0 0 200 40">
            <path d="M 0 20 L 40 20 L 50 5 L 60 35 L 70 10 L 80 25 L 90 20 L 140 20 L 150 5 L 160 35 L 170 10 L 180 25 L 200 20" />
          </svg>

          <div style={{ marginTop: '1rem', width: '100%', fontSize: '0.78rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Arterial Pressure:</span>
              <strong style={{ color: formData.trestbps > 130 ? '#ff4d4d' : '#34d399' }}>{formData.trestbps} mmHg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Serum Lipids:</span>
              <strong style={{ color: formData.chol > 240 ? '#ff4d4d' : '#34d399' }}>{formData.chol} mg/dL</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span>ST Depression:</span>
              <strong style={{ color: formData.oldpeak > 1.5 ? '#ff4d4d' : '#34d399' }}>{formData.oldpeak} mm</strong>
            </div>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit}>
          {/* Section 1: Hemodynamics */}
          <div className="form-fieldset">
            <div className="fieldset-legend">
              <span>🩸</span>
              <span>Primary Hemodynamics &amp; Biometrics</span>
            </div>
            <div className="fields-grid">
              <div>
                <label className="input-label" htmlFor="age">
                  <span>Player Age</span>
                  <span className="input-subtext">Years</span>
                </label>
                <input 
                  type="number" 
                  id="age" 
                  name="age" 
                  className="mc-input" 
                  value={formData.age} 
                  onChange={handleChange} 
                  min="1" 
                  max="120" 
                  required 
                />
              </div>

              <div>
                <label className="input-label" htmlFor="sex">
                  <span>Biological Sex</span>
                </label>
                <select id="sex" name="sex" className="mc-input" value={formData.sex} onChange={handleChange}>
                  <option value={1}>Male (XY)</option>
                  <option value={0}>Female (XX)</option>
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="trestbps">
                  <span>Resting Blood Pressure</span>
                  <span className="input-subtext">Target: &lt;120</span>
                </label>
                <input 
                  type="number" 
                  id="trestbps" 
                  name="trestbps" 
                  className="mc-input" 
                  value={formData.trestbps} 
                  onChange={handleChange} 
                  min="60" 
                  max="260" 
                  required 
                />
              </div>

              <div>
                <label className="input-label" htmlFor="thalach">
                  <span>Exertion Heart Rate (BPM)</span>
                  <span className="input-subtext">Vitals rate</span>
                </label>
                <input 
                  type="number" 
                  id="thalach" 
                  name="thalach" 
                  className="mc-input" 
                  value={formData.thalach} 
                  onChange={handleChange} 
                  min="50" 
                  max="240" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Blood Lipids & Chest Pain */}
          <div className="form-fieldset">
            <div className="fieldset-legend">
              <span>🧪</span>
              <span>Lipid Panels &amp; Symptom Presentation</span>
            </div>
            <div className="fields-grid">
              <div>
                <label className="input-label" htmlFor="chol">
                  <span>Serum Cholesterol (mg/dL)</span>
                  <span className="input-subtext">&lt;200 Normal</span>
                </label>
                <input 
                  type="number" 
                  id="chol" 
                  name="chol" 
                  className="mc-input" 
                  value={formData.chol} 
                  onChange={handleChange} 
                  min="80" 
                  max="600" 
                  required 
                />
              </div>

              <div>
                <label className="input-label" htmlFor="cp">
                  <span>Chest Pain Sensation</span>
                </label>
                <select id="cp" name="cp" className="mc-input" value={formData.cp} onChange={handleChange}>
                  <option value={0}>Typical Angina (Crushing pressure)</option>
                  <option value={1}>Atypical Angina (Intermittent)</option>
                  <option value={2}>Non-Anginal Discomfort</option>
                  <option value={3}>Asymptomatic (No pain)</option>
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="oldpeak">
                  <span>ST Depression (Oldpeak)</span>
                  <span className="input-subtext">&lt;1.0 Normal</span>
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  id="oldpeak" 
                  name="oldpeak" 
                  className="mc-input" 
                  value={formData.oldpeak} 
                  onChange={handleChange} 
                  min="0.0" 
                  max="6.5" 
                  required 
                />
              </div>

              <div>
                <label className="input-label" htmlFor="exang">
                  <span>Exertional Angina</span>
                </label>
                <select id="exang" name="exang" className="mc-input" value={formData.exang} onChange={handleChange}>
                  <option value={0}>No Angina on Exertion</option>
                  <option value={1}>Yes, Present on Exertion</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
            <button 
              type="submit" 
              className="mc-action-btn btn-cardiac-execute" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              <span>{loading ? 'Brewing Analysis...' : '⚡ Stratify Cardiac Risk (Compute Vitals)'}</span>
            </button>
            {result && (
              <button 
                type="button" 
                className="chamber-tab-btn"
                onClick={onReset}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Result Display Overlay if prediction completed */}
      {result && (
        <div style={{
          background: isHighRisk 
            ? 'rgba(255, 42, 42, 0.12)' 
            : isModRisk 
            ? 'rgba(245, 158, 11, 0.12)' 
            : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${isHighRisk ? '#ff2a2a' : isModRisk ? '#f59e0b' : '#10b981'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: isHighRisk ? '#ff6b6b' : isModRisk ? '#fbbf24' : '#34d399' }}>
              {isHighRisk ? '💀 WITHER III DEBUFF INFLICTED' : isModRisk ? '🧪 POISON II BURDEN ACTIVE' : '✨ REGENERATION & ABSORPTION GRANTED'}
            </h3>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '1.5rem', fontWeight: '800' }}>
              {Math.round(result.risk_score * 100)}% Risk
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            {isHighRisk 
              ? 'Arterial decay indices have breached critical tolerance thresholds. Player hearts mutated to Withered state. Immediate cardiology intervention required.'
              : isModRisk 
              ? 'Intermediate cardiac stress factors detected. Poison effect active on heart bar. Dietary intervention and BP control advised.'
              : 'Cardiovascular parameters remain optimal. Golden Absorption hearts and Regeneration granted.'}
          </p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="effect-badge effect-wither">
              <span className="effect-icon-box">💀</span>
              <span className="effect-name">Wither Score: {Math.round(result.risk_score * 100)}%</span>
            </span>
            <span className="effect-badge effect-regen">
              <span className="effect-icon-box">❤️</span>
              <span className="effect-name">BPM: {formData.thalach}</span>
            </span>
            <span className="effect-badge effect-darkness">
              <span className="effect-icon-box">🩺</span>
              <span className="effect-name">BP: {formData.trestbps} mmHg</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

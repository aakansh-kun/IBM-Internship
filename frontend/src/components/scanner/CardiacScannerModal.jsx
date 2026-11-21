import { useState, useEffect } from 'react';
import { playScannerPowerUpSound, playScannerCompleteSound, playHeartbeatSound } from '../../utils/minecraftAudio';

export default function CardiacScannerModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  prediction,
  loading,
  onSubmit,
  onConsultAICore,
  onAwardXP
}) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configTab, setConfigTab] = useState('player'); // 'player' | 'vitals' | 'labs' | 'symptoms'
  const [scanPhase, setScanPhase] = useState('idle'); // 'idle' | 'power_up' | 'scanning' | 'analyzing' | 'complete'
  const [scanProgress, setScanProgress] = useState(0);
  const [symptomSearch, setSymptomSearch] = useState('');

  const symptomList = [
    { id: 'chest_pain', label: 'Chest Pressure / Pain' },
    { id: 'shortness_of_breath', label: 'Shortness of Breath' },
    { id: 'palpitations', label: 'Palpitations / Tachycardia' },
    { id: 'dizziness', label: 'Lightheadedness / Dizziness' },
    { id: 'fatigue', label: 'Exertional Exhaustion' },
    { id: 'radiating_arm_pain', label: 'Radiating Arm Discomfort' }
  ];

  const selectedSymptoms = formData.symptoms || [];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSymptom = (symId) => {
    let next;
    if (selectedSymptoms.includes(symId)) {
      next = selectedSymptoms.filter(s => s !== symId);
    } else {
      next = [...selectedSymptoms, symId];
    }
    setFormData(prev => ({ ...prev, symptoms: next }));
  };

  // 2.5 Second Fun Scan Sequence
  const handleInitiateScan = () => {
    setScanPhase('power_up');
    setScanProgress(15);
    playScannerPowerUpSound();

    setTimeout(() => {
      setScanPhase('scanning');
      setScanProgress(55);
      playHeartbeatSound();
    }, 700);

    setTimeout(() => {
      setScanPhase('analyzing');
      setScanProgress(85);
    }, 1500);

    setTimeout(async () => {
      setScanPhase('complete');
      setScanProgress(100);
      playScannerCompleteSound();
      await onSubmit(formData);
      if (onAwardXP) onAwardXP(5, 'Completed Cardiac Scan');
    }, 2200);
  };

  if (!isOpen) return null;

  const hasAge = Boolean(formData.age);
  const hasSex = formData.sex !== undefined;
  const hasBP = Boolean(formData.resting_bp);
  const hasChol = Boolean(formData.cholesterol);
  const hasSymptoms = selectedSymptoms.length > 0;

  const riskPct = prediction?.risk_percentage || 24;
  const riskTier = prediction?.risk_level || 'Low';

  return (
    <div className="mc-modal-backdrop" onClick={onClose}>
      <div className="cardiac-scanner-machine" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="scanner-terminal-header">
          <div className="scanner-glyph-title">
            <span className="pulsing-heart-glyph-mini">❤️</span>
            <span>CARDIAC SCANNER</span>
          </div>
          <button type="button" className="terminal-close-x" onClick={onClose} title="Close [ESC]">
            ✕
          </button>
        </div>

        {/* SCANNING SEQUENCE OVERLAY (2.5s Cinematic) */}
        {scanPhase !== 'idle' && scanPhase !== 'complete' ? (
          <div className="scan-sequence-stage">
            <div className="cyan-scanning-laser-line" />
            <div className="scan-status-text">
              {scanPhase === 'power_up' && 'INITIALIZING BIOMETRIC ARRAY...'}
              {scanPhase === 'scanning' && 'SCANNING HEMODYNAMIC FREQUENCIES...'}
              {scanPhase === 'analyzing' && 'ANALYZING CARDIAC SIGNAL...'}
            </div>

            {/* Accelerated ECG during scanning */}
            <div className="scanner-ecg-accelerated">
              <svg className="ecg-scan-line-fast" viewBox="0 0 200 36">
                <path d="M 0 18 L 25 18 L 32 4 L 40 32 L 48 8 L 56 26 L 64 18 L 110 18 L 118 4 L 126 32 L 134 8 L 142 26 L 200 18" />
              </svg>
            </div>

            <div className="scan-progress-bar-wrap">
              <div className="scan-progress-bar-fill" style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        ) : isConfiguring ? (
          /* CONFIGURATION SLOTS DRAWER */
          <div className="scanner-config-drawer">
            <div className="config-drawer-header">
              <span className="config-title">CONFIGURE TELEMETRY SLOTS</span>
              <button 
                type="button" 
                className="config-done-btn"
                onClick={() => setIsConfiguring(false)}
              >
                Done ✓
              </button>
            </div>

            {/* Mini Tabs */}
            <div className="config-subtabs">
              <button
                type="button"
                className={`config-tab-btn ${configTab === 'player' ? 'active-config' : ''}`}
                onClick={() => setConfigTab('player')}
              >
                Player
              </button>
              <button
                type="button"
                className={`config-tab-btn ${configTab === 'vitals' ? 'active-config' : ''}`}
                onClick={() => setConfigTab('vitals')}
              >
                Vitals
              </button>
              <button
                type="button"
                className={`config-tab-btn ${configTab === 'labs' ? 'active-config' : ''}`}
                onClick={() => setConfigTab('labs')}
              >
                Labs
              </button>
              <button
                type="button"
                className={`config-tab-btn ${configTab === 'symptoms' ? 'active-config' : ''}`}
                onClick={() => setConfigTab('symptoms')}
              >
                Symptoms
              </button>
            </div>

            {/* Tab Contents */}
            <div className="config-slots-area">
              {configTab === 'player' && (
                <div className="config-fields-grid">
                  <div className="config-slot-box">
                    <label>AGE</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>SEX</label>
                    <select
                      className="mc-pixel-input"
                      value={formData.sex}
                      onChange={(e) => handleInputChange('sex', parseInt(e.target.value, 10))}
                    >
                      <option value={1}>Male (XY)</option>
                      <option value={0}>Female (XX)</option>
                    </select>
                  </div>
                  <div className="config-slot-box">
                    <label>HEIGHT (cm)</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.height_cm || 175}
                      onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>WEIGHT (kg)</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.weight_kg || 74}
                      onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              {configTab === 'vitals' && (
                <div className="config-fields-grid">
                  <div className="config-slot-box">
                    <label>SYSTOLIC BP</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.resting_bp}
                      onChange={(e) => handleInputChange('resting_bp', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>DIASTOLIC BP</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.diastolic_bp || 80}
                      onChange={(e) => handleInputChange('diastolic_bp', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>RESTING PULSE</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.resting_hr}
                      onChange={(e) => handleInputChange('resting_hr', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>
              )}

              {configTab === 'labs' && (
                <div className="config-fields-grid">
                  <div className="config-slot-box">
                    <label>CHOLESTEROL</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.cholesterol}
                      onChange={(e) => handleInputChange('cholesterol', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>LDL CHOLESTEROL</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.ldl || 115}
                      onChange={(e) => handleInputChange('ldl', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="config-slot-box">
                    <label>FASTING GLUCOSE</label>
                    <input
                      type="number"
                      className="mc-pixel-input"
                      value={formData.glucose || 95}
                      onChange={(e) => handleInputChange('glucose', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>
              )}

              {configTab === 'symptoms' && (
                <div className="config-symptoms-chips">
                  {symptomList.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        className={`mc-symptom-slot-chip ${isSelected ? 'slot-chip-equipped' : ''}`}
                        onClick={() => handleToggleSymptom(sym.id)}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{sym.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : prediction && scanPhase === 'complete' ? (
          /* RPG ITEM STAT RESULT VIEW */
          <div className="cardiac-rpg-stat-sheet">
            <div className="rpg-stat-title-row">
              <span className="rpg-stat-header">❤️ CARDIAC STATUS</span>
              <span className={`rpg-tier-pill tier-${riskTier.toLowerCase()}`}>
                {riskTier.toUpperCase()}
              </span>
            </div>

            <div className="rpg-stats-metrics-block">
              <div className="rpg-stat-row">
                <span className="rpg-key">Integrity</span>
                <span className="rpg-val" style={{ color: riskPct < 35 ? '#34d399' : '#f87171' }}>
                  {riskPct < 35 ? 'GOOD' : riskPct < 65 ? 'MODERATE' : 'CRITICAL'}
                </span>
              </div>
              <div className="rpg-stat-row">
                <span className="rpg-key">Risk Estimate</span>
                <span className="rpg-val-bold">{riskPct}%</span>
              </div>
              <div className="rpg-stat-row">
                <span className="rpg-key">Blood Pressure</span>
                <span className="rpg-val">{formData.resting_bp || 120} / {formData.diastolic_bp || 80}</span>
              </div>
              <div className="rpg-stat-row">
                <span className="rpg-key">LDL Cholesterol</span>
                <span className="rpg-val">{formData.ldl || 115} mg/dL</span>
              </div>
              <div className="rpg-stat-row">
                <span className="rpg-key">Resting Pulse</span>
                <span className="rpg-val">{formData.resting_hr || 75} BPM</span>
              </div>
            </div>

            {/* Modifiers List */}
            <div className="rpg-modifiers-box">
              <div className="rpg-modifiers-title">Modifiers</div>
              <ul className="rpg-modifiers-list">
                {formData.resting_bp > 130 && (
                  <li><span className="mod-arrow-up">▲</span> Systolic Blood Pressure (+ risk signal)</li>
                )}
                {formData.cholesterol > 200 && (
                  <li><span className="mod-arrow-up">▲</span> Total / LDL Cholesterol (+ risk signal)</li>
                )}
                {formData.physical_activity !== false && (
                  <li><span className="mod-arrow-down">▼</span> Aerobic Physical Activity (protective)</li>
                )}
                {formData.resting_hr <= 80 && (
                  <li><span className="mod-arrow-down">▼</span> Resting Heart Rate Reserved (protective)</li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="rpg-actions-row">
              <button
                type="button"
                className="mc-mod-action-btn btn-ai-core"
                onClick={() => onConsultAICore('cardio')}
              >
                ✨ Consult AI Core
              </button>

              <button
                type="button"
                className="mc-mod-action-btn"
                onClick={() => {
                  setScanPhase('idle');
                }}
              >
                Scan Again
              </button>
            </div>

            <div className="rpg-disclaimer-micro">
              Educational risk screening estimate &bull; Not a medical diagnosis
            </div>
          </div>
        ) : (
          /* IDLE / READY HEART MONITOR VIEW */
          <div className="cardiac-ready-view">
            {/* Real-time BPM Hero */}
            <div className="cardiac-bpm-banner">
              <span className="heart-beating-icon">❤️</span>
              <div className="bpm-stack">
                <span className="bpm-number-glow">{formData.resting_hr || 75}</span>
                <span className="bpm-label">RESTING BPM</span>
              </div>
            </div>

            {/* Continuous SVG ECG Wave */}
            <div className="scanner-ecg-frame">
              <svg className="ecg-wave-svg-cont" viewBox="0 0 200 36">
                <path d="M 0 18 L 38 18 L 46 6 L 54 30 L 62 10 L 70 24 L 78 18 L 130 18 L 138 6 L 146 30 L 154 10 L 162 24 L 200 18" />
              </svg>
            </div>

            {/* Data Readiness Checklist */}
            <div className="scanner-checklist-box">
              <div className="checklist-title">TELEMETRY STATUS:</div>
              <div className="checklist-items-grid">
                <span className={hasAge ? 'check-ok' : 'check-missing'}>
                  {hasAge ? '✓' : '○'} Age ({formData.age}y)
                </span>
                <span className={hasSex ? 'check-ok' : 'check-missing'}>
                  {hasSex ? '✓' : '○'} Sex ({formData.sex ? 'M' : 'F'})
                </span>
                <span className={hasBP ? 'check-ok' : 'check-missing'}>
                  {hasBP ? '✓' : '○'} Blood Pressure ({formData.resting_bp || 120} mmHg)
                </span>
                <span className={hasChol ? 'check-ok' : 'check-missing'}>
                  {hasChol ? '✓' : '○'} Cholesterol ({formData.cholesterol || 205} mg/dL)
                </span>
                <span className={hasSymptoms ? 'check-ok' : 'check-opt'}>
                  {hasSymptoms ? '✓' : '○'} Symptoms ({selectedSymptoms.length})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="scanner-actions-grid">
              <button
                type="button"
                className="mc-mod-action-btn"
                onClick={() => setIsConfiguring(true)}
              >
                ⚙️ CONFIGURE DATA
              </button>

              <button
                type="button"
                className="mc-mod-action-btn btn-initiate-scan"
                onClick={handleInitiateScan}
              >
                ⚡ INITIATE SCAN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

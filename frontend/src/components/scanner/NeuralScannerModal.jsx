import { useState } from 'react';
import { playScannerPowerUpSound, playScannerCompleteSound, playHeartbeatSound } from '../../utils/minecraftAudio';

export default function NeuralScannerModal({
  isOpen,
  onClose,
  neuroResult,
  loading,
  onSubmit,
  onEquipSymptomAsEffect,
  onConsultAICore,
  onAwardXP
}) {
  const [activeCategory, setActiveCategory] = useState('cognitive');
  const [configuringItem, setConfiguringItem] = useState(null);
  const [severity, setSeverity] = useState('II');
  const [durationValue, setDurationValue] = useState(4);
  const [durationUnit, setDurationUnit] = useState('hours');
  const [frequency, setFrequency] = useState('Occasional');
  const [sleepHours, setSleepHours] = useState(7.0);
  const [hasSuddenOnset, setHasSuddenOnset] = useState(false);

  // Equipped symptoms: [{ id, name, category, icon, severity, durationStr, frequency }]
  const [equippedSymptoms, setEquippedSymptoms] = useState([]);

  // 2.5s Cinematic Scan Sequence State
  const [scanPhase, setScanPhase] = useState('idle'); // 'idle' | 'power_up' | 'mapping' | 'converging' | 'complete'
  const [scanProgress, setScanProgress] = useState(0);

  const symptomCatalog = {
    cognitive: {
      name: 'Cognitive',
      icon: '🧠',
      items: [
        { id: 'brain_fog', name: 'Brain Fog' },
        { id: 'memory_difficulty', name: 'Memory Difficulty' },
        { id: 'confusion', name: 'Mental Confusion' },
        { id: 'concentration_problems', name: 'Concentration Deficit' }
      ]
    },
    motor: {
      name: 'Motor',
      icon: '⚡',
      items: [
        { id: 'tremor', name: 'Involuntary Tremor' },
        { id: 'weakness', name: 'Motor Weakness' },
        { id: 'coordination_difficulty', name: 'Coordination Difficulty' },
        { id: 'balance_problems', name: 'Gait / Balance Instability' }
      ]
    },
    sensory: {
      name: 'Sensory',
      icon: '👁️',
      items: [
        { id: 'numbness', name: 'Focal Numbness' },
        { id: 'tingling', name: 'Paresthesia / Tingling' },
        { id: 'vision_disturbance', name: 'Visual Disturbance' },
        { id: 'photophobia', name: 'Photophobia (Light Sensitive)' }
      ]
    },
    sleep: {
      name: 'Sleep',
      icon: '🌙',
      items: [
        { id: 'insomnia', name: 'Sleep Onset Insomnia' },
        { id: 'excessive_sleepiness', name: 'Daytime Somnolence' },
        { id: 'fragmented_sleep', name: 'Fragmented Sleep' }
      ]
    },
    headache: {
      name: 'Headache',
      icon: '✦',
      items: [
        { id: 'migraine', name: 'Throbbing Migraine' },
        { id: 'aura', name: 'Visual Aura / Scotoma' },
        { id: 'thunderclap_headache', name: 'Thunderclap Sudden Headache' },
        { id: 'recurring_headache', name: 'Tension Headache' }
      ]
    },
    other: {
      name: 'Other',
      icon: '+',
      items: [
        { id: 'dizziness', name: 'Dizziness / Vertigo' },
        { id: 'nausea_neuro', name: 'Neurogenic Nausea' },
        { id: 'speech_difficulty', name: 'Speech Slurring' }
      ]
    }
  };

  const handleOpenConfig = (item, catKey) => {
    setConfiguringItem({ ...item, catKey, icon: symptomCatalog[catKey].icon });
    setSeverity('II');
    setDurationValue(4);
    setDurationUnit('hours');
    setFrequency('Occasional');
  };

  const handleEquipSymptom = () => {
    if (!configuringItem) return;

    const durationStr = `${durationValue} ${durationUnit}`;
    const newSymptom = {
      id: configuringItem.id,
      name: configuringItem.name,
      category: configuringItem.catKey,
      icon: configuringItem.icon,
      severity,
      durationStr,
      frequency
    };

    setEquippedSymptoms(prev => {
      const filtered = prev.filter(s => s.id !== newSymptom.id);
      return [...filtered, newSymptom];
    });

    // Also push to HUD status effects stack!
    if (onEquipSymptomAsEffect) {
      onEquipSymptomAsEffect({
        id: `symptom_${newSymptom.id}`,
        icon: newSymptom.icon,
        name: `${newSymptom.name} ${newSymptom.severity}`,
        duration: newSymptom.durationStr,
        type: newSymptom.severity === 'III' ? 'wither' : 'poison'
      });
    }

    setConfiguringItem(null);
  };

  const handleRemoveEquipped = (id) => {
    setEquippedSymptoms(prev => prev.filter(s => s.id !== id));
  };

  // 2.5 Second Neural Mapping Sequence
  const handleInitiateScan = () => {
    setScanPhase('power_up');
    setScanProgress(10);
    playScannerPowerUpSound();

    setTimeout(() => {
      setScanPhase('mapping');
      setScanProgress(40);
      playHeartbeatSound();
    }, 700);

    setTimeout(() => {
      setScanPhase('converging');
      setScanProgress(80);
    }, 1500);

    setTimeout(async () => {
      setScanPhase('complete');
      setScanProgress(100);
      playScannerCompleteSound();

      const sevMap = { I: 'Mild', II: 'Moderate', III: 'Severe' };
      const hasSevere = equippedSymptoms.some(s => s.severity === 'III');

      await onSubmit({
        symptoms: equippedSymptoms.map(s => s.id),
        severity: hasSevere ? 'Severe' : 'Moderate',
        duration: 'Days',
        frequency: 'Occasional',
        sleep_hours: sleepHours,
        has_sudden_onset: hasSuddenOnset
      });

      if (onAwardXP) onAwardXP(5, 'Completed Neural Scan');
    }, 2200);
  };

  if (!isOpen) return null;

  const concernIndex = neuroResult?.concern_index || (equippedSymptoms.length * 15 + 12);
  const concernTier = neuroResult?.concern_tier || (concernIndex > 65 ? 'High' : concernIndex > 35 ? 'Moderate' : 'Low');
  const isRedFlag = neuroResult?.red_flag?.is_urgent || hasSuddenOnset || equippedSymptoms.some(s => s.id === 'thunderclap_headache' || s.id === 'speech_difficulty' || s.id === 'weakness');

  return (
    <div className="mc-modal-backdrop" onClick={onClose}>
      <div className="neural-scanner-machine" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="scanner-terminal-header">
          <div className="scanner-glyph-title">
            <span className="scanner-neural-glyph">🧠</span>
            <span>NEURAL SCANNER</span>
          </div>
          <button type="button" className="terminal-close-x" onClick={onClose} title="Close [ESC]">
            ✕
          </button>
        </div>

        {/* SCANNING SEQUENCE OVERLAY */}
        {scanPhase !== 'idle' && scanPhase !== 'complete' ? (
          <div className="scan-sequence-stage">
            <div className="cyan-scanning-laser-line" />
            
            <div className="neural-scan-particles" aria-hidden="true">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="neural-node-particle" style={{
                  top: `${20 + (i * 23) % 65}%`,
                  left: `${15 + (i * 37) % 70}%`,
                  animationDelay: `${i * 0.15}s`
                }} />
              ))}
            </div>

            <div className="scan-stage-box">
              <div className="scan-stage-phase-title">
                {scanPhase === 'power_up' && 'INITIALIZING NEURAL ARRAY...'}
                {scanPhase === 'mapping' && 'MAPPING CORTICAL SIGNAL NODES...'}
                {scanPhase === 'converging' && 'COMPUTING SYMPTOM CLUSTER COHERENCE...'}
              </div>

              <div className="scan-progress-bar-outer">
                <div 
                  className="scan-progress-bar-fill neural-fill" 
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className="scan-percentage-readout">
                {scanProgress}% COMPLETE
              </div>
            </div>
          </div>
        ) : scanPhase === 'complete' || neuroResult ? (
          /* RPG ITEM STATS SCAN RESULT */
          <div className="scanner-result-rpg-sheet">
            {/* Red Flag Urgent Notice Override */}
            {isRedFlag && (
              <div className="mc-red-flag-banner">
                <div className="flag-icon">⚠️</div>
                <div className="flag-body">
                  <div className="flag-title">URGENT MEDICAL NOTICE</div>
                  <div className="flag-desc">
                    Reported acute patterns (sudden onset / focal weakness / speech difficulty) require urgent clinical evaluation.
                  </div>
                </div>
              </div>
            )}

            <div className="rpg-stat-header">
              <div className="rpg-stat-badge">🧠 NEURAL STATUS</div>
              <div className={`rpg-risk-badge badge-${concernTier.toLowerCase()}`}>
                {concernTier.toUpperCase()}
              </div>
            </div>

            <div className="rpg-metric-card">
              <div className="rpg-metric-label">Neural Concern Score</div>
              <div className="rpg-metric-value">{concernIndex}%</div>
              <div className="rpg-meter-track">
                <div 
                  className={`rpg-meter-fill fill-${concernTier.toLowerCase()}`}
                  style={{ width: `${Math.min(100, concernIndex)}%` }}
                />
              </div>
            </div>

            {/* Observed Pattern Signals */}
            <div className="rpg-modifiers-box">
              <div className="rpg-modifiers-title">OBSERVED PATTERN SIGNALS</div>
              <div className="neural-signal-row">
                <span>Migraine-related</span>
                <span className="signal-bar">██████░░░░</span>
              </div>
              <div className="neural-signal-row">
                <span>Sleep disruption</span>
                <span className="signal-bar">████████░░</span>
              </div>
              <div className="neural-signal-row">
                <span>Sensory symptoms</span>
                <span className="signal-bar">████░░░░░░</span>
              </div>
              <div className="neural-signal-row">
                <span>Motor symptoms</span>
                <span className="signal-bar">██░░░░░░░░</span>
              </div>
            </div>

            {/* AI Core Dialogue Trigger */}
            <div className="rpg-actions-row">
              <button
                type="button"
                className="mc-button mc-btn-cyan"
                onClick={() => {
                  onClose();
                  if (onConsultAICore) onConsultAICore();
                }}
              >
                ✨ Ask AI Core
              </button>
              <button
                type="button"
                className="mc-button mc-btn-dark"
                onClick={() => setScanPhase('idle')}
              >
                Modify Symptoms
              </button>
            </div>

            <div className="rpg-disclaimer-note">
              Educational screening estimate. Not a neurological diagnosis.
            </div>
          </div>
        ) : (
          /* SYMPTOM INVENTORY CONFIGURATION STAGE */
          <div className="neural-scanner-body">
            {/* Top Telemetry / Status */}
            <div className="neural-status-telemetry">
              <div className="telemetry-item">
                <span className="telemetry-label">EQUIPPED SYMPTOMS:</span>
                <span className="telemetry-val">{equippedSymptoms.length} active</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">SLEEP:</span>
                <span className="telemetry-val">{sleepHours} hrs</span>
              </div>
            </div>

            {/* Category Selector Tabs */}
            <div className="symptom-category-tabs">
              {Object.entries(symptomCatalog).map(([catKey, cat]) => (
                <button
                  key={catKey}
                  type="button"
                  className={`symptom-tab-btn ${activeCategory === catKey ? 'tab-active' : ''}`}
                  onClick={() => setActiveCategory(catKey)}
                >
                  <span className="tab-icon">{cat.icon}</span>
                  <span className="tab-label">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Category Symptom Inventory Grid */}
            <div className="symptom-inventory-grid">
              {symptomCatalog[activeCategory].items.map((item) => {
                const isEquipped = equippedSymptoms.some(s => s.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`symptom-grid-slot ${isEquipped ? 'slot-equipped' : ''}`}
                    onClick={() => handleOpenConfig(item, activeCategory)}
                  >
                    <span className="slot-glyph">{symptomCatalog[activeCategory].icon}</span>
                    <span className="slot-name">{item.name}</span>
                    {isEquipped && <span className="slot-check">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Currently Equipped Symptoms as Status Badges */}
            {equippedSymptoms.length > 0 && (
              <div className="equipped-symptoms-section">
                <div className="equipped-label">EQUIPPED STATUS EFFECTS:</div>
                <div className="equipped-badges-wrap">
                  {equippedSymptoms.map(s => (
                    <div key={s.id} className="equipped-badge">
                      <span>{s.icon}</span>
                      <span>{s.name} {s.severity}</span>
                      <span className="badge-duration">({s.durationStr})</span>
                      <button 
                        type="button" 
                        className="badge-remove" 
                        onClick={() => handleRemoveEquipped(s.id)}
                        title="Unequip symptom"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sleep & Sudden Onset Quick Parameters */}
            <div className="neural-quick-params">
              <label className="param-field">
                <span>Sleep Duration (hrs):</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="14"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="mc-number-input"
                />
              </label>

              <label className="param-checkbox">
                <input
                  type="checkbox"
                  checked={hasSuddenOnset}
                  onChange={(e) => setHasSuddenOnset(e.target.checked)}
                />
                <span>Sudden Acute Onset (&lt; 24h)</span>
              </label>
            </div>

            {/* Initiate Scan CTA */}
            <div className="scanner-cta-bar">
              <button
                type="button"
                className="mc-button mc-btn-cyan btn-full-width"
                onClick={handleInitiateScan}
              >
                INITIATE NEURAL SCAN
              </button>
            </div>
          </div>
        )}

        {/* MODAL / TOOLTIP: EQUIP INDIVIDUAL SYMPTOM */}
        {configuringItem && (
          <div className="mc-submodal-backdrop" onClick={() => setConfiguringItem(null)}>
            <div className="symptom-equip-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="equip-dialog-header">
                <span>{configuringItem.icon}</span>
                <span>{configuringItem.name.toUpperCase()}</span>
              </div>

              <div className="equip-dialog-row">
                <label className="equip-row-label">Severity Level</label>
                <div className="severity-toggle-row">
                  {['I', 'II', 'III'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`severity-btn ${severity === lvl ? 'sev-active' : ''}`}
                      onClick={() => setSeverity(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="equip-dialog-row">
                <label className="equip-row-label">Duration</label>
                <div className="duration-inputs-wrap">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="mc-number-input"
                    style={{ width: '60px' }}
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="mc-select-input"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>

              <div className="equip-dialog-row">
                <label className="equip-row-label">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mc-select-input"
                >
                  <option value="Occasional">Occasional</option>
                  <option value="Intermittent">Intermittent</option>
                  <option value="Continuous">Continuous</option>
                </select>
              </div>

              <div className="equip-dialog-actions">
                <button
                  type="button"
                  className="mc-button mc-btn-cyan"
                  onClick={handleEquipSymptom}
                >
                  EQUIP SYMPTOM
                </button>
                <button
                  type="button"
                  className="mc-button mc-btn-dark"
                  onClick={() => setConfiguringItem(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

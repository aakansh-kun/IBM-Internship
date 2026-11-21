import { useState } from 'react';

export default function NeuroChamber({
  sanityLevel,
  setSanityLevel,
  darknessActive,
  setDarknessActive,
  nauseaActive,
  setNauseaActive,
  horrorActive,
  setHorrorActive,
  onAddEffect
}) {
  const [neuroVitals, setNeuroVitals] = useState({
    sleepDebt: 12, // hours of sleep deprivation
    tremorIndex: 3, // 0 to 10
    migraineSeverity: 4, // 0 to 10
    cognitiveFog: 40, // percentage
    sensoryOverload: 50 // percentage
  });

  const handleVitalChange = (field, val) => {
    const updated = { ...neuroVitals, [field]: Number(val) };
    setNeuroVitals(updated);

    // Compute updated sanity level from neuro stressors
    const penalty = (updated.sleepDebt * 2.5) + (updated.tremorIndex * 3) + (updated.migraineSeverity * 3.5) + (updated.cognitiveFog * 0.2);
    const newSanity = Math.max(0, Math.min(100, 100 - penalty));
    setSanityLevel(newSanity);

    // Trigger shader effects automatically if severe
    if (newSanity < 40) {
      setHorrorActive(true);
    } else {
      setHorrorActive(false);
    }
  };

  const applyPreset = (type) => {
    if (type === 'lucid') {
      setNeuroVitals({ sleepDebt: 0, tremorIndex: 0, migraineSeverity: 0, cognitiveFog: 10, sensoryOverload: 10 });
      setSanityLevel(95);
      setDarknessActive(false);
      setNauseaActive(false);
      setHorrorActive(false);
      onAddEffect({ id: 'night_vision', icon: '👁️', name: 'Night Vision & Clarity', duration: '8:00', type: 'darkness' });
    } else if (type === 'migraine') {
      setNeuroVitals({ sleepDebt: 18, tremorIndex: 4, migraineSeverity: 8, cognitiveFog: 65, sensoryOverload: 80 });
      setSanityLevel(50);
      setNauseaActive(true);
      setDarknessActive(false);
      onAddEffect({ id: 'nausea', icon: '🌀', name: 'Nausea & Migraine Aura', duration: '3:45', type: 'nausea' });
      onAddEffect({ id: 'mining_fatigue', icon: '⛏️', name: 'Mining Fatigue III (Brain Fog)', duration: '5:00', type: 'wither' });
    } else if (type === 'warden_horror') {
      setNeuroVitals({ sleepDebt: 36, tremorIndex: 9, migraineSeverity: 10, cognitiveFog: 95, sensoryOverload: 100 });
      setSanityLevel(15);
      setDarknessActive(true);
      setNauseaActive(true);
      setHorrorActive(true);
      onAddEffect({ id: 'darkness', icon: '🌌', name: 'Darkness (Warden Mod Horror)', duration: '1:30', type: 'darkness' });
      onAddEffect({ id: 'blindness', icon: '🌑', name: 'Blindness & Tremors', duration: '2:15', type: 'wither' });
      onAddEffect({ id: 'sanity_loss', icon: '👻', name: 'Phantom Insomnia Terror', duration: '0:45', type: 'wither' });
    }
  };

  return (
    <div className="minecraft-gui-panel">
      {/* Chamber Header */}
      <div className="chamber-header">
        <div className="chamber-title-group">
          <h2>
            <span>🧠</span>
            <span>Neurological &amp; Horror Sanity Chamber</span>
          </h2>
          <p>Cognitive load telemetry, neural motor tremors, migraine aura, and Minecraft horror mod shader post-processing.</p>
        </div>
        <div className="chamber-status-chip" style={{ color: sanityLevel < 40 ? '#ff2a2a' : sanityLevel < 70 ? '#f59e0b' : '#00f0ff' }}>
          <span>●</span>
          <span>{sanityLevel < 40 ? 'CRITICAL SANITY DECAY' : sanityLevel < 70 ? 'MODERATE NEURAL STRAIN' : 'LUCID & STABLE'}</span>
        </div>
      </div>

      {/* Preset Profiles */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          type="button" 
          className="chamber-tab-btn" 
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          onClick={() => applyPreset('lucid')}
        >
          ✨ Lucid &amp; Rested (High Sanity)
        </button>
        <button 
          type="button" 
          className="chamber-tab-btn" 
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          onClick={() => applyPreset('migraine')}
        >
          🌀 Migraine Aura &amp; Sleep Debt (Nausea)
        </button>
        <button 
          type="button" 
          className="chamber-tab-btn" 
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderColor: '#ff2a2a' }}
          onClick={() => applyPreset('warden_horror')}
        >
          💀 Deep Sculk Psychosis (Horror Mod / Darkness)
        </button>
      </div>

      <div className="neuro-grid">
        {/* Left Column: Neurological Assessment Sliders */}
        <div>
          <div className="form-fieldset">
            <div className="fieldset-legend">
              <span>⚡</span>
              <span>Neuro-Cognitive Stressors &amp; Biomarkers</span>
            </div>

            {/* Sleep Debt */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="sleepDebt">
                <span>Sleep Deprivation / Insomnia Debt</span>
                <span className="input-subtext">{neuroVitals.sleepDebt} Hours (Phantom threat: {neuroVitals.sleepDebt > 24 ? 'Active' : 'Dormant'})</span>
              </label>
              <input 
                type="range" 
                id="sleepDebt" 
                min="0" 
                max="48" 
                value={neuroVitals.sleepDebt}
                onChange={(e) => handleVitalChange('sleepDebt', e.target.value)} 
              />
            </div>

            {/* Tremor Index */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="tremorIndex">
                <span>Motor Tremor Severity / Shaking</span>
                <span className="input-subtext">Level {neuroVitals.tremorIndex} / 10</span>
              </label>
              <input 
                type="range" 
                id="tremorIndex" 
                min="0" 
                max="10" 
                value={neuroVitals.tremorIndex}
                onChange={(e) => handleVitalChange('tremorIndex', e.target.value)} 
              />
            </div>

            {/* Migraine Intensity */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="migraineSeverity">
                <span>Migraine &amp; Cortical Spreading Depression</span>
                <span className="input-subtext">Level {neuroVitals.migraineSeverity} / 10</span>
              </label>
              <input 
                type="range" 
                id="migraineSeverity" 
                min="0" 
                max="10" 
                value={neuroVitals.migraineSeverity}
                onChange={(e) => handleVitalChange('migraineSeverity', e.target.value)} 
              />
            </div>

            {/* Cognitive Fog */}
            <div>
              <label className="input-label" htmlFor="cognitiveFog">
                <span>Cognitive Brain Fog (Mining Fatigue)</span>
                <span className="input-subtext">{neuroVitals.cognitiveFog}% Neural Latency</span>
              </label>
              <input 
                type="range" 
                id="cognitiveFog" 
                min="0" 
                max="100" 
                value={neuroVitals.cognitiveFog}
                onChange={(e) => handleVitalChange('cognitiveFog', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Minecraft Shader Post-Processing Controls */}
        <div>
          <div className="horror-control-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎮</span>
              <span>Live Minecraft Shader Post-Processing</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Test and experience authentic modern Minecraft shaders &amp; horror mod effects in real-time.
            </p>

            {/* Toggle 1: Warden Darkness */}
            <button
              type="button"
              className={`horror-trigger-btn ${darknessActive ? 'active-trigger' : ''}`}
              onClick={() => {
                const next = !darknessActive;
                setDarknessActive(next);
                if (next) onAddEffect({ id: 'darkness', icon: '🌌', name: 'Darkness (Warden)', duration: '1:00', type: 'darkness' });
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌌</span>
                <span>Warden Deep Darkness Effect</span>
              </span>
              <span className="toggle-indicator">{darknessActive ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Toggle 2: Nausea Shader */}
            <button
              type="button"
              className={`horror-trigger-btn ${nauseaActive ? 'active-trigger' : ''}`}
              onClick={() => {
                const next = !nauseaActive;
                setNauseaActive(next);
                if (next) onAddEffect({ id: 'nausea', icon: '🌀', name: 'Nausea Distortion', duration: '0:45', type: 'nausea' });
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌀</span>
                <span>Minecraft Nausea / Optical Warp</span>
              </span>
              <span className="toggle-indicator">{nauseaActive ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Toggle 3: Sanity Depleted / Horror Glitch */}
            <button
              type="button"
              className={`horror-trigger-btn ${horrorActive ? 'active-trigger' : ''}`}
              onClick={() => {
                const next = !horrorActive;
                setHorrorActive(next);
                if (next) onAddEffect({ id: 'horror', icon: '👻', name: 'Sanity Decay Glitch', duration: '0:30', type: 'wither' });
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👻</span>
                <span>Horror Mod Sanity Jitter &amp; Whispers</span>
              </span>
              <span className="toggle-indicator">{horrorActive ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Status Feedback Box */}
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                Active Neurological Diagnosis:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600', marginTop: '0.25rem' }}>
                {sanityLevel > 80 
                  ? 'Healthy Cognitive Reserve — Low Central Nervous System Stress' 
                  : sanityLevel > 45 
                  ? 'Chronic Sleep Deprivation & Focal Migraine Sensitivity' 
                  : 'Severe Neuro-Exhaustion with Sensory Hallucinations'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

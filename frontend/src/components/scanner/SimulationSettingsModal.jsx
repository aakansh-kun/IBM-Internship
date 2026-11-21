import { useState } from 'react';
import { isAudioMuted, toggleAudioMute } from '../../utils/minecraftAudio';

export default function SimulationSettingsModal({
  isOpen,
  onClose,
  effectIntensity,
  setEffectIntensity,
  darknessActive,
  setDarknessActive,
  nauseaActive,
  setNauseaActive,
  horrorActive,
  setHorrorActive,
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather
}) {
  const [audioMuted, setAudioMuted] = useState(isAudioMuted());
  const [graphicsQuality, setGraphicsQuality] = useState('HIGH');
  const [heartbeatVignette, setHeartbeatVignette] = useState(true);
  const [brainFog, setBrainFog] = useState(true);
  const [sculkPulse, setSculkPulse] = useState(true);

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    const muted = toggleAudioMute();
    setAudioMuted(muted);
  };

  return (
    <div className="mc-modal-backdrop" onClick={onClose}>
      <div className="simulation-settings-terminal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="scanner-terminal-header">
          <div className="scanner-glyph-title">
            <span>⚙️</span>
            <span>SIMULATION &amp; SHADER SETTINGS</span>
          </div>
          <button type="button" className="terminal-close-x" onClick={onClose} title="Close [ESC]">
            ✕
          </button>
        </div>

        <div className="settings-body-scroll">
          <div className="settings-group-title">OPTIONAL VISUAL SIMULATIONS</div>
          <p className="settings-note">
            Educational shaders illustrating sensory sensitivity, sculk darkness, or perceptual shifts.
          </p>

          <div className="settings-toggles-grid">
            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">👁️</span>
                <span>Warden Darkness</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${darknessActive ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setDarknessActive(!darknessActive)}
              >
                {darknessActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">🌀</span>
                <span>Migraine Distortion</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${nauseaActive ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setNauseaActive(!nauseaActive)}
              >
                {nauseaActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">💀</span>
                <span>Sculk Horror Pulse</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${horrorActive ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setHorrorActive(!horrorActive)}
              >
                {horrorActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">💓</span>
                <span>Heartbeat Vignette</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${heartbeatVignette ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setHeartbeatVignette(!heartbeatVignette)}
              >
                {heartbeatVignette ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">🌫️</span>
                <span>Brain Fog Atmosphere</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${brainFog ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setBrainFog(!brainFog)}
              >
                {brainFog ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-name">
                <span className="toggle-glyph">🔊</span>
                <span>Master Game Audio</span>
              </div>
              <button
                type="button"
                className={`mc-toggle-btn ${!audioMuted ? 'toggle-on' : 'toggle-off'}`}
                onClick={handleToggleAudio}
              >
                {!audioMuted ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="settings-group-title" style={{ marginTop: '1.25rem' }}>SIMULATION INTENSITY</div>
          <div className="intensity-selector-row">
            {['off', 'low', 'immersive'].map((level) => (
              <button
                key={level}
                type="button"
                className={`mc-intensity-btn ${effectIntensity === level ? 'intensity-active' : ''}`}
                onClick={() => setEffectIntensity(level)}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Atmosphere & Sky */}
          <div className="settings-group-title" style={{ marginTop: '1.25rem' }}>ENVIRONMENT &amp; SKY</div>
          <div className="environment-quick-row">
            <button
              type="button"
              className="mc-button mc-btn-dark"
              onClick={() => setTimeOfDay(timeOfDay === 'day' ? 'sunset' : timeOfDay === 'sunset' ? 'night' : 'day')}
            >
              Time: {timeOfDay.toUpperCase()}
            </button>
            <button
              type="button"
              className="mc-button mc-btn-dark"
              onClick={() => setWeather(weather === 'clear' ? 'rain' : 'clear')}
            >
              Weather: {weather.toUpperCase()}
            </button>
            <button
              type="button"
              className="mc-button mc-btn-dark"
              onClick={() => {
                const q = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'];
                const nextIdx = (q.indexOf(graphicsQuality) + 1) % q.length;
                setGraphicsQuality(q[nextIdx]);
              }}
            >
              Shaders: {graphicsQuality}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer-row">
          <button
            type="button"
            className="mc-button mc-btn-cyan btn-full-width"
            onClick={onClose}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

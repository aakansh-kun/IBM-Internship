export default function TopHUD({
  activeModule,
  setActiveModule,
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather,
  effectIntensity,
  setEffectIntensity,
  sanityLevel,
  onOpenInventory
}) {
  const nextTime = () => {
    if (timeOfDay === 'day') setTimeOfDay('sunset');
    else if (timeOfDay === 'sunset') setTimeOfDay('night');
    else setTimeOfDay('day');
  };

  const nextWeather = () => {
    setWeather(weather === 'clear' ? 'rain' : 'clear');
  };

  const nextIntensity = () => {
    if (effectIntensity === 'immersive') setEffectIntensity('off');
    else if (effectIntensity === 'off') setEffectIntensity('low');
    else setEffectIntensity('immersive');
  };

  return (
    <header className="minimal-top-hud">
      {/* Upper Bar: Controls & Telemetry */}
      <div className="top-hud-main-row">
        {/* Left: Compact World & Atmosphere */}
        <div className="hud-group-left">
          <button 
            type="button" 
            className="compact-hud-btn" 
            onClick={nextTime}
            title="Toggle Sky: Day / Sunset / Night"
          >
            <span>{timeOfDay === 'day' ? '☀️ Day' : timeOfDay === 'sunset' ? '🌅 Sunset' : '🌙 Night'}</span>
          </button>

          <button 
            type="button" 
            className="compact-hud-btn" 
            onClick={nextWeather}
            title="Toggle Weather: Clear / Rain"
          >
            <span>{weather === 'clear' ? '🌤️ Clear' : '🌧️ Rain'}</span>
          </button>

          <button 
            type="button" 
            className={`compact-hud-btn ${effectIntensity !== 'off' ? 'btn-active-shader' : ''}`}
            onClick={nextIntensity}
            title="Shader Effects (Off, Low, Immersive)"
          >
            <span>✨ {effectIntensity.toUpperCase()}</span>
          </button>
        </div>

        {/* Center: Thin Neural Coherence Boss Bar */}
        <div className="hud-group-center">
          <div className="compact-bossbar-label">
            <span>🧠 NEURAL COHERENCE</span>
            <span>{Math.round(sanityLevel)}%</span>
          </div>
          <div className="compact-bossbar-track">
            <div 
              className="compact-bossbar-fill"
              style={{
                width: `${Math.max(5, Math.min(100, sanityLevel))}%`,
                background: sanityLevel < 40 
                  ? 'linear-gradient(90deg, #ef4444, #9333ea)' 
                  : 'linear-gradient(90deg, #8b5cf6, #06b6d4)'
              }}
            />
          </div>
        </div>

        {/* Right: Privacy Badge & Inventory trigger */}
        <div className="hud-group-right">
          <div className="compact-privacy-pill" title="In-memory analysis only. No persistent medical data stored.">
            <span className="privacy-live-dot" />
            <span>PRIVATE SESSION</span>
          </div>

          <button
            type="button"
            className="compact-hud-btn inventory-compact-btn"
            onClick={onOpenInventory}
            title="Open Items Inventory [E]"
          >
            <span>🎒 E</span>
          </button>
        </div>
      </div>

      {/* Lower Integrated Nav Bar: Clean Short Labels */}
      <nav className="minimal-module-nav" aria-label="Clinical Modules">
        <button
          type="button"
          className={`minimal-nav-tab ${activeModule === 'cardio' ? 'active-cardio' : ''}`}
          onClick={() => setActiveModule('cardio')}
        >
          <span>❤️</span>
          <span>Cardio</span>
        </button>

        <button
          type="button"
          className={`minimal-nav-tab ${activeModule === 'neuro' ? 'active-neuro' : ''}`}
          onClick={() => setActiveModule('neuro')}
        >
          <span>🧠</span>
          <span>Neuro</span>
        </button>

        <button
          type="button"
          className={`minimal-nav-tab ${activeModule === 'labs' ? 'active-labs' : ''}`}
          onClick={() => setActiveModule('labs')}
        >
          <span>🧪</span>
          <span>Labs</span>
        </button>

        <button
          type="button"
          className={`minimal-nav-tab ${activeModule === 'ai_scan' ? 'active-ai' : ''}`}
          onClick={() => setActiveModule('ai_scan')}
        >
          <span>✨</span>
          <span>AI</span>
        </button>
      </nav>
    </header>
  );
}

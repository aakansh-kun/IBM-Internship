export default function ScannerMenuModal({
  isOpen,
  onClose,
  onSelectModule
}) {
  if (!isOpen) return null;

  return (
    <div className="mc-modal-backdrop" onClick={onClose}>
      <div className="scanner-menu-terminal" onClick={(e) => e.stopPropagation()}>
        {/* Holographic Header */}
        <div className="scanner-terminal-header">
          <div className="scanner-glyph-title">
            <span className="scanner-pulse-dot" />
            <span>BIOMETRIC SCANNER v2.1</span>
          </div>
          <button type="button" className="terminal-close-x" onClick={onClose} title="Close Scanner [ESC]">
            ✕
          </button>
        </div>

        <div className="scanner-terminal-sub">
          SELECT DIAGNOSTIC PROTOCOL
        </div>

        {/* 5 In-Game Mod Modules */}
        <div className="scanner-protocols-grid">
          <button
            type="button"
            className="scanner-protocol-card protocol-cardio"
            onClick={() => onSelectModule('cardio')}
          >
            <span className="protocol-icon">❤️</span>
            <div className="protocol-info">
              <div className="protocol-title">CARDIAC SCAN</div>
              <div className="protocol-desc">Hemodynamic telemetry, arterial friction &amp; CVD risk matrix</div>
            </div>
            <span className="protocol-arrow">→</span>
          </button>

          <button
            type="button"
            className="scanner-protocol-card protocol-neuro"
            onClick={() => onSelectModule('neuro')}
          >
            <span className="protocol-icon">🧠</span>
            <div className="protocol-info">
              <div className="protocol-title">NEURAL SCAN</div>
              <div className="protocol-desc">Cognitive, motor &amp; sensory symptom state mapping</div>
            </div>
            <span className="protocol-arrow">→</span>
          </button>

          <button
            type="button"
            className="scanner-protocol-card protocol-labs"
            onClick={() => onSelectModule('labs')}
          >
            <span className="protocol-icon">🧪</span>
            <div className="protocol-info">
              <div className="protocol-title">LAB TERMINAL</div>
              <div className="protocol-desc">In-memory medical report CSV ingestion &amp; biomarker extraction</div>
            </div>
            <span className="protocol-arrow">→</span>
          </button>

          <button
            type="button"
            className="scanner-protocol-card protocol-ai"
            onClick={() => onSelectModule('ai_core')}
          >
            <span className="protocol-icon">✨</span>
            <div className="protocol-info">
              <div className="protocol-title">AI CORE ENTITY</div>
              <div className="protocol-desc">Consult floating beacon intelligence for model factor translation</div>
            </div>
            <span className="protocol-arrow">→</span>
          </button>

          <button
            type="button"
            className="scanner-protocol-card protocol-settings"
            onClick={() => onSelectModule('settings')}
          >
            <span className="protocol-icon">⚙️</span>
            <div className="protocol-info">
              <div className="protocol-title">SIMULATION SETTINGS</div>
              <div className="protocol-desc">Warden darkness, migraine distortion &amp; audio parameters</div>
            </div>
            <span className="protocol-arrow">→</span>
          </button>
        </div>

        <div className="scanner-terminal-footer">
          <span>Target: Player Self</span>
          <span>Press [ESC] to return to world</span>
        </div>
      </div>
    </div>
  );
}

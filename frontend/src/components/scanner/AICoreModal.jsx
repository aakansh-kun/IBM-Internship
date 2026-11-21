import { useState, useEffect } from 'react';
import { playScannerCompleteSound } from '../../utils/minecraftAudio';

export default function AICoreModal({
  isOpen,
  onClose,
  cardioResult,
  neuroResult,
  cardioData,
  onAwardXP
}) {
  const [activeDomain, setActiveDomain] = useState('cardio'); // 'cardio' | 'neuro'
  const [dialogueText, setDialogueText] = useState('');
  const [dialogueOptions, setDialogueOptions] = useState([]);
  const [citations, setCitations] = useState([]);
  const [providerUsed, setProviderUsed] = useState('RAG Initializing...');
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  const isCardio = activeDomain === 'cardio';

  // Initialize dialogue upon open
  useEffect(() => {
    if (!isOpen) return;

    if (cardioResult) {
      setActiveDomain('cardio');
      const pct = Math.round(cardioResult.risk_percentage || (cardioResult.risk_score ? cardioResult.risk_score * 100 : 24));
      const tier = cardioResult.risk_level || 'Moderate';
      setDialogueText(
        `"Greetings, explorer. The Biometric Scanner has recorded your cardiovascular telemetry.\n\nEstimated Risk Signal: ${pct}% (${tier.toUpperCase()}). Several physiological factors are influencing this estimate."`
      );
    } else if (neuroResult) {
      setActiveDomain('neuro');
      const concern = neuroResult.concern_index || 38;
      const tier = neuroResult.concern_tier || 'Moderate';
      setDialogueText(
        `"Neural core synchronized. Symptom cluster mapping detected a concern index of ${concern}% (${tier.toUpperCase()})."`
      );
    } else {
      setDialogueText(
        `"Welcome to the AI Core. Run a Cardiac Scan or Neural Scan through the Biometric Scanner to analyze your clinical markers."`
      );
    }

    setDialogueOptions([
      { label: 'Why? Explain what contributed to this', mode: 'simple' },
      { label: 'What lifestyle actions can improve this estimate?', mode: 'technical' },
      { label: 'What questions should I ask my doctor?', mode: 'doctor_questions' }
    ]);
    setCitations([]);
  }, [isOpen, cardioResult, neuroResult]);

  if (!isOpen) return null;

  const handleSelectDialogue = async (option) => {
    setLoading(true);
    const mode = option.mode;

    const payload = {
      domain: activeDomain,
      risk_percentage: isCardio 
        ? Math.round(cardioResult?.risk_percentage || (cardioResult?.risk_score ? cardioResult.risk_score * 100 : 24))
        : Math.round(neuroResult?.concern_score || neuroResult?.concern_index || 35),
      risk_level: isCardio 
        ? (cardioResult?.risk_level || 'Moderate')
        : (neuroResult?.concern_tier || 'Moderate'),
      important_features: isCardio ? (cardioResult?.important_features || []) : [],
      protective_features: isCardio ? (cardioResult?.protective_features || []) : [],
      symptoms: isCardio ? (cardioData?.symptoms || []) : (neuroResult?.potential_patterns || []),
      biomarkers: isCardio ? {
        cholesterol: cardioData?.cholesterol,
        blood_pressure: cardioData?.resting_bp,
        heart_rate: cardioData?.resting_hr,
        ldl: cardioData?.ldl
      } : {},
      mode
    };

    try {
      const res = await fetch('http://localhost:8000/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        let reply = data.summary;
        if (mode === 'doctor_questions' && data.questions_for_doctor?.length > 0) {
          reply += '\n\nQuestions to consider with a physician:\n' + data.questions_for_doctor.map(q => `• ${q}`).join('\n');
        } else if (data.factors_that_matter_most) {
          reply += `\n\nInfluential factors: ${data.factors_that_matter_most}`;
        }
        setDialogueText(`"${reply}"`);
        setCitations(data.citations || []);
        setProviderUsed(data.provider_used || 'RAG Engine');
      } else {
        throw new Error();
      }
    } catch {
      // Grounded offline response
      if (isCardio) {
        setDialogueText(
          `"Your systolic blood pressure (${cardioData?.resting_bp || 120} mmHg) and lipid values contribute to the estimate. This educational screen does not confirm coronary artery disease. Aerobic conditioning and balanced diet support vascular health."`
        );
      } else {
        setDialogueText(
          `"The reported neurological pattern reflects cluster frequency and sleep recovery. Regular circadian sleep and lower screen stimulation reduce sensory fatigue."`
        );
      }
      setProviderUsed('Local Clinical Engine (Offline Fallback)');
    } finally {
      setLoading(false);
      playScannerCompleteSound();
      if (onAwardXP) onAwardXP(2, 'Read AI Explanation');
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customQuery.trim() || loading) return;

    const query = customQuery.trim();
    setCustomQuery('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          domain: activeDomain,
          context: {
            biomarkers: cardioData,
            risk_percentage: isCardio ? cardioResult?.risk_percentage : neuroResult?.concern_index,
            risk_level: isCardio ? cardioResult?.risk_level : neuroResult?.concern_tier
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDialogueText(`"${data.reply}"`);
        setCitations(data.citations || []);
        setProviderUsed(data.provider_used || 'RAG Engine');
      } else {
        throw new Error();
      }
    } catch {
      setDialogueText(
        `"Based on evidence-based screening recommendations, consult a certified physician for personalized review of your ${activeDomain} health markers."`
      );
      setProviderUsed('Local Clinical Engine (Offline Fallback)');
    } finally {
      setLoading(false);
      playScannerCompleteSound();
    }
  };

  return (
    <div className="mc-modal-backdrop ai-core-dimmed-stage" onClick={onClose}>
      <div className="ai-core-container" onClick={(e) => e.stopPropagation()}>
        {/* Floating AI Core Artifact / Orb with Orbiting Particles */}
        <div className="ai-core-floating-entity" aria-hidden="true">
          <div className="ai-core-crystal">
            <span className="crystal-glyph">✨</span>
          </div>
          <div className="crystal-orbit-ring ring-1" />
          <div className="crystal-orbit-ring ring-2" />
        </div>

        {/* Domain Switcher Pill if both scans exist */}
        <div className="ai-core-domain-pills">
          <button
            type="button"
            className={`domain-pill ${activeDomain === 'cardio' ? 'pill-active' : ''}`}
            onClick={() => setActiveDomain('cardio')}
          >
            ❤️ Cardiovascular Core
          </button>
          <button
            type="button"
            className={`domain-pill ${activeDomain === 'neuro' ? 'pill-active' : ''}`}
            onClick={() => setActiveDomain('neuro')}
          >
            🧠 Neurological Core
          </button>
        </div>

        {/* MINECRAFT NPC DIALOGUE BOX */}
        <div className="mc-dialogue-box">
          <div className="dialogue-speaker-tag">
            <div className="dialogue-speaker-left">
              <span className="speaker-glyph">✨</span>
              <span className="speaker-name">AI CORE INTELLECT</span>
            </div>
            {providerUsed && (
              <span className="dialogue-provider-pill" title="Active AI explanation & RAG provider">
                {providerUsed}
              </span>
            )}
          </div>

          <div className="dialogue-speech-text">
            {loading ? (
              <span className="dialogue-typing">SYNCHRONIZING RAG KNOWLEDGE MATRIX...</span>
            ) : (
              <>
                {dialogueText.split('\n').map((line, i) => (
                  <p key={i} className="speech-paragraph">{line}</p>
                ))}

                {/* Grounded Guidelines Citations (RAG) */}
                {citations && citations.length > 0 && (
                  <div className="dialogue-citations-box">
                    <div className="citations-header">
                      <span>📚</span>
                      <span>Clinical Guidelines Grounding (RAG):</span>
                    </div>
                    <div className="citation-list">
                      {citations.map((c, idx) => (
                        <div key={idx} className="citation-item">
                          • <strong>{c.title}</strong> — <em>{c.source}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quest Dialogue Response Choices */}
          <div className="dialogue-choices-stack">
            {dialogueOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                className="mc-dialogue-choice-btn"
                disabled={loading}
                onClick={() => handleSelectDialogue(opt)}
              >
                <span className="choice-pointer">▶</span>
                <span className="choice-text">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Quick write-in inquiry */}
          <form className="ai-custom-query-row" onSubmit={handleCustomSubmit}>
            <input
              type="text"
              placeholder="Ask the RAG companion a question..."
              className="mc-query-input"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
            <button type="submit" className="mc-button mc-btn-cyan" disabled={!customQuery.trim() || loading}>
              Ask
            </button>
          </form>

          <div className="dialogue-footer">
            <span className="ai-guardrail-note">
              Grounded AI explanation of statistical models & clinical guidelines. Not medical advice.
            </span>
            <button type="button" className="terminal-close-x" onClick={onClose} title="Dismiss [ESC]">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

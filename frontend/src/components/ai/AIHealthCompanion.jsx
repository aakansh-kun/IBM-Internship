import { useState } from 'react';

export default function AIHealthCompanion({
  cardioResult,
  neuroResult,
  cardioData,
  activeDomain = 'cardio'
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const activeResult = activeDomain === 'neuro' ? neuroResult : cardioResult;

  const quickPrompts = [
    { label: 'Explain results simply', mode: 'simple' },
    { label: 'What factors matter most?', mode: 'technical' },
    { label: 'Questions for my doctor', mode: 'doctor_questions' }
  ];

  const handleSendPrompt = async (promptText, promptMode = 'simple', isCustomChat = false) => {
    if (!promptText.trim()) return;

    // Add user query to conversation
    const userMsg = { id: Date.now(), sender: 'user', text: promptText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const isCardio = activeDomain === 'cardio';

    try {
      if (isCustomChat) {
        // Freeform inquiry -> invoke RAG chat endpoint
        const res = await fetch('http://localhost:8000/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptText,
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
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'ai',
              text: data.reply,
              citations: data.citations || [],
              provider: data.provider_used
            }
          ]);
        } else {
          throw new Error();
        }
      } else {
        // Structured explain endpoint
        const payload = {
          domain: activeDomain,
          risk_percentage: isCardio 
            ? Math.round(cardioResult?.risk_percentage || (cardioResult?.risk_score ? cardioResult.risk_score * 100 : 20))
            : Math.round(neuroResult?.concern_score || neuroResult?.concern_index || 25),
          risk_level: isCardio 
            ? (cardioResult?.risk_level || 'Moderate')
            : (neuroResult?.concern_tier || 'Mild'),
          important_features: isCardio ? (cardioResult?.important_features || []) : [],
          protective_features: isCardio ? (cardioResult?.protective_features || []) : [],
          symptoms: isCardio ? (cardioData?.symptoms || []) : (neuroResult?.potential_patterns || []),
          biomarkers: isCardio ? {
            cholesterol: cardioData?.cholesterol,
            blood_pressure: cardioData?.resting_bp,
            heart_rate: cardioData?.resting_hr
          } : {},
          mode: promptMode
        };

        const res = await fetch('http://localhost:8000/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          let botReply = data.summary;
          if (promptMode === 'doctor_questions' && data.questions_for_doctor?.length > 0) {
            botReply += '\n\nQuestions you can bring to your physician:\n' + data.questions_for_doctor.map(q => `• ${q}`).join('\n');
          } else if (data.factors_that_matter_most) {
            botReply += `\n\nKey influences: ${data.factors_that_matter_most}`;
          }
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'ai',
              text: botReply,
              citations: data.citations || [],
              provider: data.provider_used
            }
          ]);
        } else {
          throw new Error();
        }
      }
    } catch {
      // Offline fallback response
      const fallback = isCardio
        ? `Based on your vitals (${cardioData?.resting_bp || 120} mmHg BP, ${cardioData?.cholesterol || 205} mg/dL Chol), your cardiovascular risk estimate is ${cardioResult?.risk_level || 'Moderate'}. Key modifiable factors are blood pressure regulation and dietary balance.`
        : `Your neurological concern rating is currently ${neuroResult?.concern_tier || 'Mild'}. The reported symptoms suggest monitoring sleep consistency and avoiding late-night sensory overload.`;
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: fallback,
          citations: [],
          provider: 'Local Clinical Engine (Offline Fallback)'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="focused-medical-shell">
      <div className="medical-card-frame" style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div className="card-header-bar">
          <div>
            <h2 className="card-headline">
              <span>✨</span>
              <span>AI Health Companion</span>
            </h2>
            <p className="card-subheadline">Evidence-based clinical guidelines & RAG explainability engine</p>
          </div>
        </div>

        {/* Content State: Welcome OR Chat Thread */}
        {messages.length === 0 ? (
          /* Welcome View */
          <div className="ai-conversational-welcome">
            <div className="ai-welcome-glyph">✨</div>
            <h3 className="ai-welcome-title">Ask about your screening results</h3>
            <p className="ai-welcome-desc">
              Your inquiries are evaluated against AHA/ACC, AAN, and WHO clinical guidelines. Select a prompt or type below:
            </p>

            {/* Quick Action Pills */}
            <div className="ai-quick-prompts-grid">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ai-prompt-pill"
                  onClick={() => handleSendPrompt(p.label, p.mode, false)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="ai-chat-thread-container">
            <div className="ai-messages-scroll">
              {messages.map(m => (
                <div key={m.id} className={`ai-chat-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                  {m.provider && (
                    <div className="dialogue-provider-pill" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                      {m.provider}
                    </div>
                  )}

                  {m.text.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '0 0 0.35rem' }}>{line}</p>
                  ))}

                  {/* Grounded Citations (RAG) */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="dialogue-citations-box" style={{ marginTop: '0.6rem' }}>
                      <div className="citations-header">
                        <span>📚</span>
                        <span>Clinical Guidelines Grounding (RAG):</span>
                      </div>
                      <div className="citation-list">
                        {m.citations.map((c, ci) => (
                          <div key={ci} className="citation-item">
                            • <strong>{c.title}</strong> — <em>{c.source}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="ai-chat-bubble bubble-ai bubble-loading">
                  Synthesizing clinical response with RAG knowledge base...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              className="ai-chat-input-bar"
              style={{ marginTop: '1rem' }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(inputText, 'simple', true);
              }}
            >
              <input
                type="text"
                placeholder="Ask a medical guidelines question..."
                className="ai-chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="ai-send-btn" disabled={!inputText.trim() || loading}>
                Send
              </button>
            </form>

            <div className="ai-disclaimer-subtext">
              Educational screening translation grounded in AHA/ACC & AAN guidelines &bull; Does not provide medical diagnoses
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

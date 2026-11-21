"""
GenAI Health Explanation & Clinical RAG Engine with Google Gemini Provider
Translates structured ML risk outputs, lab data, and patient biometrics into
evidence-grounded clinical summaries citing authoritative medical guidelines (AHA/ACC, AAN, WHO).
Never overrides the ML risk score. Strictly non-diagnostic and educational.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
import requests
from dotenv import load_dotenv

from app.rag.retriever import retrieve_guidelines

# Load environment configuration (.env in backend or workspace root)
env_path = Path(__file__).resolve().parents[2] / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

logger = logging.getLogger("medicraft.ai")

class AIProvider:
    def explain(self, context: Dict[str, Any], mode: str = "simple") -> Dict[str, Any]:
        raise NotImplementedError

    def chat(self, message: str, context: Dict[str, Any], domain: str = "cardio") -> Dict[str, Any]:
        raise NotImplementedError

class LocalClinicalProvider(AIProvider):
    """
    Deterministic rule-based clinical explanation provider grounded with RAG guidelines.
    Guarantees 100% reliable, zero-crash responses when external API keys are not supplied.
    """
    def explain(self, context: Dict[str, Any], mode: str = "simple") -> Dict[str, Any]:
        domain = context.get("domain", "cardio")
        risk_pct = context.get("risk_percentage", 30)
        risk_level = context.get("risk_level", "Moderate")
        important_features = context.get("important_features", [])
        protective_features = context.get("protective_features", [])
        symptoms = context.get("symptoms", [])

        # 1. RAG Retrieval of clinical guidelines matching the patient's biomarkers/symptoms
        guidelines = retrieve_guidelines(context, domain=domain, top_k=3)
        citations = [
            {
                "id": g["id"],
                "source": g["source"],
                "title": g["title"],
                "similarity_score": g["similarity_score"]
            }
            for g in guidelines
        ]

        feature_names = [f["feature"] if isinstance(f, dict) else str(f) for f in important_features]
        top_drivers = ", ".join(feature_names[:3]) if feature_names else "general demographic metrics"
        top_guideline_source = citations[0]["source"] if citations else "AHA/ACC Clinical Guidelines"

        if mode == "technical":
            summary = (
                f"The calibrated predictive classifier stratifies current {domain} risk at {risk_pct}% ({risk_level} Risk Category). "
                f"Primary log-odds weighting stems from {top_drivers}. "
                f"Grounded in {top_guideline_source}, this index reflects epidemiological risk attribution rather than an individual etiologic diagnosis."
            )
            why_this_score = (
                f"Elevated hemodynamic and biochemical values increase systemic vascular resistance and atherogenic lipid infiltration. "
                f"Key physiological signals: {', '.join(feature_names) if feature_names else 'No single biomarker dominated.'}"
            )
            factors_matter_most = (
                "1. Arterial shear stress from resting systolic blood pressure.\n"
                "2. Atherogenic apolipoprotein/LDL particle circulation over time.\n"
                "3. Aerobic cardiovascular reserve and myocardial oxygen demand."
            )
            doctor_questions = [
                f"Based on my systolic BP and reported {', '.join(symptoms[:2]) if symptoms else 'vitals'}, is formal ambulatory BP monitoring indicated?",
                "Would a comprehensive fasting lipid subfraction panel (ApoB, LDL-P, Lp(a)) be warranted?",
                "What target thresholds for lipid reduction and exercise intensity do you recommend for my demographic profile?"
            ]
            data_to_improve = "Complete 12-lead resting ECG, high-sensitivity C-reactive protein (hs-CRP), and coronary artery calcium (CAC) scoring."

        elif mode == "doctor_questions":
            summary = f"Here are structured, high-yield clinical questions tailored to your reported biomarkers and symptoms, referenced against {top_guideline_source}:"
            why_this_score = f"Your estimated screening tier ({risk_level}) indicates discussion points around {top_drivers}."
            factors_matter_most = "Focusing on modifiable risk factors (dietary sodium, lipid intake, structured aerobic training, smoking cessation)."
            doctor_questions = [
                f"My recent risk screening flagged {top_drivers}. Are there specific diagnostic tests you recommend to investigate this further?",
                "Given my reported symptoms, should we consider an exercise stress test or echocardiogram?",
                "What lifestyle modifications would have the greatest quantitative impact on reducing my vascular risk over the next 12 months?",
                "Do any of my medications or family history patterns modify my target blood pressure and cholesterol goals?"
            ]
            data_to_improve = "Repeat in-office blood pressure confirmation across multiple visits and fasting metabolic panel."

        else: # simple / default
            summary = (
                f"Your estimated {domain} risk is {risk_level.lower()} (approximately {risk_pct}% screening score), "
                f"primarily related to {top_drivers}. "
                "This educational estimate is informed by clinical prevention guidelines to help you understand your health markers."
            )
            why_this_score = (
                f"Markers like blood pressure and cholesterol compound over years. When markers like {top_drivers} "
                f"trend above guideline targets, cardiac workload and arterial shear stress increase."
            )
            factors_matter_most = (
                "• Modifiable Factors: Daily physical activity, dietary sodium/saturated fat balance, and blood pressure control.\n"
                "• Baseline Factors: Age and biological sex, which naturally calibrate baseline cardiovascular curves.\n"
                "• Protective Strengths: " + (", ".join(protective_features[:2]) if protective_features else "Maintaining regular health checkups.")
            )
            doctor_questions = [
                "Could we review my blood pressure and cholesterol target ranges together?",
                "Are there safe lifestyle or dietary adjustments you would recommend for my heart health?",
                "Should I schedule routine follow-up blood work in 6 to 12 months?"
            ]
            data_to_improve = "Adding recent fasting lab tests, height/weight for BMI, and formal in-clinic blood pressure checks."

        return {
            "summary": summary,
            "why_this_score": why_this_score,
            "factors_that_matter_most": factors_matter_most,
            "questions_for_doctor": doctor_questions,
            "data_to_improve_estimate": data_to_improve,
            "mode_applied": mode,
            "provider_used": "Local Clinical Engine (RAG-Grounded)",
            "citations": citations
        }

    def chat(self, message: str, context: Dict[str, Any], domain: str = "cardio") -> Dict[str, Any]:
        """Provides rule-grounded educational answers for custom chat queries."""
        guidelines = retrieve_guidelines(message, domain=domain, top_k=2)
        citations = [
            {
                "id": g["id"],
                "source": g["source"],
                "title": g["title"],
                "similarity_score": g["similarity_score"]
            }
            for g in guidelines
        ]

        if guidelines:
            top_g = guidelines[0]
            reply = (
                f"Based on clinical recommendations in '{top_g['title']}' ({top_g['source']}):\n\n"
                f"{top_g['content']}\n\n"
                f"Note: This information is strictly educational. Consult a licensed physician for personalized medical advice."
            )
        else:
            reply = (
                f"Regarding your query about {domain} health: Key evidence-based recommendations highlight consistent "
                f"blood pressure management, balanced dietary patterns (like DASH or Mediterranean diets), "
                f"regular aerobic activity, and 7-9 hours of restorative sleep."
            )

        return {
            "reply": reply,
            "citations": citations,
            "provider_used": "Local Clinical Engine (RAG-Grounded)"
        }

class GeminiProvider(AIProvider):
    """
    Google Gemini LLM Provider with Clinical RAG Grounding.
    Uses Google Gemini models (gemini-1.5-flash / gemini-2.0-flash) with structured JSON generation.
    Gracefully falls back to LocalClinicalProvider if API calls cannot be fulfilled.
    """
    def __init__(self, api_key: str, model: str = "gemini-3.5-flash-lite"):
        self.api_key = api_key.strip()
        self.model = os.environ.get("GEMINI_MODEL", model).strip()
        self.fallback = LocalClinicalProvider()
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    def explain(self, context: Dict[str, Any], mode: str = "simple") -> Dict[str, Any]:
        domain = context.get("domain", "cardio")
        risk_pct = context.get("risk_percentage", 30)
        risk_level = context.get("risk_level", "Moderate")

        # 1. RAG Retrieval of authoritative clinical guideline chunks
        guidelines = retrieve_guidelines(context, domain=domain, top_k=3)
        citations = [
            {
                "id": g["id"],
                "source": g["source"],
                "title": g["title"],
                "similarity_score": g["similarity_score"]
            }
            for g in guidelines
        ]

        # 2. Build grounding context from retrieved guidelines
        guideline_context_str = "\n\n".join([
            f"[Source {idx+1}: {g['id']} - {g['source']}]\nTitle: {g['title']}\nGuideline Excerpt: {g['content']}"
            for idx, g in enumerate(guidelines)
        ])

        system_instruction = (
            "You are a medical AI explainability assistant for an educational risk screening tool called Medicraft. "
            "You translate structured machine learning risk predictions and biomarker values into compassionate, "
            "medically accurate, and evidence-grounded educational explanations. "
            "STRICT RULES:\n"
            "1. NEVER give a definitive diagnosis. Always state this is an educational screening estimate.\n"
            "2. Ground your reasoning in the provided Clinical Guidelines below and cite them (e.g. '[AHA-ACC-2019-BP]').\n"
            "3. Output ONLY valid JSON matching the exact schema specified."
        )

        user_prompt = (
            f"Patient Context & Screening Result:\n"
            f"- Domain: {domain}\n"
            f"- ML Estimated Risk: {risk_level} ({risk_pct}% probability score)\n"
            f"- Key Biomarkers: {context.get('biomarkers', {})}\n"
            f"- Important Drivers (ML weights): {context.get('important_features', [])}\n"
            f"- Protective Strengths: {context.get('protective_features', [])}\n"
            f"- Reported Symptoms: {context.get('symptoms', [])}\n"
            f"- Requested Explanation Mode: {mode}\n\n"
            f"Retrieved Clinical Guidelines (RAG Context):\n"
            f"{guideline_context_str}\n\n"
            "Required JSON Schema:\n"
            "{\n"
            '  "summary": "Clear 2-3 sentence overview citing relevant guidelines",\n'
            '  "why_this_score": "Explanation of physiological mechanisms behind the biomarkers",\n'
            '  "factors_that_matter_most": "Bullet points on modifiable vs baseline drivers",\n'
            '  "questions_for_doctor": ["Question 1", "Question 2", "Question 3"],\n'
            '  "data_to_improve_estimate": "Specific clinical tests or confirmatory labs recommended by guidelines"\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        try:
            resp = requests.post(self.api_url, json=payload, timeout=18)
            if resp.status_code == 200:
                data = resp.json()
                candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(candidate_text)

                return {
                    "summary": parsed.get("summary", ""),
                    "why_this_score": parsed.get("why_this_score", ""),
                    "factors_that_matter_most": parsed.get("factors_that_matter_most", ""),
                    "questions_for_doctor": parsed.get("questions_for_doctor", []),
                    "data_to_improve_estimate": parsed.get("data_to_improve_estimate", ""),
                    "mode_applied": mode,
                    "provider_used": f"Google Gemini ({self.model}) + RAG",
                    "citations": citations
                }
            else:
                logger.warning(f"[Gemini] API returned status {resp.status_code}: {resp.text}. Falling back to LocalClinicalProvider.")
                result = self.fallback.explain(context, mode)
                result["citations"] = citations
                return result

        except Exception as e:
            logger.warning(f"[Gemini] Request failed ({e}). Falling back to LocalClinicalProvider.")
            result = self.fallback.explain(context, mode)
            result["citations"] = citations
            return result

    def chat(self, message: str, context: Dict[str, Any], domain: str = "cardio") -> Dict[str, Any]:
        """Interactive RAG chat grounded with Gemini LLM."""
        guidelines = retrieve_guidelines(message, domain=domain, top_k=3)
        citations = [
            {
                "id": g["id"],
                "source": g["source"],
                "title": g["title"],
                "similarity_score": g["similarity_score"]
            }
            for g in guidelines
        ]

        guideline_context_str = "\n\n".join([
            f"[{g['id']} - {g['source']}]: {g['content']}" for g in guidelines
        ])

        system_instruction = (
            "You are a friendly, compassionate clinical explainability companion inside Medicraft. "
            "Answer the user's question educational, citing the provided clinical guidelines where applicable. "
            "Never diagnose or prescribe medications. Advise consulting a physician for clinical decisions."
        )

        user_prompt = (
            f"Patient Context: {context}\n\n"
            f"Clinical Guidelines (RAG):\n{guideline_context_str}\n\n"
            f"User Question: {message}"
        )

        payload = {
            "contents": [
                {
                    "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3
            }
        }

        try:
            resp = requests.post(self.api_url, json=payload, timeout=18)
            if resp.status_code == 200:
                data = resp.json()
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "reply": reply_text.strip(),
                    "citations": citations,
                    "provider_used": f"Google Gemini ({self.model}) + RAG"
                }
            else:
                logger.warning(f"[Gemini Chat] API status {resp.status_code}. Using local fallback.")
                return self.fallback.chat(message, context, domain)
        except Exception as e:
            logger.warning(f"[Gemini Chat] Failed ({e}). Using local fallback.")
            return self.fallback.chat(message, context, domain)

def get_ai_provider() -> AIProvider:
    """
    Returns GeminiProvider if GEMINI_API_KEY is configured in the environment or .env,
    otherwise returns LocalClinicalProvider.
    """
    if env_path.exists():
        load_dotenv(env_path, override=False)

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if gemini_key:
        return GeminiProvider(gemini_key)
    return LocalClinicalProvider()

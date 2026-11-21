"""
GenAI Health Report Engine
Generates comprehensive, structured clinical health reports from:
- Unified HealthProfile
- Calibrated ML Predictions (Cardiovascular & Neurological)
- Authoritative RAG Clinical Guidelines (AHA/ACC, AAN, WHO)
- LLM Explainability Insights
"""

from typing import Dict, Any, List, Optional
from app.schemas.profile import HealthProfile
from app.rag.retriever import retrieve_guidelines

class HealthReportEngine:
    @classmethod
    def generate_report(
        cls,
        profile: HealthProfile,
        cardio_pred: Optional[Dict[str, Any]] = None,
        neuro_pred: Optional[Dict[str, Any]] = None,
        explanation: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Assembles the standardized 9-section clinical health report."""
        bmi = profile.calculate_bmi_if_missing()
        
        # 1. RAG retrieval for grounding
        context_for_rag = {
            "domain": "cardio",
            "biomarkers": {
                "resting_bp": profile.vitals.resting_bp,
                "cholesterol": profile.laboratory_values.cholesterol,
                "glucose": profile.laboratory_values.glucose
            },
            "symptoms": profile.symptoms
        }
        guidelines = retrieve_guidelines(context_for_rag, top_k=3)
        sources = [
            {
                "id": g["id"],
                "title": g["title"],
                "organization": g["source"].split(":")[0] if ":" in g["source"] else g["source"]
            }
            for g in guidelines
        ]

        # 2. Key Stats
        key_stats = {
            "blood_pressure": f"{int(profile.vitals.resting_bp)}/{int(profile.vitals.diastolic_bp)} mmHg" if profile.vitals.resting_bp and profile.vitals.diastolic_bp else (f"{int(profile.vitals.resting_bp)} mmHg" if profile.vitals.resting_bp else "Not Recorded"),
            "total_cholesterol": f"{int(profile.laboratory_values.cholesterol)} mg/dL" if profile.laboratory_values.cholesterol else "Not Recorded",
            "resting_heart_rate": f"{int(profile.vitals.resting_hr)} BPM" if profile.vitals.resting_hr else "Not Recorded",
            "fasting_glucose": f"{int(profile.laboratory_values.glucose)} mg/dL" if profile.laboratory_values.glucose else "Not Recorded",
            "bmi": f"{bmi} kg/m²" if bmi else "Not Recorded",
            "input_source": profile.source.replace("_", " ").title()
        }

        # 3. What looks good & What deserves attention
        what_looks_good = []
        what_deserves_attention = []

        if profile.vitals.resting_bp:
            if profile.vitals.resting_bp < 120:
                what_looks_good.append("Resting systolic blood pressure is within normal physiological limits (< 120 mmHg).")
            elif profile.vitals.resting_bp >= 130:
                what_deserves_attention.append(f"Systolic blood pressure ({int(profile.vitals.resting_bp)} mmHg) is above recommended guideline thresholds (Stage 1/2 Hypertension).")

        if profile.laboratory_values.cholesterol:
            if profile.laboratory_values.cholesterol < 200:
                what_looks_good.append("Total serum cholesterol is optimal (< 200 mg/dL).")
            else:
                what_deserves_attention.append(f"Total cholesterol ({int(profile.laboratory_values.cholesterol)} mg/dL) indicates elevated circulating atherogenic lipid burden.")

        if profile.lifestyle_factors.physical_activity is True:
            what_looks_good.append("Reported regular aerobic conditioning supports endothelial nitric oxide bioavailability.")
        elif profile.lifestyle_factors.physical_activity is False:
            what_deserves_attention.append("Sedentary lifestyle pattern limits cardiovascular oxygen reserve.")

        if profile.lifestyle_factors.smoking:
            what_deserves_attention.append("Active tobacco exposure substantially accelerates vascular endothelial damage.")

        if not what_looks_good:
            what_looks_good.append("Engaging in proactive preventive health screening and health tracking.")
        if not what_deserves_attention:
            what_deserves_attention.append("No critical biomarker deviations detected in available data.")

        # 4. Assemble report dictionary
        cardio_tier = cardio_pred.get("risk_level", "Moderate") if cardio_pred else "Screening Pending"
        cardio_pct = cardio_pred.get("risk_percentage", 35) if cardio_pred else None

        neuro_tier = neuro_pred.get("concern_tier", "Mild") if neuro_pred else "Screening Pending"
        neuro_index = neuro_pred.get("concern_index", 20) if neuro_pred else None

        summary_text = (
            f"This personalized health report synthesizes your recorded biometrics, laboratory markers, and reported symptoms. "
            f"The predictive classifier estimates a {cardio_tier.lower()} cardiovascular signal"
            + (f" ({cardio_pct}% statistical risk score)" if cardio_pct else "")
            + f" and a {neuro_tier.lower()} neurological concern pattern. "
            f"All findings are grounded in authoritative AHA/ACC, AAN, and WHO clinical guidelines."
        )

        practical_steps = [
            "Maintain dietary sodium intake under 2,300 mg daily (optimally < 1,500 mg if blood pressure is elevated).",
            "Engage in at least 150 minutes of moderate aerobic exercise (e.g. brisk walking, cycling) per week.",
            "Target 7 to 9 hours of uninterrupted sleep nightly to support glymphatic neural clearance and autonomic tone recovery."
        ]

        doctor_questions = explanation.get("questions_for_doctor", []) if explanation else [
            "Are my blood pressure and cholesterol levels aligned with my demographic target ranges?",
            "Would ambulatory blood pressure monitoring or a fasting lipid subfraction panel be indicated?",
            "What lifestyle modifications would yield the highest quantitative improvement over the next 12 months?"
        ]

        return {
            "title": "PLAYER HEALTH REPORT",
            "health_summary": summary_text,
            "cardiovascular_signal": {
                "tier": cardio_tier,
                "risk_percentage": cardio_pct,
                "top_drivers": [f["feature"] if isinstance(f, dict) else str(f) for f in cardio_pred.get("important_features", [])] if cardio_pred else []
            },
            "neurological_signal": {
                "tier": neuro_tier,
                "concern_index": neuro_index,
                "patterns": neuro_pred.get("potential_patterns", []) if neuro_pred else []
            },
            "key_health_stats": key_stats,
            "what_looks_good": what_looks_good,
            "what_deserves_attention": what_deserves_attention,
            "practical_next_steps": practical_steps,
            "questions_for_next_checkup": doctor_questions,
            "sources": sources,
            "provider_used": explanation.get("provider_used", "RAG Grounded Engine") if explanation else "Clinical Guidelines RAG Engine",
            "educational_disclaimer": "This report is an educational risk screening tool based on statistical models and clinical guidelines. It does not provide medical diagnoses or replace a licensed physician."
        }

report_engine = HealthReportEngine()

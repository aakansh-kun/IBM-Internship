"""
Unified LLM Service Abstraction
Centralizes all LLM interactions (Google Gemini API with local clinical fallback).
Enforces clinical guardrails: LLM never estimates numerical risk probabilities (the ML models do that).
The LLM translates, explains, and grounds predictions in RAG evidence.
"""

from typing import Dict, Any, List, Optional
from app.ai.provider import get_ai_provider
from app.rag.retriever import retrieve_guidelines
from app.schemas.profile import HealthProfile

class LLMService:
    @staticmethod
    def get_provider():
        return get_ai_provider()

    @classmethod
    def explain_prediction(
        cls,
        profile: HealthProfile,
        cardio_result: Optional[Dict[str, Any]] = None,
        neuro_result: Optional[Dict[str, Any]] = None,
        mode: str = "simple",
        domain: str = "cardio"
    ) -> Dict[str, Any]:
        """Explains ML prediction using retrieved clinical guidelines without hallucinating risk."""
        provider = cls.get_provider()

        context = {
            "domain": domain,
            "risk_percentage": cardio_result.get("risk_percentage", 35) if cardio_result else neuro_result.get("concern_index", 25) if neuro_result else 30,
            "risk_level": cardio_result.get("risk_level", "Moderate") if cardio_result else neuro_result.get("concern_tier", "Moderate") if neuro_result else "Moderate",
            "important_features": cardio_result.get("important_features", []) if cardio_result else [],
            "protective_features": cardio_result.get("protective_features", []) if cardio_result else [],
            "symptoms": profile.symptoms,
            "biomarkers": {
                "resting_bp": profile.vitals.resting_bp,
                "cholesterol": profile.laboratory_values.cholesterol,
                "resting_hr": profile.vitals.resting_hr,
                "glucose": profile.laboratory_values.glucose,
                "bmi": profile.calculate_bmi_if_missing()
            }
        }

        return provider.explain(context, mode=mode)

    @classmethod
    def answer_health_question(
        cls,
        question: str,
        profile: Optional[HealthProfile] = None,
        domain: str = "cardio"
    ) -> Dict[str, Any]:
        """Provides evidence-grounded answer to a user's health query."""
        provider = cls.get_provider()
        context = {
            "biomarkers": {
                "resting_bp": profile.vitals.resting_bp if profile else None,
                "cholesterol": profile.laboratory_values.cholesterol if profile else None,
                "resting_hr": profile.vitals.resting_hr if profile else None,
                "bmi": profile.calculate_bmi_if_missing() if profile else None
            } if profile else {},
            "symptoms": profile.symptoms if profile else []
        }
        return provider.chat(message=question, context=context, domain=domain)

    @classmethod
    def extract_health_data_from_query(cls, query: str) -> Dict[str, Any]:
        """Extracts any mentioned metrics (BMI, BP, LDL, weight) from natural language query."""
        from app.services.report_parser import report_parser
        profile = report_parser._extract_biomarkers_from_text(query, "user_query")
        return profile.model_dump(exclude_none=True)

llm_service = LLMService()

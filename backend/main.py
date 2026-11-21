import os
import sys
import io
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np

# Internal architecture imports
from app.safety.red_flags import evaluate_cardio_red_flags, evaluate_neuro_red_flags
from app.ml.cardio_model import cardio_pipeline
from app.ml.neuro_analyzer import neuro_analyzer
from app.ai.provider import get_ai_provider
from app.schemas.cardio import CardioPredictionRequest, CardioPredictionResponse
from app.schemas.neuro import NeuroScreenRequest, NeuroScreenResponse
from app.schemas.labs import LabAnalysisResponse, BiomarkerAnalysisItem
from app.schemas.ai import AIExplanationRequest, AIExplanationResponse, AIChatRequest, AIChatResponse
from app.schemas.profile import HealthProfile
from app.services.report_parser import report_parser
from app.services.llm_service import llm_service
from app.services.report_engine import report_engine
from app.rag.retriever import rag_retriever

# Legacy models for backwards compatibility
from models import PatientData, PredictionResponse, SyntheticDataRequest

# Logging configuration (privacy-safe, avoids dumping raw patient payloads)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("medicraft.backend")

app = FastAPI(
    title="Medicraft Health AI & ML Processing Layer",
    description="Containerized clinical risk screening, RAG explainability, and multi-modal health processing.",
    version="2.2.0"
)

# Configure CORS with configurable origins
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 0. DOCKER & CONTAINER HEALTH CHECKS
# ==============================================================================

@app.get("/health")
def docker_health():
    """Standard lightweight container health check for Docker engine."""
    return {
        "status": "ok",
        "models_loaded": cardio_pipeline.is_trained,
        "rag_ready": len(rag_retriever.documents) > 0
    }

@app.get("/api/health")
def api_health():
    """Detailed health diagnostic probe."""
    provider = get_ai_provider()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    return {
        "status": "online",
        "service": "Medicraft Health AI & ML Processing Layer",
        "version": "2.2.0",
        "cardio_model_ready": cardio_pipeline.is_trained,
        "neuro_analyzer_ready": True,
        "rag_ready": True,
        "rag_indexed_chunks": len(rag_retriever.documents),
        "gemini_key_configured": bool(gemini_key),
        "ai_explanation_provider": type(provider).__name__,
        "ai_model": os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite") if gemini_key else "local-clinical-rules",
        "privacy_mode": "Zero-Persistence Session"
    }

# ==============================================================================
# 1. THREE UNIFIED HEALTH INPUT MODES
# ==============================================================================

@app.post("/api/health/clinical-report")
async def process_clinical_report(file: UploadFile = File(...)):
    """
    Mode 1: Clinical Report Upload
    Accepts PDF, PNG, JPG, JPEG, CSV -> extracts structured biomarkers without hallucination
    -> normalizes into HealthProfile -> runs ML -> retrieves RAG -> generates GenAI report.
    """
    content = await file.read()
    logger.info(f"Received clinical report file: {file.filename} ({len(content)} bytes)")

    profile = report_parser.parse_document(
        filename=file.filename,
        content=content,
        content_type=file.content_type
    )

    # 1. Safety check
    red_flag = evaluate_cardio_red_flags(
        symptoms=profile.symptoms,
        systolic_bp=profile.vitals.resting_bp or 120.0,
        diastolic_bp=profile.vitals.diastolic_bp or 80.0,
        heart_rate=profile.vitals.resting_hr or 75.0
    )

    # 2. ML predictions
    cardio_pred = cardio_pipeline.predict(profile.to_cardio_dict())
    if red_flag:
        cardio_pred["red_flag"] = red_flag.model_dump()

    neuro_pred = neuro_analyzer.analyze(profile.to_neuro_dict())

    # 3. LLM explainability & RAG
    explanation = llm_service.explain_prediction(profile, cardio_result=cardio_pred, neuro_result=neuro_pred)

    # 4. Assembled report
    report = report_engine.generate_report(profile, cardio_pred, neuro_pred, explanation)

    return {
        "status": "success",
        "health_profile": profile.model_dump(),
        "cardiovascular_prediction": cardio_pred,
        "neurological_screening": neuro_pred,
        "clinical_explanation": explanation,
        "health_report": report
    }

@app.post("/api/health/manual")
async def process_manual_input(profile: HealthProfile):
    """
    Mode 2: Manual Health Input
    Accepts structured biometrics -> calculates BMI -> runs ML -> RAG -> explanation -> report.
    """
    profile.calculate_bmi_if_missing()
    profile.source = "manual_input"

    red_flag = evaluate_cardio_red_flags(
        symptoms=profile.symptoms,
        systolic_bp=profile.vitals.resting_bp or 120.0,
        diastolic_bp=profile.vitals.diastolic_bp or 80.0,
        heart_rate=profile.vitals.resting_hr or 75.0
    )

    cardio_pred = cardio_pipeline.predict(profile.to_cardio_dict())
    if red_flag:
        cardio_pred["red_flag"] = red_flag.model_dump()

    neuro_pred = neuro_analyzer.analyze(profile.to_neuro_dict())
    explanation = llm_service.explain_prediction(profile, cardio_result=cardio_pred, neuro_result=neuro_pred)
    report = report_engine.generate_report(profile, cardio_pred, neuro_pred, explanation)

    return {
        "status": "success",
        "health_profile": profile.model_dump(),
        "cardiovascular_prediction": cardio_pred,
        "neurological_screening": neuro_pred,
        "clinical_explanation": explanation,
        "health_report": report
    }

@app.post("/api/health/chat", response_model=AIChatResponse)
async def process_health_ai_chat(payload: AIChatRequest):
    """
    Mode 3: Ask Health AI
    Natural language Q&A -> extracts any mentioned biomarkers -> RAG retrieval -> grounded response.
    """
    return await chat_with_ai(payload)

@app.post("/api/health/report")
async def generate_unified_health_report(profile: HealthProfile):
    """Generates the standardized 9-section player health report."""
    profile.calculate_bmi_if_missing()
    cardio_pred = cardio_pipeline.predict(profile.to_cardio_dict())
    neuro_pred = neuro_analyzer.analyze(profile.to_neuro_dict())
    explanation = llm_service.explain_prediction(profile, cardio_result=cardio_pred, neuro_result=neuro_pred)
    report = report_engine.generate_report(profile, cardio_pred, neuro_pred, explanation)
    return report

# ==============================================================================
# 2. EXISTING CORE API ENDPOINTS (Preserved for 100% Frontend Compatibility)
# ==============================================================================

@app.post("/api/predict/cardio", response_model=CardioPredictionResponse)
async def predict_cardio(data: CardioPredictionRequest):
    red_flag = evaluate_cardio_red_flags(
        symptoms=data.symptoms,
        systolic_bp=data.resting_bp,
        diastolic_bp=data.diastolic_bp,
        heart_rate=data.resting_hr
    )
    prediction = cardio_pipeline.predict(data.model_dump())
    if red_flag:
        prediction["red_flag"] = red_flag.model_dump()
    return CardioPredictionResponse(**prediction)

@app.post("/api/predict/neuro", response_model=NeuroScreenResponse)
async def predict_neuro(data: NeuroScreenRequest):
    red_flag = evaluate_neuro_red_flags(
        symptoms=data.symptoms,
        has_sudden_onset=data.has_sudden_onset
    )
    analysis = neuro_analyzer.analyze(data.model_dump())
    if red_flag:
        analysis["red_flag"] = red_flag.model_dump()
    return NeuroScreenResponse(**analysis)

@app.post("/api/ai/explain", response_model=AIExplanationResponse)
async def generate_ai_explanation(payload: AIExplanationRequest):
    provider = get_ai_provider()
    explanation = provider.explain(payload.model_dump(), mode=payload.mode)
    return AIExplanationResponse(**explanation)

@app.post("/api/ai/chat", response_model=AIChatResponse)
async def chat_with_ai(payload: AIChatRequest):
    provider = get_ai_provider()
    chat_result = provider.chat(
        message=payload.message,
        context=payload.context or {},
        domain=payload.domain or "cardio"
    )
    return AIChatResponse(**chat_result)

# ==============================================================================
# 3. IN-MEMORY CSV LAB SCANNER
# ==============================================================================

STANDARD_COLUMN_ALIASES = {
    "cholesterol": ["chol", "total_cholesterol", "cholesterol_mg_dl", "serum_chol"],
    "resting_bp": ["trestbps", "blood_pressure", "systolic_bp", "systolic", "bp"],
    "resting_hr": ["thalach", "heart_rate", "pulse", "max_hr", "bpm"],
    "glucose": ["fbs", "fasting_blood_sugar", "blood_glucose", "sugar"],
    "ldl": ["ldl_chol", "ldl_cholesterol", "bad_cholesterol"],
    "hdl": ["hdl_chol", "good_cholesterol"],
    "triglycerides": ["trig", "triglyceride", "tg"],
    "age": ["patient_age", "years"],
    "st_depression": ["oldpeak", "st_dep"]
}

@app.post("/api/analyze/labs")
async def analyze_labs_in_memory(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid format. Only CSV files are supported.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 5 MB limit.")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    columns_found = [c.strip() for c in df.columns]
    mapping_suggestions = {}
    unmapped_columns = []

    for col in columns_found:
        col_clean = col.lower().replace(" ", "_")
        matched = False
        for std_key, aliases in STANDARD_COLUMN_ALIASES.items():
            if col_clean == std_key or col_clean in aliases:
                mapping_suggestions[col] = std_key
                matched = True
                break
        if not matched:
            unmapped_columns.append(col)

    biomarkers_recognized = []
    missing_required = []

    for std_name in ["resting_bp", "cholesterol", "resting_hr", "glucose"]:
        found_source = [src for src, target in mapping_suggestions.items() if target == std_name]
        if found_source:
            col_name = found_source[0]
            val = float(df[col_name].dropna().mean())
            status = "Normal"
            ref = "Normal"
            unit = "mg/dL"

            if std_name == "resting_bp":
                unit = "mmHg"
                ref = "< 120 mmHg"
                if val >= 135: status = "Elevated"
                elif val < 90: status = "Low"
            elif std_name == "cholesterol":
                unit = "mg/dL"
                ref = "< 200 mg/dL"
                if val >= 200: status = "Elevated"
            elif std_name == "glucose":
                unit = "mg/dL"
                ref = "< 100 mg/dL"
                if val >= 120: status = "Elevated"
            elif std_name == "resting_hr":
                unit = "BPM"
                ref = "60-100 BPM"
                if val >= 100: status = "Elevated"
                elif val < 60: status = "Low"

            biomarkers_recognized.append({
                "biomarker": std_name.replace("_", " ").title(),
                "mapped_from": col_name,
                "value": round(val, 1),
                "unit": unit,
                "status": status,
                "reference_range": ref
            })
        else:
            missing_required.append(std_name)

    data_completeness = int(round((len(biomarkers_recognized) / 4) * 100))

    return {
        "filename": file.filename,
        "rows_detected": len(df),
        "columns_detected": columns_found,
        "mapping_suggestions": mapping_suggestions,
        "unmapped_columns": unmapped_columns,
        "biomarkers_recognized": biomarkers_recognized,
        "missing_required": missing_required,
        "data_completeness_pct": data_completeness,
        "privacy_notice": "In-memory analysis complete. CSV buffer discarded from memory."
    }

# ==============================================================================
# 4. BACKWARD COMPATIBILITY
# ==============================================================================

@app.get("/")
def read_root():
    return {"message": "Medicraft Health AI & ML Processing Layer is running."}

@app.post("/predict", response_model=PredictionResponse)
async def legacy_predict(data: PatientData):
    cardio_dict = {
        "age": data.age,
        "sex": data.sex,
        "resting_bp": data.trestbps,
        "cholesterol": data.chol,
        "fbs": data.fbs,
        "resting_hr": data.thalach,
        "oldpeak": data.oldpeak,
        "cp": data.cp
    }
    pred = cardio_pipeline.predict(cardio_dict)
    return PredictionResponse(
        risk_score=pred["risk_probability"],
        risk_level=f"{pred['risk_level']} Risk"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

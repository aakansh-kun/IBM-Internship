"""
Deterministic Red-Flag Safety Engine
Evaluates clinical symptom combinations independently of machine learning or LLMs.
Detects potential acute emergency presentations (e.g. ACS, stroke, intracranial catastrophe).
"""

from typing import List, Optional
from pydantic import BaseModel

class RedFlagAlert(BaseModel):
    is_urgent: bool
    title: str
    message: str
    urgency_level: str  # "EMERGENCY" | "URGENT" | "ROUTINE"
    flagged_reasons: List[str]
    action_recommendation: str

def evaluate_cardio_red_flags(
    symptoms: List[str],
    systolic_bp: Optional[int] = None,
    diastolic_bp: Optional[int] = None,
    heart_rate: Optional[int] = None
) -> Optional[RedFlagAlert]:
    reasons = []
    normalized_symptoms = [s.lower().strip() for s in symptoms]

    has_chest_pain = any("chest pain" in s or "crushing" in s or "pressure" in s for s in normalized_symptoms)
    has_sob = any("shortness of breath" in s or "dyspnea" in s for s in normalized_symptoms)
    has_radiating = any("arm pain" in s or "jaw pain" in s or "radiating" in s for s in normalized_symptoms)
    has_sweating = any("sweating" in s or "diaphoresis" in s for s in normalized_symptoms)
    has_syncope = any("fainting" in s or "syncope" in s or "loss of consciousness" in s for s in normalized_symptoms)

    # 1. Classic Acute Coronary Syndrome (ACS) cluster
    if has_chest_pain and (has_sob or has_radiating or has_sweating):
        reasons.append("Reported chest discomfort co-occurring with shortness of breath, radiation, or diaphoresis.")

    # 2. Syncope with cardiac symptoms
    if has_syncope and (has_chest_pain or has_sob):
        reasons.append("Unexplained fainting/syncope combined with thoracic discomfort.")

    # 3. Hypertensive Emergency / Crisis threshold
    if systolic_bp and systolic_bp >= 180:
        reasons.append(f"Systolic blood pressure ({systolic_bp} mmHg) exceeds hypertensive emergency threshold (≥180 mmHg).")
    if diastolic_bp and diastolic_bp >= 120:
        reasons.append(f"Diastolic blood pressure ({diastolic_bp} mmHg) exceeds hypertensive emergency threshold (≥120 mmHg).")

    # 4. Severe symptomatic tachycardia / bradycardia
    if heart_rate and heart_rate >= 160:
        reasons.append(f"Resting heart rate ({heart_rate} BPM) indicates severe resting tachycardia.")
    elif heart_rate and heart_rate <= 40:
        reasons.append(f"Resting heart rate ({heart_rate} BPM) indicates severe bradycardia.")

    if reasons:
        return RedFlagAlert(
            is_urgent=True,
            title="⚠ URGENT CARDIOVASCULAR SYMPTOM PATTERN",
            message="One or more reported symptom combinations require immediate, formal in-person emergency evaluation.",
            urgency_level="EMERGENCY",
            flagged_reasons=reasons,
            action_recommendation="Seek emergency medical services (call 911 / emergency line) or proceed directly to the nearest emergency medical department immediately."
        )
    return None

def evaluate_neuro_red_flags(
    symptoms: List[str],
    has_sudden_onset: bool = False
) -> Optional[RedFlagAlert]:
    reasons = []
    normalized = [s.lower().strip() for s in symptoms]

    # FAST stroke signs
    has_unilateral_weakness = any("one-sided" in s or "facial droop" in s or "arm weakness" in s for s in normalized)
    has_speech_difficulty = any("speech" in s or "slurred" in s or "aphasia" in s for s in normalized)
    has_sudden_thunderclap = any("thunderclap" in s or "worst headache of life" in s or "sudden severe headache" in s for s in normalized)
    has_vision_loss = any("sudden vision loss" in s or "amaurosis" in s or "diplopia" in s for s in normalized)

    if has_unilateral_weakness or has_speech_difficulty:
        reasons.append("Acute focal neurological deficit (unilateral motor weakness or acute speech difficulty).")

    if has_sudden_thunderclap:
        reasons.append("Acute sudden-onset severe cephalalgia ('thunderclap' pattern) potentially indicative of subarachnoid pathology.")

    if has_vision_loss and has_sudden_onset:
        reasons.append("Sudden acute monocular or binocular visual deficit.")

    if reasons:
        return RedFlagAlert(
            is_urgent=True,
            title="⚠ URGENT NEUROLOGICAL SYMPTOM PATTERN",
            message="Reported focal neurological signs warrant immediate acute neurological / emergency assessment (e.g. stroke evaluation protocol).",
            urgency_level="EMERGENCY",
            flagged_reasons=reasons,
            action_recommendation="Emergency department evaluation is urgently advised. Do not delay or drive yourself; contact emergency services immediately."
        )
    return None

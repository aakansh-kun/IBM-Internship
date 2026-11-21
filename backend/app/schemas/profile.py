"""
Unified HealthProfile Schema
Normalizes patient health data from all three input modes:
1. Clinical Report (PDF/Image/CSV extraction)
2. Manual Health Input (Structured biometrics)
3. Health AI Chat (Natural language conversation extraction)
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Demographics(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120, description="Age in years")
    sex: Optional[int] = Field(None, description="1 = male, 0 = female")

class Anthropometrics(BaseModel):
    height_cm: Optional[float] = Field(None, ge=50.0, le=260.0, description="Height in centimeters")
    weight_kg: Optional[float] = Field(None, ge=20.0, le=350.0, description="Weight in kilograms")
    bmi: Optional[float] = Field(None, ge=10.0, le=75.0, description="Body Mass Index (kg/m^2)")

class Vitals(BaseModel):
    resting_bp: Optional[float] = Field(None, ge=60.0, le=260.0, description="Resting systolic blood pressure (mmHg)")
    diastolic_bp: Optional[float] = Field(None, ge=40.0, le=160.0, description="Resting diastolic blood pressure (mmHg)")
    resting_hr: Optional[float] = Field(None, ge=35.0, le=240.0, description="Resting heart rate (BPM)")

class LaboratoryValues(BaseModel):
    cholesterol: Optional[float] = Field(None, ge=50.0, le=600.0, description="Serum total cholesterol (mg/dL)")
    ldl: Optional[float] = Field(None, ge=20.0, le=400.0, description="Low-density lipoprotein cholesterol (mg/dL)")
    hdl: Optional[float] = Field(None, ge=10.0, le=150.0, description="High-density lipoprotein cholesterol (mg/dL)")
    triglycerides: Optional[float] = Field(None, ge=30.0, le=1500.0, description="Serum triglycerides (mg/dL)")
    glucose: Optional[float] = Field(None, ge=40.0, le=600.0, description="Fasting blood glucose (mg/dL)")
    oldpeak: Optional[float] = Field(None, ge=0.0, le=10.0, description="ST depression induced by exercise (mm)")

class LifestyleFactors(BaseModel):
    smoking: Optional[bool] = Field(None, description="Current or recent cigarette smoker")
    physical_activity: Optional[bool] = Field(None, description="Engages in regular aerobic exercise (>=150 min/wk)")
    family_history: Optional[bool] = Field(None, description="Family history of early cardiovascular disease")
    sleep_hours: Optional[float] = Field(None, ge=0.0, le=24.0, description="Average daily hours of sleep")

class HealthProfile(BaseModel):
    demographics: Demographics = Field(default_factory=Demographics)
    anthropometrics: Anthropometrics = Field(default_factory=Anthropometrics)
    vitals: Vitals = Field(default_factory=Vitals)
    laboratory_values: LaboratoryValues = Field(default_factory=LaboratoryValues)
    lifestyle_factors: LifestyleFactors = Field(default_factory=LifestyleFactors)
    symptoms: List[str] = Field(default_factory=list, description="Reported clinical symptoms")
    source: str = Field("manual_input", description="clinical_report | manual_input | conversation")
    raw_extracted_text: Optional[str] = Field(None, description="Original report snippet or query text")

    def calculate_bmi_if_missing(self) -> Optional[float]:
        """Calculates BMI from height (cm) and weight (kg) if not explicitly supplied."""
        if self.anthropometrics.bmi is None:
            h = self.anthropometrics.height_cm
            w = self.anthropometrics.weight_kg
            if h and w and h > 0:
                h_m = h / 100.0
                computed = round(w / (h_m * h_m), 1)
                self.anthropometrics.bmi = computed
                return computed
        return self.anthropometrics.bmi

    def to_cardio_dict(self) -> Dict[str, Any]:
        """Converts unified profile to the schema expected by CardioMLPipeline."""
        return {
            "age": self.demographics.age if self.demographics.age is not None else 45,
            "sex": self.demographics.sex if self.demographics.sex is not None else 1,
            "resting_bp": self.vitals.resting_bp if self.vitals.resting_bp is not None else 120.0,
            "cholesterol": self.laboratory_values.cholesterol if self.laboratory_values.cholesterol is not None else 200.0,
            "glucose": self.laboratory_values.glucose if self.laboratory_values.glucose is not None else 95.0,
            "resting_hr": self.vitals.resting_hr if self.vitals.resting_hr is not None else 75.0,
            "oldpeak": self.laboratory_values.oldpeak if self.laboratory_values.oldpeak is not None else 0.0,
            "symptoms": self.symptoms,
            "smoking": bool(self.lifestyle_factors.smoking),
            "physical_activity": True if self.lifestyle_factors.physical_activity is None else bool(self.lifestyle_factors.physical_activity),
            "family_history": bool(self.lifestyle_factors.family_history),
            "bmi": self.calculate_bmi_if_missing() or 24.5
        }

    def to_neuro_dict(self) -> Dict[str, Any]:
        """Converts unified profile to the schema expected by NeuroAnalyzer."""
        return {
            "symptoms": self.symptoms,
            "sleep_hours": self.lifestyle_factors.sleep_hours if self.lifestyle_factors.sleep_hours is not None else 7.0,
            "severity": "Severe" if any("severe" in s.lower() for s in self.symptoms) else "Moderate",
            "duration": "days",
            "frequency": "frequent" if len(self.symptoms) >= 3 else "occasional",
            "has_sudden_onset": any("sudden" in s.lower() or "acute" in s.lower() for s in self.symptoms)
        }

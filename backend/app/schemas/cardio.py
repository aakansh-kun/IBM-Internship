from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CardioPredictionRequest(BaseModel):
    age: int = Field(45, ge=1, le=120, description="Age in years")
    sex: int = Field(1, description="1 = male; 0 = female")
    resting_bp: int = Field(120, ge=60, le=280, description="Resting systolic blood pressure in mmHg")
    diastolic_bp: Optional[int] = Field(80, ge=40, le=160, description="Diastolic blood pressure in mmHg")
    cholesterol: int = Field(200, ge=80, le=650, description="Total serum cholesterol in mg/dL")
    ldl: Optional[int] = Field(None, ge=30, le=400, description="LDL cholesterol in mg/dL")
    hdl: Optional[int] = Field(None, ge=15, le=150, description="HDL cholesterol in mg/dL")
    triglycerides: Optional[int] = Field(None, ge=30, le=1000, description="Triglycerides in mg/dL")
    glucose: Optional[int] = Field(95, ge=40, le=450, description="Fasting blood glucose in mg/dL")
    resting_hr: int = Field(75, ge=40, le=220, description="Resting heart rate in BPM")
    st_depression: Optional[float] = Field(0.0, ge=0.0, le=8.0, description="ST depression (Oldpeak) in mm")
    height_cm: Optional[float] = Field(None, ge=80, le=250, description="Height in cm")
    weight_kg: Optional[float] = Field(None, ge=25, le=300, description="Weight in kg")
    symptoms: List[str] = Field(default_factory=list, description="List of reported cardiovascular symptoms")
    smoking: bool = Field(False, description="Current or recent tobacco smoker")
    physical_activity: bool = Field(True, description="Regular weekly aerobic exercise")
    family_history: bool = Field(False, description="Family history of premature cardiovascular events")

class FeatureContribution(BaseModel):
    feature: str
    direction: str
    value: str
    reference: str

class CardioPredictionResponse(BaseModel):
    risk_probability: float
    risk_percentage: int
    risk_level: str
    risk_text: str
    confidence_label: str
    confidence_score: int
    important_features: List[FeatureContribution]
    protective_features: List[str]
    bmi: Optional[float] = None
    red_flag: Optional[Dict[str, Any]] = None
    model_version: str
    is_demo_mode: bool
    disclaimer: str

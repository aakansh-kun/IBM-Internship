# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

class PatientData(BaseModel):
    age: int = Field(..., ge=0, description="Age in years")
    sex: int = Field(..., description="1 = male; 0 = female")
    cp: int = Field(..., description="Chest pain type (0-3)")
    trestbps: int = Field(..., description="Resting blood pressure")
    chol: int = Field(..., description="Serum cholestoral in mg/dl")
    fbs: int = Field(..., description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: int = Field(..., description="Resting electrocardiographic results (0-2)")
    thalach: int = Field(..., description="Maximum heart rate achieved")
    exang: int = Field(..., description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(..., description="ST depression induced by exercise relative to rest")

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: str

class SyntheticDataRequest(BaseModel):
    num_samples: int = Field(100, ge=10, le=10000, description="Number of samples to generate")

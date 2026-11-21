from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AIExplanationRequest(BaseModel):
    domain: str = Field("cardio", description="cardio | neuro | complete")
    risk_percentage: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="Low | Moderate | High | Elevated")
    important_features: List[Dict[str, Any]] = Field(default_factory=list)
    protective_features: List[str] = Field(default_factory=list)
    symptoms: List[str] = Field(default_factory=list)
    biomarkers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    mode: str = Field("simple", description="simple | technical | doctor_questions")

class AIExplanationResponse(BaseModel):
    summary: str
    why_this_score: str
    factors_that_matter_most: str
    questions_for_doctor: List[str]
    data_to_improve_estimate: str
    mode_applied: str
    provider_used: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)

class AIChatRequest(BaseModel):
    message: str = Field(..., description="User query or question to the AI clinical companion")
    domain: Optional[str] = Field("cardio", description="cardio | neuro")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AIChatResponse(BaseModel):
    reply: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    provider_used: str

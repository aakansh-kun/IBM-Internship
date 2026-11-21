from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class NeuroScreenRequest(BaseModel):
    symptoms: List[str] = Field(default_factory=list, description="Reported neurological symptoms")
    severity: str = Field("Moderate", description="Mild | Moderate | Severe")
    duration: str = Field("Days", description="Hours | Days | Weeks | Months")
    frequency: str = Field("Occasional", description="Once | Occasional | Frequent | Constant")
    sleep_hours: float = Field(7.0, ge=0.0, le=24.0, description="Average daily hours of sleep")
    has_sudden_onset: bool = Field(False, description="Did symptoms emerge instantaneously?")

class NeuroScreenResponse(BaseModel):
    concern_index: int
    concern_tier: str
    severity_assigned: str
    frequency_assigned: str
    potential_patterns: List[str]
    matched_domains: Dict[str, List[str]]
    recommendation: str
    red_flag: Optional[Dict[str, Any]] = None
    disclaimer: str

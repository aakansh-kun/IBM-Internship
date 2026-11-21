from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ColumnMappingRequest(BaseModel):
    mapping: Dict[str, str] = Field(..., description="User column mappings (e.g. {'trestbps': 'resting_bp'})")
    raw_data: List[Dict[str, Any]] = Field(..., description="Parsed in-memory CSV rows")

class BiomarkerAnalysisItem(BaseModel):
    biomarker: str
    value: float
    unit: str
    status: str  # "Normal" | "Elevated" | "Low"
    reference_range: str

class LabAnalysisResponse(BaseModel):
    total_biomarkers_identified: int
    missing_fields: List[str]
    abnormal_count: int
    biomarkers: List[BiomarkerAnalysisItem]
    data_completeness_pct: int
    summary_notes: str

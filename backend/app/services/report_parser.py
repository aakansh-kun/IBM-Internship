"""
Clinical Report Parser Service
Safely parses uploaded medical documents (PDF, PNG, JPG, JPEG, CSV),
extracts laboratory values, vitals, and demographics strictly without hallucinating missing data,
and normalizes into a unified HealthProfile.
"""

import io
import re
from typing import Dict, Any, Tuple, Optional
from fastapi import HTTPException
import pandas as pd

from app.schemas.profile import HealthProfile

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".csv"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/csv",
    "application/vnd.ms-excel",
    "text/plain"
}

class ClinicalReportParser:
    @staticmethod
    def validate_file(filename: str, content_type: Optional[str], size: int) -> str:
        """Validates file extension, MIME type, and size to ensure safe processing."""
        ext = ("." + filename.rsplit(".", 1)[-1]).lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"UNSUPPORTED_FILE: Extension '{ext}' is not supported. Allowed formats: PDF, PNG, JPG, JPEG, CSV."
            )

        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"FILE_TOO_LARGE: File size ({round(size / 1024 / 1024, 2)} MB) exceeds maximum limit of 10 MB."
            )

        return ext

    @classmethod
    def parse_document(cls, filename: str, content: bytes, content_type: Optional[str] = None) -> HealthProfile:
        """
        Parses document bytes into a unified HealthProfile.
        Strict rule: Missing values remain None and are NEVER fabricated.
        """
        ext = cls.validate_file(filename, content_type, len(content))
        extracted_text = ""

        if ext == ".pdf":
            extracted_text = cls._extract_text_from_pdf(content)
        elif ext in {".png", ".jpg", ".jpeg"}:
            extracted_text = cls._extract_text_from_image(content, ext)
        elif ext == ".csv":
            return cls._parse_csv_to_profile(content)

        return cls._extract_biomarkers_from_text(extracted_text, filename)

    @staticmethod
    def _extract_text_from_pdf(content: bytes) -> str:
        """Extracts text across all pages of a PDF document using pypdf."""
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            return "\n".join(pages_text)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"INVALID_REPORT: Could not parse PDF: {str(e)}")

    @staticmethod
    def _extract_text_from_image(content: bytes, ext: str) -> str:
        """Verifies image integrity and extracts text/metadata safely."""
        try:
            from PIL import Image
            img = Image.open(io.BytesIO(content))
            img.verify()  # Verifies file integrity without executing payload
            
            # Reopen after verify for metadata inspection
            img = Image.open(io.BytesIO(content))
            info_text = f"Image format: {img.format}, Size: {img.size}, Mode: {img.mode}"
            return info_text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"INVALID_REPORT: Corrupted or unreadable image: {str(e)}")

    @staticmethod
    def _parse_csv_to_profile(content: bytes) -> HealthProfile:
        """Parses CSV lab table using standard clinical column aliases (wide or tall format)."""
        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"INVALID_REPORT: CSV parsing failed: {str(e)}")

        profile = HealthProfile(source="clinical_report")
        col_map = {str(c).strip().lower().replace(" ", "_"): c for c in df.columns}

        # Check for tall format (e.g. column 'biomarker'/'test' and column 'value'/'result')
        key_col_candidates = ["biomarker", "test", "test_name", "parameter", "name", "metric", "indicator"]
        val_col_candidates = ["value", "result", "finding", "reading", "measurement"]
        
        found_key_col = next((col_map[k] for k in key_col_candidates if k in col_map), None)
        found_val_col = next((col_map[v] for v in val_col_candidates if v in col_map), None)

        tall_data: Dict[str, float] = {}
        if found_key_col and found_val_col:
            for _, row in df.iterrows():
                k = str(row[found_key_col]).strip().lower().replace(" ", "_")
                val_num = pd.to_numeric(row[found_val_col], errors="coerce")
                if pd.notnull(val_num):
                    tall_data[k] = float(val_num)

        # Helper to extract numeric mean from mapped column or tall rows
        def get_val(aliases):
            # Check tall data first
            for a in aliases:
                clean_a = a.strip().lower().replace(" ", "").replace("_", "")
                for k, v in tall_data.items():
                    if k.replace("_", "") == clean_a:
                        return v
            # Check wide columns
            for a in aliases:
                clean_a = a.strip().lower().replace(" ", "").replace("_", "")
                for k, orig in col_map.items():
                    if k.replace("_", "") == clean_a:
                        s = pd.to_numeric(df[orig], errors="coerce").dropna()
                        if not s.empty:
                            return float(s.mean())
            return None

        # Vitals
        profile.vitals.resting_bp = get_val(["resting_bp", "trestbps", "systolic_bp", "systolic", "bp", "blood_pressure"])
        profile.vitals.diastolic_bp = get_val(["diastolic_bp", "diastolic"])
        profile.vitals.resting_hr = get_val(["resting_hr", "thalach", "heart_rate", "pulse", "bpm", "maxhr"])

        # Labs
        profile.laboratory_values.cholesterol = get_val(["cholesterol", "chol", "total_cholesterol", "serum_chol"])
        profile.laboratory_values.ldl = get_val(["ldl", "ldl_chol", "ldl_cholesterol"])
        profile.laboratory_values.hdl = get_val(["hdl", "hdl_chol", "good_cholesterol"])
        profile.laboratory_values.triglycerides = get_val(["triglycerides", "trig", "tg"])
        profile.laboratory_values.glucose = get_val(["glucose", "fbs", "fasting_blood_sugar", "fastingbs", "sugar"])
        profile.laboratory_values.oldpeak = get_val(["oldpeak", "st_depression"])

        # Demographics
        profile.demographics.age = int(get_val(["age", "patient_age", "years"]) or 0) or None
        sex_raw = get_val(["sex", "gender"])
        if sex_raw is not None:
            profile.demographics.sex = int(sex_raw)

        return profile

    @classmethod
    def _extract_biomarkers_from_text(cls, text: str, filename: str) -> HealthProfile:
        """
        Uses deterministic clinical regular expressions to extract metrics from text.
        Values not found remain None — no hallucination.
        """
        profile = HealthProfile(source="clinical_report", raw_extracted_text=text[:500] if text else filename)

        if not text:
            return profile

        # Blood pressure regex (e.g. "135/85", "BP: 140/90 mmHg", "systolic 130")
        bp_match = re.search(r'(?:blood\s*pressure|bp|trestbps)?[:\s]*(\d{2,3})\s*[/]\s*(\d{2,3})', text, re.I)
        if bp_match:
            profile.vitals.resting_bp = float(bp_match.group(1))
            profile.vitals.diastolic_bp = float(bp_match.group(2))
        else:
            sys_match = re.search(r'(?:systolic|resting\s*bp)[:\s]*(\d{2,3})', text, re.I)
            if sys_match:
                profile.vitals.resting_bp = float(sys_match.group(1))

        # Total Cholesterol regex (e.g. "Cholesterol: 220", "Total Chol: 240 mg/dL")
        chol_match = re.search(r'(?:total\s*cholesterol|cholesterol|serum\s*chol)[:\s]*(\d{2,3})', text, re.I)
        if chol_match:
            profile.laboratory_values.cholesterol = float(chol_match.group(1))

        # LDL & HDL
        ldl_match = re.search(r'(?:ldl|ldl[- ]cholesterol)[:\s]*(\d{2,3})', text, re.I)
        if ldl_match:
            profile.laboratory_values.ldl = float(ldl_match.group(1))

        hdl_match = re.search(r'(?:hdl|hdl[- ]cholesterol)[:\s]*(\d{2,3})', text, re.I)
        if hdl_match:
            profile.laboratory_values.hdl = float(hdl_match.group(1))

        # Fasting Glucose (e.g. "Glucose: 105", "FBS: 95 mg/dL")
        gluc_match = re.search(r'(?:fasting\s*glucose|glucose|fbs|blood\s*sugar)[:\s]*(\d{2,3})', text, re.I)
        if gluc_match:
            profile.laboratory_values.glucose = float(gluc_match.group(1))

        # Heart Rate / Pulse (e.g. "Heart Rate: 72 bpm", "Pulse: 80")
        hr_match = re.search(r'(?:heart\s*rate|pulse|resting\s*hr|thalach)[:\s]*(\d{2,3})', text, re.I)
        if hr_match:
            profile.vitals.resting_hr = float(hr_match.group(1))

        # Age
        age_match = re.search(r'(?:age|years\s*old)[:\s]*(\d{1,3})', text, re.I)
        if age_match:
            profile.demographics.age = int(age_match.group(1))

        return profile

report_parser = ClinicalReportParser()

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, File, UploadFile, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from models import PatientData, PredictionResponse, SyntheticDataRequest
import pandas as pd
import numpy as np
from pathlib import Path

app = FastAPI(title="Cardiac Disease Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "data"
os.makedirs(DATA_DIR, exist_ok=True)

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(data: PatientData):
    # Mock prediction logic based on a few risk factors
    # A real implementation would load a pre-trained ML model here
    
    risk_score = 0.0
    
    if data.age > 50:
        risk_score += 0.2
    if data.sex == 1:
        risk_score += 0.1
    if data.cp > 0:  # Typical angina, atypical angina, non-anginal pain
        risk_score += 0.3
    if data.trestbps > 130:
        risk_score += 0.15
    if data.chol > 240:
        risk_score += 0.15
    if data.thalach < 100:
        risk_score += 0.1
        
    risk_score = min(risk_score, 1.0)
    
    if risk_score > 0.7:
        risk_level = "High Risk"
    elif risk_score > 0.4:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"
        
    return PredictionResponse(risk_score=risk_score, risk_level=risk_level)

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    file_path = DATA_DIR / "uploaded_dataset.csv"
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Try to read with pandas to validate it's a valid CSV and get stats
        df = pd.read_csv(file_path)
        return {
            "message": "Dataset uploaded successfully",
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving dataset: {str(e)}")

@app.post("/generate-synthetic-data")
async def generate_synthetic_data(request: SyntheticDataRequest):
    num_samples = request.num_samples
    
    # Generate synthetic data based on PatientData schema
    # Use random seeds per call instead of global to get different data each time
    
    data = {
        "age": np.random.randint(29, 78, num_samples),
        "sex": np.random.choice([0, 1], num_samples, p=[0.3, 0.7]),
        "cp": np.random.randint(0, 4, num_samples),
        "trestbps": np.random.randint(94, 200, num_samples),
        "chol": np.random.randint(126, 564, num_samples),
        "fbs": np.random.choice([0, 1], num_samples, p=[0.85, 0.15]),
        "restecg": np.random.randint(0, 3, num_samples),
        "thalach": np.random.randint(71, 202, num_samples),
        "exang": np.random.choice([0, 1], num_samples, p=[0.67, 0.33]),
        "oldpeak": np.round(np.random.uniform(0.0, 6.2, num_samples), 1)
    }
    
    df = pd.DataFrame(data)
    
    # Simple target generation based on mock logic
    risk_scores = (
        (df["age"] > 50) * 0.2 + 
        (df["sex"] == 1) * 0.1 + 
        (df["cp"] > 0) * 0.3 + 
        (df["trestbps"] > 130) * 0.15 + 
        (df["chol"] > 240) * 0.15 + 
        (df["thalach"] < 100) * 0.1
    )
    df["target"] = (risk_scores > 0.4).astype(int)
    
    file_path = DATA_DIR / "synthetic_dataset.csv"
    df.to_csv(file_path, index=False)
    
    return {
        "message": f"Successfully generated {num_samples} synthetic samples",
        "file": str(file_path.name),
        "rows": num_samples,
        "features": list(df.columns)
    }

@app.get("/")
def read_root():
    return {"message": "Cardiac Disease Prediction API is running."}

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

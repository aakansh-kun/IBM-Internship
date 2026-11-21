# Medicraft: Minecraft First-Person Health AI & Clinical Decision-Support

An educational, interactive first-person Minecraft environment coupled with an evidence-grounded clinical risk screening and explainability platform.

---

## Target Architecture

```text
                         USER
                           ↓
                Minecraft React Frontend
                           ↓
                    THREE INPUT MODES
                 ┌─────────┼─────────┐
                 ↓         ↓         ↓
             Clinical    Manual    Health AI
              Report     Inputs     Question
                 └─────────┼─────────┘
                           ↓
                    FastAPI Backend
                           ↓
                 Health Data Processing
                           ↓
                Unified Health Profile
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
        ML Risk Models                  RAG
              ↓                         ↓
    Cardiovascular /             Trusted Medical
    Neurological Risk              Knowledge
              └────────────┬────────────┘
                           ↓
                       LLM / GenAI
                           ↓
              Explanation + Health Report
                           ↓
                    Risk + Feedback
                           ↓
                Minecraft React Frontend
```

---

## Docker Packaging Layer

Docker cleanly packages the **backend AI/ML processing environment** into a single, reproducible, lightweight container:

```text
┌──────────────────── DOCKER CONTAINER ────────────────────┐
│                                                          │
│                   FastAPI + Uvicorn                      │
│                          ↓                               │
│                       Python                             │
│                          ↓                               │
│             Health Processing Layer                      │
│                          ↓                               │
│       ┌──────────────────┼──────────────────┐            │
│       ↓                  ↓                  ↓            │
│  Report Parser       ML Models         RAG Engine        │
│       ↓                  ↓                  ↓            │
│ PDF / Image       Cardiovascular      Embeddings         │
│ Extraction        Neurological        Retrieval          │
│       │             Prediction            │             │
│       └──────────────────┼──────────────────┘            │
│                          ↓                               │
│                     LLM Service                          │
│                          ↓                               │
│                  GenAI Report Engine                     │
│                          ↓                               │
│                Validation + Safety                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Three Input Modes

1. **Clinical Report Upload (`POST /api/health/clinical-report`)**
   - Supports: **PDF, PNG, JPG, JPEG, and CSV**.
   - Validates file integrity, extension, MIME type, and 10 MB size limits.
   - Extracts structured numerical biomarkers (BP, cholesterol, glucose, resting HR) without hallucination.
   - Executes ML models, retrieves matching clinical guidelines via RAG, and generates a structured report.

2. **Manual Health Input (`POST /api/health/manual`)**
   - Accepts structured patient biometrics (vitals, demographics, lipid subfractions, lifestyle).
   - Derives BMI and calculates calibrated Cardiovascular & Neurological risk.
   - Enriches findings with RAG evidence and doctor consultation questions.

3. **Ask Health AI (`POST /api/health/chat`)**
   - Natural language conversational Q&A.
   - Extracts mentioned metrics from conversational queries.
   - Grounds answers in authoritative clinical guidelines (AHA/ACC, AAN, ADA, WHO) with verified citations.

---

## Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Google Gemini API Key (Obtain from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Active Model (Default: gemini-3.5-flash-lite)
GEMINI_MODEL=gemini-3.5-flash-lite

# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,*
```

*Note: If no API key is supplied or rate limits are reached, the system automatically falls back to the deterministic `LocalClinicalProvider` with full RAG grounding.*

---

## Running with Docker (Deployment Layer)

### Prerequisites
- Docker Engine & Docker Compose installed.

### Build & Run
```bash
# 1. Build and start the backend container
docker compose up --build -d

# 2. Check container status and health
docker compose ps
curl http://localhost:8000/health

# 3. View container logs
docker compose logs -f
```

---

## Running Locally Without Docker (Antigravity IDE Development)

Docker is an **optional** deployment layer. You can run the application directly:

### 1. Start the FastAPI Backend
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
Open in browser at: `http://localhost:5173`

---

## Educational & Clinical Safety Guardrails
- **Non-Diagnostic:** The system is an educational risk screening tool based on statistical ML and clinical literature. It does not provide medical diagnoses or prescribe medications.
- **Red-Flag Safety Triage:** High-risk thresholds (e.g. resting BP $\ge 180$, acute focal neurological symptoms) automatically trigger emergency consultation warnings independent of ML predictions.

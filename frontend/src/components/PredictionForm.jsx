import { useState } from 'react';

const PRESETS = {
  optimal: {
    name: 'Optimal / Athlete',
    data: {
      age: 28,
      sex: 0,
      cp: 3,
      trestbps: 112,
      chol: 175,
      fbs: 0,
      restecg: 0,
      thalach: 182,
      exang: 0,
      oldpeak: 0.0
    }
  },
  moderate: {
    name: 'Moderate Risk',
    data: {
      age: 54,
      sex: 1,
      cp: 1,
      trestbps: 136,
      chol: 228,
      fbs: 0,
      restecg: 1,
      thalach: 142,
      exang: 0,
      oldpeak: 1.2
    }
  },
  high: {
    name: 'High Risk Alert',
    data: {
      age: 65,
      sex: 1,
      cp: 0,
      trestbps: 165,
      chol: 295,
      fbs: 1,
      restecg: 2,
      thalach: 92,
      exang: 1,
      oldpeak: 3.2
    }
  }
};

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    age: 45,
    sex: 1,
    cp: 0,
    trestbps: 125,
    chol: 210,
    fbs: 0,
    restecg: 0,
    thalach: 155,
    exang: 0,
    oldpeak: 0.8
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'oldpeak' ? parseFloat(value) || 0 : parseInt(value, 10) || 0 
    }));
  };

  const applyPreset = (key) => {
    if (PRESETS[key]) {
      setFormData(PRESETS[key].data);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Preset Profiles Bar */}
      <div className="presets-bar">
        <span className="preset-label">Clinical Presets:</span>
        <button 
          type="button" 
          className="preset-btn"
          onClick={() => applyPreset('optimal')}
        >
          🟢 Optimal Baseline
        </button>
        <button 
          type="button" 
          className="preset-btn"
          onClick={() => applyPreset('moderate')}
        >
          🟡 Moderate Risk Case
        </button>
        <button 
          type="button" 
          className="preset-btn"
          onClick={() => applyPreset('high')}
        >
          🔴 High Risk Alert
        </button>
      </div>

      {/* Section 1: Demographics & Primary Vitals */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">🩺</div>
          <h2 className="section-title">Patient Demographics & Vitals</h2>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="age">
              <span>Patient Age</span>
              <span className="field-hint">Years</span>
            </label>
            <input 
              type="number" 
              id="age" 
              name="age" 
              className="form-control" 
              value={formData.age} 
              onChange={handleChange} 
              min="1" 
              max="120" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="sex">
              <span>Biological Sex</span>
            </label>
            <select 
              id="sex" 
              name="sex" 
              className="form-control" 
              value={formData.sex} 
              onChange={handleChange}
            >
              <option value={1}>Male</option>
              <option value={0}>Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="trestbps">
              <span>Resting Blood Pressure</span>
              <span className="field-hint">Target: &lt;120 mmHg</span>
            </label>
            <input 
              type="number" 
              id="trestbps" 
              name="trestbps" 
              className="form-control" 
              value={formData.trestbps} 
              onChange={handleChange} 
              min="60" 
              max="260" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="thalach">
              <span>Max Heart Rate</span>
              <span className="field-hint">bpm achieved</span>
            </label>
            <input 
              type="number" 
              id="thalach" 
              name="thalach" 
              className="form-control" 
              value={formData.thalach} 
              onChange={handleChange} 
              min="50" 
              max="240" 
              required 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Laboratory Biomarkers */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">🧪</div>
          <h2 className="section-title">Laboratory Biomarkers</h2>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="chol">
              <span>Serum Cholesterol</span>
              <span className="field-hint">Desirable: &lt;200 mg/dL</span>
            </label>
            <input 
              type="number" 
              id="chol" 
              name="chol" 
              className="form-control" 
              value={formData.chol} 
              onChange={handleChange} 
              min="80" 
              max="650" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="fbs">
              <span>Fasting Blood Sugar</span>
              <span className="field-hint">&gt; 120 mg/dL</span>
            </label>
            <select 
              id="fbs" 
              name="fbs" 
              className="form-control" 
              value={formData.fbs} 
              onChange={handleChange}
            >
              <option value={0}>Normal (&le; 120 mg/dL)</option>
              <option value={1}>Elevated (&gt; 120 mg/dL)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Electrocardiography & Symptoms */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">📈</div>
          <h2 className="section-title">Symptomatology & Electrocardiography</h2>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="cp">
              <span>Chest Pain Classification</span>
            </label>
            <select 
              id="cp" 
              name="cp" 
              className="form-control" 
              value={formData.cp} 
              onChange={handleChange}
            >
              <option value={0}>Typical Angina (Exertional Pressure)</option>
              <option value={1}>Atypical Angina (Sharp / Episodic)</option>
              <option value={2}>Non-Anginal Discomfort</option>
              <option value={3}>Asymptomatic</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="restecg">
              <span>Resting ECG Trace</span>
            </label>
            <select 
              id="restecg" 
              name="restecg" 
              className="form-control" 
              value={formData.restecg} 
              onChange={handleChange}
            >
              <option value={0}>Normal Rhythm</option>
              <option value={1}>ST-T Wave Abnormality</option>
              <option value={2}>Left Ventricular Hypertrophy (LVH)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="exang">
              <span>Exercise Induced Angina</span>
            </label>
            <select 
              id="exang" 
              name="exang" 
              className="form-control" 
              value={formData.exang} 
              onChange={handleChange}
            >
              <option value={0}>No Angina on Exertion</option>
              <option value={1}>Yes, Present on Exertion</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="oldpeak">
              <span>ST Depression (Oldpeak)</span>
              <span className="field-hint">Normal: &lt; 1.0 mm</span>
            </label>
            <input 
              type="number" 
              step="0.1" 
              id="oldpeak" 
              name="oldpeak" 
              className="form-control" 
              value={formData.oldpeak} 
              onChange={handleChange} 
              min="0.0" 
              max="6.5" 
              required 
            />
          </div>
        </div>
      </div>
      
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            <span>Running AI Diagnostic Evaluation...</span>
          </>
        ) : (
          <span>Execute Risk Stratification</span>
        )}
      </button>
    </form>
  );
}

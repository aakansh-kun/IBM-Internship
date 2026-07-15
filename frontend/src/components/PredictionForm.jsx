import { useState } from 'react';

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    age: 45,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 0.0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input type="number" id="age" name="age" className="form-control" value={formData.age} onChange={handleChange} min="0" max="120" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <select id="sex" name="sex" className="form-control" value={formData.sex} onChange={handleChange}>
            <option value={1}>Male</option>
            <option value={0}>Female</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cp">Chest Pain Type</label>
          <select id="cp" name="cp" className="form-control" value={formData.cp} onChange={handleChange}>
            <option value={0}>Typical Angina</option>
            <option value={1}>Atypical Angina</option>
            <option value={2}>Non-anginal Pain</option>
            <option value={3}>Asymptomatic</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="trestbps">Resting Blood Pressure (mm Hg)</label>
          <input type="number" id="trestbps" name="trestbps" className="form-control" value={formData.trestbps} onChange={handleChange} min="50" max="250" required />
        </div>

        <div className="form-group">
          <label htmlFor="chol">Serum Cholestoral (mg/dl)</label>
          <input type="number" id="chol" name="chol" className="form-control" value={formData.chol} onChange={handleChange} min="100" max="600" required />
        </div>

        <div className="form-group">
          <label htmlFor="fbs">Fasting Blood Sugar {'>'} 120 mg/dl</label>
          <select id="fbs" name="fbs" className="form-control" value={formData.fbs} onChange={handleChange}>
            <option value={0}>False</option>
            <option value={1}>True</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="restecg">Resting ECG Results</label>
          <select id="restecg" name="restecg" className="form-control" value={formData.restecg} onChange={handleChange}>
            <option value={0}>Normal</option>
            <option value={1}>ST-T Wave Abnormality</option>
            <option value={2}>Left Ventricular Hypertrophy</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="thalach">Max Heart Rate Achieved</label>
          <input type="number" id="thalach" name="thalach" className="form-control" value={formData.thalach} onChange={handleChange} min="60" max="220" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="exang">Exercise Induced Angina</label>
          <select id="exang" name="exang" className="form-control" value={formData.exang} onChange={handleChange}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="oldpeak">ST Depression (Oldpeak)</label>
          <input type="number" step="0.1" id="oldpeak" name="oldpeak" className="form-control" value={formData.oldpeak} onChange={handleChange} min="0" max="6.2" required />
        </div>
      </div>
      
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Analyzing...' : 'Predict Risk'}
      </button>
    </form>
  );
}

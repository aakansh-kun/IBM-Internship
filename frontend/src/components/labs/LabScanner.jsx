import { useState, useRef } from 'react';

export default function LabScanner({ onApplyLabsToCardio }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labResult, setLabResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selected) => {
    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a standard CSV file.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }
    setError(null);
    setFile(selected);
    uploadAndAnalyze(selected);
  };

  const uploadAndAnalyze = async (uploadFile) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await fetch('http://localhost:8000/api/analyze/labs', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Could not parse medical CSV.');
      }

      const data = await response.json();
      setLabResult(data);
    } catch (err) {
      setError(err.message || 'Error scanning lab report.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCardio = () => {
    if (!labResult || !labResult.biomarkers_recognized) return;
    const extracted = {};
    labResult.biomarkers_recognized.forEach(b => {
      const key = b.biomarker.toLowerCase();
      if (key.includes('cholesterol')) extracted.cholesterol = Math.round(b.value);
      if (key.includes('blood pressure') || key.includes('bp')) extracted.resting_bp = Math.round(b.value);
      if (key.includes('heart rate') || key.includes('pulse')) extracted.resting_hr = Math.round(b.value);
      if (key.includes('glucose')) extracted.glucose = Math.round(b.value);
    });
    onApplyLabsToCardio(extracted);
  };

  return (
    <div className="focused-medical-shell">
      <div className="medical-card-frame" style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* INITIAL STATE: Clean, centered simple dropzone */}
        {!labResult ? (
          <div 
            className={`clean-dropzone-box ${isDragging ? 'dropzone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && processSelectedFile(e.target.files[0])}
            />

            <div className="clean-dropzone-icon">🧪</div>
            <h2 className="clean-dropzone-title">LAB SCANNER</h2>
            <p className="clean-dropzone-sub">
              {loading ? 'Analyzing biomarkers in-memory...' : file ? file.name : 'Drop your CSV medical report here'}
            </p>

            <button
              type="button"
              className="clean-file-pick-btn"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {loading ? 'Scanning...' : 'Choose CSV'}
            </button>

            <div className="clean-dropzone-meta">
              CSV &bull; max 10MB &bull; private session
            </div>

            {error && (
              <div className="clean-dropzone-error">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* AFTER UPLOAD: PROGRESSIVE DISCLOSURE OF BIOMARKERS */
          <div className="clean-lab-results-view">
            <div className="card-header-bar" style={{ paddingBottom: '0.85rem' }}>
              <div>
                <h3 className="card-headline" style={{ fontSize: '1.05rem' }}>
                  <span>🧪</span>
                  <span>{labResult.filename}</span>
                </h3>
                <span className="card-subheadline">
                  {labResult.rows_detected} records &bull; {labResult.data_completeness_pct}% data completeness
                </span>
              </div>

              <button
                type="button"
                className="clean-reupload-btn"
                onClick={() => {
                  setLabResult(null);
                  setFile(null);
                }}
              >
                Scan Another
              </button>
            </div>

            {/* Recognized Biomarkers Table */}
            <div className="clean-biomarkers-list">
              {labResult.biomarkers_recognized.map((item, idx) => (
                <div key={idx} className="clean-biomarker-row">
                  <div>
                    <div className="clean-biomarker-name">{item.biomarker}</div>
                    <div className="clean-biomarker-ref">Target: {item.reference_range}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`clean-biomarker-val ${item.status === 'Elevated' ? 'val-elevated' : 'val-normal'}`}>
                      {item.value} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <button
              type="button"
              className="primary-scan-action-btn"
              style={{ marginTop: '1.25rem' }}
              onClick={handleApplyToCardio}
            >
              Import into Cardio Scan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

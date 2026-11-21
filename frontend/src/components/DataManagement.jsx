import { useState, useRef } from 'react';

export default function DataManagement() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  
  const [numSamples, setNumSamples] = useState(500);
  const [genStatus, setGenStatus] = useState(null);
  const [genStats, setGenStats] = useState(null);
  
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        setUploadStatus('Error: Only .CSV files are accepted for training datasets.');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoadingUpload(true);
    setUploadStatus(null);
    setUploadStats(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload-dataset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setUploadStatus(data.message);
      setUploadStats({ rows: data.rows, columns: data.columns, filename: data.filename });
    } catch (err) {
      setUploadStatus('Error: ' + err.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoadingGen(true);
    setGenStatus(null);
    setGenStats(null);

    try {
      const response = await fetch('http://localhost:8000/generate-synthetic-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num_samples: Number(numSamples) }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Data generation failed');
      }

      const data = await response.json();
      setGenStatus(data.message);
      setGenStats({ rows: data.rows, features: data.features.length, file: data.file });
    } catch (err) {
      setGenStatus('Error: ' + err.message);
    } finally {
      setLoadingGen(false);
    }
  };

  return (
    <div className="data-management">
      {/* Upload Dataset Card */}
      <div className="data-action-card">
        <h3>Training Dataset Ingestion</h3>
        <p>Upload a validated CSV cohort containing patient vitals and cardiac labels to retrain or fine-tune models.</p>
        
        <form onSubmit={handleUpload}>
          <div 
            className="dropzone"
            style={{
              borderColor: isDragging ? 'var(--accent-cyan)' : undefined,
              backgroundColor: isDragging ? 'rgba(6, 182, 212, 0.08)' : undefined
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <div className="dropzone-icon">📁</div>
            <div className="dropzone-text">
              {file ? (
                <strong>{file.name} ({(file.size / 1024).toFixed(1)} KB)</strong>
              ) : (
                'Drop your cohort CSV here, or click to browse'
              )}
            </div>
            <div className="dropzone-hint">
              Supports standard Cleveland / UCI Heart Disease CSV format
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={!file || loadingUpload}
          >
            {loadingUpload ? (
              <>
                <span className="spinner"></span>
                <span>Ingesting Dataset...</span>
              </>
            ) : (
              <span>Upload &amp; Validate Cohort</span>
            )}
          </button>
        </form>

        {uploadStatus && (
          <div className={uploadStatus.startsWith('Error') ? 'error-msg' : 'success-msg'} style={{ marginTop: '1rem' }}>
            <span>{uploadStatus.startsWith('Error') ? '⚠️' : '✓'}</span>
            <span>{uploadStatus}</span>
          </div>
        )}

        {uploadStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{uploadStats.rows.toLocaleString()}</div>
              <div className="stat-label">Patient Rows</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{uploadStats.columns}</div>
              <div className="stat-label">Features</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Active</div>
              <div className="stat-label">Dataset State</div>
            </div>
          </div>
        )}
      </div>

      {/* Synthetic Cohort Generator Card */}
      <div className="data-action-card">
        <h3>Synthetic Clinical Data Generator</h3>
        <p>Synthesize realistic, privacy-compliant mock cohorts based on standard patient hemodynamic distributions.</p>
        
        <form onSubmit={handleGenerate}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="numSamples">
              <span>Cohort Sample Size</span>
              <span className="field-hint">{numSamples} Patients</span>
            </label>
            <input 
              type="range" 
              id="numSamples" 
              min="50" 
              max="5000" 
              step="50" 
              value={numSamples} 
              onChange={(e) => setNumSamples(Number(e.target.value))} 
            />
            
            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[100, 250, 500, 1000, 2500].map(cnt => (
                <button
                  type="button"
                  key={cnt}
                  className="preset-btn"
                  onClick={() => setNumSamples(cnt)}
                  style={{ opacity: numSamples === cnt ? 1 : 0.7 }}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary btn-block" 
            disabled={loadingGen}
          >
            {loadingGen ? (
              <>
                <span className="spinner"></span>
                <span>Synthesizing Cohort...</span>
              </>
            ) : (
              <span>Generate Synthetic Cohort ({numSamples} Patients)</span>
            )}
          </button>
        </form>

        {genStatus && (
          <div className={genStatus.startsWith('Error') ? 'error-msg' : 'success-msg'} style={{ marginTop: '1rem' }}>
            <span>{genStatus.startsWith('Error') ? '⚠️' : '✓'}</span>
            <span>{genStatus}</span>
          </div>
        )}

        {genStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{genStats.rows.toLocaleString()}</div>
              <div className="stat-label">Synthesized Records</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{genStats.features}</div>
              <div className="stat-label">Model Features</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Ready</div>
              <div className="stat-label">Storage Status</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

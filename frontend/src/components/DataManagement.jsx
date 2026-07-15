import { useState } from 'react';

export default function DataManagement() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  
  const [numSamples, setNumSamples] = useState(100);
  const [genStatus, setGenStatus] = useState(null);
  const [genStats, setGenStats] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadStatus(data.message);
      setUploadStats({ rows: data.rows, columns: data.columns });
    } catch (err) {
      setUploadStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setGenStatus(data.message);
      setGenStats({ rows: data.rows, features: data.features });
    } catch (err) {
      setGenStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-management">
      <div className="data-action-card">
        <h3>Upload Training Dataset</h3>
        <p>Upload a CSV file containing historical patient data for model training.</p>
        
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <div className="file-input-wrapper">
              <button type="button" className="btn" style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                {file ? file.name : 'Choose CSV File'}
              </button>
              <input type="file" accept=".csv" onChange={handleFileChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={!file || loading}>
            {loading && !file ? 'Uploading...' : 'Upload Dataset'}
          </button>
        </form>

        {uploadStatus && (
          <div className="success-msg" style={{ marginTop: '1rem', backgroundColor: uploadStatus.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : '', color: uploadStatus.startsWith('Error') ? 'var(--danger)' : '', borderColor: uploadStatus.startsWith('Error') ? 'rgba(239, 68, 68, 0.2)' : '' }}>
            {uploadStatus}
          </div>
        )}

        {uploadStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{uploadStats.rows}</div>
              <div className="stat-label">Rows</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{uploadStats.columns}</div>
              <div className="stat-label">Columns</div>
            </div>
          </div>
        )}
      </div>

      <div className="data-action-card">
        <h3>Generate Synthetic Data</h3>
        <p>Generate a synthetic dataset based on the PatientData schema for testing or augmenting training data.</p>
        
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="numSamples">Number of Samples to Generate</label>
            <input 
              type="number" 
              id="numSamples" 
              className="form-control" 
              value={numSamples} 
              onChange={(e) => setNumSamples(e.target.value)} 
              min="10" 
              max="10000" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && file ? 'Generating...' : 'Generate Data'}
          </button>
        </form>

        {genStatus && (
          <div className="success-msg" style={{ marginTop: '1rem', backgroundColor: genStatus.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : '', color: genStatus.startsWith('Error') ? 'var(--danger)' : '', borderColor: genStatus.startsWith('Error') ? 'rgba(239, 68, 68, 0.2)' : '' }}>
            {genStatus}
          </div>
        )}

        {genStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{genStats.rows}</div>
              <div className="stat-label">Rows Generated</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{genStats.features}</div>
              <div className="stat-label">Features</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

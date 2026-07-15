import { useState } from 'react'
import PredictionForm from './components/PredictionForm'
import Results from './components/Results'
import DataManagement from './components/DataManagement'

function App() {
  const [activeTab, setActiveTab] = useState('predict')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePredict = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      
      const resultData = await response.json();
      setResult(resultData);
    } catch (err) {
      setError(err.message || 'An error occurred while connecting to the server. Make sure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Cardiac Health Predictor</h1>
        <p>AI-powered early disease risk assessment</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          Predict Risk
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Data Management
        </button>
      </div>

      <div className="glass-card">
        {error && <div className="error-msg">{error}</div>}
        
        {activeTab === 'predict' && (
          !result ? (
            <PredictionForm onSubmit={handlePredict} loading={loading} />
          ) : (
            <Results result={result} onReset={() => setResult(null)} />
          )
        )}
        
        {activeTab === 'manage' && (
          <DataManagement />
        )}
      </div>
    </div>
  )
}

export default App

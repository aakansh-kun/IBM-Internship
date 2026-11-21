export default function Results({ result, patientData, onReset }) {
  if (!result) return null;

  const { risk_level, risk_score } = result;
  const percentage = Math.round(risk_score * 100);

  // SVG Gauge calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine severity colors & classification
  let riskTheme = 'low';
  let strokeColor = '#10b981'; // emerald
  let summaryText = 'Favorable cardiovascular profile. No acute clinical intervention indicated based on current vitals.';

  if (percentage > 70) {
    riskTheme = 'high';
    strokeColor = '#ef4444'; // crimson
    summaryText = 'Significant cardiovascular risk markers detected. Urgent cardiological evaluation and comprehensive diagnostics recommended.';
  } else if (percentage > 40) {
    riskTheme = 'moderate';
    strokeColor = '#f59e0b'; // amber
    summaryText = 'Intermediate cardiovascular risk profile. Lifestyle modifications, blood pressure monitoring, and lipid management warranted.';
  }

  // Calculate detailed factor breakdown if patientData is available
  const factors = [];
  if (patientData) {
    // 1. Age Factor
    const isAgeElevated = patientData.age > 50;
    factors.push({
      name: 'Age Factor',
      value: `${patientData.age} years`,
      status: isAgeElevated ? 'Elevated' : 'Optimal',
      impact: isAgeElevated ? 20 : 5,
      impactType: isAgeElevated ? 'impact-elevated' : 'impact-optimal',
      detail: isAgeElevated ? 'Age > 50 contributes to increased arterial stiffness.' : 'Age within lower risk demographic bracket.'
    });

    // 2. Resting Blood Pressure
    const isBpElevated = patientData.trestbps > 130;
    const bpPercent = Math.min(100, Math.round((patientData.trestbps / 180) * 100));
    factors.push({
      name: 'Resting Blood Pressure',
      value: `${patientData.trestbps} mmHg`,
      status: isBpElevated ? 'Hypertensive Range' : 'Normotensive',
      impact: isBpElevated ? 15 : 4,
      impactType: isBpElevated ? 'impact-elevated' : 'impact-optimal',
      detail: isBpElevated ? 'Resting systolic BP > 130 mmHg increases vascular workload.' : 'Resting systolic BP maintained in healthy range.'
    });

    // 3. Serum Cholesterol
    const isCholElevated = patientData.chol > 240;
    const isCholBorderline = patientData.chol >= 200 && patientData.chol <= 240;
    factors.push({
      name: 'Serum Cholesterol',
      value: `${patientData.chol} mg/dL`,
      status: isCholElevated ? 'Hypercholesterolemia' : isCholBorderline ? 'Borderline High' : 'Desirable',
      impact: isCholElevated ? 15 : isCholBorderline ? 8 : 3,
      impactType: isCholElevated ? 'impact-elevated' : isCholBorderline ? 'impact-moderate' : 'impact-optimal',
      detail: isCholElevated ? 'Cholesterol > 240 mg/dL accelerates atheroma development.' : isCholBorderline ? 'Cholesterol near upper boundary of normal.' : 'Optimal lipid level under 200 mg/dL.'
    });

    // 4. Chest Pain Type
    const cpNames = ['Typical Angina', 'Atypical Angina', 'Non-Anginal Discomfort', 'Asymptomatic'];
    const isCpSignificant = patientData.cp === 0 || patientData.cp === 1;
    factors.push({
      name: 'Chest Pain Evaluation',
      value: cpNames[patientData.cp] || 'Not specified',
      status: isCpSignificant ? 'Clinically Significant' : 'Low Probability',
      impact: patientData.cp > 0 ? 30 : 10,
      impactType: isCpSignificant ? 'impact-elevated' : 'impact-optimal',
      detail: isCpSignificant ? 'Symptom presentation correlates with ischemic heart disease.' : 'No typical angina presentation noted.'
    });

    // 5. Maximum Heart Rate & Exercise Tolerance
    const isHrLow = patientData.thalach < 100;
    factors.push({
      name: 'Max Heart Rate Response',
      value: `${patientData.thalach} bpm`,
      status: isHrLow ? 'Chronotropic Incompetence' : 'Normal Exertion',
      impact: isHrLow ? 10 : 3,
      impactType: isHrLow ? 'impact-elevated' : 'impact-optimal',
      detail: isHrLow ? 'Peak exertion heart rate < 100 bpm suggests impaired reserve.' : 'Robust chronotropic response achieved on exertion.'
    });

    // 6. ST Depression (Oldpeak)
    const isStElevated = patientData.oldpeak >= 1.5;
    factors.push({
      name: 'ST Segment Depression',
      value: `${patientData.oldpeak} mm`,
      status: isStElevated ? 'Ischemic Shift' : 'Physiologic',
      impact: isStElevated ? 15 : 2,
      impactType: isStElevated ? 'impact-elevated' : 'impact-optimal',
      detail: isStElevated ? 'Exercise-induced ST depression reflects myocardial ischemia.' : 'Minimal or absent ST displacement.'
    });
  }

  // Recommendations tailored to patient results
  const recommendations = [];
  if (percentage > 70) {
    recommendations.push('Immediate referral to a specialist cardiologist for clinical review.');
    recommendations.push('Consider 12-lead diagnostic ECG and echocardiogram (TTE).');
    recommendations.push('Evaluation for coronary computed tomography angiography (CCTA).');
  } else if (percentage > 40) {
    recommendations.push('Schedule fasting lipid panel (total cholesterol, LDL, HDL, triglycerides).');
    recommendations.push('Monitor home blood pressure twice daily for 2 weeks.');
    recommendations.push('Review nutritional guidelines: Mediterranean diet and structured cardio exercise.');
  } else {
    recommendations.push('Maintain regular physical activity (minimum 150 min/week moderate aerobic exercise).');
    recommendations.push('Schedule routine preventative health and biomarker checkup in 12 months.');
    recommendations.push('Continue balanced diet low in saturated fats and sodium.');
  }

  return (
    <div className="results-container">
      {/* Hero Assessment Card */}
      <div className="results-hero-card">
        {/* Radial SVG Gauge */}
        <div className="gauge-wrapper">
          <svg className="gauge-svg" viewBox="0 0 200 200">
            <circle
              className="gauge-bg"
              cx="100"
              cy="100"
              r={radius}
            />
            <circle
              className="gauge-fill"
              cx="100"
              cy="100"
              r={radius}
              stroke={strokeColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="gauge-center">
            <div className="gauge-percentage">{percentage}%</div>
            <div className="gauge-label">Risk Probability</div>
          </div>
        </div>

        {/* Narrative Clinical Summary */}
        <div className="result-overview">
          <div className={`risk-badge badge-${riskTheme}`}>
            <span>●</span>
            <span>{risk_level}</span>
          </div>
          <h2 className="result-title">Stratification Complete</h2>
          <p className="result-desc">{summaryText}</p>
        </div>
      </div>

      {/* Interactive Risk Factor Breakdown */}
      {factors.length > 0 && (
        <div className="breakdown-section">
          <div className="breakdown-header">
            <h3 className="breakdown-title">Interactive Risk Factor Breakdown</h3>
            <span className="breakdown-subtitle">Model Feature Contribution &amp; Biomarker Status</span>
          </div>

          <div className="factors-list">
            {factors.map((f, idx) => (
              <div key={idx} className="factor-item">
                <div className="factor-top">
                  <span className="factor-name">{f.name}</span>
                  <span className={`factor-impact-tag ${f.impactType}`}>
                    {f.status}
                  </span>
                </div>
                <div className="factor-bar-bg">
                  <div 
                    className="factor-bar-fill" 
                    style={{ 
                      width: `${Math.min(100, f.impact * 3)}%`,
                      backgroundColor: f.impactType === 'impact-elevated' 
                        ? 'var(--risk-high)' 
                        : f.impactType === 'impact-moderate' 
                        ? 'var(--risk-moderate)' 
                        : 'var(--risk-low)'
                    }} 
                  />
                </div>
                <div className="factor-details">
                  <span>Patient Value: <strong>{f.value}</strong></span>
                  <span>{f.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Clinical Recommendations */}
      <div className="recommendation-card">
        <h4 className="rec-title">
          <span>📋</span>
          <span>Next Clinical Steps &amp; Recommendations</span>
        </h4>
        <ul className="rec-list">
          {recommendations.map((rec, i) => (
            <li key={i} className="rec-item">
              <span className="rec-bullet">&rsaquo;</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button onClick={onReset} className="btn btn-secondary">
          &larr; Recalibrate / New Assessment
        </button>
        <button onClick={() => window.print()} className="btn btn-primary">
          Export Clinical Summary
        </button>
      </div>
    </div>
  );
}

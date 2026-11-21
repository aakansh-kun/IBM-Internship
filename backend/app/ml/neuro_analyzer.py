"""
Neurological Symptom Analyzer & Concern Index Estimator
Evaluates multi-domain neurological symptoms across Cognitive, Motor, Sensory, Headache, and Sleep axes.
Calculates Neurological Concern Index and identifies potential clinical patterns.
Strictly non-diagnostic screening.
"""

from typing import List, Dict, Any

class NeuroAnalyzer:
    def __init__(self):
        self.version = "neuro-screen-v2.0"

    def analyze(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        symptoms = payload.get("symptoms", [])  # list of strings
        severity = payload.get("severity", "Moderate").lower()  # mild, moderate, severe
        duration = payload.get("duration", "days").lower()  # hours, days, weeks, months
        frequency = payload.get("frequency", "occasional").lower()  # once, occasional, frequent, constant
        sleep_hours = float(payload.get("sleep_hours", 7.0))

        # Weight multipliers
        sev_multiplier = 1.0
        if severity == "mild":
            sev_multiplier = 0.7
        elif severity == "severe":
            sev_multiplier = 1.4

        freq_multiplier = 1.0
        if frequency == "once":
            freq_multiplier = 0.6
        elif frequency == "frequent":
            freq_multiplier = 1.2
        elif frequency == "constant":
            freq_multiplier = 1.45

        # Base score calculation based on symptom domain weights
        domain_weights = {
            "cognitive": ["memory", "confusion", "concentration", "brain fog", "disoriented"],
            "motor": ["tremor", "weakness", "coordination", "balance", "gait", "shaking"],
            "sensory": ["numbness", "tingling", "vision", "light sensitivity", "paresthesia", "photophobia"],
            "headache": ["migraine", "aura", "headache", "throbbing", "cephalalgia"],
            "sleep": ["insomnia", "sleepiness", "fragmented sleep", "night terrors", "sleep debt"],
            "other": ["dizziness", "vertigo", "speech", "nausea", "tinnitus"]
        }

        matched_domains = {k: [] for k in domain_weights}
        base_points = 0

        for sym in symptoms:
            sym_lower = sym.lower()
            matched = False
            for domain, keywords in domain_weights.items():
                if any(kw in sym_lower for kw in keywords):
                    matched_domains[domain].append(sym)
                    matched = True
            if matched:
                base_points += 12
            else:
                base_points += 8

        # Sleep deficit penalty
        if sleep_hours < 5.0:
            base_points += 15
            matched_domains["sleep"].append(f"Acute Sleep Deprivation ({sleep_hours} hrs/night)")
        elif sleep_hours < 6.5:
            base_points += 8

        # Composite Concern Index calculation
        raw_index = (base_points * sev_multiplier * freq_multiplier)
        concern_index = int(round(min(98, max(5, raw_index))))

        if concern_index >= 65:
            tier = "Elevated"
            tone_color = "red"
        elif concern_index >= 35:
            tier = "Moderate"
            tone_color = "amber"
        else:
            tier = "Mild / Baseline"
            tone_color = "teal"

        # Pattern Recognition
        potential_patterns = []

        if len(matched_domains["headache"]) > 0 and len(matched_domains["sensory"]) > 0:
            potential_patterns.append("Migraine-associated symptom complex (sensory aura / photophobia / headache)")

        if len(matched_domains["sleep"]) > 0 and len(matched_domains["cognitive"]) > 0:
            potential_patterns.append("Sleep-architecture deficit contributing to cognitive latency and mental fatigue")

        if len(matched_domains["motor"]) > 0 and (severity == "severe" or frequency in ["frequent", "constant"]):
            potential_patterns.append("Persistent motor or balance complaints warranting formal neurologic physical exam")

        if len(matched_domains["other"]) > 0 and any("vertigo" in s.lower() or "dizziness" in s.lower() for s in symptoms):
            potential_patterns.append("Vestibular equilibrium disturbance pattern")

        if not potential_patterns:
            potential_patterns.append("Non-localized, diffuse stress or physiological fatigue complaints")

        return {
            "concern_index": concern_index,
            "concern_tier": tier,
            "severity_assigned": severity.capitalize(),
            "frequency_assigned": frequency.capitalize(),
            "potential_patterns": potential_patterns,
            "matched_domains": {k: v for k, v in matched_domains.items() if len(v) > 0},
            "recommendation": (
                "These patterns are observed in preliminary screening. If symptoms are persistent, progressive, "
                "or distressing, discussion with a primary care clinician or neurologist is advised."
            ),
            "disclaimer": "This is an informational risk-screening estimate and does NOT constitute a neurological diagnosis."
        }

neuro_analyzer = NeuroAnalyzer()

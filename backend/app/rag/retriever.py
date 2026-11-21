"""
Clinical Guideline RAG Retriever Engine
Loads authoritative medical prevention guidelines (AHA/ACC, AAN, ADA, WHO),
indexes them with TF-IDF vector embeddings, and provides fast, cosine-similarity
retrieval tailored to the patient's specific biomarker deviations and clinical symptoms.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ClinicalRAGRetriever:
    def __init__(self, kb_dir: Optional[str] = None):
        if kb_dir is None:
            self.kb_dir = Path(__file__).parent / "knowledge_base"
        else:
            self.kb_dir = Path(kb_dir)
            
        self.documents: List[Dict[str, Any]] = []
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_df=0.95,
            min_df=1
        )
        self.tfidf_matrix = None
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Loads and indexes all guideline JSON files in the knowledge base directory."""
        self.documents = []
        corpus_texts = []

        if not self.kb_dir.exists():
            print(f"[RAG] Warning: Knowledge base directory {self.kb_dir} does not exist.")
            return

        for json_file in sorted(self.kb_dir.glob("*.json")):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            self.documents.append(item)
                            # Create indexed representation combining title, keywords, biomarkers and body content
                            keywords_str = " ".join(item.get("keywords", []))
                            biomarkers_str = " ".join(item.get("target_biomarkers", []))
                            full_text = f"{item.get('title', '')}. {keywords_str}. {biomarkers_str}. {item.get('content', '')}"
                            corpus_texts.append(full_text)
            except Exception as e:
                print(f"[RAG] Error reading {json_file}: {e}")

        if corpus_texts:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)
            print(f"[RAG] Knowledge Base indexed: {len(self.documents)} guideline chunks loaded.")
        else:
            print("[RAG] Warning: No documents found to index.")

    def build_query_from_context(self, context: Dict[str, Any]) -> str:
        """
        Extracts elevated biomarkers, reported symptoms, and risk domain from patient context
        to construct a high-relevance clinical retrieval query.
        """
        query_parts = []
        domain = context.get("domain", "cardio")
        query_parts.append(domain)

        # 1. Biomarkers
        biomarkers = context.get("biomarkers", {})
        if not biomarkers:
            for k in ["resting_bp", "trestbps", "cholesterol", "chol", "resting_hr", "thalach", "glucose", "fbs"]:
                if k in context:
                    biomarkers[k] = context[k]

        bp = biomarkers.get("resting_bp") or biomarkers.get("trestbps") or biomarkers.get("blood_pressure")
        if bp is not None:
            try:
                bp_val = float(bp)
                if bp_val >= 130:
                    query_parts.append("elevated blood pressure systolic hypertension vascular resistance")
            except (ValueError, TypeError):
                pass

        chol = biomarkers.get("cholesterol") or biomarkers.get("chol")
        if chol is not None:
            try:
                chol_val = float(chol)
                if chol_val >= 200:
                    query_parts.append("elevated serum cholesterol atherogenic plaque LDL lipids")
            except (ValueError, TypeError):
                pass

        hr = biomarkers.get("resting_hr") or biomarkers.get("thalach") or biomarkers.get("heart_rate")
        if hr is not None:
            try:
                hr_val = float(hr)
                if hr_val >= 85 or hr_val < 60:
                    query_parts.append("resting heart rate pulse autonomic balance")
            except (ValueError, TypeError):
                pass

        # 2. Symptoms
        symptoms = context.get("symptoms", [])
        if symptoms:
            query_parts.append(" ".join(str(s) for s in symptoms))

        # 3. Important features identified by ML
        important_features = context.get("important_features", [])
        for feat in important_features:
            if isinstance(feat, dict):
                query_parts.append(feat.get("feature", ""))
            else:
                query_parts.append(str(feat))

        return " ".join(query_parts)

    def retrieve(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: int = 3,
        threshold: float = 0.05
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant clinical guideline chunks matching the query string.
        Applies domain category affinity weighting.
        """
        if not self.documents or self.tfidf_matrix is None:
            return []

        try:
            query_vec = self.vectorizer.transform([query])
            raw_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        except Exception as e:
            print(f"[RAG] Error computing similarity: {e}")
            return []

        scored_docs = []
        for idx, doc in enumerate(self.documents):
            score = float(raw_scores[idx])

            # Domain affinity boost
            doc_cat = doc.get("category", "")
            if domain and (doc_cat == domain or doc_cat == "lifestyle"):
                score += 0.08

            if score >= threshold:
                scored_docs.append({
                    "id": doc.get("id"),
                    "source": doc.get("source"),
                    "category": doc.get("category"),
                    "title": doc.get("title"),
                    "content": doc.get("content"),
                    "similarity_score": round(score, 3)
                })

        # Sort descending by score
        scored_docs.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_docs[:top_k]

# Global singleton
rag_retriever = ClinicalRAGRetriever()

def retrieve_guidelines(query_or_context: Any, domain: Optional[str] = None, top_k: int = 3) -> List[Dict[str, Any]]:
    if isinstance(query_or_context, dict):
        query = rag_retriever.build_query_from_context(query_or_context)
        dom = domain or query_or_context.get("domain")
    else:
        query = str(query_or_context)
        dom = domain
    return rag_retriever.retrieve(query=query, domain=dom, top_k=top_k)

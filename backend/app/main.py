"""Death Clock FastAPI backend.

Endpoints:
  GET  /health          → liveness check
  POST /predict         → full prediction from questionnaire answers
  POST /explain         → prediction + risk factors + retrieval queries
  POST /what-if         → compare base answers vs hypothetical overrides
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    PredictRequest,
    WhatIfRequest,
    PredictResponse,
    ExplainResponse,
    WhatIfResponse,
)
from .model.features import questionnaire_to_features
from .model.vitality import features_to_vitality_params, vitality_to_prediction
from .model.explain import build_explanation_payload, identify_risk_factors, user_to_retrieval_queries

app = FastAPI(
    title="Death Clock API",
    description="Longevity prediction engine backed by SSA life tables and vitality modelling.",
    version="1.0.0",
)

# Allow all origins during local development. Tighten for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_prediction(answers: dict) -> tuple[dict, dict, dict]:
    """Core pipeline: answers → features → vitality params → prediction."""
    try:
        features   = questionnaire_to_features(answers)
        sex        = "male" if features["sex_male"] == 1 else "female"
        params     = features_to_vitality_params(features)
        prediction = vitality_to_prediction(params, features["age"], sex)
        return features, params, prediction
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/health")
def health():
    return {"ok": True, "service": "death-clock-api"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Full prediction from a complete questionnaire answer set."""
    features, params, prediction = _run_prediction(req.answers)
    return {
        "features":       features,
        "vitality_params": params,
        "prediction":     prediction,
    }


@app.post("/explain", response_model=ExplainResponse)
def explain(req: PredictRequest):
    """Prediction plus risk factor breakdown and retrieval queries.

    Evidence chunks (RAG) are not included unless a vector DB is running.
    Connect ChromaDB + paper embeddings from notebook Section 9 to enable them.
    """
    features, params, prediction = _run_prediction(req.answers)
    payload = build_explanation_payload(req.answers, features, prediction)

    return {
        "features":         features,
        "vitality_params":  params,
        "prediction":       prediction,
        "risk_factors":     payload["risk_factors"],
        "retrieval_queries": payload["retrieval_queries"],
        "instructions":     payload["instructions"],
    }


@app.post("/what-if", response_model=WhatIfResponse)
def what_if(req: WhatIfRequest):
    """Compare a base prediction against a hypothetical lifestyle change.

    Example: what happens if the user quits smoking and starts exercising?
    Pass the base answers in `answers` and the changes in `overrides`.
    """
    base_features, base_params, base_prediction = _run_prediction(req.answers)

    hypo_answers = {**req.answers, **req.overrides}
    hypo_features, hypo_params, hypo_prediction = _run_prediction(hypo_answers)

    delta = round(
        hypo_prediction["predicted_death_age"] - base_prediction["predicted_death_age"],
        1,
    )

    return {
        "base": {
            "features":        base_features,
            "vitality_params": base_params,
            "prediction":      base_prediction,
        },
        "hypothetical": {
            "features":        hypo_features,
            "vitality_params": hypo_params,
            "prediction":      hypo_prediction,
        },
        "delta_years":    delta,
        "changed_fields": list(req.overrides.keys()),
    }

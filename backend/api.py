"""FastAPI application that exposes DNA disease risk prediction endpoints.

This module serves two responsibilities:
- Provide a small REST API to return model metadata and predictions
- Optionally serve the built frontend static assets in production

Directory assumptions after repo cleanup:
- Model artifacts are stored in `backend/model.joblib` (built by `backend/train.py`)
- Frontend production build is at `frontend/dist`
"""

from pathlib import Path
from typing import List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).parent
REPO_ROOT = APP_DIR.parent
MODEL_PATH = APP_DIR / "model.joblib"
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"

app = FastAPI(title="DNA Disease Risk API", version="1.0.0")

# Serve frontend build if present
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")


class PredictRequest(BaseModel):
    GC_Content: float = Field(..., description="GC content percentage")
    AT_Content: float = Field(..., description="AT content percentage")
    Num_A: int
    Num_T: int
    Num_C: int
    Num_G: int
    kmer_3_freq: float
    Mutation_Flag: int
    Class_Label: int | str


class PredictResponse(BaseModel):
    prediction: str
    class_index: Optional[int] = None
    classes: Optional[List[str]] = None


def load_model():
    """Load the serialized model bundle from disk.

    Returns a dictionary containing:
    - model: trained estimator
    - features: feature column names
    - classes_: optional class labels
    - feature_label_to_int: optional mappings for categorical features
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model file not found. Train the model first by running train.py")
    blob = joblib.load(MODEL_PATH)
    return blob


@app.get("/")
async def root():
    # Prefer React index.html if build exists; otherwise fallback to plain index.html
    if FRONTEND_DIST.exists():
        return FileResponse(FRONTEND_DIST / "index.html")
    index_path = REPO_ROOT / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)


@app.get("/meta")
async def meta():
    blob = load_model()
    return {
        "features": blob["features"],
        "target": blob["target"],
        "classes": list(map(str, blob.get("classes_", []))) if blob.get("classes_") is not None else None,
        "feature_label_to_int": blob.get("feature_label_to_int", {}),
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    blob = load_model()
    model = blob["model"]
    features = blob["features"]
    mappings = blob.get("feature_label_to_int", {})

    raw_values = [
        req.GC_Content,
        req.AT_Content,
        req.Num_A,
        req.Num_T,
        req.Num_C,
        req.Num_G,
        req.kmer_3_freq,
        req.Mutation_Flag,
        req.Class_Label,
    ]

    encoded_values = []
    for col, value in zip(features, raw_values):
        mapping = mappings.get(col)
        if mapping is not None:
            try:
                encoded_values.append(mapping[str(value)] if not isinstance(value, (int, float)) and str(value) in mapping else mapping.get(value, mapping.get(str(value))))
            except Exception:
                encoded_values.append(mapping.get(value, mapping.get(str(value))))
        else:
            encoded_values.append(value)

    input_df = pd.DataFrame([encoded_values], columns=features)

    try:
        pred = model.predict(input_df)[0]
        classes = getattr(model, "classes_", None)
        class_index = int(list(classes).index(pred)) if classes is not None else None
        return PredictResponse(
            prediction=str(pred),
            class_index=class_index,
            classes=list(map(str, classes)) if classes is not None else None,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

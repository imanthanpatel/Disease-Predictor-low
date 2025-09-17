from pathlib import Path
from typing import List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).parent
MODEL_PATH = APP_DIR / "model.joblib"

app = FastAPI(title="DNA Disease Risk API", version="1.0.0")


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
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model file not found. Train the model first by running train.py")
    blob = joblib.load(MODEL_PATH)
    return blob


@app.get("/")
async def root():
    index_path = APP_DIR / "index.html"
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

    # Prepare raw values
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

    # Apply label mappings where present
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

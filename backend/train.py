
"""Training script to build a DNA disease risk classifier.

This script reads the dataset from `data/dna.csv`, performs minimal preprocessing,
trains a RandomForestClassifier, evaluates it, and saves both the trained model
and metadata into `backend/`.
"""

import json
import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from typing import Dict, Any

APP_DIR = Path(__file__).parent
REPO_ROOT = APP_DIR.parent
DATA_PATH = REPO_ROOT / "data" / "dna.csv"
MODEL_PATH = APP_DIR / "model.joblib"
META_PATH = APP_DIR / "model_meta.json"

FEATURE_COLUMNS = [
    "GC_Content",
    "AT_Content",
    "Num_A",
    "Num_T",
    "Num_C",
    "Num_G",
    "kmer_3_freq",
    "Mutation_Flag",
    "Class_Label",
]
TARGET_COLUMN = "Disease_Risk"


def load_and_prepare_dataframe() -> pd.DataFrame:
    """Load dataset and apply simple cleanup aligned with the notebook."""
    df = pd.read_csv(DATA_PATH)
    # Mirror notebook preprocessing: drop noisy/non-used columns
    for col in ["Sample_ID", "Sequence", "Sequence_Length"]:
        if col in df.columns:
            df = df.drop(columns=col)
    return df


def build_categorical_mappings(df: pd.DataFrame) -> Dict[str, Dict[Any, int]]:
    """Create stable label→int mappings for object-dtype features."""
    mappings: Dict[str, Dict[Any, int]] = {}
    for col in FEATURE_COLUMNS:
        if col in df.columns and df[col].dtype == "object":
            # Stable label -> int mapping based on sorted unique labels
            unique_values = sorted(df[col].dropna().unique().tolist())
            label_to_int = {label: idx for idx, label in enumerate(unique_values)}
            mappings[col] = label_to_int
    return mappings


def apply_mappings(df: pd.DataFrame, mappings: Dict[str, Dict[Any, int]]) -> pd.DataFrame:
    """Apply categorical mappings to a DataFrame copy."""
    df_enc = df.copy()
    for col, mapping in mappings.items():
        df_enc[col] = df_enc[col].map(mapping)
    return df_enc


def train_and_save_model() -> None:
    """Train the model, evaluate it, and save artifacts to disk."""
    df = load_and_prepare_dataframe()
    missing = [c for c in FEATURE_COLUMNS + [TARGET_COLUMN] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in dataset: {missing}")

    # Build and apply categorical mappings for any object-dtype features
    cat_mappings = build_categorical_mappings(df)

    X = df[FEATURE_COLUMNS]
    if cat_mappings:
        X = apply_mappings(X, cat_mappings)

    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    joblib.dump({
        "model": model,
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "classes_": getattr(model, "classes_", None),
        "feature_label_to_int": cat_mappings,
    }, MODEL_PATH)

    META_PATH.write_text(json.dumps({
        "accuracy": acc,
        "classification_report": report,
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "feature_label_to_int": cat_mappings,
    }, indent=2))

    print(f"Saved model to {MODEL_PATH}")
    print(f"Test accuracy: {acc:.4f}")


if __name__ == "__main__":
    train_and_save_model()

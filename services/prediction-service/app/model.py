from pathlib import Path

import joblib
from sklearn.pipeline import Pipeline


MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "match_predictor.joblib"


def load_model() -> Pipeline:
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model artifact not found at {MODEL_PATH}. Run app/training/train_model.py first."
        )
    return joblib.load(MODEL_PATH)
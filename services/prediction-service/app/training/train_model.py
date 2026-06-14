from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


SERVICE_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = SERVICE_ROOT / "data" / "matches.csv"
MODEL_PATH = SERVICE_ROOT / "models" / "match_predictor.joblib"
FEATURE_COLUMNS = [
    "team_a_rating",
    "team_b_rating",
    "team_a_form",
    "team_b_form",
    "home_advantage",
]


def train() -> None:
    dataset = pd.read_csv(DATA_PATH)
    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(random_state=42, max_iter=500)),
        ]
    )
    pipeline.fit(dataset[FEATURE_COLUMNS], dataset["team_a_win"])
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Saved LogisticRegression model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
import pandas as pd
from sklearn.pipeline import Pipeline

from app.schemas import PredictionRequest, PredictionResponse


FEATURE_COLUMNS = [
    "team_a_rating",
    "team_b_rating",
    "team_a_form",
    "team_b_form",
    "home_advantage",
]


def predict_match(model: Pipeline, request: PredictionRequest) -> PredictionResponse:
    features = pd.DataFrame(
        [[
            request.team_a_rating,
            request.team_b_rating,
            request.team_a_form,
            request.team_b_form,
            request.home_advantage,
        ]],
        columns=FEATURE_COLUMNS,
    )
    probabilities = model.predict_proba(features)[0]
    class_probabilities = dict(zip(model.classes_, probabilities))
    team_a_probability = float(class_probabilities[1])
    team_b_probability = float(class_probabilities[0])

    return PredictionResponse(
        winner=request.team_a if team_a_probability >= team_b_probability else request.team_b,
        team_a_probability=round(team_a_probability, 2),
        team_b_probability=round(team_b_probability, 2),
    )
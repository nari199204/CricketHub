from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from sklearn.pipeline import Pipeline

from app.model import load_model
from app.predictor import predict_match
from app.schemas import ModelInfo, PredictionRequest, PredictionResponse


MODEL_VERSION = "1.0"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.model = load_model()
    yield


app = FastAPI(
    title="CricketHub Prediction Service",
    version=MODEL_VERSION,
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "prediction-service"}


@app.get("/model/info", response_model=ModelInfo)
def model_info() -> ModelInfo:
    return ModelInfo(model="LogisticRegression", version=MODEL_VERSION)


@app.post("/predict", response_model=PredictionResponse)
def predict(request: Request, payload: PredictionRequest) -> PredictionResponse:
    model: Pipeline = request.app.state.model
    return predict_match(model, payload)
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    team_a: str = Field(min_length=1, max_length=100)
    team_b: str = Field(min_length=1, max_length=100)
    team_a_rating: float = Field(ge=0, le=100)
    team_b_rating: float = Field(ge=0, le=100)
    team_a_form: float = Field(ge=0, le=5)
    team_b_form: float = Field(ge=0, le=5)
    home_advantage: int = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    winner: str
    team_a_probability: float
    team_b_probability: float


class ModelInfo(BaseModel):
    model: str
    version: str
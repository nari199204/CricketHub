# CricketHub Prediction Service

An isolated FastAPI microservice that uses a locally trained scikit-learn
Logistic Regression model to predict a cricket match winner. It has no database
or external API dependency.

## Run locally

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app/training/train_model.py
uvicorn app.main:app --host 0.0.0.0 --port 8085
```

## Run with Docker

```bash
docker build -t crickethub/prediction-service:latest .
docker run --rm -p 8085:8085 -e PORT=8085 crickethub/prediction-service:latest
```

## API

- `GET /health`
- `GET /model/info`
- `POST /predict`

```bash
curl -X POST http://localhost:8085/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "team_a": "Mumbai Strikers",
    "team_b": "Delhi Daredevils",
    "team_a_rating": 85,
    "team_b_rating": 76,
    "team_a_form": 4,
    "team_b_form": 2,
    "home_advantage": 1
  }'
```

To retrain the bundled model after changing `data/matches.csv`, run:

```bash
python app/training/train_model.py
```
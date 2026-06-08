# CricketHub

A production-style cricket scoring & team management microservices platform inspired by CricHeroes.

## Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript microservices
- **Database:** PostgreSQL 16 (single instance, multiple DBs)
- **Auth:** JWT + RBAC (Admin, Team Owner, Scorer, Viewer)
- **Deploy:** Docker Compose → Kubernetes → Helm → ArgoCD → AWS EKS

## Architecture

```
                    ┌────────────┐
                    │  Frontend  │  :3000
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │ API Gateway│  :8080 (JWT validation, routing)
                    └─────┬──────┘
       ┌──────────┬───────┼───────┬──────────┐
       ▼          ▼       ▼       ▼          ▼
   ┌──────┐  ┌──────┐ ┌──────┐ ┌──────┐
   │ Auth │  │ Team │ │Match │ │Scoring│
   │ 8081 │  │ 8082 │ │ 8083 │ │ 8084 │
   └───┬──┘  └──┬───┘ └──┬───┘ └──┬───┘
       └────────┴────────┴────────┘
                  │
            ┌─────▼──────┐
            │ PostgreSQL │  (auth_db, team_db, match_db, scoring_db)
            └────────────┘
```

## Quick Start (Docker Compose)

```bash
cd docker
docker compose up --build
```

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080

Default admin: `admin@crickethub.io` / `admin123`

## Kubernetes

```bash
kubectl apply -f k8s/namespace/
kubectl apply -R -f k8s/
```

## Helm

```bash
helm install crickethub helm/crickethub -f helm/crickethub/values-dev.yaml
```

## ArgoCD

```bash
kubectl apply -f argocd/app-of-apps.yaml
```

## AWS EKS

The same Helm chart deploys unchanged to EKS. Provision an EKS cluster, install the AWS ALB Ingress controller, then:

```bash
helm install crickethub helm/crickethub -f helm/crickethub/values-prod.yaml
```

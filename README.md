# Scoped — Dashboard Analysis Prototype

A full-stack workshop project that analyzes dashboard images for selected International Business Communication Standards (IBCS) presentation rules.

## Current status

Implemented prototype, not documentation-only. The repository contains a React interface, FastAPI backend, PostgreSQL persistence, YOLO chart detection, and vision-language-model analysis. Its scores are application heuristics rather than a verified IBCS certification.

## Features and implementation

- Authentication screens plus dashboard upload and analysis-history interfaces.
- A FastAPI API with request/response contracts and separated controller, service, and repository layers.
- YOLO detection of chart regions and generation of annotated images/crops.
- Groq vision-language-model calls to analyze chart notation, metadata, and presentation.
- Stored analysis status, findings, scores, detections, and image paths.

## Technology

React, TypeScript, Vite, FastAPI, SQLAlchemy, PostgreSQL, OpenCV, Ultralytics YOLO, and Groq. Backend pyproject.toml requires Python >=3.12.

## Repository map

| Path | Purpose |
| --- | --- |
| [app/client](app/client) | React application |
| [app/backend/main.py](app/backend/main.py) | FastAPI entry point |
| [app/backend/src/api](app/backend/src/api) | HTTP routes and contracts |
| [app/backend/src/core](app/backend/src/core) | Application models and services |
| [app/backend/src/dal](app/backend/src/dal) | Repository layer |
| [app/backend/src/services/dashboard_analyzer.py](app/backend/src/services/dashboard_analyzer.py) | Chart detection and model-analysis pipeline |
| [app/backend/uploads](app/backend/uploads) | Original, annotated, and cropped images |

## Local setup

Run the native development setup first. Start PostgreSQL with a database for this project:

```bash
git clone https://github.com/frontend-alex/Scoped.git
cd Scoped
docker run --name scoped-local-postgres -e POSTGRES_PASSWORD=local-only-password -e POSTGRES_DB=ibcs_db -p 5432:5432 -d postgres:16
cd app/backend
cp .env.example .env
uv sync
```

Set DATABASE_URL to postgresql://postgres:local-only-password@127.0.0.1:5432/ibcs_db, provide JWT_SECRET_KEY, and set GROQ_API_KEY for image analysis. JWT_ALGORITHM and JWT_EXPIRATION_MINUTES have defaults in the configuration. The detector requires src/ml/model/best.pt.

```bash
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

In another terminal, from app/client:

```bash
npm install
npm run dev
```

Use the Vite localhost:5173 origin accepted by the backend CORS configuration. The frontend API helper currently targets http://127.0.0.1:8000. API documentation is exposed at /docs.

## Verification

```bash
curl http://127.0.0.1:8000/
cd app/client
npm run build
npm run typecheck
npm run lint
```

Manually validate authentication, image upload, saved history, and model/API error handling with a local test image. No runtime, external model calls, or accuracy evaluation were performed in this documentation update.

## Limitations and next steps

- The original workshop plan also discusses synthetic data and deterministic baselines; those goals should not be presented as completed without evaluation evidence.
- Scores depend on model responses and custom penalties. A fixed prompt/temperature does not establish reproducibility or correctness.
- Native setup is documented because root Compose expects a default backend Dockerfile while the checked-in file is named Dockerfile.txt.
- Deployment requires revisiting hardcoded frontend API/CORS origins and handling upload storage and model availability.

## Code review starting points

- [app/backend/src/services/dashboard_analyzer.py](app/backend/src/services/dashboard_analyzer.py)
- [app/backend/src/api/router/routes.py](app/backend/src/api/router/routes.py)
- [app/backend/src/core/models/dashboard_analysis_model.py](app/backend/src/core/models/dashboard_analysis_model.py)
- [app/client/src/lib/api.ts](app/client/src/lib/api.ts)

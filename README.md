# AI Resume Analyzer

AI Resume Analyzer is a full-stack project for PDF resume upload, text extraction, AI analysis, and result visualization.

It combines:
- Node.js + Express API
- Python FastAPI parser service
- PostgreSQL + Prisma
- React frontend
- Dify workflow integration

## Highlights

- Upload PDF resumes and process them end-to-end
- Parse and clean resume text through Python service
- Call Dify Workflow API for AI evaluation
- Store resumes and analysis records in PostgreSQL
- Dashboard with structured result cards:
  - Candidate Name
  - Overall Score
  - Core Competency Analysis
  - Technical Skills chips
  - Recruiter Suggestions list
- Supports both Chinese and English result labels in frontend parsing

## Architecture

```
frontend-react (3001)
    -> backend-node (3000)
        -> parser-python (8000)
        -> Dify API
        -> PostgreSQL (5432)
```

## Repository Structure

```
ai-resume-analyzer/
├── backend-node/          # Express API + Prisma
├── parser-python/         # FastAPI PDF parser
├── frontend-react/        # React app (CRA + Tailwind)
├── dify/                  # Dify workflow export/config
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (or Docker)
- Docker Desktop (optional, recommended for full stack run)

## Quick Start (Docker)

1. Move to project folder.

```bash
cd ai-resume-analyzer
```

2. Create backend env file.

```bash
cp backend-node/.env.example backend-node/.env
```

3. Set your Dify key in backend env.

```env
DIFY_API_KEY=your_real_dify_api_key
```

4. Start all services.

```bash
docker-compose up --build
```

5. Open app.

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Parser: http://localhost:8000
- PostgreSQL: localhost:5432

## Quick Start (Local Development)

Run services in three terminals.

### 1) Parser Service

Windows PowerShell:

```powershell
cd parser-python
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

macOS/Linux:

```bash
cd parser-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Backend Service

```bash
cd backend-node
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 3) Frontend Service

```bash
cd frontend-react
npm install
npm start
```

Open http://localhost:3001

## Environment Variables

Create backend-node/.env:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_resume_analyzer"

# Dify
DIFY_API_KEY="your_dify_api_key_here"
DIFY_API_URL="https://api.dify.ai/v1"

# Dify workflow input variable name (must match your Dify workflow input key)
# Example: resume_text
DIFY_WORKFLOW_INPUT_VAR="resume_text"

# Internal services
PYTHON_SERVICE_URL="http://localhost:8000"

# App
PORT=3000
NODE_ENV=development
```

## API Overview

Backend Base URL: http://localhost:3000

### Health
- GET /health

### Resume
- POST /api/resumes/upload (multipart/form-data, field name: file)
- GET /api/resumes
- GET /api/resumes/:id
- DELETE /api/resumes/:id

### Analysis
- POST /api/analyses
- GET /api/analyses/:id
- GET /api/analyses/resume/:resumeId

### Parser Service

Parser Base URL: http://localhost:8000

- GET /health
- POST /parse

## Data Model

Main entities:
- Resume: file metadata + extracted text
- Analysis: analysis type + result payload + optional score

See Prisma schema in backend-node/prisma/schema.prisma for exact fields.

## Troubleshooting

### 1) npm run dev fails from workspace root

Run commands inside each service folder, not from parent folder.

### 2) Port conflicts (3000 / 3001 / 8000)

Windows (PowerShell):

```powershell
netstat -ano | Select-String ":3000|:3001|:8000"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then restart services.

### 3) Backend cannot connect to parser

Check parser is running and reachable:

```bash
curl http://localhost:8000/health
```

### 4) Dify returns unauthorized or invalid input

- Verify DIFY_API_KEY is valid
- Verify DIFY_WORKFLOW_INPUT_VAR exactly matches your workflow variable name
- Check backend logs for Dify error payload

### 5) Prisma migration issues

```bash
cd backend-node
npm run prisma:generate
npm run prisma:migrate
```

## Current Limitations

- Backend has no dedicated automated test script configured yet
- Frontend/API error handling can be further improved for partial service failures

## Suggested Git Workflow Before Push

```bash
git status
git add .
git commit -m "docs: upgrade README with setup, env and troubleshooting"
git push origin <your-branch>
```


Last updated: 2026-03-12

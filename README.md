# Enterprise Context Web

Frontend demo for the Enterprise Context Layer backend.

It now includes the core demo loop: view seeded knowledge, load a `.md` or `.txt` file, ingest a manual document, ask cited questions, inspect retrieval debug details, review audit logs, delete manual documents, and reset demo data.

## Portfolio Signal

This project is intentionally shaped as an interview-friendly AI full-stack demo:

- Frontend owns the complete workflow instead of showing a bare chat box.
- Backend exposes source-grounded RAG APIs with citations and audit logs.
- Local deployment keeps the recording cheap and repeatable.
- Provider seams make it easy to swap local, Jina, OpenAI, and DeepSeek paths.

Backend repo:

- `/Users/chenwencheng/codebase/ai-app/enterprise-context-api`
- GitHub API repo: https://github.com/mowtwo/enterprise-context-api
- Local API: `http://localhost:8010`
- Frontend env: `VITE_API_BASE_URL=http://localhost:8010`

## Architecture

```mermaid
flowchart LR
  A["React demo workspace"] --> B["FastAPI RAG API"]
  B --> C["PostgreSQL + pgvector"]
  B --> D["Embedding provider"]
  B --> E["Chat provider"]
  D --> F["local hash / Jina / OpenAI"]
  E --> G["fallback / DeepSeek"]
  C --> H["Citations + audit logs"]
  H --> A
```

## Demo Checklist

- Load a `.md` or `.txt` memo into the ingest form.
- Ingest the document and confirm it appears under Knowledge Sources.
- Ask a question and inspect answer, citations, latency, cost, and Retrieval Debug.
- Review the Audit Trail.
- Delete manual documents or Reset to return to a clean recording state.

## Run

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-web
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL and make sure the backend is running with:

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-api
docker compose up -d
```

Docs:

- `docs/product.md`
- `docs/development.md`
- `docs/recording-script.md`
- `docs/testing-checklist.md`

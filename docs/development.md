# Development Document

## Repositories

- Frontend: `/Users/chenwencheng/codebase/ai-app/enterprise-context-web`
- Backend: `/Users/chenwencheng/codebase/ai-app/enterprise-context-api`

## Stack

Frontend:

- React
- TypeScript
- Vite
- Plain CSS for a compact product demo surface
- Browser-side `.md` and `.txt` file reading before JSON ingestion

Backend:

- FastAPI
- PostgreSQL
- pgvector
- SQLAlchemy async engine
- Docker Compose
- Provider interfaces for embedding and chat

## Local Startup

Backend:

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-api
cp .env.example .env
docker compose up --build -d
curl http://localhost:8010/health
```

Frontend:

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-web
cp .env.example .env
npm install
npm run dev
```

## Environment Contract

The frontend reads:

```bash
VITE_API_BASE_URL=http://localhost:8010
```

The backend exposes:

- `GET /health`
- `GET /config`
- `GET /documents`
- `POST /documents/ingest`
- `DELETE /documents/{id}`
- `POST /query`
- `GET /audit-logs`
- `POST /demo/reset`

## Provider Notes

Default embedding is local hashing, which is intentionally lightweight and model-free. It proves the system architecture and keeps the Docker image small. For better semantic quality, switch to Jina or OpenAI embeddings and call `/demo/reset` to re-ingest.

Default chat provider is fallback extractive answer generation. To use DeepSeek:

```bash
CHAT_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key_here
```

## Debug Surface

The frontend displays retrieval debug data from the `citations` array returned by `POST /query`:

- document title
- chunk id prefix
- retrieval score
- citation excerpt

This keeps the demo honest during interviews: the answer is visibly connected to retrieved context.

## Next Engineering Steps

1. Add drag-and-drop upload and background ingestion status.
2. Add provider quality comparison.
3. Add answer feedback and retrieval debugging.
4. Add auth boundary and workspace-aware document filtering.
5. Add hosted deployment profile after the local demo is recorded.

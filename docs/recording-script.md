# Recording Script

## Setup

1. Start backend:

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-api
docker compose up -d
```

2. Start frontend:

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-web
npm run dev
```

3. Open the frontend URL from Vite.

## Recording Flow

1. Show the dashboard status: backend connected, local embedding, fallback chat.
2. Show the seeded knowledge sources and explain that they represent company policy, onboarding, pricing, and customer call notes.
3. Ask: `How should a remote team use approved AI tools?`
4. Point out the answer, citations, retrieval scores, and latency.
5. Show the audit trail updating after the query.
6. Open Swagger at `http://localhost:8010/docs` and quickly show the backend API surface.
7. Mention that the provider can switch to DeepSeek, Jina, or OpenAI through environment variables.

## Talking Points

- Built as two repos to mirror real frontend/backend ownership.
- Local-first deployment keeps demo cost low.
- Query logs and citations show enterprise AI discipline.
- The architecture is ready for stronger providers without changing frontend code.

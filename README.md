# Enterprise Context Web

Frontend demo for the Enterprise Context Layer backend.

Backend repo:

- `/Users/chenwencheng/codebase/ai-app/enterprise-context-api`
- Local API: `http://localhost:8010`
- Frontend env: `VITE_API_BASE_URL=http://localhost:8010`

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

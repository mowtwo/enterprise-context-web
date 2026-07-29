# Testing Checklist

## Backend

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-api
docker compose up --build -d
curl http://localhost:8010/health
curl http://localhost:8010/config
curl http://localhost:8010/documents
uv run pytest -q
```

## Frontend

```bash
cd /Users/chenwencheng/codebase/ai-app/enterprise-context-web
npm run check
npm run dev
```

## Manual Demo QA

1. Open `http://127.0.0.1:5174/`.
2. Confirm provider bar shows `local`, `fallback`, and `http://localhost:8010`.
3. Confirm Model Configuration shows `local-hash-384`, `extractive-fallback`, and missing hosted provider keys.
4. Change Chat provider to `deepseek`, keep the key empty, save, and confirm the status changes while the key still shows missing.
5. Change Chat provider back to `fallback` and save.
6. Confirm the UI defaults to English.
7. Toggle Chinese and confirm key controls, panels, architecture notes, model config, and testing notes are translated.
8. Toggle back to English for recording consistency.
9. Run `How should a remote team use approved AI tools?`.
10. Confirm answer, citations, Retrieval Debug, and Audit Trail update.
11. Load `docs/sample-remote-hiring-memo.md` or another `.md/.txt` file into the ingest form.
12. Ingest it and confirm the document appears in Knowledge Sources.
13. Ask a question that should retrieve the newly ingested document.
14. Delete the manual document.
15. Use Reset and confirm the seed documents return.

## Known Limits

- Local hashing embedding is intentionally lightweight and not production semantic retrieval.
- There is no auth or document permission model yet.
- File handling is browser-side `.md/.txt` loading, not a production upload queue.

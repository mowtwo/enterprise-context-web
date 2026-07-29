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
3. Run an example question: `How should a remote team use approved AI tools?`
4. Point out the answer, citations, retrieval scores, latency, and estimated cost.
5. Load a small `.md` or `.txt` memo, or use the default Chinese-friendly remote hiring memo in the left panel.
6. Ingest the memo and show that it appears in Knowledge Sources.
7. Run: `What signals matter for a China-friendly AI full-stack candidate?`
8. Show Retrieval Debug: document title, chunk id prefix, score, and citation preview.
9. Delete the manual document or use Reset to make the demo repeatable.
10. Show the audit trail updating after each query.
11. Open Swagger at `http://localhost:8010/docs` and quickly show the backend API surface.
12. Mention that the provider can switch to DeepSeek, Jina, or OpenAI through environment variables.

## Talking Points

- Built as two repos to mirror real frontend/backend ownership.
- Local-first deployment keeps demo cost low.
- Query logs and citations show enterprise AI discipline.
- The architecture is ready for stronger providers without changing frontend code.
- Manual ingest, delete, and reset make the demo repeatable for interviews.
- Retrieval debug makes the RAG behavior visible instead of asking the reviewer to trust a chat response.

## 2-Minute Voiceover

This is a local-first Enterprise Context Layer demo. The goal is to show a complete AI full-stack workflow, not just a chat box. The frontend loads seeded internal knowledge, lets me ingest a markdown or text memo, and sends questions to a FastAPI backend.

The backend stores document chunks in Postgres with pgvector, retrieves relevant context, and returns an answer with citations. Because this is meant to be cheap and repeatable for interviews, the default embedding provider is local and the default answer provider is extractive fallback. The same provider interface can switch to Jina or OpenAI embeddings and DeepSeek answer generation.

The important part is traceability. Every answer shows source documents, retrieval scores, chunk ids, latency, estimated cost, and an audit trail. That makes the demo closer to an enterprise AI workflow where product, engineering, and customer success can inspect why an answer was produced.

## 2 分钟中文口播

这是一个本地优先的 Enterprise Context Layer demo。它不是单纯做一个聊天框，而是展示完整的 AI 全栈工作流：前端可以查看 seed 知识库、导入 markdown 或 txt 文档，然后把问题发送到 FastAPI 后端。

后端会把文档切片写入 Postgres 和 pgvector，查询时做向量检索，并返回带引用来源的答案。为了让面试录屏成本足够低，默认使用本地 embedding 和 fallback answer；但 provider 机制已经预留，可以切换到 Jina、OpenAI embedding 或 DeepSeek 生成答案。

重点是可追溯性。每次回答都会展示来源文档、检索分数、chunk id、耗时、成本估算和审计日志。这比普通聊天 demo 更接近企业 AI 应用真正需要的工程细节。

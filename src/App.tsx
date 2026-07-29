import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010'

const EXAMPLE_QUESTIONS = [
  'How should a remote team use approved AI tools?',
  'What makes this demo cheap enough to run locally?',
  'What signals matter for a China-friendly AI full-stack candidate?',
  '客户为什么关心 citations 和 audit logs？',
]

const DEFAULT_INGEST_CONTENT = `Chinese-friendly remote hiring memo

AI startup teams hiring from China should prefer async written collaboration, clear issue ownership, and contract-friendly workflows. A strong candidate can communicate in English text, ship frontend and backend slices, and document trade-offs without waiting for synchronous meetings.

For an AI full-stack demo, the most relevant signals are RAG implementation, vector retrieval, provider abstraction, audit logs, Docker-based local deployment, and a frontend that exposes the product workflow clearly.`

const ARCHITECTURE_STEPS = [
  'React workspace loads source documents and user questions',
  'FastAPI validates requests and coordinates ingestion or retrieval',
  'PostgreSQL + pgvector stores document chunks and vector search state',
  'Embedding provider can run locally or switch to OpenAI/Jina',
  'Chat provider can use fallback extraction or DeepSeek answer generation',
  'Audit logs preserve query, citations, latency, and estimated cost',
]

const TEST_NOTES = [
  'Docker backend smoke: /health, /config, /documents, /query',
  'Frontend quality gate: oxlint, TypeScript build, Vite production build',
  'Demo reset keeps recordings repeatable after manual document tests',
]

type Health = {
  status: string
  embedding_provider: string
  chat_provider: string
}

type RuntimeConfig = {
  api_base_url: string
  embedding_provider: string
  chat_provider: string
  supported_embedding_providers: string[]
  supported_chat_providers: string[]
  default_top_k: number
}

type DocumentSummary = {
  id: string
  title: string
  source_type: string
  language: string
  source_uri: string | null
  chunk_count: number
  created_at: string
}

type Citation = {
  document_id: string
  document_title: string
  chunk_id: string
  chunk_index: number
  score: number
  excerpt: string
}

type QueryResponse = {
  answer: string
  citations: Citation[]
  latency_ms: number
  estimated_cost_usd: number
}

type AuditLog = {
  id: string
  query: string
  answer: string
  latency_ms: number
  estimated_cost_usd: number
  created_at: string
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [config, setConfig] = useState<RuntimeConfig | null>(null)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [question, setQuestion] = useState(EXAMPLE_QUESTIONS[0])
  const [topK, setTopK] = useState(4)
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [ingestTitle, setIngestTitle] = useState('Chinese-friendly Remote Hiring Memo')
  const [ingestLanguage, setIngestLanguage] = useState('en')
  const [ingestContent, setIngestContent] = useState(DEFAULT_INGEST_CONTENT)
  const [ingestSourceUri, setIngestSourceUri] = useState('manual://recording-memo')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const totalChunks = useMemo(
    () => documents.reduce((sum, document) => sum + document.chunk_count, 0),
    [documents],
  )
  const manualDocuments = useMemo(
    () => documents.filter((document) => document.source_type === 'manual').length,
    [documents],
  )
  const latestAudit = auditLogs[0]

  async function refresh() {
    const [nextHealth, nextConfig, nextDocuments, nextLogs] = await Promise.all([
      fetchJson<Health>('/health'),
      fetchJson<RuntimeConfig>('/config'),
      fetchJson<DocumentSummary[]>('/documents'),
      fetchJson<AuditLog[]>('/audit-logs'),
    ])
    setHealth(nextHealth)
    setConfig(nextConfig)
    setDocuments(nextDocuments)
    setAuditLogs(nextLogs)
  }

  async function askQuestion(nextQuestion = question) {
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const safeTopK = Math.min(Math.max(topK, 1), 12)
      const response = await fetchJson<QueryResponse>('/query', {
        method: 'POST',
        body: JSON.stringify({ query: nextQuestion, top_k: safeTopK }),
      })
      setResult(response)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function ingestDocument() {
    if (!ingestTitle.trim() || !ingestContent.trim()) {
      setError('Title and content are required')
      return
    }
    setMutating(true)
    setError(null)
    setNotice(null)
    try {
      await fetchJson('/documents/ingest', {
        method: 'POST',
        body: JSON.stringify({
          title: ingestTitle,
          content: ingestContent,
          language: ingestLanguage,
          source_type: 'manual',
          source_uri: ingestSourceUri,
        }),
      })
      setNotice('Document ingested')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingest failed')
    } finally {
      setMutating(false)
    }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return
    const supported = file.name.endsWith('.md') || file.name.endsWith('.txt')
    if (!supported) {
      setError('Only .md and .txt files are supported for this demo')
      return
    }
    const content = await file.text()
    setSelectedFileName(file.name)
    setIngestTitle(file.name.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' '))
    setIngestContent(content)
    setIngestSourceUri(`file://${file.name}`)
    setNotice('File loaded into ingest form')
    setError(null)
  }

  async function deleteDocument(documentId: string) {
    setMutating(true)
    setError(null)
    setNotice(null)
    try {
      await fetchJson(`/documents/${documentId}`, { method: 'DELETE' })
      setNotice('Document deleted')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setMutating(false)
    }
  }

  async function resetDemo() {
    setMutating(true)
    setError(null)
    setNotice(null)
    try {
      await fetchJson('/demo/reset', { method: 'POST' })
      setResult(null)
      setNotice('Demo data reset')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setMutating(false)
    }
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : 'Backend unavailable'))
  }, [])

  return (
    <main className="workspace">
      <section className="masthead">
        <div>
          <p className="eyebrow">Enterprise Context Layer</p>
          <h1>Source-grounded AI answers for internal knowledge.</h1>
        </div>
        <div className="status-strip" aria-label="System status">
          <span className={health?.status === 'ok' ? 'status-dot ok' : 'status-dot'} />
          <span>{health?.status ?? 'checking'}</span>
          <span>{config?.embedding_provider ?? health?.embedding_provider ?? 'embedding'}</span>
          <span>{config?.chat_provider ?? health?.chat_provider ?? 'chat'}</span>
        </div>
      </section>

      <section className="metrics" aria-label="Demo metrics">
        <div>
          <strong>{documents.length}</strong>
          <span>Documents</span>
        </div>
        <div>
          <strong>{totalChunks}</strong>
          <span>Chunks</span>
        </div>
        <div>
          <strong>{manualDocuments}</strong>
          <span>Manual</span>
        </div>
        <div>
          <strong>{result?.latency_ms ?? latestAudit?.latency_ms ?? 0}ms</strong>
          <span>Latency</span>
        </div>
      </section>

      <section className="provider-bar" aria-label="Provider configuration">
        <div>
          <strong>Embedding</strong>
          <span>{config?.embedding_provider ?? 'local'}</span>
          <em>{config?.supported_embedding_providers.join(' / ') ?? 'local / openai / jina'}</em>
        </div>
        <div>
          <strong>Answer</strong>
          <span>{config?.chat_provider ?? 'fallback'}</span>
          <em>{config?.supported_chat_providers.join(' / ') ?? 'fallback / deepseek'}</em>
        </div>
        <div>
          <strong>API</strong>
          <span>{config?.api_base_url ?? API_BASE_URL}</span>
          <em>Docker local deployment</em>
        </div>
      </section>

      {(error || notice) && (
        <section className={error ? 'message error' : 'message notice'}>{error ?? notice}</section>
      )}

      <section className="grid">
        <div className="left-column">
          <aside className="panel documents-panel">
            <div className="panel-title">
              <h2>Knowledge Sources</h2>
              <div className="button-row compact">
                <button type="button" onClick={() => refresh().catch(() => undefined)}>
                  Refresh
                </button>
                <button type="button" onClick={resetDemo} disabled={mutating}>
                  Reset
                </button>
              </div>
            </div>
            <div className="document-list">
              {documents.map((document) => (
                <article key={document.id} className="document-item">
                  <div>
                    <h3>{document.title}</h3>
                    <p>{document.source_uri ?? document.source_type}</p>
                  </div>
                  <div className="document-actions">
                    <span>{document.language}</span>
                    {document.source_type === 'manual' ? (
                      <button
                        type="button"
                        aria-label={`Delete ${document.title}`}
                        onClick={() => deleteDocument(document.id)}
                        disabled={mutating}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <section className="panel ingest-panel">
            <div className="panel-title">
              <h2>Ingest Document</h2>
              <span>{selectedFileName ?? 'textarea or .md/.txt file'}</span>
            </div>
            <div className="form-grid">
              <label className="full file-loader">
                <span>Load File</span>
                <input
                  type="file"
                  accept=".md,.txt,text/markdown,text/plain"
                  onChange={(event) => loadFile(event.target.files?.[0]).catch((err) => {
                    setError(err instanceof Error ? err.message : 'File load failed')
                  })}
                />
              </label>
              <label>
                <span>Title</span>
                <input value={ingestTitle} onChange={(event) => setIngestTitle(event.target.value)} />
              </label>
              <label>
                <span>Language</span>
                <select
                  value={ingestLanguage}
                  onChange={(event) => setIngestLanguage(event.target.value)}
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
              <label className="full">
                <span>Source URI</span>
                <input
                  value={ingestSourceUri}
                  onChange={(event) => setIngestSourceUri(event.target.value)}
                />
              </label>
              <label className="full">
                <span>Content</span>
                <textarea
                  value={ingestContent}
                  onChange={(event) => setIngestContent(event.target.value)}
                  aria-label="Document content"
                />
              </label>
              <button type="button" className="primary wide" onClick={ingestDocument} disabled={mutating}>
                {mutating ? 'Working...' : 'Ingest'}
              </button>
            </div>
          </section>
        </div>

        <section className="panel query-panel">
          <div className="panel-title">
            <h2>Ask With Citations</h2>
            <span className="api-url">{API_BASE_URL}</span>
          </div>
          <div className="examples">
            {EXAMPLE_QUESTIONS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setQuestion(example)
                  askQuestion(example).catch(() => undefined)
                }}
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Question"
          />
          <div className="query-actions">
            <label>
              <span>Top K</span>
              <input
                type="number"
                min="1"
                max="12"
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
              />
            </label>
            <button type="button" className="primary" onClick={() => askQuestion()} disabled={loading}>
              {loading ? 'Querying...' : 'Run Query'}
            </button>
          </div>
          {result ? (
            <div className="answer">
              <div className="answer-meta">
                <span>{result.latency_ms}ms</span>
                <span>${result.estimated_cost_usd.toFixed(6)}</span>
                <span>{result.citations.length} citations</span>
              </div>
              <pre>{result.answer}</pre>
              <div className="citation-list">
                {result.citations.map((citation) => (
                  <article key={citation.chunk_id} className="citation">
                    <div>
                      <strong>{citation.document_title}</strong>
                      <span>{Math.round(citation.score * 100)}%</span>
                    </div>
                    <p>{citation.excerpt}</p>
                  </article>
                ))}
              </div>
              <div className="debug-panel">
                <div className="debug-title">
                  <h3>Retrieval Debug</h3>
                  <span>chunk source and score</span>
                </div>
                <div className="debug-table">
                  {result.citations.map((citation, index) => (
                    <article key={`${citation.chunk_id}-debug`}>
                      <span>#{index + 1}</span>
                      <strong>{citation.document_title}</strong>
                      <code>{citation.chunk_id.slice(0, 8)}</code>
                      <em>{citation.score.toFixed(3)}</em>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>

      <section className="panel audit-panel">
        <div className="panel-title">
          <h2>Audit Trail</h2>
          <span>{auditLogs.length} recent records</span>
        </div>
        <div className="audit-table">
          {auditLogs.slice(0, 8).map((log) => (
            <article key={log.id}>
              <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              <strong>{log.query}</strong>
              <p>{log.answer}</p>
              <em>{log.latency_ms}ms</em>
            </article>
          ))}
        </div>
      </section>

      <section className="info-grid">
        <article className="panel info-panel">
          <div className="panel-title">
            <h2>Architecture</h2>
            <span>local-first RAG path</span>
          </div>
          <ol>
            {ARCHITECTURE_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel info-panel">
          <div className="panel-title">
            <h2>Testing Notes</h2>
            <span>recording-ready checks</span>
          </div>
          <ul>
            {TEST_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App

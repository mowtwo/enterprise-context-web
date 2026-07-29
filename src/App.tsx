import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010'

type Health = {
  status: string
  embedding_provider: string
  chat_provider: string
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
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [question, setQuestion] = useState('How should a remote team use approved AI tools?')
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalChunks = useMemo(
    () => documents.reduce((sum, document) => sum + document.chunk_count, 0),
    [documents],
  )

  async function refresh() {
    const [nextHealth, nextDocuments, nextLogs] = await Promise.all([
      fetchJson<Health>('/health'),
      fetchJson<DocumentSummary[]>('/documents'),
      fetchJson<AuditLog[]>('/audit-logs'),
    ])
    setHealth(nextHealth)
    setDocuments(nextDocuments)
    setAuditLogs(nextLogs)
  }

  async function askQuestion() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchJson<QueryResponse>('/query', {
        method: 'POST',
        body: JSON.stringify({ query: question, top_k: 4 }),
      })
      setResult(response)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
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
          <span>{health?.embedding_provider ?? 'embedding'}</span>
          <span>{health?.chat_provider ?? 'chat'}</span>
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
          <strong>{auditLogs.length}</strong>
          <span>Queries</span>
        </div>
        <div>
          <strong>{result?.latency_ms ?? 0}ms</strong>
          <span>Last latency</span>
        </div>
      </section>

      <section className="grid">
        <aside className="panel documents-panel">
          <div className="panel-title">
            <h2>Knowledge Sources</h2>
            <button type="button" onClick={() => refresh().catch(() => undefined)}>
              Refresh
            </button>
          </div>
          <div className="document-list">
            {documents.map((document) => (
              <article key={document.id} className="document-item">
                <div>
                  <h3>{document.title}</h3>
                  <p>{document.source_uri ?? document.source_type}</p>
                </div>
                <span>{document.language}</span>
              </article>
            ))}
          </div>
        </aside>

        <section className="panel query-panel">
          <div className="panel-title">
            <h2>Ask With Citations</h2>
            <span className="api-url">{API_BASE_URL}</span>
          </div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Question"
          />
          <button type="button" className="primary" onClick={askQuestion} disabled={loading}>
            {loading ? 'Querying...' : 'Run Query'}
          </button>
          {error ? <p className="error">{error}</p> : null}
          {result ? (
            <div className="answer">
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
          {auditLogs.slice(0, 6).map((log) => (
            <article key={log.id}>
              <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              <strong>{log.query}</strong>
              <em>{log.latency_ms}ms</em>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App

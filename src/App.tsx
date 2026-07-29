import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010'

type Locale = 'en' | 'zh'

const COPY = {
  en: {
    languageToggle: '中文',
    languageLabel: 'Switch to Chinese',
    eyebrow: 'Enterprise Context Layer',
    headline: 'Source-grounded AI answers for internal knowledge.',
    checking: 'checking',
    embeddingFallback: 'embedding',
    chatFallback: 'chat',
    metrics: {
      documents: 'Documents',
      chunks: 'Chunks',
      manual: 'Manual',
      latency: 'Latency',
    },
    provider: {
      label: 'Provider configuration',
      embedding: 'Embedding',
      answer: 'Answer',
      api: 'API',
      apiNote: 'Docker local deployment',
    },
    modelConfig: {
      title: 'Model Configuration',
      subtitle: 'safe runtime status, no secrets exposed',
      embeddingModel: 'Embedding model',
      chatModel: 'LLM / chat model',
      localNote: 'Local hash embedding is free and model-download-free.',
      fallbackNote: 'Fallback chat does not call a hosted LLM.',
      configured: 'configured',
      missing: 'missing',
      noKeyRequired: 'no key required',
      deepseekKey: 'DeepSeek key',
      openaiKey: 'OpenAI key',
      jinaKey: 'Jina key',
      runtimeForm: 'Runtime override',
      embeddingProvider: 'Embedding provider',
      embeddingApiKey: 'Embedding API key',
      chatProvider: 'Chat provider',
      chatApiKey: 'Chat API key',
      save: 'Save runtime config',
      saving: 'Saving...',
      keyPlaceholder: 'optional, kept in backend memory',
      updated: 'Runtime config updated. Reset or re-ingest documents after changing embedding providers.',
      updateFailed: 'Runtime config update failed',
    },
    messages: {
      titleContentRequired: 'Title and content are required',
      requestFailed: 'Request failed',
      ingestFailed: 'Ingest failed',
      ingested: 'Document ingested',
      unsupportedFile: 'Only .md and .txt files are supported for this demo',
      fileLoaded: 'File loaded into ingest form',
      fileLoadFailed: 'File load failed',
      deleted: 'Document deleted',
      deleteFailed: 'Delete failed',
      reset: 'Demo data reset',
      resetFailed: 'Reset failed',
      backendUnavailable: 'Backend unavailable',
    },
    documents: {
      title: 'Knowledge Sources',
      refresh: 'Refresh',
      reset: 'Reset',
      delete: 'Delete',
      deleteLabel: 'Delete',
    },
    ingest: {
      title: 'Ingest Document',
      sourceHint: 'textarea or .md/.txt file',
      loadFile: 'Load File',
      docTitle: 'Title',
      language: 'Language',
      sourceUri: 'Source URI',
      content: 'Content',
      ingest: 'Ingest',
      working: 'Working...',
      options: {
        en: 'English',
        zh: 'Chinese',
        mixed: 'Mixed',
      },
    },
    query: {
      title: 'Ask With Citations',
      questionLabel: 'Question',
      topK: 'Top K',
      run: 'Run Query',
      querying: 'Querying...',
      citations: 'citations',
    },
    debug: {
      title: 'Retrieval Debug',
      subtitle: 'chunk source and score',
    },
    audit: {
      title: 'Audit Trail',
      recent: 'recent records',
    },
    architecture: {
      title: 'Architecture',
      subtitle: 'local-first RAG path',
      steps: [
        'React workspace loads source documents and user questions',
        'FastAPI validates requests and coordinates ingestion or retrieval',
        'PostgreSQL + pgvector stores document chunks and vector search state',
        'Embedding provider can run locally or switch to OpenAI/Jina',
        'Chat provider can use fallback extraction or DeepSeek answer generation',
        'Audit logs preserve query, citations, latency, and estimated cost',
      ],
    },
    testing: {
      title: 'Testing Notes',
      subtitle: 'recording-ready checks',
      notes: [
        'Docker backend smoke: /health, /config, /documents, /query',
        'Frontend quality gate: oxlint, TypeScript build, Vite production build',
        'Demo reset keeps recordings repeatable after manual document tests',
      ],
    },
    exampleQuestions: [
      'How should a remote team use approved AI tools?',
      'What makes this demo cheap enough to run locally?',
      'What signals matter for a China-friendly AI full-stack candidate?',
      '客户为什么关心 citations 和 audit logs？',
    ],
    defaultIngestTitle: 'Chinese-friendly Remote Hiring Memo',
    defaultIngestContent: `Chinese-friendly remote hiring memo

AI startup teams hiring from China should prefer async written collaboration, clear issue ownership, and contract-friendly workflows. A strong candidate can communicate in English text, ship frontend and backend slices, and document trade-offs without waiting for synchronous meetings.

For an AI full-stack demo, the most relevant signals are RAG implementation, vector retrieval, provider abstraction, audit logs, Docker-based local deployment, and a frontend that exposes the product workflow clearly.`,
  },
  zh: {
    languageToggle: 'EN',
    languageLabel: '切换到英文',
    eyebrow: '企业上下文层',
    headline: '面向内部知识库的可追溯 AI 回答。',
    checking: '检查中',
    embeddingFallback: '向量模型',
    chatFallback: '回答模型',
    metrics: {
      documents: '文档',
      chunks: '切片',
      manual: '手动导入',
      latency: '耗时',
    },
    provider: {
      label: 'Provider 配置',
      embedding: 'Embedding',
      answer: 'Answer',
      api: 'API',
      apiNote: 'Docker 本地部署',
    },
    modelConfig: {
      title: '模型配置',
      subtitle: '安全运行状态，不暴露密钥',
      embeddingModel: 'Embedding 模型',
      chatModel: '大模型 / Chat 模型',
      localNote: '本地 hash embedding 免费运行，不需要下载模型。',
      fallbackNote: 'Fallback chat 不会调用托管大模型。',
      configured: '已配置',
      missing: '未配置',
      noKeyRequired: '不需要 key',
      deepseekKey: 'DeepSeek key',
      openaiKey: 'OpenAI key',
      jinaKey: 'Jina key',
      runtimeForm: '运行时覆盖',
      embeddingProvider: 'Embedding provider',
      embeddingApiKey: 'Embedding API key',
      chatProvider: 'Chat provider',
      chatApiKey: 'Chat API key',
      save: '保存运行时配置',
      saving: '保存中...',
      keyPlaceholder: '可选，仅保存在后端内存',
      updated: '运行时配置已更新。切换 embedding provider 后请 Reset 或重新导入文档。',
      updateFailed: '运行时配置更新失败',
    },
    messages: {
      titleContentRequired: '标题和内容不能为空',
      requestFailed: '请求失败',
      ingestFailed: '导入失败',
      ingested: '文档已导入',
      unsupportedFile: '这个 demo 只支持 .md 和 .txt 文件',
      fileLoaded: '文件已加载到导入表单',
      fileLoadFailed: '文件读取失败',
      deleted: '文档已删除',
      deleteFailed: '删除失败',
      reset: 'Demo 数据已重置',
      resetFailed: '重置失败',
      backendUnavailable: '后端不可用',
    },
    documents: {
      title: '知识来源',
      refresh: '刷新',
      reset: '重置',
      delete: '删除',
      deleteLabel: '删除',
    },
    ingest: {
      title: '导入文档',
      sourceHint: '文本框或 .md/.txt 文件',
      loadFile: '加载文件',
      docTitle: '标题',
      language: '语言',
      sourceUri: '来源 URI',
      content: '内容',
      ingest: '导入',
      working: '处理中...',
      options: {
        en: '英文',
        zh: '中文',
        mixed: '中英混合',
      },
    },
    query: {
      title: '带引用问答',
      questionLabel: '问题',
      topK: 'Top K',
      run: '开始查询',
      querying: '查询中...',
      citations: '条引用',
    },
    debug: {
      title: '检索调试',
      subtitle: '切片来源和分数',
    },
    audit: {
      title: '审计日志',
      recent: '条最近记录',
    },
    architecture: {
      title: '架构',
      subtitle: '本地优先 RAG 路径',
      steps: [
        'React 工作台加载来源文档和用户问题',
        'FastAPI 校验请求并协调导入或检索流程',
        'PostgreSQL + pgvector 存储文档切片和向量检索状态',
        'Embedding provider 可以本地运行，也可以切换到 OpenAI/Jina',
        'Chat provider 可以使用 fallback 摘录，或切换 DeepSeek 生成答案',
        '审计日志记录 query、引用、耗时和成本估算',
      ],
    },
    testing: {
      title: '测试说明',
      subtitle: '录屏前检查项',
      notes: [
        'Docker 后端冒烟测试：/health、/config、/documents、/query',
        '前端质量门：oxlint、TypeScript build、Vite production build',
        'Demo reset 让手动导入测试后的录屏可以重复执行',
      ],
    },
    exampleQuestions: [
      '远程团队应该如何使用经过批准的 AI 工具？',
      '这个 demo 为什么可以低成本本地运行？',
      '中国友好的 AI 全栈候选人需要哪些信号？',
      '客户为什么关心 citations 和 audit logs？',
    ],
    defaultIngestTitle: '中国友好的远程招聘备忘录',
    defaultIngestContent: `中国友好的远程招聘备忘录

招聘中国远程工程师的 AI 创业团队，应该重点考察异步文字沟通、清晰的问题 ownership，以及跨前端、后端和 AI provider 边界交付完整切片的能力。

对 AI 全栈 demo 来说，最有价值的信号包括 RAG 实现、向量检索、provider 抽象、审计日志、Docker 本地部署，以及能把产品工作流清晰展示出来的前端。`,
  },
} as const

type Health = {
  status: string
  embedding_provider: string
  chat_provider: string
}

type RuntimeConfig = {
  api_base_url: string
  embedding_provider: string
  embedding_model: string
  chat_provider: string
  chat_model: string
  supported_embedding_providers: string[]
  supported_chat_providers: string[]
  provider_key_status: Record<string, boolean>
  default_top_k: number
}

type RuntimeConfigUpdate = {
  embedding_provider: string
  embedding_model: string
  embedding_api_key?: string
  chat_provider: string
  chat_model: string
  chat_api_key?: string
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
  const [locale, setLocale] = useState<Locale>('en')
  const copy = COPY[locale]
  const [health, setHealth] = useState<Health | null>(null)
  const [config, setConfig] = useState<RuntimeConfig | null>(null)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [question, setQuestion] = useState<string>(COPY.en.exampleQuestions[0])
  const [topK, setTopK] = useState(4)
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [ingestTitle, setIngestTitle] = useState<string>(COPY.en.defaultIngestTitle)
  const [ingestLanguage, setIngestLanguage] = useState('en')
  const [ingestContent, setIngestContent] = useState<string>(COPY.en.defaultIngestContent)
  const [ingestSourceUri, setIngestSourceUri] = useState('manual://recording-memo')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [embeddingProvider, setEmbeddingProvider] = useState('local')
  const [embeddingModel, setEmbeddingModel] = useState('local-hash-384')
  const [embeddingApiKey, setEmbeddingApiKey] = useState('')
  const [chatProvider, setChatProvider] = useState('fallback')
  const [chatModel, setChatModel] = useState('extractive-fallback')
  const [chatApiKey, setChatApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [mutating, setMutating] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)
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
    setEmbeddingProvider(nextConfig.embedding_provider)
    setEmbeddingModel(nextConfig.embedding_model)
    setChatProvider(nextConfig.chat_provider)
    setChatModel(nextConfig.chat_model)
    setDocuments(nextDocuments)
    setAuditLogs(nextLogs)
  }

  function toggleLocale() {
    const nextLocale: Locale = locale === 'en' ? 'zh' : 'en'
    const oldCopy = COPY[locale]
    const nextCopy = COPY[nextLocale]
    const currentQuestionIndex = oldCopy.exampleQuestions.findIndex((example) => example === question)
    if (currentQuestionIndex >= 0) {
      setQuestion(nextCopy.exampleQuestions[currentQuestionIndex])
    }
    if (ingestTitle === oldCopy.defaultIngestTitle) {
      setIngestTitle(nextCopy.defaultIngestTitle)
    }
    if (ingestContent === oldCopy.defaultIngestContent) {
      setIngestContent(nextCopy.defaultIngestContent)
    }
    setLocale(nextLocale)
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
      setError(err instanceof Error ? err.message : copy.messages.requestFailed)
    } finally {
      setLoading(false)
    }
  }

  async function ingestDocument() {
    if (!ingestTitle.trim() || !ingestContent.trim()) {
      setError(copy.messages.titleContentRequired)
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
      setNotice(copy.messages.ingested)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.messages.ingestFailed)
    } finally {
      setMutating(false)
    }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return
    const supported = file.name.endsWith('.md') || file.name.endsWith('.txt')
    if (!supported) {
      setError(copy.messages.unsupportedFile)
      return
    }
    const content = await file.text()
    setSelectedFileName(file.name)
    setIngestTitle(file.name.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' '))
    setIngestContent(content)
    setIngestSourceUri(`file://${file.name}`)
    setNotice(copy.messages.fileLoaded)
    setError(null)
  }

  async function deleteDocument(documentId: string) {
    setMutating(true)
    setError(null)
    setNotice(null)
    try {
      await fetchJson(`/documents/${documentId}`, { method: 'DELETE' })
      setNotice(copy.messages.deleted)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.messages.deleteFailed)
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
      setNotice(copy.messages.reset)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.messages.resetFailed)
    } finally {
      setMutating(false)
    }
  }

  async function saveRuntimeConfig() {
    setConfigSaving(true)
    setError(null)
    setNotice(null)
    const payload: RuntimeConfigUpdate = {
      embedding_provider: embeddingProvider,
      embedding_model: embeddingModel,
      chat_provider: chatProvider,
      chat_model: chatModel,
    }
    if (embeddingApiKey.trim()) {
      payload.embedding_api_key = embeddingApiKey.trim()
    }
    if (chatApiKey.trim()) {
      payload.chat_api_key = chatApiKey.trim()
    }
    try {
      const nextConfig = await fetchJson<RuntimeConfig>('/config', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      setConfig(nextConfig)
      setEmbeddingProvider(nextConfig.embedding_provider)
      setEmbeddingModel(nextConfig.embedding_model)
      setChatProvider(nextConfig.chat_provider)
      setChatModel(nextConfig.chat_model)
      setEmbeddingApiKey('')
      setChatApiKey('')
      setNotice(copy.modelConfig.updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.modelConfig.updateFailed)
    } finally {
      setConfigSaving(false)
    }
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : COPY.en.messages.backendUnavailable))
  }, [])

  return (
    <main className="workspace" lang={locale}>
      <section className="masthead">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
        </div>
        <div className="masthead-actions">
          <button
            type="button"
            className="language-toggle"
            aria-label={copy.languageLabel}
            onClick={toggleLocale}
          >
            {copy.languageToggle}
          </button>
          <div className="status-strip" aria-label="System status">
            <span className={health?.status === 'ok' ? 'status-dot ok' : 'status-dot'} />
            <span>{health?.status ?? copy.checking}</span>
            <span>{config?.embedding_provider ?? health?.embedding_provider ?? copy.embeddingFallback}</span>
            <span>{config?.chat_provider ?? health?.chat_provider ?? copy.chatFallback}</span>
          </div>
        </div>
      </section>

      <section className="metrics" aria-label="Demo metrics">
        <div>
          <strong>{documents.length}</strong>
          <span>{copy.metrics.documents}</span>
        </div>
        <div>
          <strong>{totalChunks}</strong>
          <span>{copy.metrics.chunks}</span>
        </div>
        <div>
          <strong>{manualDocuments}</strong>
          <span>{copy.metrics.manual}</span>
        </div>
        <div>
          <strong>{result?.latency_ms ?? latestAudit?.latency_ms ?? 0}ms</strong>
          <span>{copy.metrics.latency}</span>
        </div>
      </section>

      <section className="provider-bar" aria-label={copy.provider.label}>
        <div>
          <strong>{copy.provider.embedding}</strong>
          <span>{config?.embedding_provider ?? 'local'}</span>
          <em>{config?.embedding_model ?? 'local-hash-384'}</em>
        </div>
        <div>
          <strong>{copy.provider.answer}</strong>
          <span>{config?.chat_provider ?? 'fallback'}</span>
          <em>{config?.chat_model ?? 'extractive-fallback'}</em>
        </div>
        <div>
          <strong>{copy.provider.api}</strong>
          <span>{config?.api_base_url ?? API_BASE_URL}</span>
          <em>{copy.provider.apiNote}</em>
        </div>
      </section>

      <section className="model-config" aria-label={copy.modelConfig.title}>
        <div className="panel-title">
          <h2>{copy.modelConfig.title}</h2>
          <span>{copy.modelConfig.subtitle}</span>
        </div>
        <div className="model-grid">
          <article>
            <strong>{copy.modelConfig.embeddingModel}</strong>
            <span>{config?.embedding_model ?? 'local-hash-384'}</span>
            <p>{copy.modelConfig.localNote}</p>
          </article>
          <article>
            <strong>{copy.modelConfig.chatModel}</strong>
            <span>{config?.chat_model ?? 'extractive-fallback'}</span>
            <p>{copy.modelConfig.fallbackNote}</p>
          </article>
          <article>
            <strong>{copy.modelConfig.deepseekKey}</strong>
            <span className={config?.provider_key_status.deepseek_chat ? 'key-ok' : 'key-missing'}>
              {config?.provider_key_status.deepseek_chat
                ? copy.modelConfig.configured
                : copy.modelConfig.missing}
            </span>
            <p>chat=deepseek</p>
          </article>
          <article>
            <strong>{copy.modelConfig.openaiKey}</strong>
            <span className={config?.provider_key_status.openai_embedding ? 'key-ok' : 'key-missing'}>
              {config?.provider_key_status.openai_embedding
                ? copy.modelConfig.configured
                : copy.modelConfig.missing}
            </span>
            <p>provider=openai</p>
          </article>
          <article>
            <strong>{copy.modelConfig.jinaKey}</strong>
            <span className={config?.provider_key_status.jina_embedding ? 'key-ok' : 'key-missing'}>
              {config?.provider_key_status.jina_embedding
                ? copy.modelConfig.configured
                : copy.modelConfig.missing}
            </span>
            <p>provider=jina</p>
          </article>
          <article>
            <strong>Fallback</strong>
            <span className="key-ok">{copy.modelConfig.noKeyRequired}</span>
            <p>chat=fallback</p>
          </article>
        </div>
        <div className="runtime-form">
          <div className="runtime-title">
            <h3>{copy.modelConfig.runtimeForm}</h3>
            <span>{copy.modelConfig.subtitle}</span>
          </div>
          <div className="runtime-fields">
            <label>
              <span>{copy.modelConfig.embeddingProvider}</span>
              <select
                value={embeddingProvider}
                onChange={(event) => {
                  const provider = event.target.value
                  setEmbeddingProvider(provider)
                  if (provider === 'local') setEmbeddingModel('local-hash-384')
                  if (provider === 'openai') setEmbeddingModel('text-embedding-3-small')
                  if (provider === 'jina') setEmbeddingModel('jina-embeddings-v3')
                }}
              >
                <option value="local">local</option>
                <option value="openai">openai</option>
                <option value="jina">jina</option>
              </select>
            </label>
            <label>
              <span>{copy.modelConfig.embeddingModel}</span>
              <input value={embeddingModel} onChange={(event) => setEmbeddingModel(event.target.value)} />
            </label>
            <label>
              <span>{copy.modelConfig.embeddingApiKey}</span>
              <input
                type="password"
                value={embeddingApiKey}
                placeholder={copy.modelConfig.keyPlaceholder}
                onChange={(event) => setEmbeddingApiKey(event.target.value)}
              />
            </label>
            <label>
              <span>{copy.modelConfig.chatProvider}</span>
              <select
                value={chatProvider}
                onChange={(event) => {
                  const provider = event.target.value
                  setChatProvider(provider)
                  setChatModel(provider === 'deepseek' ? 'deepseek-chat' : 'extractive-fallback')
                }}
              >
                <option value="fallback">fallback</option>
                <option value="deepseek">deepseek</option>
              </select>
            </label>
            <label>
              <span>{copy.modelConfig.chatModel}</span>
              <input value={chatModel} onChange={(event) => setChatModel(event.target.value)} />
            </label>
            <label>
              <span>{copy.modelConfig.chatApiKey}</span>
              <input
                type="password"
                value={chatApiKey}
                placeholder={copy.modelConfig.keyPlaceholder}
                onChange={(event) => setChatApiKey(event.target.value)}
              />
            </label>
          </div>
          <button type="button" className="primary runtime-save" onClick={saveRuntimeConfig} disabled={configSaving}>
            {configSaving ? copy.modelConfig.saving : copy.modelConfig.save}
          </button>
        </div>
      </section>

      {(error || notice) && (
        <section className={error ? 'message error' : 'message notice'}>{error ?? notice}</section>
      )}

      <section className="grid">
        <div className="left-column">
          <aside className="panel documents-panel">
            <div className="panel-title">
              <h2>{copy.documents.title}</h2>
              <div className="button-row compact">
                <button type="button" onClick={() => refresh().catch(() => undefined)}>
                  {copy.documents.refresh}
                </button>
                <button type="button" onClick={resetDemo} disabled={mutating}>
                  {copy.documents.reset}
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
                        aria-label={`${copy.documents.deleteLabel} ${document.title}`}
                        onClick={() => deleteDocument(document.id)}
                        disabled={mutating}
                      >
                        {copy.documents.delete}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <section className="panel ingest-panel">
            <div className="panel-title">
              <h2>{copy.ingest.title}</h2>
              <span>{selectedFileName ?? copy.ingest.sourceHint}</span>
            </div>
            <div className="form-grid">
              <label className="full file-loader">
                <span>{copy.ingest.loadFile}</span>
                <input
                  type="file"
                  accept=".md,.txt,text/markdown,text/plain"
                  onChange={(event) => {
                    loadFile(event.target.files?.[0]).catch((err) => {
                      setError(err instanceof Error ? err.message : copy.messages.fileLoadFailed)
                    })
                  }}
                />
              </label>
              <label>
                <span>{copy.ingest.docTitle}</span>
                <input value={ingestTitle} onChange={(event) => setIngestTitle(event.target.value)} />
              </label>
              <label>
                <span>{copy.ingest.language}</span>
                <select
                  value={ingestLanguage}
                  onChange={(event) => setIngestLanguage(event.target.value)}
                >
                  <option value="en">{copy.ingest.options.en}</option>
                  <option value="zh">{copy.ingest.options.zh}</option>
                  <option value="mixed">{copy.ingest.options.mixed}</option>
                </select>
              </label>
              <label className="full">
                <span>{copy.ingest.sourceUri}</span>
                <input
                  value={ingestSourceUri}
                  onChange={(event) => setIngestSourceUri(event.target.value)}
                />
              </label>
              <label className="full">
                <span>{copy.ingest.content}</span>
                <textarea
                  value={ingestContent}
                  onChange={(event) => setIngestContent(event.target.value)}
                  aria-label={copy.ingest.content}
                />
              </label>
              <button type="button" className="primary wide" onClick={ingestDocument} disabled={mutating}>
                {mutating ? copy.ingest.working : copy.ingest.ingest}
              </button>
            </div>
          </section>
        </div>

        <section className="panel query-panel">
          <div className="panel-title">
            <h2>{copy.query.title}</h2>
            <span className="api-url">{API_BASE_URL}</span>
          </div>
          <div className="examples">
            {copy.exampleQuestions.map((example) => (
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
            aria-label={copy.query.questionLabel}
          />
          <div className="query-actions">
            <label>
              <span>{copy.query.topK}</span>
              <input
                type="number"
                min="1"
                max="12"
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
              />
            </label>
            <button type="button" className="primary" onClick={() => askQuestion()} disabled={loading}>
              {loading ? copy.query.querying : copy.query.run}
            </button>
          </div>
          {result ? (
            <div className="answer">
              <div className="answer-meta">
                <span>{result.latency_ms}ms</span>
                <span>${result.estimated_cost_usd.toFixed(6)}</span>
                <span>
                  {result.citations.length} {copy.query.citations}
                </span>
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
                  <h3>{copy.debug.title}</h3>
                  <span>{copy.debug.subtitle}</span>
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
          <h2>{copy.audit.title}</h2>
          <span>
            {auditLogs.length} {copy.audit.recent}
          </span>
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
            <h2>{copy.architecture.title}</h2>
            <span>{copy.architecture.subtitle}</span>
          </div>
          <ol>
            {copy.architecture.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel info-panel">
          <div className="panel-title">
            <h2>{copy.testing.title}</h2>
            <span>{copy.testing.subtitle}</span>
          </div>
          <ul>
            {copy.testing.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App

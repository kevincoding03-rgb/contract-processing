import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageCircle, FileText, Upload, X, Trash2, Bot, User } from 'lucide-react'
import { chat as chatApi } from '../api/client'
import { useLanguage } from '../i18n'

export default function Chat() {
  const { t } = useLanguage()

  const MODE_TABS = [
    { key: 'none', label: t('modeGeneral'), icon: MessageCircle },
    { key: 'paste', label: t('modePaste'), icon: FileText },
    { key: 'upload', label: t('modeUpload'), icon: Upload },
  ]

  const EXAMPLE_QUESTIONS = [
    t('exampleQ1'),
    t('exampleQ2'),
    t('exampleQ3'),
    t('exampleQ4'),
  ]

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('none')
  const [context, setContext] = useState('')
  const [uploadName, setUploadName] = useState('')

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text) => {
    const question = (text ?? input).trim()
    if (!question || loading) return

    const userMsg = { role: 'user', content: question }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const data = await chatApi(
        history.map((m) => ({ role: m.role, content: m.content })),
        mode !== 'none' ? context : ''
      )
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message || t('answerFailed'), isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleUploadFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (ext !== 'txt') {
      alert(t('chatUploadError'))
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setContext(ev.target.result)
      setUploadName(f.name)
      setMode('upload')
    }
    reader.readAsText(f)
  }

  const clearContext = () => {
    setContext('')
    setUploadName('')
    setMode('none')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearConversation = () => {
    if (messages.length === 0) return
    if (confirm(t('clearConfirm'))) {
      setMessages([])
    }
  }

  const hasContext = mode !== 'none' && context.trim()

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('chatTitle')}</h1>
        <p className="text-gray-500">{t('chatSubtitle')}</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {MODE_TABS.map((tab) => {
              const Icon = tab.icon
              const active = mode === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMode(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          {hasContext && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <FileText className="w-4 h-4" />
              <span>
                {mode === 'upload' ? uploadName : t('pastedContract')}（{t('chars', { count: context.length })}）
              </span>
              <button type="button" onClick={clearContext} className="hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {mode === 'paste' && (
          <textarea
            value={mode === 'paste' ? context : ''}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t('pastePlaceholder')}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-y"
            rows={5}
          />
        )}

        {mode === 'upload' && (
          <div className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleUploadFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              {t('selectTxtFile')}
            </button>
            <p className="text-xs text-gray-400 mt-1">
              {t('txtOnlyTip')}
            </p>
          </div>
        )}
      </div>

      <div className="card flex flex-col" style={{ minHeight: '400px' }}>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-gray-900">{t('chatTitleBar')}</span>
            {hasContext && (
              <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                {t('basedOnContract')}
              </span>
            )}
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('clearChat')}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: '500px' }}>
          {messages.length === 0 && !loading && (
            <div className="text-center py-10">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">{t('startChat')}</p>
              <div className="flex flex-col items-center gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors max-w-md"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatPlaceholder')}
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="btn-primary flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              {t('send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-gray-200' : isError ? 'bg-red-100' : 'bg-primary-100'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-gray-600" />
        ) : (
          <Bot className={`w-5 h-5 ${isError ? 'text-red-500' : 'text-primary-600'}`} />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : isError
            ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Bot, Send, RotateCcw, Plus, Trash2, Check, ChevronDown } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES = [
  {
    id: 1,
    trigger: 'password reset',
    response: "To reset your password, go to the login page and click **Forgot Password**. You'll receive an email within 2 minutes. If you don't see it, check your spam folder.",
    enabled: true,
  },
  {
    id: 2,
    trigger: 'refund',
    response: "We process refunds within 5–7 business days back to your original payment method. Please share your order number and we'll get that started for you right away.",
    enabled: true,
  },
  {
    id: 3,
    trigger: 'cancel subscription',
    response: "To cancel your subscription, go to **Settings → Billing → Cancel Plan**. Your access will continue until the end of the current billing period.",
    enabled: true,
  },
  {
    id: 4,
    trigger: 'api rate limit',
    response: "Our API allows 1,000 requests per minute on the Growth plan and 10,000 on Enterprise. You can monitor your usage in the API dashboard. Would you like to upgrade?",
    enabled: false,
  },
  {
    id: 5,
    trigger: 'invoice',
    response: "You can view and download all your invoices from **Settings → Billing → Invoice History**. PDFs are generated automatically for each payment.",
    enabled: true,
  },
]

const KB_SOURCES = [
  { id: 1, name: 'Getting Started', articleCount: 8 },
  { id: 2, name: 'Account & Billing', articleCount: 12 },
  { id: 3, name: 'Troubleshooting', articleCount: 15 },
  { id: 4, name: 'API Reference', articleCount: 9 },
]

const INITIAL_MESSAGES = [
  { role: 'user',  body: "Hi, I can't log into my account." },
  { role: 'bot',   body: "Hi there! I'm sorry to hear that. To help you log in, could you tell me if you're seeing a specific error message?" },
  { role: 'user',  body: "It says my password is incorrect." },
  { role: 'bot',   body: "Got it! You can reset your password by clicking **Forgot Password** on the login page. You'll receive a reset email within 2 minutes. Shall I walk you through it?" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AIAutoReplyPage() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [confidence, setConfidence] = useState(75)
  const [selectedKB, setSelectedKB] = useState([1, 2, 3])
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES)
  const [saved, setSaved] = useState(false)

  function toggleKB(id) {
    setSelectedKB(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleTemplate(id) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  function deleteTemplate(id) {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  function sendTestMessage() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', body: chatInput }
    const botMsg = { role: 'bot', body: `🤖 AI is processing: "${chatInput}"\n\nBased on your knowledge base, here's a suggested response: This appears to be a common support query. I'm checking relevant articles to provide you with the most accurate answer...` }
    setChatMessages(prev => [...prev, userMsg, botMsg])
    setChatInput('')
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SupportLayout>
      <Header title="AI Auto-Reply" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Auto-Reply
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Automate responses using your knowledge base and templates</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: '#A855F7' }}
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — settings */}
          <div className="space-y-5">

            {/* Enable toggle */}
            <ConfigCard title="AI Auto-Reply">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Enable AI Auto-Reply</p>
                  <p className="text-xs text-gray-400 mt-0.5">AI will attempt to reply to incoming messages automatically</p>
                </div>
                <Toggle enabled={aiEnabled} onChange={setAiEnabled} />
              </div>

              {aiEnabled && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-500">Confidence Threshold</label>
                    <span className="text-xs font-semibold text-purple-600">{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Only auto-reply when AI confidence is above {confidence}%. Lower = more replies, higher = more accuracy.
                  </p>
                </div>
              )}
            </ConfigCard>

            {/* KB Sources */}
            <ConfigCard title="Knowledge Base Sources">
              <p className="text-xs text-gray-400 mb-3">Select which KB categories the AI can use as context</p>
              <div className="space-y-2">
                {KB_SOURCES.map(src => (
                  <label key={src.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedKB.includes(src.id)}
                        onChange={() => toggleKB(src.id)}
                        className="rounded accent-purple-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{src.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{src.articleCount} articles</span>
                  </label>
                ))}
              </div>
            </ConfigCard>

            {/* Templates */}
            <ConfigCard
              title="Response Templates"
              action={
                <button
                  onClick={() => setEditingTemplate({ id: Date.now(), trigger: '', response: '', enabled: true })}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              }
            >
              <p className="text-xs text-gray-400 mb-3">Keyword-triggered canned responses for common questions</p>
              <div className="space-y-2">
                {templates.map(tmpl => (
                  <div key={tmpl.id} className={cn(
                    'rounded-lg border p-3 transition-colors',
                    tmpl.enabled
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-gray-100 dark:border-gray-800 opacity-50'
                  )}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Toggle enabled={tmpl.enabled} onChange={() => toggleTemplate(tmpl.id)} small />
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                          {tmpl.trigger}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTemplate(tmpl.id)}
                        className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pl-8">{tmpl.response}</p>
                  </div>
                ))}
              </div>
            </ConfigCard>

          </div>

          {/* Right — test chat */}
          <div>
            <ConfigCard title="Test AI Replies">
              <p className="text-xs text-gray-400 mb-3">Simulate incoming messages to test your AI configuration</p>

              {/* Chat history */}
              <div className="h-72 overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-3 space-y-3 mb-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn(
                      'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
                      msg.role === 'bot' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600'
                    )}>
                      {msg.role === 'bot' ? '🤖' : 'U'}
                    </div>
                    <div className={cn(
                      'rounded-2xl px-3 py-2 text-xs max-w-[80%] whitespace-pre-wrap',
                      msg.role === 'bot'
                        ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-sm shadow-sm'
                        : 'text-white rounded-tr-sm'
                    )}
                    style={msg.role === 'user' ? { backgroundColor: '#A855F7' } : {}}>
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendTestMessage()}
                  placeholder="Type a test customer message…"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={sendTestMessage}
                  className="px-3 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#A855F7' }}
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChatMessages(INITIAL_MESSAGES)}
                  className="px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  title="Reset chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Auto-resolved today', value: '47' },
                  { label: 'Avg confidence',       value: '82%' },
                  { label: 'Escalated to human',   value: '8' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

            </ConfigCard>
          </div>
        </div>

      </div>
    </SupportLayout>
  )
}

function ConfigCard({ title, children, action }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Toggle({ enabled, onChange, small = false }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative rounded-full transition-colors shrink-0',
        small ? 'w-8 h-4' : 'w-10 h-5',
        enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform',
        small ? 'w-3 h-3' : 'w-4 h-4',
        enabled && (small ? 'translate-x-4' : 'translate-x-5')
      )} />
    </button>
  )
}

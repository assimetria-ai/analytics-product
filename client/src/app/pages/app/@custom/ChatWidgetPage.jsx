import { useState } from 'react'
import { Copy, Check, Code2 } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { ChatWidgetPreview } from '../../../components/@custom/ChatWidgetPreview'
import { cn } from '../../../lib/@system/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#A855F7', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#EC4899', '#6366F1',
]

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left',  label: 'Bottom Left' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ChatWidgetPage() {
  const [config, setConfig] = useState({
    color: '#A855F7',
    greeting: 'Hi there! 👋 How can we help you today?',
    agentName: 'Support Team',
    position: 'bottom-right',
    officeHoursEnabled: true,
    officeStart: '09:00',
    officeEnd: '18:00',
    offlineDays: ['Sat', 'Sun'],
    offlineMessage: "We're offline right now. Leave a message and we'll get back to you soon!",
    launcherText: 'Chat with us',
    showLauncherText: true,
  })

  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(key, value) {
    setConfig(c => ({ ...c, [key]: value }))
  }

  function toggleOfflineDay(day) {
    setConfig(c => ({
      ...c,
      offlineDays: c.offlineDays.includes(day)
        ? c.offlineDays.filter(d => d !== day)
        : [...c.offlineDays, day],
    }))
  }

  const embedCode = `<script>
  window.SupportWidget = ${JSON.stringify({ color: config.color, position: config.position, greeting: config.greeting }, null, 2)};
</script>
<script src="https://widget.yoursupport.app/loader.js" async></script>`

  function handleCopy() {
    navigator.clipboard.writeText(embedCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SupportLayout>
      <Header title="Chat Widget" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chat Widget</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure your live chat widget and embed it on your site</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#A855F7' }}
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Config panel */}
          <div className="space-y-6">

            {/* Appearance */}
            <Section title="Appearance">
              <Field label="Brand Color">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => update('color', c)}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all',
                          config.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={config.color}
                    onChange={e => update('color', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </Field>

              <Field label="Widget Position">
                <div className="flex gap-2">
                  {POSITION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('position', opt.value)}
                      className={cn(
                        'flex-1 py-2 text-sm rounded-lg border transition-colors',
                        config.position === opt.value
                          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Launcher Text">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={config.launcherText}
                    onChange={e => update('launcherText', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showLauncherText}
                      onChange={e => update('showLauncherText', e.target.checked)}
                      className="rounded accent-purple-600"
                    />
                    Show
                  </label>
                </div>
              </Field>
            </Section>

            {/* Messaging */}
            <Section title="Messaging">
              <Field label="Agent / Team Name">
                <input
                  type="text"
                  value={config.agentName}
                  onChange={e => update('agentName', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </Field>

              <Field label="Greeting Message">
                <textarea
                  value={config.greeting}
                  onChange={e => update('greeting', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              </Field>

              <Field label="Offline Message">
                <textarea
                  value={config.offlineMessage}
                  onChange={e => update('offlineMessage', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              </Field>
            </Section>

            {/* Office hours */}
            <Section title="Office Hours">
              <Field label="">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => update('officeHoursEnabled', !config.officeHoursEnabled)}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors cursor-pointer',
                      config.officeHoursEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      config.officeHoursEnabled && 'translate-x-5'
                    )} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable office hours</span>
                </label>
              </Field>

              {config.officeHoursEnabled && (
                <>
                  <Field label="Hours">
                    <div className="flex items-center gap-3">
                      <input type="time" value={config.officeStart} onChange={e => update('officeStart', e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={config.officeEnd} onChange={e => update('officeEnd', e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none" />
                    </div>
                  </Field>
                  <Field label="Offline Days">
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleOfflineDay(day)}
                          className={cn(
                            'px-3 py-1 text-xs rounded-lg border transition-colors',
                            config.offlineDays.includes(day)
                              ? 'border-red-300 bg-red-50 text-red-600 font-medium'
                              : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}
            </Section>

            {/* Embed code */}
            <Section title="Install">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Paste this snippet before <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;/body&gt;</code> on your website.</p>
              <div className="relative">
                <pre className="rounded-xl bg-gray-900 text-green-400 text-xs p-4 overflow-x-auto leading-relaxed">
                  {embedCode}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </Section>

          </div>

          {/* Right — Live preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h2>
            </div>
            <div className="sticky top-6">
              <ChatWidgetPreview config={config} />
              <p className="text-xs text-center text-gray-400 mt-3">Changes reflect in real-time</p>
            </div>
          </div>
        </div>

      </div>
    </SupportLayout>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>}
      {children}
    </div>
  )
}

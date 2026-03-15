import { useState } from 'react'
import { Plus, Trash2, Check, Users, Bell, GitBranch, Clock } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_RULES = [
  { id: 1, name: 'Critical Priority → Senior Agent', trigger: 'priority', triggerValue: 'critical', action: 'assign-agent', actionValue: 'Dana K.', enabled: true },
  { id: 2, name: 'Billing Keywords → Billing Team',   trigger: 'keyword',  triggerValue: 'billing, invoice, charge, refund', action: 'assign-team', actionValue: 'Billing', enabled: true },
  { id: 3, name: 'Wait > 10min → Any Available',      trigger: 'wait-time', triggerValue: '10',     action: 'notify-all',  actionValue: '',        enabled: true },
  { id: 4, name: 'AI Low Confidence → Human',         trigger: 'ai-confidence', triggerValue: '50', action: 'assign-agent', actionValue: 'Sam R.', enabled: false },
  { id: 5, name: 'VIP Customer → Priority Queue',     trigger: 'tag',      triggerValue: 'vip',    action: 'assign-team', actionValue: 'VIP Support', enabled: true },
]

const AGENTS = [
  { id: 1, name: 'Sam Rivera',   role: 'Support Agent',   status: 'online',  tickets: 5,  avatar: 'SR' },
  { id: 2, name: 'Dana Kim',     role: 'Senior Agent',    status: 'online',  tickets: 3,  avatar: 'DK' },
  { id: 3, name: 'Mike Torres',  role: 'Support Agent',   status: 'busy',    tickets: 8,  avatar: 'MT' },
  { id: 4, name: 'Priya Patel',  role: 'Support Lead',    status: 'online',  tickets: 2,  avatar: 'PP' },
  { id: 5, name: 'Chris Lee',    role: 'Support Agent',   status: 'offline', tickets: 0,  avatar: 'CL' },
  { id: 6, name: 'Anna Johansson', role: 'Support Agent', status: 'online',  tickets: 6,  avatar: 'AJ' },
]

const TRIGGER_TYPES = [
  { value: 'priority',       label: 'Ticket Priority' },
  { value: 'keyword',        label: 'Message Contains' },
  { value: 'wait-time',      label: 'Wait Time (minutes)' },
  { value: 'ai-confidence',  label: 'AI Confidence Below (%)' },
  { value: 'tag',            label: 'Customer Tag' },
  { value: 'channel',        label: 'Channel' },
]

const NOTIF_CHANNELS = [
  { id: 'email', label: 'Email', enabled: true },
  { id: 'slack', label: 'Slack', enabled: true },
  { id: 'push',  label: 'Push Notification', enabled: false },
  { id: 'sms',   label: 'SMS',  enabled: false },
]

const STATUS_COLORS = {
  online:  'bg-green-400',
  busy:    'bg-yellow-400',
  offline: 'bg-gray-300',
}

const STATUS_LABELS = {
  online:  'Online',
  busy:    'Busy',
  offline: 'Offline',
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HumanEscalationPage() {
  const [rules, setRules] = useState(INITIAL_RULES)
  const [notifChannels, setNotifChannels] = useState(NOTIF_CHANNELS)
  const [roundRobin, setRoundRobin] = useState(true)
  const [maxQueueDepth, setMaxQueueDepth] = useState(15)
  const [saved, setSaved] = useState(false)

  function toggleRule(id) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  function deleteRule(id) {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  function addRule() {
    setRules(prev => [...prev, {
      id: Date.now(),
      name: 'New Rule',
      trigger: 'keyword',
      triggerValue: '',
      action: 'assign-agent',
      actionValue: '',
      enabled: true,
    }])
  }

  function toggleNotif(id) {
    setNotifChannels(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const onlineCount = AGENTS.filter(a => a.status === 'online').length
  const busyCount = AGENTS.filter(a => a.status === 'busy').length
  const totalTickets = AGENTS.reduce((s, a) => s + a.tickets, 0)

  return (
    <SupportLayout>
      <Header title="Human Escalation" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Human Escalation
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure routing rules, agent availability, and notifications</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Routing rules + routing config */}
          <div className="lg:col-span-2 space-y-5">

            {/* Escalation Rules */}
            <Panel
              icon={GitBranch}
              title="Escalation Rules"
              action={
                <button onClick={addRule} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Rule
                </button>
              }
            >
              <div className="space-y-2">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      rule.enabled
                        ? 'border-gray-200 dark:border-gray-700'
                        : 'border-gray-100 dark:border-gray-800 opacity-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule.id)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{rule.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              IF {TRIGGER_TYPES.find(t => t.value === rule.trigger)?.label || rule.trigger}
                              {rule.triggerValue ? ` = "${rule.triggerValue}"` : ''}
                            </span>
                            <span className="text-xs text-gray-400">→</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              {rule.action.replace(/-/g, ' ')}
                              {rule.actionValue ? ` "${rule.actionValue}"` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {rules.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No rules configured. Add one above.</p>
                )}
              </div>
            </Panel>

            {/* Routing Config */}
            <Panel icon={Clock} title="Routing Configuration">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Round-robin Assignment</p>
                    <p className="text-xs text-gray-400 mt-0.5">Distribute tickets equally across online agents</p>
                  </div>
                  <Toggle enabled={roundRobin} onChange={setRoundRobin} />
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Max Queue Depth</p>
                      <p className="text-xs text-gray-400 mt-0.5">Alert when queue exceeds this number</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{maxQueueDepth}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={maxQueueDepth}
                    onChange={e => setMaxQueueDepth(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5</span><span>50</span>
                  </div>
                </div>
              </div>
            </Panel>

          </div>

          {/* Right: Agent availability + notifications */}
          <div className="space-y-5">

            {/* Agent Availability */}
            <Panel icon={Users} title="Agent Availability">
              <div className="flex items-center gap-4 mb-3 text-xs">
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400" />{onlineCount} Online
                </span>
                <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />{busyCount} Busy
                </span>
                <span className="text-gray-400 ml-auto">{totalTickets} active</span>
              </div>

              <div className="space-y-2">
                {AGENTS.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                        {agent.avatar}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900', STATUS_COLORS[agent.status])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{agent.tickets}</p>
                      <p className="text-xs text-gray-400">tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Notifications */}
            <Panel icon={Bell} title="Escalation Notifications">
              <p className="text-xs text-gray-400 mb-3">Notify agents via these channels when escalation triggers</p>
              <div className="space-y-2">
                {notifChannels.map(nc => (
                  <div key={nc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{nc.label}</span>
                    <Toggle enabled={nc.enabled} onChange={() => toggleNotif(nc.id)} small />
                  </div>
                ))}
              </div>
            </Panel>

          </div>
        </div>

      </div>
    </SupportLayout>
  )
}

function Panel({ icon: Icon, title, children, action }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
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

import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { ConversationList } from '../../../components/@custom/ConversationList'
import { MessageThread } from '../../../components/@custom/MessageThread'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  { id: 1, customer: 'Alice Chen',      email: 'alice@example.com',  channel: 'chat',   status: 'open',    lastMessage: "I can't access my dashboard at all.", lastMessageAt: new Date(Date.now() - 2 * 60000).toISOString(), unread: 2 },
  { id: 2, customer: 'Bob Martinez',    email: 'bob@acme.io',        channel: 'email',  status: 'open',    lastMessage: 'Payment keeps failing with card error.', lastMessageAt: new Date(Date.now() - 8 * 60000).toISOString(), unread: 1 },
  { id: 3, customer: 'Carla Diaz',      email: 'carla@startup.co',   channel: 'chat',   status: 'pending', lastMessage: 'Any update on the dark mode feature?', lastMessageAt: new Date(Date.now() - 22 * 60000).toISOString(), unread: 0 },
  { id: 4, customer: 'David Lee',       email: 'david@corp.net',     channel: 'social', status: 'open',    lastMessage: 'App is super slow on my iPhone 14.', lastMessageAt: new Date(Date.now() - 41 * 60000).toISOString(), unread: 3 },
  { id: 5, customer: 'Emma Wilson',     email: 'emma@finance.org',   channel: 'email',  status: 'resolved',lastMessage: 'Great, the export is working now. Thanks!', lastMessageAt: new Date(Date.now() - 60 * 60000).toISOString(), unread: 0 },
  { id: 6, customer: 'Frank Nguyen',    email: 'frank@dev.io',       channel: 'chat',   status: 'open',    lastMessage: 'I was charged twice for March.', lastMessageAt: new Date(Date.now() - 120 * 60000).toISOString(), unread: 1 },
  { id: 7, customer: 'Grace Kim',       email: 'grace@media.com',    channel: 'email',  status: 'resolved',lastMessage: 'Got it, adding members worked. Thank you.', lastMessageAt: new Date(Date.now() - 180 * 60000).toISOString(), unread: 0 },
  { id: 8, customer: 'Henry Park',      email: 'henry@saas.io',      channel: 'chat',   status: 'open',    lastMessage: 'Rate limit on API is blocking our integration.', lastMessageAt: new Date(Date.now() - 240 * 60000).toISOString(), unread: 2 },
  { id: 9, customer: 'Isla Torres',     email: 'isla@blog.net',      channel: 'email',  status: 'pending', lastMessage: 'Still not getting notification emails.', lastMessageAt: new Date(Date.now() - 300 * 60000).toISOString(), unread: 1 },
  { id: 10, customer: 'Jake Brown',     email: 'jake@build.co',      channel: 'social', status: 'resolved',lastMessage: 'Looks good now, charts are loading fine.', lastMessageAt: new Date(Date.now() - 360 * 60000).toISOString(), unread: 0 },
  { id: 11, customer: 'Kate Murphy',    email: 'kate@retail.com',    channel: 'chat',   status: 'open',    lastMessage: 'Need to cancel my subscription.', lastMessageAt: new Date(Date.now() - 420 * 60000).toISOString(), unread: 1 },
  { id: 12, customer: 'Liam Johnson',   email: 'liam@freelance.io',  channel: 'email',  status: 'open',    lastMessage: 'How do I export my data?', lastMessageAt: new Date(Date.now() - 480 * 60000).toISOString(), unread: 0 },
]

const MESSAGES_MAP = {
  1: [
    { id: 1, role: 'customer', body: 'Hi, I cannot access my dashboard at all.', sentAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 2, role: 'agent',    body: 'Hi Alice! Sorry to hear that. Can you describe what you see when you try to load it?', sentAt: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 3, role: 'customer', body: "It just shows a blank white screen after logging in. I've tried Chrome and Safari.", sentAt: new Date(Date.now() - 6 * 60000).toISOString() },
    { id: 4, role: 'agent',    body: "Thanks for that detail. Could you try opening the browser console and letting me know if there are any red errors? (Press F12 → Console tab)", sentAt: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: 5, role: 'customer', body: "I can't access my dashboard at all.", sentAt: new Date(Date.now() - 2 * 60000).toISOString() },
  ],
  2: [
    { id: 1, role: 'customer', body: 'My payment keeps failing with a card error even though my card is valid.', sentAt: new Date(Date.now() - 20 * 60000).toISOString() },
    { id: 2, role: 'agent',    body: "Hi Bob, I'm sorry about that! Can you share the last 4 digits of the card you're using?", sentAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 3, role: 'customer', body: 'Payment keeps failing with card error.', sentAt: new Date(Date.now() - 8 * 60000).toISOString() },
  ],
}

const CHANNEL_TABS = [
  { label: 'All',    value: 'all' },
  { label: 'Chat',   value: 'chat' },
  { label: 'Email',  value: 'email' },
  { label: 'Social', value: 'social' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export function InboxPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(CONVERSATIONS[0])

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter(c => {
      const matchesTab = activeTab === 'all' || c.channel === activeTab
      const matchesSearch = !search ||
        c.customer.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, search])

  const messages = MESSAGES_MAP[selected?.id] || []

  const unreadTotal = CONVERSATIONS.reduce((s, c) => s + c.unread, 0)

  return (
    <SupportLayout>
      <Header title="Inbox" />
      <div className="flex h-[calc(100vh-57px)]">

        {/* Left panel — conversation list */}
        <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Inbox
                {unreadTotal > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs">
                    {unreadTotal}
                  </span>
                )}
              </h1>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Channel tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {CHANNEL_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={[
                  'flex-1 py-2.5 text-xs font-medium transition-colors',
                  activeTab === tab.value
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">No conversations</div>
            ) : (
              <ConversationList
                conversations={filtered}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            )}
          </div>
        </div>

        {/* Right panel — message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          <MessageThread conversation={selected} messages={messages} />
        </div>

      </div>
    </SupportLayout>
  )
}

// @custom — Conversation list panel for Inbox
import { cn } from '@/app/lib/@system/utils'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const CHANNEL_COLORS = {
  chat: 'bg-purple-100 text-purple-700',
  email: 'bg-blue-100 text-blue-700',
  social: 'bg-pink-100 text-pink-700',
}

export function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={cn(
            'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
            selectedId === conv.id && 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                {conv.customer.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{conv.customer}</span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
          </div>
          <div className="flex items-center gap-2 pl-10">
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium shrink-0', CHANNEL_COLORS[conv.channel] || 'bg-gray-100 text-gray-600')}>
              {conv.channel}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
            {conv.unread > 0 && (
              <span className="ml-auto shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                {conv.unread}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

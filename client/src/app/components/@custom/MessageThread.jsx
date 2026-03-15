// @custom — Message thread panel for Inbox
import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function MessageThread({ conversation, messages }) {
  const [input, setInput] = useState('')

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm">Select a conversation to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300">
          {conversation.customer.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{conversation.customer}</p>
          <p className="text-xs text-gray-400">{conversation.email}</p>
        </div>
        <div className="ml-auto">
          <span className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            conversation.status === 'open' ? 'bg-green-100 text-green-700' :
            conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          )}>
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'agent' && 'flex-row-reverse')}>
            <div className={cn(
              'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
              msg.role === 'agent' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            )}>
              {msg.role === 'agent' ? 'A' : conversation.customer.charAt(0).toUpperCase()}
            </div>
            <div className={cn('max-w-[70%]', msg.role === 'agent' && 'items-end flex flex-col')}>
              <div className={cn(
                'rounded-2xl px-4 py-2.5 text-sm',
                msg.role === 'agent'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
              )}>
                {msg.body}
              </div>
              <p className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.sentAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <Smile className="h-4 w-4" />
            </button>
            <button
              className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#A855F7' }}
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

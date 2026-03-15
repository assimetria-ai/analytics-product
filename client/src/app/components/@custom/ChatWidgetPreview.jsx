// @custom — Live preview of chat widget configuration
import { MessageSquare, X, Send, Minus } from 'lucide-react'

export function ChatWidgetPreview({ config }) {
  const { color = '#A855F7', greeting = 'Hi there! How can we help?', position = 'bottom-right', agentName = 'Support' } = config

  const isLeft = position === 'bottom-left'

  return (
    <div className="relative h-[420px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Fake page background */}
      <div className="absolute inset-0 p-4 space-y-2 opacity-30">
        <div className="h-4 w-3/4 rounded bg-gray-300" />
        <div className="h-3 w-full rounded bg-gray-300" />
        <div className="h-3 w-5/6 rounded bg-gray-300" />
        <div className="h-3 w-2/3 rounded bg-gray-300" />
        <div className="h-16 w-full rounded-lg bg-gray-300 mt-4" />
        <div className="h-3 w-full rounded bg-gray-300 mt-2" />
        <div className="h-3 w-4/5 rounded bg-gray-300" />
      </div>

      {/* Chat window */}
      <div className={`absolute bottom-16 ${isLeft ? 'left-3' : 'right-3'} w-64 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">{agentName}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/80 text-[10px]">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-white/80 hover:text-white p-0.5 rounded">
              <Minus className="h-3 w-3" />
            </button>
            <button className="text-white/80 hover:text-white p-0.5 rounded">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="px-3 py-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: color }}>
              A
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 shadow-sm max-w-[80%]">
              {greeting}
            </div>
          </div>
          <div className="flex gap-2 flex-row-reverse">
            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-500 shrink-0" />
            <div className="rounded-2xl rounded-tr-sm px-3 py-1.5 text-xs text-white max-w-[80%]" style={{ backgroundColor: color }}>
              Hi! I need help with my order.
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: color }}>
              A
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 shadow-sm max-w-[80%]">
              Of course! Can you share your order number?
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-1.5">
          <input
            className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none px-2"
            placeholder="Type a message…"
            readOnly
          />
          <button className="p-1.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: color }}>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Launcher button */}
      <button
        className={`absolute bottom-4 ${isLeft ? 'left-4' : 'right-4'} w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white`}
        style={{ backgroundColor: color }}
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  )
}

// @custom — Single ticket table row
import { cn } from '@/app/lib/@system/utils'

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_STYLES = {
  open: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-500',
}

function SLABadge({ sla }) {
  const isBreached = sla === 'Breached'
  const isWarning = sla === 'Warning'
  return (
    <span className={cn(
      'text-xs font-medium px-2 py-0.5 rounded',
      isBreached ? 'bg-red-100 text-red-700' :
      isWarning ? 'bg-orange-100 text-orange-700' :
      'bg-green-100 text-green-700'
    )}>
      {sla}
    </span>
  )
}

export function TicketRow({ ticket, onClick }) {
  return (
    <tr
      onClick={() => onClick?.(ticket)}
      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 text-xs font-mono text-gray-500">#{ticket.id}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{ticket.subject}</p>
        <p className="text-xs text-gray-400 mt-0.5">{ticket.channel}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ticket.requester}</td>
      <td className="px-4 py-3">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.low)}>
          {ticket.priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', STATUS_STYLES[ticket.status] || STATUS_STYLES.open)}>
          {ticket.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ticket.assignee || '—'}</td>
      <td className="px-4 py-3"><SLABadge sla={ticket.sla} /></td>
    </tr>
  )
}

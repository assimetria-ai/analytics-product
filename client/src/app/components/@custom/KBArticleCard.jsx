// @custom — Knowledge Base article card
import { FileText, Clock, Eye, ChevronRight } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

const STATUS_STYLES = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-500',
  archived: 'bg-orange-100 text-orange-600',
}

export function KBArticleCard({ article, onClick }) {
  return (
    <div
      onClick={() => onClick?.(article)}
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-700 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
              {article.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{article.excerpt}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-purple-400 shrink-0 mt-1 transition-colors" />
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_STYLES[article.status] || STATUS_STYLES.draft)}>
          {article.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Eye className="h-3 w-3" />
          {article.views.toLocaleString()} views
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {article.readTime}
        </span>
        <span className="text-xs text-gray-400 ml-auto">{article.updatedAt}</span>
      </div>
    </div>
  )
}

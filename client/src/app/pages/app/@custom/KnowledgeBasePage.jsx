import { useState, useMemo } from 'react'
import { Search, Plus, BookOpen, ChevronRight, X, ArrowLeft, Save } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { KBArticleCard } from '../../../components/@custom/KBArticleCard'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 1, name: 'Getting Started',    icon: '🚀', articleCount: 8,  color: 'bg-purple-100 text-purple-700' },
  { id: 2, name: 'Account & Billing',  icon: '💳', articleCount: 12, color: 'bg-blue-100 text-blue-700' },
  { id: 3, name: 'Integrations',       icon: '🔗', articleCount: 6,  color: 'bg-green-100 text-green-700' },
  { id: 4, name: 'Troubleshooting',    icon: '🔧', articleCount: 15, color: 'bg-orange-100 text-orange-700' },
  { id: 5, name: 'API Reference',      icon: '⚙️', articleCount: 9,  color: 'bg-gray-100 text-gray-700' },
  { id: 6, name: 'Security & Privacy', icon: '🔐', articleCount: 5,  color: 'bg-red-100 text-red-700' },
]

const ARTICLES = [
  { id: 1, categoryId: 1, title: 'How to create your first project',         excerpt: 'Learn how to set up your workspace and create a new support project in under 5 minutes.', status: 'published', views: 3421, readTime: '3 min', updatedAt: 'Mar 12', author: 'Dana K.' },
  { id: 2, categoryId: 1, title: 'Inviting team members to your workspace',  excerpt: 'Add collaborators and manage roles to keep your team in sync and productive.', status: 'published', views: 2187, readTime: '2 min', updatedAt: 'Mar 10', author: 'Sam R.' },
  { id: 3, categoryId: 1, title: 'Setting up the chat widget',               excerpt: 'A step-by-step guide to embedding the chat widget on your website or web app.', status: 'published', views: 1543, readTime: '4 min', updatedAt: 'Mar 8', author: 'Dana K.' },
  { id: 4, categoryId: 2, title: 'Understanding your invoice',               excerpt: 'A breakdown of what each line item on your invoice means and how billing cycles work.', status: 'published', views: 4210, readTime: '3 min', updatedAt: 'Mar 11', author: 'Sam R.' },
  { id: 5, categoryId: 2, title: 'Updating your payment method',             excerpt: 'How to add, remove, or change your default credit or debit card for billing.', status: 'published', views: 3876, readTime: '2 min', updatedAt: 'Mar 9', author: 'Dana K.' },
  { id: 6, categoryId: 2, title: 'Cancelling or pausing your subscription',  excerpt: 'What happens to your data if you cancel, and how to pause billing during off-seasons.', status: 'published', views: 2934, readTime: '3 min', updatedAt: 'Mar 7', author: 'Sam R.' },
  { id: 7, categoryId: 3, title: 'Connecting Slack notifications',           excerpt: 'Get real-time alerts in Slack whenever a new ticket is created or a conversation escalates.', status: 'published', views: 1987, readTime: '3 min', updatedAt: 'Mar 6', author: 'Dana K.' },
  { id: 8, categoryId: 3, title: 'Zapier integration guide',                 excerpt: 'Use Zapier to connect your support inbox to 5,000+ apps with no code required.', status: 'draft', views: 0, readTime: '5 min', updatedAt: 'Mar 5', author: 'Sam R.' },
  { id: 9, categoryId: 4, title: 'Why am I not receiving email notifications?', excerpt: 'Common causes for missing notification emails and how to fix them in your mail settings.', status: 'published', views: 5432, readTime: '4 min', updatedAt: 'Mar 13', author: 'Dana K.' },
  { id: 10, categoryId: 4, title: 'Chat widget not showing on my site',      excerpt: 'Troubleshoot why the widget may be hidden, blocked, or not rendering correctly.', status: 'published', views: 3201, readTime: '5 min', updatedAt: 'Mar 12', author: 'Sam R.' },
  { id: 11, categoryId: 4, title: 'Dashboard showing blank screen',          excerpt: 'Step-by-step fixes for blank dashboard issues across different browsers.', status: 'published', views: 2876, readTime: '3 min', updatedAt: 'Mar 11', author: 'Dana K.' },
  { id: 12, categoryId: 5, title: 'Authentication with API keys',            excerpt: 'How to generate, rotate, and use API keys to authenticate your API requests securely.', status: 'published', views: 1543, readTime: '4 min', updatedAt: 'Mar 8', author: 'Sam R.' },
]

// ─── Views ────────────────────────────────────────────────────────────────────

function CategoryGrid({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          className="text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-700 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg', cat.color)}>
              {cat.icon}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-purple-400 transition-colors mt-1" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{cat.name}</h3>
          <p className="text-xs text-gray-400 mt-1">{cat.articleCount} articles</p>
        </button>
      ))}
    </div>
  )
}

function ArticleEditor({ article, onClose }) {
  const [title, setTitle] = useState(article?.title || '')
  const [body, setBody] = useState(article ? `# ${article.title}\n\n${article.excerpt}\n\nAdd your full article content here...` : '')

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white">{article ? 'Edit Article' : 'New Article'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 hover:bg-gray-50">
            Preview
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: '#A855F7' }}
          >
            <Save className="h-4 w-4" />
            Publish
          </button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 py-6 max-w-3xl mx-auto w-full space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article title…"
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your article in Markdown…"
          className="w-full flex-1 min-h-[500px] bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 resize-none font-mono leading-relaxed"
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function KnowledgeBasePage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editingArticle, setEditingArticle] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  const filteredArticles = useMemo(() => {
    const base = selectedCategory
      ? ARTICLES.filter(a => a.categoryId === selectedCategory.id)
      : ARTICLES
    if (!search) return base
    return base.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase())
    )
  }, [selectedCategory, search])

  const totalArticles = ARTICLES.length
  const totalViews = ARTICLES.reduce((s, a) => s + a.views, 0)

  if (showEditor) {
    return <ArticleEditor article={editingArticle} onClose={() => { setShowEditor(false); setEditingArticle(null) }} />
  }

  return (
    <SupportLayout>
      <Header title="Knowledge Base" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedCategory(null)} className="text-sm text-gray-400 hover:text-purple-600 transition-colors">
                  Knowledge Base
                </button>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h1>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
                <p className="text-sm text-gray-500 mt-0.5">{totalArticles} articles · {totalViews.toLocaleString()} total views</p>
              </>
            )}
          </div>
          <button
            onClick={() => { setEditingArticle(null); setShowEditor(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: '#A855F7' }}
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Categories or Articles */}
        {!selectedCategory && !search ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Browse by Category</h2>
            </div>
            <CategoryGrid categories={CATEGORIES} onSelect={setSelectedCategory} />

            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">Recent Articles</h2>
            <div className="space-y-3">
              {ARTICLES.slice(0, 5).map(a => (
                <KBArticleCard key={a.id} article={a} onClick={art => { setEditingArticle(art); setShowEditor(true) }} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
                No articles found
              </div>
            ) : (
              filteredArticles.map(a => (
                <KBArticleCard key={a.id} article={a} onClick={art => { setEditingArticle(art); setShowEditor(true) }} />
              ))
            )}
          </div>
        )}

      </div>
    </SupportLayout>
  )
}

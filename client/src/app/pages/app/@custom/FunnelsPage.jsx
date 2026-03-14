import { useState } from 'react'
import {
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  ArrowDown,
  Users,
  TrendingDown,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_FUNNELS = [
  {
    id: 1,
    name: 'Signup Funnel',
    steps: [
      { name: 'Landing Page', count: 10234, dropoff: 0 },
      { name: 'Clicked Sign Up', count: 4521, dropoff: 55.8 },
      { name: 'Filled Form', count: 2890, dropoff: 36.1 },
      { name: 'Email Verified', count: 2145, dropoff: 25.8 },
      { name: 'Completed Onboarding', count: 1678, dropoff: 21.8 },
    ],
    conversionRate: 16.4,
    totalEntries: 10234,
  },
  {
    id: 2,
    name: 'Upgrade Funnel',
    steps: [
      { name: 'Dashboard Visit', count: 5678, dropoff: 0 },
      { name: 'Viewed Pricing', count: 2345, dropoff: 58.7 },
      { name: 'Started Checkout', count: 876, dropoff: 62.6 },
      { name: 'Payment Complete', count: 654, dropoff: 25.3 },
    ],
    conversionRate: 11.5,
    totalEntries: 5678,
  },
  {
    id: 3,
    name: 'Feature Adoption',
    steps: [
      { name: 'Logged In', count: 8901, dropoff: 0 },
      { name: 'Created Project', count: 4567, dropoff: 48.7 },
      { name: 'Invited Team', count: 1234, dropoff: 73.0 },
      { name: 'Used Integration', count: 567, dropoff: 54.1 },
    ],
    conversionRate: 6.4,
    totalEntries: 8901,
  },
]

// ─── Components ──────────────────────────────────────────────────────────────

function FunnelStep({ step, index, totalSteps, maxCount }) {
  const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0
  const isFirst = index === 0
  const isLast = index === totalSteps - 1

  return (
    <div className="flex items-stretch gap-4">
      {/* Step bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium flex items-center justify-center text-gray-600 dark:text-gray-300">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{step.name}</span>
          </div>
          <span className="text-sm tabular-nums font-semibold text-gray-900 dark:text-white">
            {step.count.toLocaleString()}
          </span>
        </div>
        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div
            className="h-full rounded-lg transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: isFirst ? '#6b7280' : isLast ? '#10b981' : '#9ca3af',
            }}
          />
        </div>
      </div>

      {/* Drop-off indicator */}
      {!isFirst && (
        <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
          <ArrowDown className="w-3.5 h-3.5 text-red-400 mb-0.5" />
          <span className="text-xs font-medium text-red-500 dark:text-red-400">
            -{step.dropoff}%
          </span>
        </div>
      )}
      {isFirst && <div className="w-20 flex-shrink-0" />}
    </div>
  )
}

function FunnelCard({ funnel, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(funnel.id)}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-all',
        isSelected
          ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-750 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{funnel.name}</h3>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {funnel.totalEntries.toLocaleString()} entries
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          {funnel.conversionRate}% conversion
        </span>
      </div>
      <div className="mt-3 flex gap-0.5">
        {funnel.steps.map((step, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full flex-1"
            style={{
              backgroundColor: i === 0 ? '#6b7280' : i === funnel.steps.length - 1 ? '#10b981' : '#d1d5db',
              opacity: 0.4 + (step.count / funnel.steps[0].count) * 0.6,
            }}
          />
        ))}
      </div>
    </button>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function FunnelsPage() {
  const [selectedFunnel, setSelectedFunnel] = useState(MOCK_FUNNELS[0].id)
  const funnel = MOCK_FUNNELS.find(f => f.id === selectedFunnel)

  return (
    <AnalyticsLayout>
      <Header title="Funnels" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Conversion Funnels</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Track drop-off at each step of your user journey
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4" />
            New Funnel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel list */}
          <div className="space-y-3">
            {MOCK_FUNNELS.map(f => (
              <FunnelCard
                key={f.id}
                funnel={f}
                isSelected={f.id === selectedFunnel}
                onSelect={setSelectedFunnel}
              />
            ))}
          </div>

          {/* Funnel detail */}
          {funnel && (
            <div className="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{funnel.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {funnel.steps.length} steps · {funnel.conversionRate}% overall conversion
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <Filter className="w-3 h-3" />
                    Filter
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <Calendar className="w-3 h-3" />
                    Last 30 days
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {funnel.steps.map((step, i) => (
                  <FunnelStep
                    key={i}
                    step={step}
                    index={i}
                    totalSteps={funnel.steps.length}
                    maxCount={funnel.steps[0].count}
                  />
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{funnel.steps[0].count.toLocaleString()}</span> entered
                  {' → '}
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{funnel.steps[funnel.steps.length - 1].count.toLocaleString()}</span> completed
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {funnel.conversionRate}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnalyticsLayout>
  )
}

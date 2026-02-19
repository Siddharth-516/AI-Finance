/** Purpose: lazy-loaded spending bar chart with robust fallback states. */
import React, { Suspense } from 'react'

const LazyBar = React.lazy(async () => {
  const [{ Bar }] = await Promise.all([import('react-chartjs-2'), import('chart.js/auto')])
  return {
    default: ({ data }) => {
      const total = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
      const chartData = {
        labels: data.map((item) => item.category),
        datasets: [
          {
            label: 'Amount (INR)',
            data: data.map((item) => item.amount),
            backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'],
            borderRadius: 8,
          },
        ],
      }
      const options = {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.raw)
                const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
                return `₹${value.toLocaleString()} (${pct}%)`
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: '#64748b' } },
          y: { ticks: { color: '#64748b' } },
        },
      }

      return <Bar data={chartData} options={options} data-testid='spending-bar-chart-canvas' />
    },
  }
})

export default function SpendingBarChart({ data = [], loading = false }) {
  if (loading) {
    return <div className='h-72 animate-pulse rounded-2xl border border-border bg-card' data-testid='spending-bar-chart-loading' />
  }

  if (!data.length) {
    return (
      <div className='h-72 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted' data-testid='spending-bar-chart-empty'>
        No category data yet. Import SMS or add a transaction to see your spending mix.
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-border bg-card p-4 shadow-soft' data-testid='spending-bar-chart'>
      <h3 className='mb-4 text-base font-semibold text-foreground'>Spending by category</h3>
      <Suspense fallback={<div className='h-56 animate-pulse rounded-xl bg-muted/30' />}>
        <LazyBar data={data} />
      </Suspense>
    </div>
  )
}

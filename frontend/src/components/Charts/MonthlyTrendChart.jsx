/** Purpose: lazy-loaded monthly trend line chart with loading and empty states. */
import React, { Suspense } from 'react'

const LazyLine = React.lazy(async () => {
  const [{ Line }] = await Promise.all([import('react-chartjs-2'), import('chart.js/auto')])
  return {
    default: ({ data }) => {
      const chartData = {
        labels: data.map((item) => item.month),
        datasets: [
          {
            label: 'Monthly spend',
            data: data.map((item) => item.total),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.18)',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true,
          },
        ],
      }

      const options = {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₹${Number(ctx.raw).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#64748b' } },
          y: { ticks: { color: '#64748b' } },
        },
      }
      return <Line data={chartData} options={options} data-testid='monthly-trend-chart-canvas' />
    },
  }
})

export default function MonthlyTrendChart({ data = [], loading = false }) {
  if (loading) {
    return <div className='h-80 animate-pulse rounded-2xl border border-border bg-card' data-testid='monthly-trend-loading' />
  }

  if (!data.length) {
    return (
      <div className='h-80 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted' data-testid='monthly-trend-empty'>
        Monthly trend will appear once transaction history is available.
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-border bg-card p-4 shadow-soft' data-testid='monthly-trend-chart'>
      <h3 className='mb-4 text-base font-semibold text-foreground'>12-month trend</h3>
      <Suspense fallback={<div className='h-64 animate-pulse rounded-xl bg-muted/30' />}>
        <LazyLine data={data} />
      </Suspense>
    </div>
  )
}

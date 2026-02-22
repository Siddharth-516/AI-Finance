import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SpendingBarChart from './SpendingBarChart'

describe('SpendingBarChart', () => {
  it('renders chart card title with sample data', () => {
    const sample = [
      { category: 'Food', amount: 500 },
      { category: 'Rent', amount: 400 },
    ]

    render(<SpendingBarChart data={sample} loading={false} />)
    expect(screen.getByTestId('spending-bar-chart')).toBeTruthy()
    expect(screen.getByText(/Spending by category/i)).toBeTruthy()
  })
})

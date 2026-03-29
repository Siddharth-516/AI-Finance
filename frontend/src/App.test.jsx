import { render, screen } from '@testing-library/react'
import App from './App'
import React from 'react'
import { test, expect } from 'vitest'

test('renders app title', () => {
  render(<App />)
  expect(screen.getByText(/AI Financial Companion/)).toBeTruthy()
})

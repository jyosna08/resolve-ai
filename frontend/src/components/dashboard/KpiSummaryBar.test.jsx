import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import KpiSummaryBar from './KpiSummaryBar.jsx'

describe('KpiSummaryBar', () => {
  it('shows the four KPI labels and values', () => {
    render(<KpiSummaryBar stats={{ totalOpen: 12, criticalAlerts: 3, resolvedToday: 7, slaWarnings: 2 }} />)
    const summary = within(screen.getByRole('region', { name: 'Ticket summary' }))
    expect(summary.getByText('Total Open')).toBeInTheDocument(); expect(summary.getByText('12')).toBeInTheDocument()
    expect(summary.getByText('Critical Alerts')).toBeInTheDocument(); expect(summary.getByText('3')).toBeInTheDocument()
    expect(summary.getByText('Resolved Today')).toBeInTheDocument(); expect(summary.getByText('7')).toBeInTheDocument()
    expect(summary.getByText('SLA Warnings')).toBeInTheDocument(); expect(summary.getByText('2')).toBeInTheDocument()
  })
  it('shows skeletons while loading and dashes for unavailable stats', () => {
    const { rerender } = render(<KpiSummaryBar stats={null} isLoading />)
    expect(screen.queryByText('—')).not.toBeInTheDocument()
    rerender(<KpiSummaryBar stats={null} isLoading={false} />)
    expect(screen.getAllByText('—')).toHaveLength(4)
  })
})

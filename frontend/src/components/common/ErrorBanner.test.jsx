import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorBanner from './ErrorBanner.jsx'

describe('ErrorBanner', () => {
  it('runs dismiss and retry handlers', () => {
    const dismiss = vi.fn(); const retry = vi.fn()
    render(<ErrorBanner message="Failed" onDismiss={dismiss} onRetry={retry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' })); fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(dismiss).toHaveBeenCalledOnce(); expect(retry).toHaveBeenCalledOnce()
  })
  it('hides action buttons when handlers are absent', () => {
    render(<ErrorBanner message="Failed" />); expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

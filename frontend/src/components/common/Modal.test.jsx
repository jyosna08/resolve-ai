import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal.jsx'

describe('Modal', () => {
  it('renders only when open and closes on Escape or backdrop click', () => {
    const onClose = vi.fn()
    const { rerender } = render(<Modal isOpen={false} onClose={onClose} title="Test dialog">Content</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<Modal isOpen onClose={onClose} title="Test dialog">Content</Modal>)
    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' }); expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByTestId('modal-backdrop')); expect(onClose).toHaveBeenCalledTimes(2)
  })
  it('blocks Escape and backdrop dismissal while closeDisabled', () => {
    const onClose = vi.fn()
    render(<Modal isOpen closeDisabled onClose={onClose} title="Locked dialog">Content</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' }); fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled()
  })
  it('moves focus into the dialog and restores the trigger after close', () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return <><button type="button" onClick={() => setOpen(true)}>Launch</button><Modal isOpen={open} onClose={() => setOpen(false)} title="Focus dialog"><button type="button">Dialog action</button></Modal></>
    }
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Launch' })
    trigger.focus(); fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(trigger).toHaveFocus()
  })
  it('keeps Tab focus inside the dialog', () => {
    render(<Modal isOpen onClose={() => {}} title="Trap dialog"><button type="button">First action</button><button type="button">Last action</button></Modal>)
    const close = screen.getByRole('button', { name: 'Close dialog' })
    const last = screen.getByRole('button', { name: 'Last action' })
    last.focus(); fireEvent.keyDown(last, { key: 'Tab' }); expect(close).toHaveFocus()
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true }); expect(last).toHaveFocus()
  })
})

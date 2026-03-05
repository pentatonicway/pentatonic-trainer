import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastContainer } from './Toast'
import { useToastStore } from '../../store/toastStore'
import { ThemeProvider } from '../../styles/ThemeContext'

function renderToasts() {
  return render(
    <ThemeProvider>
      <ToastContainer />
    </ThemeProvider>
  )
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  act(() => {
    useToastStore.getState().showToast(message, type)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.useRealTimers()
  useToastStore.setState({ toasts: [] })
})

describe('ToastContainer', () => {

  it('renders without crashing', () => {
    expect(() => renderToasts()).not.toThrow()
  })

  it('shows no toasts initially', () => {
    renderToasts()
    const container = screen.getByTestId('toast-container')
    expect(container.children.length).toBe(0)
  })

  it('shows a toast when showToast is called', () => {
    renderToasts()
    showToast('Hello toast!')
    expect(screen.getByText('Hello toast!')).toBeTruthy()
  })

  it('success toast has data-type="success"', () => {
    renderToasts()
    showToast('Saved!', 'success')
    const toasts = screen.getAllByRole('alert')
    expect(toasts[0].getAttribute('data-type')).toBe('success')
  })

  it('error toast has data-type="error"', () => {
    renderToasts()
    showToast('Oops!', 'error')
    const toasts = screen.getAllByRole('alert')
    expect(toasts[0].getAttribute('data-type')).toBe('error')
  })

  it('info toast has data-type="info"', () => {
    renderToasts()
    showToast('FYI', 'info')
    const toasts = screen.getAllByRole('alert')
    expect(toasts[0].getAttribute('data-type')).toBe('info')
  })

  it('multiple toasts stack', () => {
    renderToasts()
    showToast('Toast A', 'success')
    showToast('Toast B', 'error')
    showToast('Toast C', 'info')
    expect(screen.getAllByRole('alert')).toHaveLength(3)
  })

  it('auto-dismisses after 3 seconds', () => {
    renderToasts()
    showToast('Vanishing toast')
    expect(screen.getByText('Vanishing toast')).toBeTruthy()
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByText('Vanishing toast')).toBeNull()
  })

  it('does NOT dismiss before 3 seconds', () => {
    renderToasts()
    showToast('Still here')
    act(() => vi.advanceTimersByTime(2999))
    expect(screen.getByText('Still here')).toBeTruthy()
  })

  it('dismiss button removes the toast immediately', () => {
    renderToasts()
    showToast('Dismissible')
    // Find toast and click its dismiss button
    const toasts = screen.getAllByRole('alert')
    const dismissBtn = toasts[0].querySelector('button')!
    act(() => fireEvent.click(dismissBtn))
    expect(screen.queryByText('Dismissible')).toBeNull()
  })

  it('clicking the toast itself dismisses it', () => {
    renderToasts()
    showToast('Click me')
    act(() => fireEvent.click(screen.getByText('Click me')))
    expect(screen.queryByText('Click me')).toBeNull()
  })

  it('default type is info when not specified', () => {
    renderToasts()
    act(() => {
      useToastStore.getState().showToast('Default type')
    })
    const toasts = screen.getAllByRole('alert')
    expect(toasts[0].getAttribute('data-type')).toBe('info')
  })
})

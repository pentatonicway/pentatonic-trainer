import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Component that always throws
function Bomb({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test explosion')
  return <div data-testid="normal-child">All good</div>
}

describe('ErrorBoundary', () => {

  it('renders children normally when no error', () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>)
    expect(screen.getByTestId('normal-child')).toBeTruthy()
  })

  it('renders fallback UI when child throws', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb shouldThrow /></ErrorBoundary>)
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy()
    spy.mockRestore()
  })

  it('does NOT render children when an error occurs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb shouldThrow /></ErrorBoundary>)
    expect(screen.queryByTestId('normal-child')).toBeNull()
    spy.mockRestore()
  })

  it('shows "Something went wrong" text in fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb shouldThrow /></ErrorBoundary>)
    expect(screen.getByText(/something went wrong/i)).toBeTruthy()
    spy.mockRestore()
  })

  it('shows error message in fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb shouldThrow /></ErrorBoundary>)
    expect(screen.getByText('Test explosion')).toBeTruthy()
    spy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error UI</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('custom-fallback')).toBeTruthy()
    spy.mockRestore()
  })

  it('"Try again" button is rendered and clickable', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb shouldThrow /></ErrorBoundary>)
    const tryAgain = screen.getByText('Try again')
    expect(tryAgain).toBeTruthy()
    // Should not throw when clicked
    expect(() => fireEvent.click(tryAgain)).not.toThrow()
    spy.mockRestore()
  })
})

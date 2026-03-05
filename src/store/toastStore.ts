import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
}

type ToastState = {
  toasts: Toast[]
}

type ToastActions = {
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  toasts: [],

  showToast(message, type = 'info') {
    const id = Math.random().toString(36).slice(2, 9)
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }))
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },

  dismissToast(id) {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
}))

import { create } from 'zustand'

export interface ToastItem {
  id: string
  message: string
  variant: 'default' | 'success' | 'error'
}

interface ToastState {
  toasts: ToastItem[]
  push: (message: string, variant?: ToastItem['variant']) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'default') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, variant }],
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function toast(message: string, variant: ToastItem['variant'] = 'default') {
  useToastStore.getState().push(message, variant)
}

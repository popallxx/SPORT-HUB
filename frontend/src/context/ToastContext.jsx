/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import ToastStack from '../components/ToastStack'

const ToastContext = createContext(null)
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message, type = 'info', duration = 3800) => {
      const id = ++toastId
      setToasts((prev) => [...prev.slice(-3), { id, message, type }])
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }
      return id
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      toasts,
      dismiss,
      info: (msg, duration) => push(msg, 'info', duration),
      success: (msg, duration) => push(msg, 'success', duration),
      warning: (msg, duration) => push(msg, 'warning', duration),
      error: (msg, duration) => push(msg, 'error', duration),
    }),
    [toasts, dismiss, push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return ctx
}

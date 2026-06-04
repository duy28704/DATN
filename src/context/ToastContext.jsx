/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'

export const ToastContext = createContext()

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

let toastIdCounter = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback(({ type = 'success', title, message, image, duration = 3500 }) => {
    const id = ++toastIdCounter
    setToasts(prev => [...prev, { id, type, title, message, image }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

import { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'sonner'

export const ToastContext = createContext()

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState(null)

  const showToast = useCallback(({ type = 'success', title, message, duration = 3000 }) => {
    const text = title || message;
    const options = {
      duration,
      description: title ? message : undefined
    };

    if (type === 'success') {
      toast.success(text, options)
    } else if (type === 'error') {
      toast.error(text, options)
    } else if (type === 'warning') {
      toast.warning(text, options)
    } else if (type === 'info') {
      toast.info(text, options)
    } else {
      toast(text, options)
    }
  }, [])

  const showConfirm = useCallback(({ title = 'Xác nhận', message = 'Bạn có chắc chắn muốn thực hiện hành động này?' }) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        title,
        message,
        onConfirm: () => {
          setConfirmConfig(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmConfig(null)
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, removeToast: () => {}, toasts: [], showConfirm, confirmConfig }}>
      {children}
    </ToastContext.Provider>
  )
}

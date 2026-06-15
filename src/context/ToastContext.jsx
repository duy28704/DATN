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

  const showToast = useCallback(({ type = 'success', title, message, image, duration = 3000 }) => {
    const content = (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {image && (
          <img 
            src={image} 
            alt="" 
            style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain', background: '#111', marginRight: '4px' }} 
          />
        )}
        <div>
          {title && <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</div>}
          {message && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{message}</div>}
        </div>
      </div>
    )

    const options = { duration }

    if (type === 'success') {
      toast.success(content, options)
    } else if (type === 'error') {
      toast.error(content, options)
    } else if (type === 'warning') {
      toast.warning(content, options)
    } else if (type === 'info') {
      toast.info(content, options)
    } else {
      toast(content, options)
    }
  }, [])

  const confirm = useCallback(({ title = 'Xác nhận', message = 'Bạn có chắc chắn muốn thực hiện hành động này?' }) => {
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
    <ToastContext.Provider value={{ showToast, removeToast: () => {}, toasts: [], confirm, confirmConfig }}>
      {children}
    </ToastContext.Provider>
  )
}

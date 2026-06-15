import { useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastContext } from '../context/ToastContext'
import { HelpCircle } from 'lucide-react'
import { Toaster } from 'sonner'

const ToastContainer = () => {
  const { confirmConfig } = useContext(ToastContext)

  return (
    <>
      {/* Sonner Toaster */}
      <Toaster 
        richColors 
        position="top-right" 
        theme="dark" 
        toastOptions={{
          style: {
            background: 'rgba(14, 14, 18, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            color: '#fff',
            borderRadius: '10px'
          }
        }}
      />

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmConfig && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'all'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 32px rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                width: '400px',
                maxWidth: 'calc(100vw - 32px)',
                padding: '24px',
                color: '#fff',
                fontFamily: 'var(--font-display, inherit)'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  color: '#ffc107',
                  borderRadius: '50%',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h6 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>
                    {confirmConfig.title}
                  </h6>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    {confirmConfig.message}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={confirmConfig.onCancel}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmConfig.onConfirm}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4154f1, #2f3fd4)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(65, 84, 241, 0.35)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(65, 84, 241, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(65, 84, 241, 0.35)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ToastContainer

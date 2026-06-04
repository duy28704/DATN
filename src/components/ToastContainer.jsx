import { useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastContext } from '../context/ToastContext'
import { CheckCircle, ShieldAlert, Info, X, ShoppingCart } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <ShieldAlert size={18} />,
  info: <Info size={18} />,
  cart: <ShoppingCart size={18} />
}

const COLORS = {
  success: { border: 'rgba(46, 204, 113, 0.35)', glow: 'rgba(46,204,113,0.12)', icon: '#2ecc71' },
  error: { border: 'rgba(255, 0, 60, 0.35)', glow: 'rgba(255,0,60,0.12)', icon: '#ff003c' },
  info: { border: 'rgba(52, 152, 219, 0.35)', glow: 'rgba(52,152,219,0.12)', icon: '#3498db' },
  cart: { border: 'rgba(255, 0, 60, 0.35)', glow: 'rgba(255,0,60,0.12)', icon: '#ff003c' }
}

const ToastItem = ({ toast, onRemove }) => {
  const col = COLORS[toast.type] || COLORS.success

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.94 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(14, 14, 18, 0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${col.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${col.glow}`,
        width: '320px',
        maxWidth: 'calc(100vw - 32px)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.5, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: col.icon,
          transformOrigin: 'left',
          opacity: 0.5
        }}
      />

      {/* Product image (if cart type) */}
      {toast.image && (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '6px',
          background: '#111',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src={toast.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* Icon (no image) */}
      {!toast.image && (
        <span style={{ color: col.icon, flexShrink: 0, marginTop: '1px' }}>
          {ICONS[toast.type] || ICONS.success}
        </span>
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{
            margin: 0,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: toast.message ? '3px' : 0,
            fontFamily: 'var(--font-display, inherit)',
            letterSpacing: '0.02em'
          }}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.4
          }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginTop: '1px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        aria-label="Đóng"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer

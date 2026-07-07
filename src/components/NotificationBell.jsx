import React, { useState, useEffect, useContext, useRef } from 'react'
import { Bell, ShoppingBag, CreditCard, Package, Info, Tag, CheckCheck, Trash2 } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { apiService } from '../services/api'

export default function NotificationBell({ onNavigate }) {
  const { user } = useContext(AuthContext)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchUnreadCount = async () => {
    if (!user) return
    try {
      const count = await apiService.notifications.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error('Lỗi khi lấy số thông báo chưa đọc:', err)
    }
  }

  const fetchNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await apiService.notifications.getAll({ page: 0, size: 10 })
      setNotifications(data.content || [])
    } catch (err) {
      console.error('Lỗi khi lấy danh sách thông báo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 15000) // Poll every 15s
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id, url) => {
    try {
      await apiService.notifications.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      fetchUnreadCount()
      if (url && onNavigate) {
        setIsOpen(false)
        if (url.startsWith('/admin')) {
          onNavigate('dashboard')
        } else if (url.startsWith('/profile')) {
          onNavigate('login')
        }
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.notifications.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag size={16} className="text-danger" />
      case 'INSTALLMENT':
        return <CreditCard size={16} className="text-success" />
      case 'INVENTORY':
        return <Package size={16} className="text-warning" />
      case 'PROMOTION':
        return <Tag size={16} className="text-info" />
      default:
        return <Info size={16} className="text-primary" />
    }
  }

  if (!user) return null

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link text-white position-relative p-2 border-0"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 rounded shadow-lg overflow-hidden z-3"
          style={{ width: '360px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="p-3 d-flex align-items-center justify-content-between border-bottom" style={{ borderColor: 'var(--border-color)' }}>
            <h6 className="mb-0 text-white fw-bold fs-7">THÔNG BÁO</h6>
            {notifications.some(n => !n.isRead) && (
              <button
                className="btn btn-link text-secondary hover-red p-0 border-0 fs-8 d-flex align-items-center gap-1 text-decoration-none"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck size={14} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="overflow-auto" style={{ maxHeight: '380px' }}>
            {loading ? (
              <div className="text-center py-4 text-secondary fs-8">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-secondary fs-8">Bạn không có thông báo nào.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border-bottom cursor-pointer transition-smooth ${!item.isRead ? 'bg-black bg-opacity-40' : 'bg-transparent'}`}
                  style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => handleMarkAsRead(item.id, item.referenceUrl)}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded bg-dark flex-shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <h6 className={`fs-8 mb-1 ${!item.isRead ? 'text-white fw-bold' : 'text-secondary'}`}>{item.title}</h6>
                        {!item.isRead && <span className="bg-danger rounded-circle d-inline-block" style={{ width: '6px', height: '6px' }}></span>}
                      </div>
                      <p className="text-secondary fs-8 mb-1 text-break">{item.content}</p>
                      <span className="text-secondary" style={{ fontSize: '0.65rem' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

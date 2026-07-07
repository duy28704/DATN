import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { History, Search, RotateCcw, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function EmailLogsViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [resendingId, setResendingId] = useState(null)
  const [msg, setMsg] = useState('')

  const fetchLogs = async (searchQuery = query, pageNum = page) => {
    setLoading(true)
    try {
      const data = await apiService.adminEmails.getLogs({ query: searchQuery, page: pageNum, size: 15 })
      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử email:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    fetchLogs(query, 0)
  }

  const handleResend = async (id) => {
    setResendingId(id)
    setMsg('')
    try {
      await apiService.adminEmails.resend(id)
      setMsg('Đã đẩy email vào hàng đợi để gửi lại thành công!')
      fetchLogs()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Lỗi khi gửi lại: ' + err.message)
    } finally {
      setResendingId(null)
    }
  }

  return (
    <div className="container-fluid py-4 text-start">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 text-white display-font mb-1">QUẢN LÝ LỊCH SỬ GỬI EMAIL (EMAIL LOGS)</h1>
          <p className="text-secondary fs-7 mb-0">Nhật ký theo dõi vết và trạng thái gửi email thời gian thực.</p>
        </div>

        <form onSubmit={handleSearch} className="d-flex gap-2">
          <div className="position-relative">
            <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control tech-input ps-5"
              placeholder="Tìm theo email người nhận hoặc tiêu đề..."
              style={{ width: '300px' }}
            />
          </div>
          <button type="submit" className="btn btn-danger glow-btn fs-7 px-3">Tìm kiếm</button>
        </form>
      </div>

      {msg && (
        <div className="alert alert-info py-2 px-3 fs-7 border-0 bg-info bg-opacity-10 text-info mb-4">
          {msg}
        </div>
      )}

      <div className="rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle fs-7">
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-3">Email Người Nhận</th>
                <th className="py-3 px-3">Tiêu Đề Email</th>
                <th className="py-3 px-3">Mẫu (Template)</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3">Thời Gian Gửi</th>
                <th className="py-3 px-4 text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">Đang tải nhật ký gửi email...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">Không tìm thấy bản ghi lịch sử gửi email nào.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    <td className="py-3 px-4 fw-bold text-white">#{log.id}</td>
                    <td className="py-3 px-3 text-white fw-medium">{log.recipientEmail}</td>
                    <td className="py-3 px-3 text-secondary text-truncate" style={{ maxWidth: '240px' }}>{log.subject}</td>
                    <td className="py-3 px-3">
                      <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-25 fs-8">
                        {log.templateCode || 'CUSTOM'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {log.status === 'SUCCESS' ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fs-8 d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={12} /> Thành công
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 fs-8 d-inline-flex align-items-center gap-1" title={log.errorDetails}>
                          <XCircle size={12} /> Thất bại
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-secondary fs-8">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString('vi-VN') : ''}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        className="btn btn-outline-secondary btn-sm fs-8 d-inline-flex align-items-center gap-1"
                        onClick={() => handleResend(log.id)}
                        disabled={resendingId === log.id}
                        title="Gửi lại email này"
                      >
                        <RotateCcw size={12} className={resendingId === log.id ? 'spin' : ''} /> Gửi lại
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25">
            <span className="text-secondary fs-8">Trang {page + 1} / {totalPages}</span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm fs-8"
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
              >
                Trước
              </button>
              <button
                className="btn btn-outline-secondary btn-sm fs-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { BarChart3, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

export default function EmailAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const data = await apiService.adminEmails.getAnalytics()
      setAnalytics(data)
    } catch (err) {
      console.error('Lỗi khi lấy thống kê email:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return <div className="text-center py-5 text-secondary fs-7">Đang tải báo cáo thống kê email...</div>
  }

  return (
    <div className="container-fluid py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-4 text-white display-font mb-1">BÁO CÁO THỐNG KÊ EMAIL (EMAIL ANALYTICS)</h1>
          <p className="text-secondary fs-7 mb-0">Theo dõi sức khỏe hệ thống email, tỷ lệ thành công và lưu lượng theo ngày.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm fs-7" onClick={fetchAnalytics}>Cập nhật dữ liệu</button>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary fs-8 uppercase">Tổng Email Đã Gửi</span>
              <div className="p-2 rounded bg-primary bg-opacity-10 text-primary"><BarChart3 size={16} /></div>
            </div>
            <h3 className="fs-3 text-white display-font mb-0">{analytics?.totalSent || 0}</h3>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary fs-8 uppercase">Tỷ Lệ Thành Công</span>
              <div className="p-2 rounded bg-success bg-opacity-10 text-success"><TrendingUp size={16} /></div>
            </div>
            <h3 className="fs-3 text-success display-font mb-0">{analytics?.successRate || 100}%</h3>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary fs-8 uppercase">Lỗi Gửi Email</span>
              <div className="p-2 rounded bg-danger bg-opacity-10 text-danger"><AlertTriangle size={16} /></div>
            </div>
            <h3 className="fs-3 text-danger display-font mb-0">{analytics?.failedCount || 0}</h3>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary fs-8 uppercase">Hàng Đợi Chờ Gửi</span>
              <div className="p-2 rounded bg-warning bg-opacity-10 text-warning"><Clock size={16} /></div>
            </div>
            <h3 className="fs-3 text-warning display-font mb-0">{analytics?.pendingQueueCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="p-4 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h2 className="fs-6 text-white mb-3">Lưu Lượng Gửi Email 7 Ngày Gần Nhất</h2>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle fs-7">
            <thead>
              <tr className="text-secondary border-bottom border-secondary border-opacity-25">
                <th className="py-2">Ngày</th>
                <th className="py-2">Tổng Gửi</th>
                <th className="py-2">Thành Công</th>
                <th className="py-2">Thất Bại</th>
                <th className="py-2">Tỷ Lệ Thành Công</th>
              </tr>
            </thead>
            <tbody>
              {!analytics?.dailyStats || analytics.dailyStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-secondary">Chưa có dữ liệu thống kê theo ngày.</td>
                </tr>
              ) : (
                analytics.dailyStats.map((item, idx) => {
                  const rate = item.total > 0 ? ((item.success / item.total) * 100).toFixed(1) : '100'
                  return (
                    <tr key={idx} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                      <td className="py-3 text-white fw-bold">{item.date}</td>
                      <td className="py-3 text-white display-font">{item.total}</td>
                      <td className="py-3 text-success display-font">{item.success}</td>
                      <td className="py-3 text-danger display-font">{item.failed}</td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="progress-bar bg-success" style={{ width: `${rate}%` }}></div>
                          </div>
                          <span className="text-white fs-8 display-font" style={{ width: '40px' }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

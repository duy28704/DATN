import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Send, Users, Layers, CheckCircle2, Loader2, Plus } from 'lucide-react'

export default function EmailCampaignsManager() {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    templateCode: 'PROMO_FLASH_SALE',
    targetGroup: 'ALL_CUSTOMERS'
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [campData, tmplData] = await Promise.all([
        apiService.adminEmails.getCampaigns(),
        apiService.adminEmails.getTemplates()
      ])
      setCampaigns(campData.content || [])
      setTemplates(tmplData || [])
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu chiến dịch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    setMsg('')
    try {
      await apiService.adminEmails.createCampaign(formData)
      setMsg('Khởi tạo chiến dịch gửi email hàng loạt thành công!')
      setFormData({ name: '', templateCode: 'PROMO_FLASH_SALE', targetGroup: 'ALL_CUSTOMERS' })
      fetchData()
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setMsg('Lỗi: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container-fluid py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-4 text-white display-font mb-1">GỬI EMAIL HÀNG LOẠT (MASS EMAIL CAMPAIGNS)</h1>
          <p className="text-secondary fs-7 mb-0">Tạo chiến dịch email marketing truyền thông và khuyến mãi cho khách hàng.</p>
        </div>
      </div>

      {msg && (
        <div className="alert alert-info py-2 px-3 fs-7 border-0 bg-info bg-opacity-10 text-info mb-4">
          {msg}
        </div>
      )}

      <div className="row g-4">
        {/* Create Campaign Form */}
        <div className="col-12 col-lg-4">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="fs-6 text-white mb-3 d-flex align-items-center gap-2">
              <Send size={18} className="text-danger" /> Tạo Chiến Dịch Mới
            </h2>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Tên Chiến Dịch</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control tech-input"
                  placeholder="Ví dụ: Siêu Khuyến Mãi Flash Sale Tháng 7"
                />
              </div>

              <div>
                <label className="form-label text-secondary fs-7 mb-1">Chọn Mẫu Email (Template)</label>
                <select
                  value={formData.templateCode}
                  onChange={(e) => setFormData({ ...formData, templateCode: e.target.value })}
                  className="form-select tech-input"
                >
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.code}>{tmpl.name} ({tmpl.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-secondary fs-7 mb-1">Nhóm Đối Tượng Nhận Email</label>
                <select
                  value={formData.targetGroup}
                  onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                  className="form-select tech-input"
                >
                  <option value="ALL_CUSTOMERS">Tất cả Khách hàng trên hệ thống</option>
                  <option value="VIP_CUSTOMERS">Khách hàng thân thiết VIP</option>
                  <option value="INACTIVE_30_DAYS">Khách hàng chưa đăng nhập 30 ngày</option>
                </select>
              </div>

              <button type="submit" disabled={creating} className="btn btn-danger glow-btn py-3 mt-2 fs-7 d-flex align-items-center justify-content-center gap-2">
                {creating ? <Loader2 size={16} className="spinner-border spinner-border-sm border-0" /> : <Send size={16} />}
                Gửi Email Hàng Loạt
              </button>
            </form>
          </div>
        </div>

        {/* Campaigns History List */}
        <div className="col-12 col-lg-8">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="fs-6 text-white mb-3 d-flex align-items-center gap-2">
              <Layers size={18} className="text-danger" /> Lịch Sử Các Chiến Dịch Đã Gửi
            </h2>

            {loading ? (
              <div className="text-center py-4 text-secondary fs-7">Đang tải danh sách chiến dịch...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-4 text-secondary fs-7">Chưa có chiến dịch gửi email nào được tạo.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                      <h5 className="fs-7 text-white fw-bold mb-0">{camp.name}</h5>
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fs-8">
                        {camp.status}
                      </span>
                    </div>

                    <div className="row g-2 fs-8 text-secondary">
                      <div className="col-6 col-sm-3">Mẫu: <strong className="text-white">{camp.templateCode}</strong></div>
                      <div className="col-6 col-sm-3">Nhóm: <strong className="text-white">{camp.targetGroup}</strong></div>
                      <div className="col-6 col-sm-3">Tổng nhận: <strong className="text-danger display-font">{camp.totalRecipients}</strong></div>
                      <div className="col-6 col-sm-3">Thời gian: {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString('vi-VN') : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

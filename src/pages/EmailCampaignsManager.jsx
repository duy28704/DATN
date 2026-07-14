import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../services/api'
import { Send, Users, Layers, CheckCircle2, Loader2, Plus, Image, Eye, EyeOff, FileText, Palette } from 'lucide-react'

export default function EmailCampaignsManager() {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // 'template' or 'custom'
  const [mode, setMode] = useState('custom')

  const [formData, setFormData] = useState({
    name: '',
    templateCode: 'PROMO_FLASH_SALE',
    targetGroup: 'ALL_CUSTOMERS',
    customSubject: '',
    customBody: '',
    bannerImageUrl: ''
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
      const payload = {
        name: formData.name,
        targetGroup: formData.targetGroup,
      }
      if (mode === 'template') {
        payload.templateCode = formData.templateCode
      } else {
        payload.customSubject = formData.customSubject
        payload.customBody = formData.customBody
        payload.bannerImageUrl = formData.bannerImageUrl
      }

      await apiService.adminEmails.createCampaign(payload)
      setMsg('✅ Khởi tạo chiến dịch gửi email hàng loạt thành công!')
      setFormData({
        name: '', templateCode: 'PROMO_FLASH_SALE', targetGroup: 'ALL_CUSTOMERS',
        customSubject: '', customBody: '', bannerImageUrl: ''
      })
      fetchData()
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setMsg('❌ Lỗi: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  // Build preview HTML (client-side mirror of backend buildMarketingHtml)
  const previewHtml = useMemo(() => {
    if (mode !== 'custom') return ''
    const body = formData.customBody || ''
    const banner = formData.bannerImageUrl || ''
    const subject = formData.customSubject || 'Tiêu đề chiến dịch'

    let html = `
      <div style="background:#f4f4f7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">`

    if (banner.trim()) {
      html += `<img src="${banner.trim()}" alt="Banner" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />`
    }

    html += `
          <div style="padding:28px 32px 0 32px;text-align:center;">
            <h1 style="font-size:22px;color:#0f62fe;margin:0 0 4px 0;letter-spacing:-0.5px;">NEXUS Tech</h1>
            <p style="font-size:12px;color:#899bbd;margin:0;">Premium Laptop & Technology Store</p>
          </div>
          <div style="padding:24px 32px 0 32px;">
            <p style="font-size:15px;color:#333;margin:0;">Chào <strong>Khách hàng</strong>,</p>
          </div>
          <div style="padding:16px 32px 24px 32px;">`

    const paragraphs = body.split('\n')
    for (const p of paragraphs) {
      const trimmed = p.trim()
      if (trimmed) {
        html += `<p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 12px 0;">${trimmed}</p>`
      }
    }

    html += `</div>
          <div style="padding:0 32px 28px 32px;text-align:center;">
            <a href="#" style="display:inline-block;padding:14px 36px;background-color:#0f62fe;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;letter-spacing:0.3px;">Khám Phá Ngay Tại NEXUS</a>
          </div>
          <div style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">Bạn nhận được email này vì đã đăng ký nhận thông tin từ NEXUS Tech.</p>
            <p style="font-size:11px;color:#94a3b8;margin:4px 0 0 0;">© 2026 NEXUS Tech. All rights reserved.</p>
          </div>
        </div>
      </div>`
    return html
  }, [mode, formData.customBody, formData.bannerImageUrl, formData.customSubject])

  const tabStyle = (active) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: active ? '2px solid #0f62fe' : '2px solid transparent',
    background: 'transparent',
    color: active ? '#fff' : '#94a3b8',
    fontWeight: active ? 600 : 400,
    fontSize: '13px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  })

  return (
    <main id="main" className="main">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-4 text-white display-font mb-1">CHIẾN DỊCH EMAIL MARKETING</h1>
          <p className="text-secondary fs-7 mb-0">Tạo chiến dịch email marketing với nội dung tùy chỉnh hoặc sử dụng mẫu có sẵn.</p>
        </div>
      </div>

      {msg && (
        <div className={`alert py-2 px-3 fs-7 border-0 mb-4 ${msg.startsWith('❌') ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
          {msg}
        </div>
      )}

      <div className="row g-4">
        {/* Create Campaign Form */}
        <div className="col-12 col-xl-6">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="fs-6 text-white mb-3 d-flex align-items-center gap-2">
              <Plus size={18} className="text-danger" /> Tạo Chiến Dịch Mới
            </h2>

            {/* Mode Tabs */}
            <div className="d-flex mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button type="button" style={tabStyle(mode === 'custom')} onClick={() => setMode('custom')}>
                <Palette size={14} /> Viết Nội Dung
              </button>
              <button type="button" style={tabStyle(mode === 'template')} onClick={() => setMode('template')}>
                <FileText size={14} /> Dùng Mẫu Template
              </button>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Tên Chiến Dịch *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control tech-input"
                  placeholder="Ví dụ: Siêu Khuyến Mãi Flash Sale Tháng 7"
                />
              </div>

              {mode === 'custom' ? (
                <>
                  <div>
                    <label className="form-label text-secondary fs-7 mb-1">Tiêu Đề Email (Subject) *</label>
                    <input
                      type="text"
                      required
                      value={formData.customSubject}
                      onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                      className="form-control tech-input"
                      placeholder="Ví dụ: 🔥 Flash Sale - Giảm giá 50% tất cả Laptop!"
                    />
                  </div>

                  <div>
                    <label className="form-label text-secondary fs-7 mb-1 d-flex align-items-center gap-2">
                      <Image size={14} /> URL Hình Ảnh Banner Marketing (tùy chọn)
                    </label>
                    <input
                      type="url"
                      value={formData.bannerImageUrl}
                      onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                      className="form-control tech-input"
                      placeholder="https://example.com/banner-flashsale.jpg"
                    />
                    {formData.bannerImageUrl && (
                      <div className="mt-2 rounded overflow-hidden" style={{ maxHeight: '140px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                          src={formData.bannerImageUrl}
                          alt="Banner preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label text-secondary fs-7 mb-1">Nội Dung Email *</label>
                    <p className="text-secondary mb-2" style={{ fontSize: '11px', opacity: 0.7 }}>
                      Viết nội dung bằng chữ thường. Hệ thống sẽ tự động chuyển thành email HTML chuyên nghiệp với header, footer, nút CTA.
                    </p>
                    <textarea
                      required
                      value={formData.customBody}
                      onChange={(e) => setFormData({ ...formData, customBody: e.target.value })}
                      className="form-control tech-input"
                      rows={7}
                      placeholder={'Chúng tôi rất vui mừng thông báo chương trình Flash Sale lớn nhất năm!\n\nGiảm giá lên đến 50% cho tất cả laptop gaming, laptop văn phòng và phụ kiện công nghệ.\n\nChương trình chỉ diễn ra trong 3 ngày, từ 10/07 đến 12/07/2026. Đừng bỏ lỡ cơ hội sở hữu sản phẩm yêu thích với mức giá tốt nhất!'}
                      style={{ resize: 'vertical', minHeight: '120px', lineHeight: '1.6' }}
                    />
                  </div>
                </>
              ) : (
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
              )}

              <div>
                <label className="form-label text-secondary fs-7 mb-1">Nhóm Đối Tượng Nhận Email</label>
                <select
                  value={formData.targetGroup}
                  onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                  className="form-select tech-input"
                >
                  <option value="ALL_CUSTOMERS">Tất cả người dùng trên hệ thống</option>
                </select>
              </div>

              <div className="d-flex gap-2 mt-1">
                {mode === 'custom' && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary py-2 flex-shrink-0 fs-7 d-flex align-items-center gap-2"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  >
                    {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                    {showPreview ? 'Ẩn' : 'Xem Trước'}
                  </button>
                )}
                <button type="submit" disabled={creating} className="btn btn-danger glow-btn py-2 flex-grow-1 fs-7 d-flex align-items-center justify-content-center gap-2">
                  {creating ? <Loader2 size={16} className="spinner-border spinner-border-sm border-0" /> : <Send size={16} />}
                  Gửi Email Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Panel OR Campaigns History */}
        <div className="col-12 col-xl-6">
          {/* Live Preview */}
          {showPreview && mode === 'custom' && (
            <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h2 className="fs-6 text-white mb-3 d-flex align-items-center gap-2">
                <Eye size={18} className="text-info" /> Xem Trước Email Marketing
              </h2>
              {formData.customSubject && (
                <div className="mb-3 p-2 rounded" style={{ background: 'rgba(15,98,254,0.08)', border: '1px solid rgba(15,98,254,0.2)' }}>
                  <span className="text-secondary" style={{ fontSize: '11px' }}>Subject: </span>
                  <span className="text-white fw-bold" style={{ fontSize: '13px' }}>{formData.customSubject}</span>
                </div>
              )}
              <div
                className="rounded overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.1)', maxHeight: '500px', overflowY: 'auto' }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          )}

          {/* Campaigns History List */}
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
    </main>
  )
}

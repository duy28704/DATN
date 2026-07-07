import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { FileText, Edit3, Eye, Check, X, Plus, Save, Loader2 } from 'lucide-react'

export default function EmailTemplatesManager() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await apiService.adminEmails.getTemplates()
      setTemplates(data || [])
    } catch (err) {
      console.error('Lỗi khi lấy mẫu email:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleEdit = (tmpl) => {
    setSelectedTemplate({ ...tmpl })
    setPreviewMode(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedTemplate) return
    setSaving(true)
    setMsg('')
    try {
      await apiService.adminEmails.saveTemplate(selectedTemplate)
      setMsg('Lưu mẫu email thành công!')
      fetchTemplates()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fs-4 text-white display-font mb-1">QUẢN LÝ MẪU EMAIL (EMAIL TEMPLATES)</h1>
          <p className="text-secondary fs-7 mb-0">Tùy chỉnh nội dung và biến động cho các mẫu email hệ thống.</p>
        </div>
      </div>

      {msg && (
        <div className="alert alert-info py-2 px-3 fs-7 border-0 bg-info bg-opacity-10 text-info mb-4">
          {msg}
        </div>
      )}

      <div className="row g-4">
        {/* Templates List */}
        <div className="col-12 col-lg-5">
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="fs-6 text-white mb-3 d-flex align-items-center gap-2">
              <FileText size={18} className="text-danger" /> Danh Sách Mẫu Email
            </h2>

            {loading ? (
              <div className="text-center py-4 text-secondary fs-7">Đang tải danh sách mẫu...</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className={`p-3 rounded border cursor-pointer transition-smooth ${selectedTemplate?.id === tmpl.id ? 'border-danger bg-black bg-opacity-40' : 'border-secondary border-opacity-25 bg-primary bg-opacity-20'}`}
                    onClick={() => handleEdit(tmpl)}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 fs-8">{tmpl.code}</span>
                      <span className={`badge ${tmpl.isActive ? 'bg-success' : 'bg-secondary'} fs-8`}>{tmpl.isActive ? 'Hoạt động' : 'Tắt'}</span>
                    </div>
                    <h6 className="fs-7 text-white fw-bold mb-1">{tmpl.name}</h6>
                    <p className="text-secondary fs-8 mb-0 text-truncate">{tmpl.subjectTemplate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Editor / Preview */}
        <div className="col-12 col-lg-7">
          {selectedTemplate ? (
            <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="fs-6 text-white mb-0">Chỉnh Sửa Mẫu: <span className="text-danger">{selectedTemplate.name}</span></h2>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${!previewMode ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setPreviewMode(false)}
                  >
                    <Edit3 size={14} className="me-1" /> Soạn thảo
                  </button>
                  <button
                    className={`btn btn-sm ${previewMode ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setPreviewMode(true)}
                  >
                    <Eye size={14} className="me-1" /> Xem trước
                  </button>
                </div>
              </div>

              {!previewMode ? (
                <form onSubmit={handleSave} className="d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-secondary fs-7 mb-1">Mã mẫu (Code)</label>
                      <input type="text" readOnly value={selectedTemplate.code} className="form-control tech-input bg-black bg-opacity-40" />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-secondary fs-7 mb-1">Tên mẫu</label>
                      <input
                        type="text"
                        required
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                        className="form-control tech-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-secondary fs-7 mb-1">Tiêu đề mẫu (Subject Template)</label>
                    <input
                      type="text"
                      required
                      value={selectedTemplate.subjectTemplate}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subjectTemplate: e.target.value })}
                      className="form-control tech-input"
                    />
                  </div>

                  <div>
                    <label className="form-label text-secondary fs-7 mb-1">Nội dung HTML mẫu (Body HTML)</label>
                    <textarea
                      rows={10}
                      required
                      value={selectedTemplate.bodyHtml}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, bodyHtml: e.target.value })}
                      className="form-control tech-input font-monospace fs-8"
                    />
                  </div>

                  <div className="p-2 rounded bg-black bg-opacity-40 fs-8 text-secondary">
                    <span>Biến khả dụng: </span>
                    <strong className="text-danger">{selectedTemplate.variablesJson || '["customerName", "otpCode", "orderId", "totalAmount"]'}</strong>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <button type="submit" disabled={saving} className="btn btn-danger glow-btn px-4 py-2 fs-7 d-flex align-items-center gap-2">
                      {saving ? <Loader2 size={16} className="spinner-border spinner-border-sm border-0" /> : <Save size={16} />}
                      Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <label className="form-label text-secondary fs-7 mb-2">Xem trước giao diện Email HTML:</label>
                  <div
                    className="p-4 rounded bg-white text-dark overflow-auto"
                    style={{ minHeight: '350px', maxHeight: '500px' }}
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded text-center text-secondary border border-secondary border-opacity-25" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              Chọn một mẫu email bên trái để xem và chỉnh sửa.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

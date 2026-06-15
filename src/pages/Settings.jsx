import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

function Settings() {
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    securityAlerts: true,
    twoFactor: false
  })

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSuccess('Cài đặt hệ thống đã được lưu thành công!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Cài đặt hệ thống</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>
      </div>

      <section className="section settings">
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body pt-3">
                <h5 className="card-title mb-4">Cấu hình bảo mật & thông báo</h5>

                {success && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                    <ShieldCheck size={18} />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSave}>
                  <div className="mb-4">
                    <h6 className="text-dark fw-bold border-bottom pb-2 mb-3">Thông báo từ hệ thống</h6>
                    
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="emailNotify"
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                      />
                      <label className="form-check-label text-dark" htmlFor="emailNotify">
                        Nhận báo cáo doanh thu & đơn hàng qua email hàng tuần
                      </label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="smsNotify"
                        checked={settings.smsNotifications}
                        onChange={() => handleToggle('smsNotifications')}
                      />
                      <label className="form-check-label text-dark" htmlFor="smsNotify">
                        Nhận tin nhắn SMS cảnh báo khi có đơn hàng giá trị cao cần phê duyệt
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-dark fw-bold border-bottom pb-2 mb-3">Bảo mật hệ thống</h6>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="securityAlert"
                        checked={settings.securityAlerts}
                        onChange={() => handleToggle('securityAlerts')}
                      />
                      <label className="form-check-label text-dark" htmlFor="securityAlert">
                        Cảnh báo bảo mật khi phát hiện đăng nhập từ IP lạ
                      </label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="twoFactor"
                        checked={settings.twoFactor}
                        onChange={() => handleToggle('twoFactor')}
                      />
                      <label className="form-check-label text-dark" htmlFor="twoFactor">
                        Kích hoạt xác thực 2 lớp (2FA) khi thực hiện rút tiền hoặc xuất báo cáo
                      </label>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button type="submit" className="btn btn-primary px-4 py-2">
                      Lưu cấu hình
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Settings

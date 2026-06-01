import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import SEO from '../components/SEO'
import { ShieldAlert, CheckCircle, Mail, Lock, User, LogOut, Calendar, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Login = ({ setCurrentPage }) => {
  const { user, error, loading, login, register, logout, setError } = useContext(AuthContext)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [successMsg, setSuccessMsg] = useState('')

  // Clear errors on mode switch
  useEffect(() => {
    setError('')
  }, [isLoginMode, setError])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoginMode) {
      const ok = await login(formData.email, formData.password)
      if (ok) {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...')
        setTimeout(() => {
          setSuccessMsg('')
          setCurrentPage('home')
        }, 1200)
      }
    } else {
      const ok = await register(formData.name, formData.email, formData.password)
      if (ok) {
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...')
        setTimeout(() => {
          setSuccessMsg('')
          setCurrentPage('home')
        }, 1200)
      }
    }
  }

  return (
    <>
      <SEO
        title={user ? 'Tài Khoản Của Tôi' : (isLoginMode ? 'Đăng Nhập' : 'Đăng Ký')}
        description="Đăng nhập hoặc đăng ký tài khoản tại NEXUS Tech để cập nhật thông tin vận chuyển, quản lý đơn hàng công nghệ và nhận nhiều ưu đãi độc quyền."
        keywords="đăng nhập nexus, tài khoản công nghệ, đăng ký tài khoản thương mại điện tử"
      />

      <div className="container py-5 px-4 px-md-5 d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
        <AnimatePresence mode="wait">
          {user ? (
            /* Logged in state dashboard view */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-100 p-4 rounded text-start"
              style={{ maxWidth: '640px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <h1 className="fs-3 text-white display-font mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                Tài Khoản Khách Hàng
              </h1>

              <div className="row g-4">
                <div className="col-12 col-md-5 text-center text-md-start">
                  <div className="d-inline-flex bg-danger bg-opacity-10 p-3 rounded-circle text-danger mb-3">
                    <User size={48} />
                  </div>
                  <h3 className="fs-5 text-white display-font mb-1">{user.name}</h3>
                  <p className="text-secondary fs-7 mb-3">{user.email}</p>
                  
                  <div className="d-flex align-items-center gap-1 text-secondary fs-8 mb-4">
                    <Calendar size={14} />
                    <span>Tham gia: {user.joinedDate}</span>
                  </div>

                  <button 
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
                    onClick={logout}
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>

                {/* Mock order tracking */}
                <div className="col-12 col-md-7" style={{ borderLeft: '1px solid var(--border-color)' }}>
                  <h3 className="fs-6 text-uppercase text-danger tracking-wider mb-3 display-font">
                    Lịch Sử Đơn Hàng
                  </h3>
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded bg-black d-flex justify-content-between align-items-center" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div>
                        <span className="d-flex align-items-center gap-1 text-white fw-medium fs-7 mb-1">
                          <Package size={14} className="text-danger" /> Mã đơn: #NX-92841
                        </span>
                        <span className="text-secondary fs-8" style={{ fontSize: '0.75rem' }}>Đã giao ngày: 15/05/2026</span>
                      </div>
                      <span className="badge bg-success fs-8" style={{ fontSize: '0.7rem' }}>Thành công</span>
                    </div>
                    <div className="p-3 rounded bg-black d-flex justify-content-between align-items-center" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div>
                        <span className="d-flex align-items-center gap-1 text-white fw-medium fs-7 mb-1">
                          <Package size={14} className="text-danger" /> Mã đơn: #NX-94205
                        </span>
                        <span className="text-secondary fs-8" style={{ fontSize: '0.75rem' }}>Đặt mua ngày: 30/05/2026</span>
                      </div>
                      <span className="badge bg-danger fs-8" style={{ fontSize: '0.7rem' }}>Đang vận chuyển</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Login Form view */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-100 p-4 p-md-5 rounded text-start"
              style={{ maxWidth: '440px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <h1 className="fs-3 text-white display-font mb-2 text-center">
                {isLoginMode ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
              </h1>
              <p className="text-secondary text-center fs-7 mb-4">
                {isLoginMode ? 'Chào mừng bạn quay lại hệ thống NEXUS' : 'Nhận đặc quyền mua hàng giới hạn sớm nhất'}
              </p>

              {/* Success Notification */}
              {successMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 fs-7 py-2 px-3 border-0 bg-success bg-opacity-10 text-success mb-4">
                  <CheckCircle size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error Notification */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 fs-7 py-2 px-3 border-0 bg-danger bg-opacity-10 text-danger mb-4">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {/* Form fields */}
                {!isLoginMode && (
                  <div>
                    <label className="form-label text-secondary fs-7 mb-1">Tên Hiển Thị</label>
                    <div className="position-relative">
                      <User size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                      <input
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control tech-input ps-5"
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label text-secondary fs-7 mb-1">Địa chỉ Email</label>
                  <div className="position-relative">
                    <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control tech-input ps-5"
                      placeholder="email@vidu.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-secondary fs-7 mb-1">Mật khẩu</label>
                  <div className="position-relative">
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input
                      type="password"
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control tech-input ps-5"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-danger w-100 py-3 mt-3 glow-btn d-flex align-items-center justify-content-center"
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-white" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    isLoginMode ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản'
                  )}
                </button>
              </form>

              {/* Mode switch */}
              <div className="mt-4 text-center">
                <button
                  className="btn btn-link text-secondary hover-red p-0 border-0 fs-7 text-decoration-none"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                >
                  {isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Login

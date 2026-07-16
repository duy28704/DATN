import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import SEO from '../components/SEO'
import {
  ShieldAlert,
  CheckCircle,
  Mail,
  Lock,
  User,
  LogOut,
  Calendar,
  Package,
  Edit3,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader2,
  Truck,
  Smartphone,
  Info,
  RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiService, validators } from '../services/api'
import TurnstileWidget from '../components/TurnstileWidget'

const Login = ({ setCurrentPage }) => {
  const { user, error, loading, login, verifyOtp, register, updateUserProfile, logout, setError } = useContext(AuthContext)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [successMsg, setSuccessMsg] = useState('')

  // CAPTCHA and OTP states
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetTrigger, setTurnstileResetTrigger] = useState(0)
  const [otpMode, setOtpMode] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpTarget, setOtpTarget] = useState({ username: '', email: '' })
  const [resendTimer, setResendTimer] = useState(0)

  // Reset OTP state when mode changes
  useEffect(() => {
    if (isLoginMode && !user) {
      setOtpMode(false)
      setOtpCode('')
    }
  }, [isLoginMode, user])

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'orders', 'installments'

  // Tab 1: Edit Profile states
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', phone: '', address: '', dob: '', gender: '' })
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' })
  const [profileFieldErrors, setProfileFieldErrors] = useState({ name: '', phone: '', dob: '', address: '' })

  // Tab 2: Orders states
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Tab 3: Installment requests states
  const [installments, setInstallments] = useState([])
  const [installmentsLoading, setInstallmentsLoading] = useState(false)

  // Clear errors on mode switch
  useEffect(() => {
    setError('')
    setFieldErrors({ name: '', email: '', password: '' })
  }, [isLoginMode, setError])

  // Populate profile fields when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob || '',
        gender: user.gender || 'Nam'
      })
    }
  }, [user])

  // Fetch Orders and Installments data on tab activation
  useEffect(() => {
    if (!user) return

    const loadOrdersData = async () => {
      setOrdersLoading(true)
      try {
        const history = await apiService.orders.getHistory(user.email)
        setOrders(history)
      } catch (err) {
        console.error(err)
      } finally {
        setOrdersLoading(false)
      }
    }

    const loadInstallmentsData = async () => {
      setInstallmentsLoading(true)
      try {
        const reqs = await apiService.installments.getRequests(user.email)
        setInstallments(reqs)
      } catch (err) {
        console.error(err)
      } finally {
        setInstallmentsLoading(false)
      }
    }

    if (activeTab === 'orders') {
      loadOrdersData()
    } else if (activeTab === 'installments') {
      loadInstallmentsData()
    }
  }, [activeTab, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    setProfileFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    // Client-side validations
    let hasErr = false
    const errs = { name: '', email: '', password: '' }

    if (isLoginMode) {
      if (!formData.email) {
        errs.email = 'Email hoặc Tên đăng nhập không được để trống'
        hasErr = true
      }
      if (!formData.password) {
        errs.password = 'Mật khẩu không được để trống'
        hasErr = true
      }
    } else {
      const emailVal = validators.email(formData.email)
      if (emailVal) {
        errs.email = emailVal
        hasErr = true
      }

      const pwdVal = validators.password(formData.password)
      if (pwdVal) {
        errs.password = pwdVal
        hasErr = true
      }

      const nameVal = validators.name(formData.name)
      if (nameVal) {
        errs.name = nameVal
        hasErr = true
      }
    }

    if (hasErr) {
      setFieldErrors(errs)
      return
    }

    if (isLoginMode) {
      if (!turnstileToken) {
        setError('Vui lòng hoàn tất xác minh bảo mật (Turnstile CAPTCHA).')
        return
      }

      const res = await login(formData.email, formData.password, null, null, turnstileToken)
      if (res && res.otpRequired) {
        setSuccessMsg('Thông tin đăng nhập hợp lệ! Mã OTP đã được gửi về email của bạn.')
        setOtpTarget({ username: res.username, email: res.email })
        setOtpMode(true)
        setResendTimer(60)
        setTimeout(() => setSuccessMsg(''), 4000)
      } else if (res && res.success) {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...')
        setTimeout(() => {
          setSuccessMsg('')
          const saved = JSON.parse(localStorage.getItem('nexus_user'))
          if (saved && (saved.role === 'ADMIN' || saved.role === 'STAFF')) {
            setCurrentPage('dashboard')
          } else {
            setCurrentPage('shop')
          }
        }, 1200)
      } else {
        // Reset turnstile widget on error
        setTurnstileResetTrigger(prev => prev + 1)
        setTurnstileToken('')
      }
    } else {
      const ok = await register(formData.name, formData.email, formData.password)
      if (ok) {
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...')
        setTimeout(() => {
          setSuccessMsg('')
          const saved = JSON.parse(localStorage.getItem('nexus_user'))
          if (saved && (saved.role === 'ADMIN' || saved.role === 'STAFF')) {
            setCurrentPage('dashboard')
          } else {
            setCurrentPage('shop')
          }
        }, 1200)
      }
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    const ok = await verifyOtp(otpTarget.username, otpCode)
    if (ok) {
      setSuccessMsg('Xác thực OTP thành công! Đang chuyển hướng...')
      setTimeout(() => {
        setSuccessMsg('')
        const saved = JSON.parse(localStorage.getItem('nexus_user'))
        if (saved && (saved.role === 'ADMIN' || saved.role === 'STAFF')) {
          setCurrentPage('dashboard')
        } else {
          setCurrentPage('shop')
        }
      }, 1200)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setError('')
    setSuccessMsg('')
    try {
      await apiService.auth.resendOtp(otpTarget.username)
      setSuccessMsg('Đã gửi lại mã OTP mới về email của bạn!')
      setResendTimer(60)
      setOtpCode('')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.message || 'Gửi lại mã OTP thất bại. Vui lòng thử lại.')
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileFieldErrors({ name: '', phone: '', dob: '', address: '' })

    // Validate fields
    let hasErr = false
    const errs = { name: '', phone: '', dob: '', address: '' }

    const nameVal = validators.name(profileData.name)
    if (nameVal) {
      errs.name = nameVal
      hasErr = true
    }

    const phoneVal = validators.phone(profileData.phone)
    if (phoneVal) {
      errs.phone = phoneVal
      hasErr = true
    }

    const dobVal = validators.dob(profileData.dob)
    if (dobVal) {
      errs.dob = dobVal
      hasErr = true
    }

    const addrVal = validators.address(profileData.address)
    if (addrVal) {
      errs.address = addrVal
      hasErr = true
    }

    if (hasErr) {
      setProfileFieldErrors(errs)
      return
    }

    const ok = await updateUserProfile(profileData)
    if (ok) {
      setProfileSuccess('Cập nhật thông tin cá nhân thành công!')
      setEditMode(false)
      setTimeout(() => setProfileSuccess(''), 4000)
    } else {
      setProfileError('Có lỗi xảy ra khi cập nhật thông tin.')
    }
  }

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
      case 'Đang vận chuyển':
        return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
      case 'Chờ xác nhận':
      case 'Chờ duyệt':
        return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25'
      case 'Đã phê duyệt':
        return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
      default:
        return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'
    }
  }

  const translatePayment = (method) => {
    const methods = {
      cod: 'Thanh toán khi nhận hàng (COD)',
      visa: 'Thẻ Quốc tế Visa/Mastercard/JCB',
      atm: 'Thẻ ATM Nội địa / Internet Banking',
      momo: 'Ví điện tử MoMo'
    }
    return methods[method] || method
  }

  return (
    <>
      <SEO
        title={user ? 'Tài Khoản Của Tôi' : (isLoginMode ? 'Đăng Nhập' : 'Đăng Ký')}
        description="Đăng nhập hoặc đăng ký tài khoản tại NEXUS Tech để cập nhật thông tin vận chuyển, quản lý đơn hàng công nghệ và nhận nhiều ưu đãi độc quyền."
        keywords="đăng nhập nexus, tài khoản công nghệ, đăng ký tài khoản thương mại điện tử"
      />

      <div className={`container py-5 px-4 px-md-5 ${!user ? 'd-flex flex-column align-items-center justify-content-center' : ''}`} style={{ minHeight: !user ? '70vh' : 'auto' }}>
        <AnimatePresence mode="wait">
          {user ? (
            /* Logged in state - Dashboard view */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-100 rounded text-start"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              {/* Dashboard Header Banner */}
              <div className="p-4 p-md-5 rounded-top d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(255,0,60,0.08) 0%, rgba(5,5,5,0) 100%)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-1 rounded-circle border border-danger border-opacity-50" style={{ width: '68px', height: '68px', overflow: 'hidden' }}>
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt="Avatar"
                      className="img-fluid rounded-circle w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h1 className="fs-4 text-white display-font mb-1">{user.name}</h1>
                    <p className="text-secondary fs-7 mb-0 d-flex align-items-center gap-2">
                      <Mail size={12} /> {user.email}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-md-end text-secondary fs-8">
                    <div className="d-flex align-items-center gap-1">
                      <Calendar size={12} />
                      <span>Ngày tham gia: {user.joinedDate}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
                    onClick={logout}
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>

              {/* Layout Content: Tab system */}
              <div className="row g-0">
                {/* Side Tab Menu */}
                <div className="col-12 col-md-3 border-end" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="d-flex flex-row flex-md-column p-2 gap-1 overflow-auto">
                    <button
                      className={`btn w-100 py-3 text-start fs-7 d-flex align-items-center gap-2 border-0 rounded ${activeTab === 'profile' ? 'bg-danger text-white' : 'text-secondary bg-transparent hover-red'}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <User size={16} /> Hồ sơ cá nhân
                    </button>
                    <button
                      className={`btn w-100 py-3 text-start fs-7 d-flex align-items-center gap-2 border-0 rounded ${activeTab === 'orders' ? 'bg-danger text-white' : 'text-secondary bg-transparent hover-red'}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      <Package size={16} /> Lịch sử đơn hàng
                    </button>
                    <button
                      className={`btn w-100 py-3 text-start fs-7 d-flex align-items-center gap-2 border-0 rounded ${activeTab === 'installments' ? 'bg-danger text-white' : 'text-secondary bg-transparent hover-red'}`}
                      onClick={() => setActiveTab('installments')}
                    >
                      <CreditCard size={16} /> Hồ sơ trả góp
                    </button>
                  </div>
                </div>

                {/* Main Tab Panel */}
                <div className="col-12 col-md-9 p-4 p-md-5">
                  <AnimatePresence mode="wait">
                    {/* Tab 1: Profile Information details & edit */}
                    {activeTab === 'profile' && (
                      <motion.div
                        key="tab-profile"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h2 className="fs-5 text-white display-font mb-0">THÔNG TIN TÀI KHOẢN</h2>
                          {!editMode && (
                            <button
                              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
                              onClick={() => setEditMode(true)}
                            >
                              <Edit3 size={14} /> Chỉnh sửa
                            </button>
                          )}
                        </div>

                        {profileSuccess && (
                          <div className="alert alert-success d-flex align-items-center gap-2 fs-7 py-2 px-3 border-0 bg-success bg-opacity-10 text-success mb-4">
                            <CheckCircle size={16} />
                            <span>{profileSuccess}</span>
                          </div>
                        )}

                        {profileError && (
                          <div className="alert alert-danger d-flex align-items-center gap-2 fs-7 py-2 px-3 border-0 bg-danger bg-opacity-10 text-danger mb-4">
                            <ShieldAlert size={16} />
                            <span>{profileError}</span>
                          </div>
                        )}

                        {editMode ? (
                          <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-4">
                            <div className="row g-3">
                              <div className="col-12 col-sm-6">
                                <label className="form-label text-secondary fs-7 mb-1">Họ và Tên</label>
                                <input
                                  type="text"
                                  required
                                  name="name"
                                  value={profileData.name}
                                  onChange={handleProfileChange}
                                  className={`form-control tech-input w-100 ${profileFieldErrors.name ? 'is-invalid border-danger' : ''}`}
                                />
                                {profileFieldErrors.name && <span className="text-danger fs-8 mt-1 d-block">{profileFieldErrors.name}</span>}
                              </div>
                              <div className="col-12 col-sm-6">
                                <label className="form-label text-secondary fs-7 mb-1">Số điện thoại</label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={profileData.phone}
                                  onChange={handleProfileChange}
                                  className={`form-control tech-input w-100 ${profileFieldErrors.phone ? 'is-invalid border-danger' : ''}`}
                                  placeholder="Nhập SĐT nhận hàng"
                                />
                                {profileFieldErrors.phone && <span className="text-danger fs-8 mt-1 d-block">{profileFieldErrors.phone}</span>}
                              </div>
                              <div className="col-12 col-sm-6">
                                <label className="form-label text-secondary fs-7 mb-1">Ngày sinh</label>
                                <input
                                  type="date"
                                  name="dob"
                                  value={profileData.dob}
                                  onChange={handleProfileChange}
                                  className={`form-control tech-input w-100 ${profileFieldErrors.dob ? 'is-invalid border-danger' : ''}`}
                                />
                                {profileFieldErrors.dob && <span className="text-danger fs-8 mt-1 d-block">{profileFieldErrors.dob}</span>}
                              </div>
                              <div className="col-12 col-sm-6">
                                <label className="form-label text-secondary fs-7 mb-1">Giới tính</label>
                                <select
                                  name="gender"
                                  value={profileData.gender}
                                  onChange={handleProfileChange}
                                  className="form-select tech-input w-100"
                                >
                                  <option value="Nam">Nam</option>
                                  <option value="Nữ">Nữ</option>
                                  <option value="Khác">Khác</option>
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label text-secondary fs-7 mb-1">Địa chỉ mặc định</label>
                                <input
                                  type="text"
                                  name="address"
                                  value={profileData.address}
                                  onChange={handleProfileChange}
                                  className={`form-control tech-input w-100 ${profileFieldErrors.address ? 'is-invalid border-danger' : ''}`}
                                  placeholder="Nhập địa chỉ giao hàng mặc định"
                                />
                                {profileFieldErrors.address && <span className="text-danger fs-8 mt-1 d-block">{profileFieldErrors.address}</span>}
                              </div>
                            </div>

                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                type="button"
                                className="btn btn-outline-secondary px-4 py-2 fs-7"
                                onClick={() => { setEditMode(false); setProfileFieldErrors({ name: '', phone: '', dob: '', address: '' }); }}
                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                              >
                                Hủy bỏ
                              </button>
                              <button
                                type="submit"
                                className="btn btn-danger px-4 py-2 glow-btn fs-7"
                                disabled={loading}
                              >
                                {loading ? <Loader2 size={16} className="spinner-border spinner-border-sm border-0" /> : 'Lưu thay đổi'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            <div className="p-3 rounded bg-black d-flex flex-column gap-3" style={{ border: '1px solid rgba(255,255,255,0.02)' }}>
                              <div className="row g-2 align-items-center">
                                <div className="col-4 col-sm-3 text-secondary fs-7">Số điện thoại:</div>
                                <div className="col-8 col-sm-9 text-white fw-medium d-flex align-items-center gap-2 fs-7">
                                  <Smartphone size={14} className="text-secondary" /> {user.phone || 'Chưa cập nhật'}
                                </div>
                              </div>
                              <div className="row g-2 align-items-center">
                                <div className="col-4 col-sm-3 text-secondary fs-7">Ngày sinh:</div>
                                <div className="col-8 col-sm-9 text-white fw-medium d-flex align-items-center gap-2 fs-7">
                                  <Calendar size={14} className="text-secondary" /> {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                </div>
                              </div>
                              <div className="row g-2 align-items-center">
                                <div className="col-4 col-sm-3 text-secondary fs-7">Giới tính:</div>
                                <div className="col-8 col-sm-9 text-white fw-medium fs-7">{user.gender || 'Chưa cập nhật'}</div>
                              </div>
                              <div className="row g-2 align-items-start">
                                <div className="col-4 col-sm-3 text-secondary fs-7">Địa chỉ nhận hàng:</div>
                                <div className="col-8 col-sm-9 text-white fw-medium d-flex align-items-start gap-2 fs-7">
                                  <MapPin size={14} className="text-secondary mt-1 flex-shrink-0" />
                                  <span>{user.address || 'Chưa cập nhật địa chỉ giao hàng mặc định'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="alert alert-info d-flex align-items-start gap-2 fs-8 bg-info bg-opacity-5 border-0 text-secondary mb-0 p-3">
                              <Info size={16} className="text-info mt-1 flex-shrink-0" />
                              <span>Địa chỉ giao hàng này sẽ được tự động điền khi bạn tiến hành thanh toán giỏ hàng để tiết kiệm thời gian nhập liệu.</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Tab 2: Orders History list & expands */}
                    {activeTab === 'orders' && (
                      <motion.div
                        key="tab-orders"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="fs-5 text-white display-font mb-4">LỊCH SỬ ĐƠN HÀNG</h2>

                        {ordersLoading ? (
                          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
                            <Loader2 size={36} className="spinner-border spinner-border-sm text-danger border-0" style={{ width: '36px', height: '36px' }} />
                            <span className="text-secondary fs-7">Đang tải lịch sử mua hàng...</span>
                          </div>
                        ) : orders.length === 0 ? (
                          <div className="text-center py-5 bg-black rounded" style={{ border: '1px solid rgba(255,255,255,0.02)' }}>
                            <Package size={48} className="text-secondary mb-3" />
                            <p className="text-secondary fs-7 mb-0">Bạn chưa thực hiện bất kỳ đơn hàng nào.</p>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {orders.map((order) => {
                              const isExpanded = expandedOrder === order.id
                              return (
                                <div
                                  key={order.id}
                                  className="rounded overflow-hidden transition-smooth"
                                  style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: isExpanded ? '1px solid var(--accent-red)' : '1px solid var(--border-color)'
                                  }}
                                >
                                  {/* Order Header Summary Row */}
                                  <div
                                    className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3 cursor-pointer"
                                    onClick={() => toggleOrder(order.id)}
                                  >
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="p-2 bg-black rounded text-danger">
                                        <Package size={20} />
                                      </div>
                                      <div>
                                        <h4 className="fs-7 text-white display-font mb-1">MÃ ĐƠN: #{order.id}</h4>
                                        <span className="text-secondary fs-8">Ngày đặt: {order.orderDate}</span>
                                      </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3">
                                      <span className="fs-7 text-white fw-bold display-font">{order.total.toLocaleString('vi-VN')} ₫</span>
                                      <span className={`badge py-2 px-3 rounded-pill fs-8 ${getStatusBadgeClass(order.status)}`}>
                                        {order.status}
                                      </span>
                                      <button className="btn btn-link text-secondary p-0 border-0">
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded Detailed View */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-top overflow-hidden"
                                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                                      >
                                        <div className="p-4 d-flex flex-column gap-4">
                                          {/* Timeline Tracker */}
                                          <div className="p-3 rounded bg-black" style={{ border: '1px solid rgba(255,255,255,0.02)' }}>
                                            <p className="text-secondary fs-8 mb-3 uppercase tracking-wider">Trạng thái vận chuyển</p>
                                            <div className="d-flex align-items-center justify-content-between position-relative py-2">
                                              {/* Connection line background */}
                                              <div className="position-absolute top-50 start-0 w-100 bg-secondary" style={{ height: '2px', transform: 'translateY(-50%)', zIndex: 1, opacity: 0.1 }}></div>

                                              {/* Colored Progress Line */}
                                              <div
                                                className="position-absolute top-50 start-0 bg-danger transition-smooth"
                                                style={{
                                                  height: '2px',
                                                  transform: 'translateY(-50%)',
                                                  zIndex: 2,
                                                  width: order.status === 'Đã giao' ? '100%' : order.status === 'Đang vận chuyển' ? '50%' : '0%'
                                                }}
                                              ></div>

                                              <div className="d-flex flex-column align-items-center gap-1 position-relative" style={{ zIndex: 3 }}>
                                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white bg-danger" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>1</div>
                                                <span className="text-white fw-medium fs-8">Đã đặt hàng</span>
                                              </div>

                                              <div className="d-flex flex-column align-items-center gap-1 position-relative" style={{ zIndex: 3 }}>
                                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${(order.status === 'Đang vận chuyển' || order.status === 'Đã giao') ? 'bg-danger' : 'bg-dark border border-secondary'}`} style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>2</div>
                                                <span className={`fs-8 ${(order.status === 'Đang vận chuyển' || order.status === 'Đã giao') ? 'text-white fw-medium' : 'text-secondary'}`}>Đang giao</span>
                                              </div>

                                              <div className="d-flex flex-column align-items-center gap-1 position-relative" style={{ zIndex: 3 }}>
                                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${order.status === 'Đã giao' ? 'bg-danger' : 'bg-dark border border-secondary'}`} style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>3</div>
                                                <span className={`fs-8 ${order.status === 'Đã giao' ? 'text-white fw-medium' : 'text-secondary'}`}>Đã giao</span>
                                              </div>
                                            </div>
                                            <p className="text-secondary fs-8 text-center mt-3 mb-0">Hành trình: <span className="text-white fw-medium">{order.deliveryDate}</span></p>
                                          </div>

                                          {/* Order Delivery and Payment Info */}
                                          <div className="row g-3 fs-8 text-secondary">
                                            <div className="col-12 col-sm-6">
                                              <p className="text-danger fw-semibold mb-2 uppercase tracking-wider">Thông tin người nhận</p>
                                              <p className="mb-1 text-white fw-medium">{order.customerName}</p>
                                              <p className="mb-1">SĐT: {order.phone}</p>
                                              <p className="mb-0 d-flex gap-1 align-items-start">
                                                <MapPin size={12} className="mt-0.5 flex-shrink-0 text-secondary" />
                                                <span>Địa chỉ: {order.address}</span>
                                              </p>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                              <p className="text-danger fw-semibold mb-2 uppercase tracking-wider">Thanh toán</p>
                                              <p className="mb-1">Phương thức: <span className="text-white fw-medium">{translatePayment(order.paymentMethod)}</span></p>
                                              {order.paymentCardInfo && <p className="mb-1">Thẻ: <span className="text-white fw-medium">{order.paymentCardInfo}</span></p>}
                                              <p className="mb-1">Tạm tính: <span className="text-white display-font">{order.subtotal.toLocaleString('vi-VN')} ₫</span></p>
                                              <p className="mb-1">Phí vận chuyển: <span className="text-white display-font">{order.shipping === 0 ? 'Miễn phí' : `${order.shipping.toLocaleString('vi-VN')} ₫`}</span></p>
                                              <p className="mb-0 text-white">Tổng cộng: <span className="text-danger fw-bold display-font fs-7">{order.total.toLocaleString('vi-VN')} ₫</span></p>
                                            </div>
                                          </div>

                                          {/* Order Items List */}
                                          <div className="d-flex flex-column gap-2">
                                            <p className="text-danger fw-semibold fs-8 mb-2 uppercase tracking-wider">Sản phẩm đã mua</p>
                                            {order.items.map((item, idx) => (
                                              <div
                                                key={idx}
                                                className="d-flex align-items-center justify-content-between p-2 rounded bg-black bg-opacity-40"
                                                style={{ border: '1px solid rgba(255,255,255,0.01)' }}
                                              >
                                                <div className="d-flex align-items-center gap-3">
                                                  <div className="p-1 bg-black rounded" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                                                    <img src={item.image} alt={item.name} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                                  </div>
                                                  <div>
                                                    <h5 className="fs-8 text-white mb-0">{item.name}</h5>
                                                    <span className="text-secondary" style={{ fontSize: '0.7rem' }}>{item.configuration ? `Cấu hình: ${item.configuration}` : `Màu: ${item.selectedColor}`}</span>
                                                  </div>
                                                </div>
                                                <span className="text-white fs-8 display-font">{item.quantity} x {item.price.toLocaleString('vi-VN')} ₫</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Tab 3: Installment consultation requests tracking */}
                    {activeTab === 'installments' && (
                      <motion.div
                        key="tab-installments"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="fs-5 text-white display-font mb-4">HỒ SƠ ĐĂNG KÝ TRẢ GÓP</h2>

                        {installmentsLoading ? (
                          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
                            <Loader2 size={36} className="spinner-border spinner-border-sm text-danger border-0" style={{ width: '36px', height: '36px' }} />
                            <span className="text-secondary fs-7">Đang tải hồ sơ trả góp...</span>
                          </div>
                        ) : installments.length === 0 ? (
                          <div className="text-center py-5 bg-black rounded" style={{ border: '1px solid rgba(255,255,255,0.02)' }}>
                            <CreditCard size={48} className="text-secondary mb-3" />
                            <p className="text-secondary fs-7 mb-0">Bạn chưa gửi yêu cầu trả góp nào.</p>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {installments.map((req) => (
                              <div
                                key={req.id}
                                className="p-4 rounded bg-black text-start"
                                style={{ border: '1px solid var(--border-color)' }}
                              >
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom border-secondary border-opacity-10 pb-3 mb-3">
                                  <div>
                                    <h4 className="fs-7 text-white display-font mb-1">MÃ HỒ SƠ: #{req.id}</h4>
                                    <span className="text-secondary fs-8">Ngày đăng ký: {req.createdDate}</span>
                                  </div>
                                  <span className={`badge py-2 px-3 rounded fs-8 ${getStatusBadgeClass(req.status)}`}>
                                    {req.status}
                                  </span>
                                </div>

                                <div className="row g-3 fs-8 text-secondary">
                                  <div className="col-12 col-sm-6">
                                    <p className="text-danger fw-semibold mb-2 uppercase tracking-wider">Thông tin sản phẩm</p>
                                    <p className="text-white fw-medium mb-1">{req.productName}</p>
                                    <p className="mb-1">Giá bán: <span className="text-white display-font">{req.price.toLocaleString('vi-VN')} ₫</span></p>
                                    <p className="mb-0">Đăng ký tư vấn bởi: <span className="text-white fw-medium">{req.customerName} - {req.phone}</span></p>
                                  </div>

                                  <div className="col-12 col-sm-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                                    <p className="text-danger fw-semibold mb-2 uppercase tracking-wider">Thông tin gói tài chính</p>
                                    <p className="mb-1">Chương trình vay: <span className="text-white">{req.packageName}</span></p>
                                    <p className="mb-1">Ngân hàng liên kết: <span className="text-white fw-medium">{req.bankName}</span></p>
                                    <p className="mb-1">Kỳ hạn chọn vay: <span className="text-white">{req.loanTerm} tháng</span></p>
                                    <p className="mb-0 text-white">Số tiền trả hàng tháng: <span className="text-danger fw-bold display-font fs-7">{req.monthlyEstimate.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span></p>
                                  </div>
                                </div>

                                <div className="mt-3 p-2 bg-dark bg-opacity-40 rounded fs-8 text-secondary d-flex align-items-center gap-2">
                                  <Info size={14} className="text-danger" />
                                  <span>Thời gian đề xuất liên hệ: <strong className="text-white">{req.preferredContactTime === 'morning' ? 'Buổi sáng (8h-12h)' : req.preferredContactTime === 'afternoon' ? 'Buổi chiều (13h30-17h30)' : 'Buổi tối (18h-21h)'}</strong>.</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : otpMode ? (
            /* OTP entry form view */
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-100 p-4 p-md-5 rounded text-start mx-auto"
              style={{ maxWidth: '440px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <h1 className="fs-3 text-white display-font mb-2 text-center">
                XÁC THỰC OTP
              </h1>
              <p className="text-secondary text-center fs-7 mb-4">
                Vui lòng nhập mã OTP 6 chữ số đã được gửi đến địa chỉ email <strong className="text-white">{otpTarget.email}</strong> để hoàn tất đăng nhập.
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

              <form onSubmit={handleOtpSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label text-secondary fs-7 mb-1">Mã xác thực OTP</label>
                  <div className="position-relative">
                    <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="form-control tech-input ps-5 text-center tracking-widest fw-bold fs-5"
                      placeholder="______"
                      style={{ letterSpacing: '0.5em' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-danger w-100 py-3 mt-2 glow-btn d-flex align-items-center justify-content-center"
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-white" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    'Xác Nhận Đăng Nhập'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center d-flex flex-column gap-2 align-items-center">
                <button
                  className="btn btn-link text-secondary hover-red p-0 border-0 fs-7 text-decoration-none"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Gửi lại mã OTP (${resendTimer}s)` : 'Gửi lại mã OTP'}
                </button>
                <button
                  className="btn btn-link text-secondary hover-red p-0 border-0 fs-8 text-decoration-none mt-1"
                  onClick={() => {
                    setOtpMode(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Quay lại màn hình đăng nhập
                </button>
              </div>
            </motion.div>
          ) : (
            /* Login Form view */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-100 p-4 p-md-5 rounded text-start mx-auto"
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
                        className={`form-control tech-input ps-5 ${fieldErrors.name ? 'is-invalid border-danger' : ''}`}
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                    {fieldErrors.name && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.name}</span>}
                  </div>
                )}

                <div>
                  <label className="form-label text-secondary fs-7 mb-1">Địa chỉ Email hoặc Username</label>
                  <div className="position-relative">
                    <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input
                      type="text"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-control tech-input ps-5 ${fieldErrors.email ? 'is-invalid border-danger' : ''}`}
                      placeholder="email@vidu.com hoặc username"
                    />
                  </div>
                  {fieldErrors.email && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.email}</span>}
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
                      className={`form-control tech-input ps-5 ${fieldErrors.password ? 'is-invalid border-danger' : ''}`}
                      placeholder="Tối thiểu 6 ký tự (1 chữ + 1 số)"
                    />
                  </div>
                  {fieldErrors.password && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.password}</span>}
                </div>

                {isLoginMode && (
                  <div>
                    <label className="form-label text-secondary fs-7 mb-1 text-center d-block">Xác minh bảo mật (Cloud CAPTCHA)</label>
                    <TurnstileWidget
                      theme="light"
                      onVerify={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken('')}
                      onError={() => setTurnstileToken('')}
                      resetTrigger={turnstileResetTrigger}
                    />
                  </div>
                )}

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

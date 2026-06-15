import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

function Profile() {
  const { user, updateUserProfile, error: authError } = useContext(AuthContext)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dob: user?.dob || '',
    gender: user?.gender || 'Nam',
    avatarUrl: user?.avatarUrl || ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    const res = await updateUserProfile(formData)
    setLoading(false)
    if (res) {
      setSuccess('Cập nhật hồ sơ thành công!')
    } else {
      setError(authError || 'Có lỗi xảy ra khi cập nhật hồ sơ.')
    }
  }

  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Hồ sơ cá nhân</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
            <li className="breadcrumb-item active">Profile</li>
          </ol>
        </nav>
      </div>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            <div className="card">
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                <img 
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                  alt="Profile" 
                  className="rounded-circle mb-3"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #f6f9ff' }}
                />
                <h2 className="text-dark mb-1">{user?.name || 'Admin'}</h2>
                <h3 className="text-muted fs-7 mb-2">{user?.role || 'STAFF'}</h3>
                <span className="badge bg-light text-dark border">Thành viên từ: {user?.joinedDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            <div className="card">
              <div className="card-body pt-3">
                <h5 className="card-title mb-4">Chi tiết tài khoản</h5>

                {success && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                    <ShieldCheck size={18} />
                    <span>{success}</span>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Địa chỉ Email</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="email" 
                        className="form-control" 
                        value={user?.email || ''} 
                        disabled 
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      />
                      <span className="fs-8 text-muted">Email đăng nhập không thể thay đổi</span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Họ và Tên</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="text" 
                        name="name"
                        className="form-control" 
                        value={formData.name} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Số điện thoại</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="text" 
                        name="phone"
                        className="form-control" 
                        value={formData.phone} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Địa chỉ giao hàng</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="text" 
                        name="address"
                        className="form-control" 
                        value={formData.address} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Ngày sinh</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="date" 
                        name="dob"
                        className="form-control" 
                        value={formData.dob} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Giới tính</label>
                    <div className="col-md-8 col-lg-9">
                      <select 
                        name="gender"
                        className="form-select" 
                        value={formData.gender} 
                        onChange={handleChange}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label text-muted fs-7">Đường dẫn ảnh đại diện</label>
                    <div className="col-md-8 col-lg-9">
                      <input 
                        type="text" 
                        name="avatarUrl"
                        className="form-control" 
                        value={formData.avatarUrl} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="text-center pt-3">
                    <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                      {loading ? (
                        <span className="d-flex align-items-center gap-2">
                          <Loader2 className="spinner-border border-0" style={{ width: '20px', height: '20px' }} />
                          Đang lưu thay đổi...
                        </span>
                      ) : 'Lưu Thay Đổi'}
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

export default Profile

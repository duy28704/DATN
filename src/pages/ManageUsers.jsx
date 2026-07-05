import { useState, useEffect, useContext } from 'react';
import { apiService, validators } from '../services/api';
import { Loader2, Plus, Edit, Trash2, ShieldAlert, Search, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';

const ROLE_DEFAULT_PERMISSIONS = {
  CUSTOMER: [
    'product.view',
    'order.checkout',
    'order.view',
    'installment.submit',
    'installment.view'
  ],
  STAFF: [
    'product.view',
    'product.create',
    'product.update',
    'product.delete',
    'product.import',
    'inventory.view',
    'inventory.manage',
    'stats.view',
    'order.view',
    'order.manage',
    'installment.view'
  ],
  ADMIN: [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'product.view',
    'product.create',
    'product.update',
    'product.delete',
    'product.hard-delete',
    'product.import',
    'product.trash',
    'product.restore',
    'inventory.view',
    'inventory.manage',
    'stats.view',
    'order.checkout',
    'order.view',
    'order.manage',
    'installment.submit',
    'installment.view',
    'settings.manage'
  ]
};

const ALL_PERMISSIONS = [
  { id: 'users.read', label: 'Xem danh sách người dùng', category: 'Người dùng' },
  { id: 'users.create', label: 'Tạo người dùng', category: 'Người dùng' },
  { id: 'users.update', label: 'Sửa người dùng', category: 'Người dùng' },
  { id: 'users.delete', label: 'Xóa người dùng', category: 'Người dùng' },
  { id: 'product.view', label: 'Xem sản phẩm', category: 'Sản phẩm' },
  { id: 'product.create', label: 'Thêm sản phẩm', category: 'Sản phẩm' },
  { id: 'product.update', label: 'Sửa sản phẩm', category: 'Sản phẩm' },
  { id: 'product.delete', label: 'Xóa tạm sản phẩm (Trash)', category: 'Sản phẩm' },
  { id: 'product.hard-delete', label: 'Xóa vĩnh viễn sản phẩm', category: 'Sản phẩm' },
  { id: 'product.import', label: 'Nhập Excel sản phẩm', category: 'Sản phẩm' },
  { id: 'product.trash', label: 'Xem thùng rác sản phẩm', category: 'Sản phẩm' },
  { id: 'product.restore', label: 'Khôi phục sản phẩm', category: 'Sản phẩm' },
  { id: 'inventory.view', label: 'Xem lịch sử kho', category: 'Kho hàng' },
  { id: 'inventory.manage', label: 'Tạo giao dịch kho', category: 'Kho hàng' },
  { id: 'stats.view', label: 'Xem thống kê tìm kiếm/dashboard', category: 'Thống kê' },
  { id: 'order.checkout', label: 'Thanh toán đơn hàng', category: 'Đơn hàng' },
  { id: 'order.view', label: 'Xem lịch sử mua hàng', category: 'Đơn hàng' },
  { id: 'order.manage', label: 'Xem thống kê doanh thu', category: 'Đơn hàng' },
  { id: 'installment.submit', label: 'Đăng ký trả góp', category: 'Trả góp' },
  { id: 'installment.view', label: 'Xem hồ sơ trả góp', category: 'Trả góp' },
  { id: 'settings.manage', label: 'Quản lý cài đặt hệ thống', category: 'Hệ thống' }
];

const groupedPermissions = ALL_PERMISSIONS.reduce((acc, perm) => {
  if (!acc[perm.category]) {
    acc[perm.category] = [];
  }
  acc[perm.category].push(perm);
  return acc;
}, {});

function ManageUsers() {
  const { showToast, showConfirm } = useToast();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    dob: '',
    gender: 'Nam',
    role: 'CUSTOMER',
    enabled: true
  });
  const [userFormErrors, setUserFormErrors] = useState({});

  const handlePermissionToggle = (permId) => {
    setCheckedPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(p => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleRoleChange = (newRole) => {
    setUserFormData({ ...userFormData, role: newRole });
    setCheckedPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || []);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await apiService.users.getAll();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Lỗi khi lấy danh sách người dùng.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddUser = () => {
    setUserFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      address: '',
      dob: '',
      gender: 'Nam',
      role: 'CUSTOMER',
      enabled: true
    });
    setUserFormErrors({});
    setUserModalMode('add');
    setCheckedPermissions(ROLE_DEFAULT_PERMISSIONS['CUSTOMER']);
    setShowUserModal(true);
  };

  const openEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      password: '', // blank by default for safety
      phone: user.phone || '',
      address: user.address || '',
      dob: user.dob || '',
      gender: user.gender || 'Nam',
      role: user.role || 'CUSTOMER',
      enabled: user.enabled !== false
    });
    setUserFormErrors({});
    setUserModalMode('edit');
    const activePerms = user.customPermissions
      ? user.customPermissions.split(',').map(p => p.trim()).filter(Boolean)
      : ROLE_DEFAULT_PERMISSIONS[user.role || 'CUSTOMER'];
    setCheckedPermissions(activePerms);
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormErrors({});
    
    // Validation
    const errs = {};
    const nameErr = validators.name(userFormData.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validators.email(userFormData.email);
    if (emailErr) errs.email = emailErr;

    if (userModalMode === 'add') {
      const pwdErr = validators.password(userFormData.password);
      if (pwdErr) errs.password = pwdErr;
    }

    if (userFormData.phone) {
      const phoneErr = validators.phone(userFormData.phone);
      if (phoneErr) errs.phone = phoneErr;
    }

    if (userFormData.dob) {
      const dobErr = validators.dob(userFormData.dob);
      if (dobErr) errs.dob = dobErr;
    }

    if (Object.keys(errs).length > 0) {
      setUserFormErrors(errs);
      return;
    }

    try {
      const payload = {
        ...userFormData,
        customPermissions: checkedPermissions.join(',')
      };

      if (userModalMode === 'add') {
        await apiService.users.create(payload);
        showToast({ type: 'success', title: 'Thêm thành công', message: 'Đã thêm người dùng mới thành công!' });
      } else {
        await apiService.users.update(selectedUser.userId, payload);
        showToast({ type: 'success', title: 'Cập nhật thành công', message: 'Cập nhật thông tin người dùng thành công!' });
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      setUserFormErrors({ global: err.message || 'Lỗi khi lưu người dùng.' });
    }
  };

  const deleteUser = async (id) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa người dùng',
      message: 'Bạn có chắc chắn muốn xóa người dùng này?'
    });
    if (!confirmed) return;
    try {
      await apiService.users.delete(id);
      showToast({ type: 'success', title: 'Xóa thành công', message: 'Đã xóa người dùng thành công.' });
      loadUsers();
    } catch (err) {
      showToast({ type: 'error', title: 'Lỗi', message: err.message || 'Xóa người dùng thất bại.' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch)
  );

  return (
    <main id="main" className="main">
      <div className="pagetitle d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Quản lý người dùng</h1>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
              <li className="breadcrumb-item active">Users</li>
            </ol>
          </nav>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1 py-2 px-3" onClick={openAddUser}>
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body pt-3">
            <div className="d-flex mb-3 position-relative" style={{ maxWidth: '360px' }}>
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="form-control ps-5"
                style={{ borderRadius: '20px' }}
              />
            </div>

            {usersLoading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                <Loader2 className="spinner-border text-primary border-0" style={{ width: '32px', height: '32px' }} />
                <span className="text-muted fs-8">Đang tải danh sách người dùng...</span>
              </div>
            ) : usersError ? (
              <div className="alert alert-danger d-flex align-items-center gap-2 m-3">
                <ShieldAlert size={18} />
                <span>{usersError}</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Avatar</th>
                      <th scope="col">Họ và Tên</th>
                      <th scope="col">Email / Username</th>
                      <th scope="col">Số điện thoại</th>
                      <th scope="col">Vai trò</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col" className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy người dùng nào.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.userId}>
                          <th scope="row">{u.userId}</th>
                          <td>
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                              alt="Avatar"
                              className="rounded-circle"
                              style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                            />
                          </td>
                          <td><strong className="text-dark">{u.name}</strong></td>
                          <td>
                            <div className="fs-7 text-dark">{u.email}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>@{u.username}</div>
                          </td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : u.role === 'STAFF' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.enabled !== false ? 'bg-success' : 'bg-dark'}`}>
                              {u.enabled !== false ? 'Hoạt động' : 'Khóa'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <button className="btn btn-sm btn-outline-primary p-2" onClick={() => openEditUser(u)}>
                                <Edit size={14} />
                              </button>
                              <button className="btn btn-sm btn-outline-danger p-2" onClick={() => deleteUser(u.userId)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USER ADD/EDIT MODAL OVERLAY */}
      {showUserModal && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto', padding: '40px 10px' }}>
          <div className="card w-100 mx-auto shadow" style={{ maxWidth: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">{userModalMode === 'add' ? 'Thêm Người Dùng Mới' : 'Cập Nhật Người Dùng'}</h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <div className="card-body p-4">
                {userFormErrors.global && (
                  <div className="alert alert-danger py-2 px-3 fs-7 mb-3 d-flex align-items-center gap-2 border-0 bg-danger bg-opacity-10 text-danger">
                    <ShieldAlert size={16} />
                    <span>{userFormErrors.global}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className={`form-control ${userFormErrors.name ? 'is-invalid' : ''}`}
                  />
                  {userFormErrors.name && <span className="invalid-feedback fs-8">{userFormErrors.name}</span>}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className={`form-control ${userFormErrors.email ? 'is-invalid' : ''}`}
                  />
                  {userFormErrors.email && <span className="invalid-feedback fs-8">{userFormErrors.email}</span>}
                </div>

                {userModalMode === 'add' ? (
                  <div className="mb-3">
                    <label className="form-label text-muted fs-7 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className={`form-control ${userFormErrors.password ? 'is-invalid' : ''}`}
                    />
                    {userFormErrors.password && <span className="invalid-feedback fs-8">{userFormErrors.password}</span>}
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label text-muted fs-7 mb-1">Đổi mật khẩu (Bỏ trống nếu giữ nguyên)</label>
                    <input
                      type="password"
                      placeholder="Mật khẩu mới"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="form-control"
                    />
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      className={`form-control ${userFormErrors.phone ? 'is-invalid' : ''}`}
                    />
                    {userFormErrors.phone && <span className="invalid-feedback fs-8">{userFormErrors.phone}</span>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={userFormData.dob}
                      onChange={(e) => setUserFormData({ ...userFormData, dob: e.target.value })}
                      className={`form-control ${userFormErrors.dob ? 'is-invalid' : ''}`}
                    />
                    {userFormErrors.dob && <span className="invalid-feedback fs-8">{userFormErrors.dob}</span>}
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Giới tính</label>
                    <select
                      value={userFormData.gender}
                      onChange={(e) => setUserFormData({ ...userFormData, gender: e.target.value })}
                      className="form-select"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Vai trò</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="form-select"
                    >
                      <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                      <option value="STAFF">STAFF (Nhân viên)</option>
                      <option value="ADMIN">ADMIN (Quản trị viên)</option>
                    </select>
                  </div>
                </div>

                {/* DYNAMIC PERMISSIONS GRID CHECKBOXES */}
                <div className="mb-3 border rounded p-3 bg-light">
                  <label className="form-label text-dark fw-bold fs-7 mb-2 d-block">
                    Phân quyền chi tiết (Custom Permissions)
                  </label>
                  <span className="text-muted d-block mb-3" style={{ fontSize: '0.75rem' }}>
                    Quyền được tự động điền theo vai trò đã chọn. Bạn có thể tick chọn/bỏ chọn để tinh chỉnh quyền chi tiết riêng cho người dùng này.
                  </span>
                  
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="pe-1">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="mb-3">
                        <span className="fw-bold text-primary border-bottom d-block pb-1 mb-2" style={{ fontSize: '0.8rem' }}>{category}</span>
                        <div className="row g-2">
                          {perms.map(perm => {
                            const isChecked = checkedPermissions.includes(perm.id);
                            return (
                              <div key={perm.id} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`perm-check-${perm.id}`}
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(perm.id)}
                                  />
                                  <label 
                                    className="form-check-label text-dark cursor-pointer fw-medium" 
                                    htmlFor={`perm-check-${perm.id}`}
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    {perm.label}
                                    <span className="text-muted d-block font-monospace" style={{ fontSize: '0.625rem' }}>
                                      {perm.id}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={userFormData.address}
                    onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-check form-switch mb-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="userEnabledSwitch"
                    checked={userFormData.enabled}
                    onChange={(e) => setUserFormData({ ...userFormData, enabled: e.target.checked })}
                  />
                  <label className="form-check-label text-muted fs-7" htmlFor="userEnabledSwitch">
                    Kích hoạt tài khoản này
                  </label>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-end gap-2 bg-light py-3 border-top px-4">
                <button type="button" className="btn btn-outline-secondary px-3 py-2 fs-7" onClick={() => setShowUserModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 fs-7">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManageUsers;

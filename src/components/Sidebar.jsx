import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Sidebar({ currentPage }) {
  const { logout } = useContext(AuthContext);

  const isOverview = currentPage === 'dashboard';
  const isProducts = currentPage === 'dashboard/products';
  const isUsers = currentPage === 'dashboard/users';
  const isProfile = currentPage === 'dashboard/profile';
  const isSettings = currentPage === 'dashboard/settings';

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-heading">Hệ thống quản lý</li>

        <li className="nav-item">
          <a className={`nav-link ${isOverview ? '' : 'collapsed'}`} href="#dashboard">
            <i className="bi bi-grid"></i>
            <span>Tổng quan</span>
          </a>
        </li>

        <li className="nav-item">
          <a className={`nav-link ${isProducts ? '' : 'collapsed'}`} href="#dashboard/products">
            <i className="bi bi-laptop"></i>
            <span>Quản lý sản phẩm</span>
          </a>
        </li>

        <li className="nav-item">
          <a className={`nav-link ${isUsers ? '' : 'collapsed'}`} href="#dashboard/users">
            <i className="bi bi-people"></i>
            <span>Quản lý người dùng</span>
          </a>
        </li>

        <li className="nav-heading">Tài khoản</li>

        <li className="nav-item">
          <a className={`nav-link ${isProfile ? '' : 'collapsed'}`} href="#dashboard/profile">
            <i className="bi bi-person"></i>
            <span>Thông tin cá nhân</span>
          </a>
        </li>

        <li className="nav-item">
          <a className={`nav-link ${isSettings ? '' : 'collapsed'}`} href="#dashboard/settings">
            <i className="bi bi-gear"></i>
            <span>Cài đặt</span>
          </a>
        </li>

        <li className="nav-heading">Hành động</li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="#shop">
            <i className="bi bi-shop"></i>
            <span>Xem cửa hàng</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link collapsed text-danger" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
            <i className="bi bi-box-arrow-right text-danger"></i>
            <span className="text-danger">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
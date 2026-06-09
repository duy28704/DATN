function Sidebar({ currentPage }) {
  const isOverview = currentPage === 'dashboard';
  const isProducts = currentPage === 'dashboard/products';
  const isUsers = currentPage === 'dashboard/users';

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

        <li className="nav-heading">Hành động</li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="#shop">
            <i className="bi bi-shop"></i>
            <span>Xem cửa hàng</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

function Header() {
    const { user, logout } = useContext(AuthContext)
    return (
       <header id="header"  className="header fixed-top d-flex align-items-center">

        <div  className="d-flex align-items-center justify-content-between">
          <a href="#dashboard"  className="logo d-flex align-items-center">
            <span  className="d-none d-lg-block">NEXUS Admin</span>
          </a>
          <i  className="bi bi-list toggle-sidebar-btn"></i>
        </div>

        <div  className="search-bar">
          <form  className="search-form d-flex align-items-center" method="POST" action="#">
            <input type="text" name="query" placeholder="Search" title="Enter search keyword" />
            <button type="submit" title="Search"><i  className="bi bi-search"></i></button>
          </form>
        </div> 

        <nav  className="header-nav ms-auto">
          <ul  className="d-flex align-items-center">

            <li  className="nav-item d-block d-lg-none">
              <a  className="nav-link nav-icon search-bar-toggle " href="#">
                <i  className="bi bi-search"></i>
              </a>
            </li>

            <li className="nav-item">
              <NotificationBell />
            </li>  

            <li  className="nav-item dropdown">

              <a  className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                <i  className="bi bi-chat-left-text"></i>
                <span  className="badge bg-success badge-number">3</span>
              </a>  

              <ul  className="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
                <li  className="dropdown-header">
                  You have 3 new messages
                  <a href="#"><span  className="badge rounded-pill bg-primary p-2 ms-2">View all</span></a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li  className="message-item">
                  <a href="#">
                    <img src="assets/img/messages-1.jpg" alt=""  className="rounded-circle" />
                    <div>
                      <h4>Maria Hudson</h4>
                      <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                      <p>4 hrs. ago</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li  className="message-item">
                  <a href="#">
                    <img src="assets/img/messages-2.jpg" alt=""  className="rounded-circle" />
                    <div>
                      <h4>Anna Nelson</h4>
                      <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                      <p>6 hrs. ago</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li  className="message-item">
                  <a href="#">
                    <img src="assets/img/messages-3.jpg" alt=""  className="rounded-circle" />
                    <div>
                      <h4>David Muldon</h4>
                      <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                      <p>8 hrs. ago</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li  className="dropdown-footer">
                  <a href="#">Show all messages</a>
                </li>

              </ul>  

            </li>  

            <li  className="nav-item dropdown pe-3">

              <a  className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                <img src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Profile"  className="rounded-circle" />
                <span  className="d-none d-md-block dropdown-toggle ps-2">{user?.name || 'Admin'}</span>
              </a>  

              <ul  className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                <li  className="dropdown-header">
                  <h6>{user?.name || 'Admin'}</h6>
                  <span>{user?.role || 'STAFF'}</span>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li>
                  <a  className="dropdown-item d-flex align-items-center" href="#dashboard/profile">
                    <i  className="bi bi-person"></i>
                    <span>My Profile</span>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li>
                  <a  className="dropdown-item d-flex align-items-center" href="#dashboard/settings">
                    <i  className="bi bi-gear"></i>
                    <span>Account Settings</span>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li>
                  <a  className="dropdown-item d-flex align-items-center" href="#installments">
                    <i  className="bi bi-question-circle"></i>
                    <span>Installments</span>
                  </a>
                </li>
                <li>
                  <hr  className="dropdown-divider" />
                </li>

                <li>
                  <a  className="dropdown-item d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                    <i  className="bi bi-box-arrow-right"></i>
                    <span>Sign Out</span>
                  </a>
                </li>

              </ul>
            </li>

          </ul>
        </nav>

      </header>
    )
  }
  export default Header
import { useContext, useState } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ShoppingBag, User, Search, Menu, X, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = ({ currentPage, setCurrentPage, onCartOpen }) => {
  const { cartCount } = useContext(CartContext)
  const { user, logout } = useContext(AuthContext)
  const { showToast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNav = (page) => {
    setCurrentPage(page)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Pass search query through page state or similar
      setCurrentPage(`shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="glass-panel sticky-top w-100 py-3 px-4 px-md-5 d-flex align-items-center justify-content-between" style={{ zIndex: 1020, borderBottom: '1px solid var(--border-color)' }}>
        {/* Brand Logo */}
        <div className="d-flex align-items-center">
          <a href="#" className="fs-3 fw-bold text-decoration-none text-white tracking-widest display-font" onClick={(e) => { e.preventDefault(); handleNav('home'); }} style={{ letterSpacing: '0.15em' }}>
            NEXUS<span style={{ color: 'var(--accent-red)' }}>.</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="d-none d-md-flex align-items-center gap-4">
          <a 
            href="#home" 
            className={`fw-medium text-uppercase text-decoration-none fs-7 ${currentPage === 'home' ? 'text-white' : 'text-secondary'}`}
            style={{ fontSize: '0.85rem', letterSpacing: '0.05em', borderBottom: currentPage === 'home' ? '2px solid var(--accent-red)' : '2px solid transparent', paddingBottom: '4px' }}
            onClick={(e) => { e.preventDefault(); handleNav('home'); }}
          >
            Trang Chủ
          </a>
          <a 
              href="#shop" 
              className={`fw-medium text-uppercase text-decoration-none fs-7 ${currentPage.startsWith('shop') ? 'text-white' : 'text-secondary'}`}
              style={{ fontSize: '0.85rem', letterSpacing: '0.05em', borderBottom: currentPage.startsWith('shop') ? '2px solid var(--accent-red)' : '2px solid transparent', paddingBottom: '4px' }}
              onClick={(e) => { e.preventDefault(); handleNav('shop'); }}
            >
              Sản Phẩm
            </a>
            {/* Installments link */}
            <a 
              href="#installments" 
              className={`fw-medium text-uppercase text-decoration-none fs-7 ${currentPage === 'installments' ? 'text-white' : 'text-secondary'}`}
              style={{ fontSize: '0.85rem', letterSpacing: '0.05em', borderBottom: currentPage === 'installments' ? '2px solid var(--accent-red)' : '2px solid transparent', paddingBottom: '4px' }}
              onClick={(e) => { e.preventDefault(); handleNav('installments'); }}
            >
              Trả góp
            </a>
            {/* Compare link */}
            <a 
              href="#compare" 
              className={`fw-medium text-uppercase text-decoration-none fs-7 ${currentPage === 'compare' ? 'text-white' : 'text-secondary'}`}
              style={{ fontSize: '0.85rem', letterSpacing: '0.05em', borderBottom: currentPage === 'compare' ? '2px solid var(--accent-red)' : '2px solid transparent', paddingBottom: '4px' }}
              onClick={(e) => { e.preventDefault(); handleNav('compare'); }}
            >
              So sánh
            </a>
          <a 
            href="#about" 
            className="fw-medium text-uppercase text-decoration-none fs-7 text-secondary"
            style={{ fontSize: '0.85rem', letterSpacing: '0.05em', paddingBottom: '4px' }}
            onClick={(e) => { e.preventDefault(); showToast({ type: 'info', title: 'Sắp ra mắt', message: 'Trang Về Chúng Tôi sẽ được cập nhật sớm nhất!' }) }}
          >
            Về Chúng Tôi
          </a>
        </nav>

        {/* Right Section Actions */}
        <div className="d-flex align-items-center gap-3 gap-md-4">
          {/* Search Toggle */}
          <div className="position-relative d-flex align-items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearchSubmit}
                  className="position-absolute end-100 me-2"
                >
                  <input
                    type="text"
                    className="tech-input py-1 px-3 fs-7"
                    placeholder="Tìm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', height: '36px', fontSize: '0.85rem' }}
                    autoFocus
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button 
              className="btn btn-link text-white p-0 border-0" 
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Account Icon / User Menu */}
          {user ? (
            <div className="dropdown d-none d-md-block">
              <button 
                className="btn btn-link text-white p-0 border-0 d-flex align-items-center gap-1 dropdown-toggle text-decoration-none" 
                type="button" 
                id="userMenu" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                onClick={() => handleNav('login')} // Simple click to page for layout compatibility
              >
                <User size={20} />
                <span className="fs-7 fw-medium" style={{ fontSize: '0.8rem' }}>{user.name}</span>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-link text-white p-0 border-0" 
              onClick={() => handleNav('login')}
              aria-label="Đăng nhập"
            >
              <User size={20} />
            </button>
          )}

          {/* Cart Icon with Motion Badge */}
          <button 
            className="btn btn-link text-white p-0 border-0 position-relative" 
            onClick={onCartOpen}
            aria-label="Mở giỏ hàng"
          >
            <ShoppingBag size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger"
                  style={{ fontSize: '0.65rem', padding: '0.25em 0.5em', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Hamburger Mobile Menu Toggle */}
          <button 
            className="btn btn-link text-white p-0 border-0 d-md-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="glass-panel position-fixed w-100 d-md-none p-4 d-flex flex-column gap-3"
            style={{ top: '65px', left: 0, zIndex: 1010, borderBottom: '1px solid var(--border-color)' }}
          >
            <a 
              href="#home" 
              className={`fs-5 fw-medium text-decoration-none ${currentPage === 'home' ? 'text-white' : 'text-secondary'}`}
              onClick={(e) => { e.preventDefault(); handleNav('home'); }}
            >
              Trang Chủ
            </a>
            <a 
            href="#shop" 
            className={`fs-5 fw-medium text-decoration-none ${currentPage.startsWith('shop') ? 'text-white' : 'text-secondary'}`}
            onClick={(e) => { e.preventDefault(); handleNav('shop'); }}
          >
            Sản Phẩm
          </a>
          {/* Installments link */}
          <a 
            href="#installments" 
            className={`fs-5 fw-medium text-decoration-none ${currentPage === 'installments' ? 'text-white' : 'text-secondary'}`}
            onClick={(e) => { e.preventDefault(); handleNav('installments'); }}
          >
            Trả góp
          </a>
          {/* Compare link */}
          <a 
            href="#compare" 
            className={`fs-5 fw-medium text-decoration-none ${currentPage === 'compare' ? 'text-white' : 'text-secondary'}`}
            onClick={(e) => { e.preventDefault(); handleNav('compare'); }}
          >
            So sánh
          </a>
            <a 
              href="#about" 
              className="fs-5 fw-medium text-decoration-none text-secondary"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); showToast({ type: 'info', title: 'Sắp ra mắt', message: 'Trang Về Chúng Tôi sẽ được cập nhật sớm nhất!' }) }}
            >
              Về Chúng Tôi
            </a>
            <div className="h-line w-100 my-2" style={{ borderTop: '1px solid var(--border-color)' }}></div>
            {user ? (
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-white fs-6">Xin chào, {user.name}</span>
                <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={logout}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              <a 
                href="#login" 
                className="btn btn-danger w-100 py-2 glow-btn text-center text-decoration-none"
                onClick={(e) => { e.preventDefault(); handleNav('login'); }}
              >
                Đăng Nhập
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header

import { useState } from 'react'
import { Send } from 'lucide-react'

const Footer = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const handleNav = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="w-100 py-5 mt-auto" style={{ backgroundColor: '#09090b', borderTop: '1px solid var(--border-color)' }}>
      <div className="container px-4 px-md-5">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-12 col-lg-4">
            <h3 className="fs-4 text-white mb-3 display-font" style={{ letterSpacing: '0.1em' }}>
              NEXUS<span style={{ color: 'var(--accent-red)' }}>.</span>
            </h3>
            <p className="fs-7 text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
              Nơi quy tụ những thiết bị công nghệ cao cấp nhất, kết hợp hoàn hảo giữa thiết kế cơ học tối giản và hiệu năng đỉnh cao tương lai.
            </p>
            <div className="d-flex align-items-center gap-3">
              <a href="#" className="text-secondary hover-red" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-secondary hover-red" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-secondary hover-red" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-secondary hover-red" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Sitemap Links (Great for SEO) */}
          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="fs-6 text-white text-uppercase tracking-wider mb-3 display-font" style={{ fontSize: '0.85rem' }}>
              Khám Phá
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <li>
                <a href="#home" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('home'); }}>
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#shop" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Tất cả sản phẩm
                </a>
              </li>
              <li>
                <a href="#featured" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Sản phẩm nổi bật
                </a>
              </li>
              <li>
                <a href="#sale" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Khuyến mãi
                </a>
              </li>
            </ul>
          </div>

          {/* Core Categories */}
          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="fs-6 text-white text-uppercase tracking-wider mb-3 display-font" style={{ fontSize: '0.85rem' }}>
              Danh Mục
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <li>
                <a href="#shop-audio" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Thiết bị Âm thanh
                </a>
              </li>
              <li>
                <a href="#shop-wearables" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Thiết bị Đeo thông minh
                </a>
              </li>
              <li>
                <a href="#shop-computing" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Gaming & PC Gear
                </a>
              </li>
              <li>
                <a href="#shop-input" className="text-secondary text-decoration-none" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
                  Phụ kiện Ngoại vi
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter section */}
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="fs-6 text-white text-uppercase tracking-wider mb-3 display-font" style={{ fontSize: '0.85rem' }}>
              Bản Tin Công Nghệ
            </h4>
            <p className="fs-7 text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
              Đăng ký để nhận thông tin sớm nhất về các sản phẩm giới hạn và ưu đãi đặc quyền.
            </p>
            <form onSubmit={handleSubscribe} className="position-relative w-100">
              <input
                type="email"
                required
                className="tech-input w-100 pe-5 fs-7"
                placeholder="Địa chỉ Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ height: '42px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                className="btn position-absolute top-50 end-0 translate-middle-y text-white p-0 border-0 me-3"
                style={{ color: 'var(--accent-red)', transition: 'var(--transition-fast)' }}
                aria-label="Đăng ký nhận tin"
              >
                <Send size={18} />
              </button>
            </form>
            {subscribed && (
              <p className="fs-7 text-danger mt-2 fw-medium" style={{ fontSize: '0.8rem' }}>
                Đăng ký thành công! Cảm ơn bạn.
              </p>
            )}
          </div>
        </div>

        <div className="h-line w-100 my-4" style={{ borderTop: '1px solid var(--border-color)' }}></div>

        {/* Bottom copyright */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary" style={{ fontSize: '0.8rem' }}>
          <div>
            &copy; {new Date().getFullYear()} NEXUS Tech. Mọi quyền được bảo lưu. Thiết kế chuẩn SEO, giao diện Premium tối giản.
          </div>
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="text-secondary text-decoration-none hover-white">Điều khoản sử dụng</a>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <a href="#" className="text-secondary text-decoration-none hover-white">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

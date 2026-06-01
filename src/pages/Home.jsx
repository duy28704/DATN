import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { ShieldCheck, Truck, Headphones, ChevronRight, Cpu, Zap, Radio } from 'lucide-react'
import { motion } from 'framer-motion'
import bannerImg from '../assets/hero_banner.png'

const Home = ({ setCurrentPage, onSelectProduct }) => {
  // Show 3 featured items
  const featuredProducts = products.slice(0, 3)

  // JSON-LD structured schema for Home
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'NEXUS Tech',
    'url': window.location.origin,
    'description': 'Cửa hàng đồ công nghệ cao cấp hiện đại với các sản phẩm độc quyền.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/#shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const handleShopRedirect = (category = 'all') => {
    if (category === 'all') {
      setCurrentPage('shop')
    } else {
      setCurrentPage(`shop?cat=${category}`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SEO 
        title="Trang Chủ" 
        description="Chào mừng bạn đến với NEXUS Tech. Chúng tôi cung cấp các sản phẩm kính VR, tai nghe, đồng hồ thông minh thiết kế tối giản, cao cấp chính hãng."
        keywords="đồ công nghệ, tai nghe, kính vr, đồng hồ thông minh, nexus, shop đồ công nghệ"
        schema={websiteSchema}
      />

      {/* Hero Section */}
      <section className="hero-container py-5 py-lg-0 px-4 px-md-5 d-flex align-items-center">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-start">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="hero-tagline">NEXUS SYSTEM 2026</div>
                <h1 className="hero-title text-white fw-bold display-font">
                  Khai Phá <br />
                  <span className="text-gradient">Tương Lai</span> <br />
                  Đồ Công Nghệ.
                </h1>
                <p className="hero-description text-secondary">
                  Trải nghiệm sự đột phá vượt trội của các dòng sản phẩm cơ học cao cấp. Tối giản trong thiết kế, đỉnh cao trong công nghệ và chất âm tinh khiết nhất.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <button 
                    className="btn btn-danger glow-btn"
                    onClick={() => handleShopRedirect('all')}
                  >
                    Mua sắm ngay
                  </button>
                  <button 
                    className="btn btn-outline-secondary outline-btn text-white"
                    onClick={() => {
                      const featuredSec = document.getElementById('featured-section')
                      if (featuredSec) {
                        featuredSec.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    Khám phá dòng sản phẩm
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center position-relative">
              {/* Decorative background grid glow */}
              <div className="position-absolute translate-middle-y start-50 top-50 rounded-circle" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,0,60,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
              
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                style={{ zIndex: 1 }}
                className="w-100 max-w-400 d-flex justify-content-center"
              >
                <img 
                  src={bannerImg} 
                  alt="NEXUS Premium VR Headset Banner" 
                  className="img-fluid"
                  style={{ maxHeight: '420px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.7))' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-5" style={{ backgroundColor: '#09090b', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container px-4 px-md-5">
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid rgba(255,255,255,0.03)', backgroundColor: '#0c0c0e' }}>
                <div className="text-danger"><Truck size={32} /></div>
                <h3 className="fs-5 text-white display-font mb-0">Miễn Phí Vận Chuyển</h3>
                <p className="fs-7 text-secondary mb-0">
                  Giao hàng hỏa tốc và hoàn toàn miễn phí vận chuyển trên toàn quốc cho tất cả các đơn hàng có giá trị trên $500.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid rgba(255,255,255,0.03)', backgroundColor: '#0c0c0e' }}>
                <div className="text-danger"><ShieldCheck size={32} /></div>
                <h3 className="fs-5 text-white display-font mb-0">Bảo Hành 2 Năm</h3>
                <p className="fs-7 text-secondary mb-0">
                  Cam kết bảo hành chính hãng lỗi 1 đổi 1 trong vòng 2 năm đối với mọi vấn đề kỹ thuật của nhà sản xuất.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid rgba(255,255,255,0.03)', backgroundColor: '#0c0c0e' }}>
                <div className="text-danger"><Headphones size={32} /></div>
                <h3 className="fs-5 text-white display-font mb-0">Hỗ Trợ Kỹ Thuật 24/7</h3>
                <p className="fs-7 text-secondary mb-0">
                  Đội ngũ kỹ thuật viên công nghệ chuyên sâu luôn sẵn sàng giải đáp và xử lý các vấn đề cài đặt của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Grid Section */}
      <section className="py-5">
        <div className="container px-4 px-md-5">
          <div className="text-center mb-5">
            <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>
              Danh Mục Sản Phẩm
            </span>
            <h2 className="fs-2 text-white display-font">Thiết Bị Công Nghệ Cao Cấp</h2>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Wearables Card */}
            <div className="col-12 col-sm-6 col-md-4">
              <div 
                className="p-4 rounded text-start d-flex justify-content-between align-items-end cursor-pointer"
                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', height: '140px', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                onClick={() => handleShopRedirect('wearables')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div>
                  <div className="text-danger mb-2"><Cpu size={24} /></div>
                  <h3 className="fs-5 text-white display-font mb-0">Thiết bị đeo</h3>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            </div>

            {/* Audio Card */}
            <div className="col-12 col-sm-6 col-md-4">
              <div 
                className="p-4 rounded text-start d-flex justify-content-between align-items-end cursor-pointer"
                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', height: '140px', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                onClick={() => handleShopRedirect('audio')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div>
                  <div className="text-danger mb-2"><Radio size={24} /></div>
                  <h3 className="fs-5 text-white display-font mb-0">Âm thanh</h3>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            </div>

            {/* Gear Card */}
            <div className="col-12 col-sm-6 col-md-4">
              <div 
                className="p-4 rounded text-start d-flex justify-content-between align-items-end cursor-pointer"
                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', height: '140px', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                onClick={() => handleShopRedirect('computing')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div>
                  <div className="text-danger mb-2"><Zap size={24} /></div>
                  <h3 className="fs-5 text-white display-font mb-0">Gaming Gear</h3>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products (Featured) Grid */}
      <section id="featured-section" className="py-5" style={{ backgroundColor: '#060608', borderTop: '1px solid var(--border-color)' }}>
        <div className="container px-4 px-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 text-start gap-3">
            <div>
              <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>
                Bộ Sưu Tập Nổi Bật
              </span>
              <h2 className="fs-2 text-white display-font mb-0">Sản Phẩm Xu Hướng</h2>
            </div>
            <button 
              className="btn btn-link text-danger fw-bold d-flex align-items-center gap-1 p-0 border-0 text-decoration-none"
              onClick={() => handleShopRedirect('all')}
            >
              Xem tất cả sản phẩm <ChevronRight size={16} />
            </button>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="row g-4"
          >
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                variants={itemVariants}
                className="col-12 col-md-6 col-lg-4"
              >
                <ProductCard 
                  product={product} 
                  onSelectProduct={onSelectProduct} 
                  setCurrentPage={setCurrentPage} 
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Home

import { useContext } from 'react'
import { ProductContext } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { ShieldCheck, Truck, Headphones, ChevronRight, Cpu, Laptop, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import bannerImg from '../assets/laptop_gaming.png'
import laptopOfficeImg from '../assets/laptop_office.png'
import laptopGraphicsImg from '../assets/laptop_graphics.png'

const Home = ({ setCurrentPage, onSelectProduct }) => {
  const { products } = useContext(ProductContext)
  
  // Show 3 featured premium laptops (High rating or Hot tag)
  const featuredProducts = products
    .filter(p => p.tag === 'Hot' || p.rating >= 4.8)
    .slice(0, 3)

  // Show 4 products on sale (price < 20,000,000 or Sale tag)
  const saleProducts = products
    .filter(p => p.tag === 'Sale' || p.price < 20000000)
    .slice(0, 4)

  // JSON-LD structured schema for Home
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'NEXUS Tech',
    'url': window.location.origin,
    'description': 'Hệ thống phân phối Laptop cao cấp chính hãng từ các thương hiệu hàng đầu.',
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
        title="Trang Chủ | NEXUS Tech" 
        description="Chào mừng bạn đến với NEXUS Tech. Chúng tôi cung cấp các sản phẩm Laptop Gaming, Laptop Văn phòng, Laptop Đồ họa chính hãng cao cấp."
        keywords="laptop, laptop gaming, laptop van phong, laptop do hoa, laptop asus, msi, dell, lenovo, hp, macbook, nexus tech"
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
                <div className="hero-tagline" style={{ color: 'var(--accent-red)' }}>NEXUS SYSTEM 2026</div>
                <h1 className="hero-title fw-bold display-font" style={{ color: 'var(--text-primary)' }}>
                  Laptop Thế Hệ Mới <br />
                  Tích Hợp <span className="text-gradient">Trí Tuệ Nhân Tạo</span> <br />
                  Kiến Tạo Tương Lai.
                </h1>
                <p className="hero-description text-secondary">
                  Trải nghiệm hiệu năng vượt trội từ các dòng Laptop cao cấp nhất thế giới. Thiết kế tối giản tinh xảo, bộ xử lý NPU thông minh và màn hình OLED sắc nét.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <button 
                    className="btn btn-danger glow-btn"
                    onClick={() => handleShopRedirect('all')}
                  >
                    Mua sắm ngay
                  </button>
                  <button 
                    className="btn btn-outline-secondary outline-btn"
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
              <div className="position-absolute translate-middle-y start-50 top-50 rounded-circle" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(15,98,254,0.08) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
              
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                style={{ zIndex: 1 }}
                className="w-100 max-w-400 d-flex justify-content-center"
              >
                <img 
                  src={bannerImg} 
                  alt="NEXUS Premium Laptop" 
                  className="img-fluid"
                  style={{ maxHeight: '350px', filter: 'drop-shadow(0 15px 30px rgba(15,98,254,0.15))' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-5" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container px-4 px-md-5">
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <div className="text-danger" style={{ color: 'var(--accent-red)' }}><Truck size={32} /></div>
                <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Giao Hàng Miễn Phí</h3>
                <p className="fs-7 text-secondary mb-0">
                  Hỗ trợ giao hàng hỏa tốc hoàn toàn miễn phí trên toàn quốc cho tất cả các đơn hàng trị giá từ 15.000.000 ₫.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <div className="text-danger" style={{ color: 'var(--accent-red)' }}><ShieldCheck size={32} /></div>
                <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Bảo Hành Chính Hãng</h3>
                <p className="fs-7 text-secondary mb-0">
                  Cam kết bảo hành chính hãng lỗi 1 đổi 1 tận nơi trong vòng 2 năm đối với tất cả lỗi từ nhà sản xuất.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded h-100 text-start d-flex flex-column gap-3" style={{ border: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <div className="text-danger" style={{ color: 'var(--accent-red)' }}><Headphones size={32} /></div>
                <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Hỗ Trợ Kỹ Thuật 24/7</h3>
                <p className="fs-7 text-secondary mb-0">
                  Đội ngũ kỹ sư CNTT tay nghề cao sẵn sàng hỗ trợ trực tuyến cài đặt phần mềm và giải quyết lỗi 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Grid Section */}
      <section className="py-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container px-4 px-md-5">
          <div className="text-center mb-5">
            <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
              Dòng Laptop Chuyên Biệt
            </span>
            <h2 className="fs-2 display-font" style={{ color: 'var(--text-primary)' }}>Danh Mục Sản Phẩm</h2>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Gaming Card */}
            <div className="col-12 col-md-4">
              <div 
                className="tech-card rounded overflow-hidden cursor-pointer"
                onClick={() => handleShopRedirect('gaming')}
                style={{ border: '1px solid var(--border-color)' }}
              >
                <div className="position-relative" style={{ height: '180px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <img src={bannerImg} alt="Gaming Laptop" className="img-fluid h-100 object-fit-contain" />
                </div>
                <div className="p-4 text-start bg-white">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-primary bg-opacity-10 text-primary"><Cpu size={18} style={{ color: 'var(--accent-red)' }} /></span>
                    <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Laptop Gaming</h3>
                  </div>
                  <p className="fs-8 text-secondary mb-0">Cấu hình khủng, card đồ họa rời chuyên nghiệp, tần số quét siêu tốc cho game thủ.</p>
                </div>
              </div>
            </div>

            {/* Office Card */}
            <div className="col-12 col-md-4">
              <div 
                className="tech-card rounded overflow-hidden cursor-pointer"
                onClick={() => handleShopRedirect('vanphong')}
                style={{ border: '1px solid var(--border-color)' }}
              >
                <div className="position-relative" style={{ height: '180px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <img src={laptopOfficeImg} alt="Office Laptop" className="img-fluid h-100 object-fit-contain" />
                </div>
                <div className="p-4 text-start bg-white">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-primary bg-opacity-10 text-primary"><Laptop size={18} style={{ color: 'var(--accent-red)' }} /></span>
                    <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Laptop Văn Phòng</h3>
                  </div>
                  <p className="fs-8 text-secondary mb-0">Mỏng nhẹ thời trang, pin cực trâu, bàn phím êm ái thích hợp cho học tập & làm việc.</p>
                </div>
              </div>
            </div>

            {/* Graphics Card */}
            <div className="col-12 col-md-4">
              <div 
                className="tech-card rounded overflow-hidden cursor-pointer"
                onClick={() => handleShopRedirect('doha')}
                style={{ border: '1px solid var(--border-color)' }}
              >
                <div className="position-relative" style={{ height: '180px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <img src={laptopGraphicsImg} alt="Graphics Laptop" className="img-fluid h-100 object-fit-contain" />
                </div>
                <div className="p-4 text-start bg-white">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-primary bg-opacity-10 text-primary"><Palette size={18} style={{ color: 'var(--accent-red)' }} /></span>
                    <h3 className="fs-5 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Laptop Đồ Họa</h3>
                  </div>
                  <p className="fs-8 text-secondary mb-0">Màn hình chuẩn màu OLED/Retina, hiệu năng CPU mạnh mẽ chuyên đồ họa & render video.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products (Featured) Grid */}
      <section id="featured-section" className="py-5" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
        <div className="container px-4 px-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 text-start gap-3">
            <div>
              <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                Sản Phẩm Cao Cấp
              </span>
              <h2 className="fs-2 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Laptop Nổi Bật Nhất</h2>
            </div>
            <button 
              className="btn btn-link text-danger fw-bold d-flex align-items-center gap-1 p-0 border-0 text-decoration-none"
              onClick={() => handleShopRedirect('all')}
              style={{ color: 'var(--accent-red)' }}
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

      {/* Sale Products Grid */}
      <section id="sale-section" className="py-5" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container px-4 px-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 text-start gap-3">
            <div>
              <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                Giá Tốt Mỗi Ngày
              </span>
              <h2 className="fs-2 display-font mb-0" style={{ color: 'var(--text-primary)' }}>Laptop Đang Giảm Giá</h2>
            </div>
            <button 
              className="btn btn-link text-danger fw-bold d-flex align-items-center gap-1 p-0 border-0 text-decoration-none"
              onClick={() => handleShopRedirect('all')}
              style={{ color: 'var(--accent-red)' }}
            >
              Xem tất cả ưu đãi <ChevronRight size={16} />
            </button>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="row g-4"
          >
            {saleProducts.map((product) => (
              <motion.div 
                key={product.id} 
                variants={itemVariants}
                className="col-12 col-sm-6 col-md-4 col-lg-3"
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

import { useContext, useState, useEffect } from 'react'
import { ProductContext } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import TechBackground from '../components/TechBackground'
import { ShieldCheck, Truck, Headphones, ChevronRight, Cpu, Laptop, Palette, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import bannerImg from '../assets/laptop_gaming.png'
import laptopOfficeImg from '../assets/laptop_office.png'
import laptopGraphicsImg from '../assets/laptop_graphics.png'

const Home = ({ setCurrentPage, onSelectProduct }) => {
  const { products } = useContext(ProductContext)
  const [activeHeroAd, setActiveHeroAd] = useState(0)
  const [adDirection, setAdDirection] = useState(1)

  // Show 3 featured premium laptops (High rating or Hot tag)
  const featuredProducts = products
    .filter(p => p.tag === 'Hot' || p.rating >= 4.8)
    .slice(0, 3)

  // Show 4 products on sale (price < 20,000,000 or Sale tag)
  const saleProducts = products
    .filter(p => p.tag === 'Sale' || p.price < 20000000)
    .slice(0, 4)

  // Auto-play horizontal ads carousel every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAdDirection(1)
      setActiveHeroAd(prev => (prev + 1) % 3)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

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

  const handleShopRedirect = (category = 'all') => {
    if (category === 'all') {
      setCurrentPage('shop')
    } else {
      setCurrentPage(`shop?cat=${category}`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextAd = () => {
    setAdDirection(1)
    setActiveHeroAd(prev => (prev + 1) % 3)
  }

  const handlePrevAd = () => {
    setAdDirection(-1)
    setActiveHeroAd(prev => (prev - 1 + 3) % 3)
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 3 Horizontal Advertisement Banners for Hero Slider
  const adBanners = [
    {
      id: 0,
      tagline: 'NEXUS SYSTEM 2026',
      titleFirst: 'Laptop Thế Hệ Mới',
      titleMiddle: 'Tích Hợp',
      titleGradient: 'Trí Tuệ Nhân Tạo',
      titleLast: 'Kiến Tạo Tương Lai.',
      description: 'Trải nghiệm hiệu năng vượt trội từ các dòng Laptop cao cấp nhất thế giới. Thiết kế tối giản tinh xảo, bộ xử lý NPU thông minh và màn hình OLED sắc nét.',
      buttonPrimary: 'Mua sắm ngay',
      buttonSecondary: 'Khám phá ưu đãi',
      image: laptopGraphicsImg,
      targetCat: 'all'
    },
    {
      id: 1,
      tagline: 'RTX 40 SERIES - GAME ON',
      titleFirst: 'Laptop Gaming Cao Cấp',
      titleMiddle: 'Đồ Họa',
      titleGradient: 'Card Rời Cực Khủng',
      titleLast: 'Chiến Game Mượt Mà.',
      description: 'Chinh phục mọi tựa game AAA nặng nhất với hiệu năng xử lý đồ họa Ray Tracing đỉnh cao, hệ thống tản nhiệt buồng hơi vượt trội và màn hình tần số quét 240Hz.',
      buttonPrimary: 'Xem Dòng Gaming',
      buttonSecondary: 'Tại sao chọn chúng tôi',
      image: bannerImg,
      targetCat: 'gaming'
    },
    {
      id: 2,
      tagline: 'SIÊU KHUYẾN MÃI HÈ',
      titleFirst: 'Học Tập Bứt Phá',
      titleMiddle: 'Đồng Hành HSSV',
      titleGradient: 'Giảm Ngay 30%',
      titleLast: 'Giao Hàng Miễn Phí.',
      description: 'Trang bị ngay các dòng Laptop văn phòng mỏng nhẹ sang trọng, dung lượng pin bền bỉ, hỗ trợ tối đa học tập và làm việc cùng quà tặng balo cao cấp.',
      buttonPrimary: 'Xem Laptop Văn Phòng',
      buttonSecondary: 'Hỗ trợ kỹ thuật 24/7',
      image: laptopOfficeImg,
      targetCat: 'vanphong'
    }
  ]

  // Horizontal ad transition variants
  const adVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 200 : -200,
      opacity: 0
    })
  }

  const renderHeroSlide = () => {
    const currentAd = adBanners[activeHeroAd]
    return (
      <div className="py-5 position-relative overflow-hidden w-100" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container px-2 px-md-4">
          <AnimatePresence mode="wait" custom={adDirection}>
            <motion.div
              key={activeHeroAd}
              custom={adDirection}
              variants={adVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="row align-items-center g-5"
            >
              <div className="col-12 col-lg-6 text-start">
                <div>
                  <span 
                    className="badge mb-2 text-uppercase fw-bold" 
                    style={{ 
                      fontSize: '0.7rem', 
                      letterSpacing: '0.12em', 
                      backgroundColor: 'var(--accent-red-dim)', 
                      color: 'var(--accent-red)',
                      padding: '6px 12px',
                      borderRadius: '4px'
                    }}
                  >
                    {currentAd.tagline}
                  </span>
                  <h1 className="hero-title fw-bold display-font mt-2" style={{ color: 'var(--text-primary)', fontSize: '2.5rem', lineHeight: '1.2' }}>
                    {currentAd.titleFirst} <br />
                    {currentAd.titleMiddle} <span className="text-gradient">{currentAd.titleGradient}</span> <br />
                    {currentAd.titleLast}
                  </h1>
                  <p className="hero-description text-secondary mt-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {currentAd.description}
                  </p>
                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <button 
                      className="btn btn-danger glow-btn btn-sm py-2.5 px-4"
                      onClick={() => handleShopRedirect(currentAd.targetCat)}
                    >
                      {currentAd.buttonPrimary}
                    </button>
                    <button 
                      className="btn btn-outline-secondary outline-btn btn-sm py-2.5 px-4"
                      onClick={() => {
                        if (currentAd.buttonSecondary.includes('chọn') || currentAd.buttonSecondary.includes('24/7')) {
                          scrollToSection('commitments-section')
                        } else {
                          scrollToSection('sale-section')
                        }
                      }}
                    >
                      {currentAd.buttonSecondary}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center position-relative">
                <div className="position-absolute translate-middle-y start-50 top-50 rounded-circle" style={{ width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(15,98,254,0.06) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
                
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  style={{ zIndex: 1 }}
                  className="w-100 max-w-400 d-flex justify-content-center"
                >
                  <img 
                    src={currentAd.image} 
                    alt={currentAd.titleFirst} 
                    className="img-fluid"
                    style={{ maxHeight: '290px', filter: 'drop-shadow(0 12px 25px rgba(15,98,254,0.12))', objectFit: 'contain' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Ad slider navigation and indicator dots */}
          <div className="d-flex align-items-center justify-content-start gap-2 mt-4 pt-2">
            <button 
              className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              onClick={handlePrevAd}
              aria-label="Previous Ad"
            >
              <ArrowLeft size={14} />
            </button>
            <div className="d-flex align-items-center gap-1.5 mx-2">
              {adBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAdDirection(idx > activeHeroAd ? 1 : -1)
                    setActiveHeroAd(idx)
                  }}
                  className="btn p-0 rounded-circle border-0"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: activeHeroAd === idx ? 'var(--accent-red)' : '#cbd5e1',
                    boxShadow: activeHeroAd === idx ? '0 0 6px var(--accent-red-glow)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to Advertisement ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              onClick={handleNextAd}
              aria-label="Next Ad"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Trang Chủ | NEXUS Tech" 
        description="Chào mừng bạn đến với NEXUS Tech. Chúng tôi cung cấp các sản phẩm Laptop Gaming, Laptop Văn phòng, Laptop Đồ họa chính hãng cao cấp."
        keywords="laptop, laptop gaming, laptop van phong, laptop do hoa, laptop asus, msi, dell, lenovo, hp, macbook, nexus tech"
        schema={websiteSchema}
      />

      <div className="position-relative overflow-hidden w-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Animated canvas tech mesh background */}
        <TechBackground />

        {/* Section 0: Hero Advertisement Banner Carousel */}
        <div className="position-relative" style={{ zIndex: 5 }}>
          {renderHeroSlide()}
        </div>

        {/* Section 1: Commitments ("Tại sao chọn chúng tôi?") */}
        <section 
          id="commitments-section" 
          className="py-5 position-relative" 
          style={{ 
            zIndex: 5, 
            backgroundColor: '#ffffff', 
            borderTop: '1px solid var(--border-color)', 
            borderBottom: '1px solid var(--border-color)' 
          }}
        >
          <motion.div 
            className="container px-4 px-md-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-5">
              <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                NEXUS COMMITMENT
              </span>
              <h2 className="fs-2 display-font text-dark mb-0" style={{ fontWeight: '700' }}>Tại Sao Chọn Chúng Tôi?</h2>
            </div>
            <div className="row g-4">
              <div className="col-12 col-md-4">
                <div className="p-4 rounded-4 h-100 text-start d-flex flex-column gap-3 shadow-sm border" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border-color)' }}>
                  <div className="text-primary" style={{ color: 'var(--accent-red)' }}><Truck size={32} /></div>
                  <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Giao Hàng Miễn Phí</h3>
                  <p className="fs-7 text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                    Hỗ trợ giao hàng hỏa tốc hoàn toàn miễn phí trên toàn quốc cho tất cả các đơn hàng trị giá từ 15.000.000 ₫.
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-4 rounded-4 h-100 text-start d-flex flex-column gap-3 shadow-sm border" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border-color)' }}>
                  <div className="text-primary" style={{ color: 'var(--accent-red)' }}><ShieldCheck size={32} /></div>
                  <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Bảo Hành Chính Hãng</h3>
                  <p className="fs-7 text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                    Cam kết bảo hành chính hãng lỗi 1 đổi 1 tận nơi trong vòng 2 năm đối với tất cả lỗi từ nhà sản xuất.
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-4 rounded-4 h-100 text-start d-flex flex-column gap-3 shadow-sm border" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border-color)' }}>
                  <div className="text-primary" style={{ color: 'var(--accent-red)' }}><Headphones size={32} /></div>
                  <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Hỗ Trợ Kỹ Thuật 24/7</h3>
                  <p className="fs-7 text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                    Đội ngũ kỹ sư CNTT tay nghề cao sẵn sàng hỗ trợ trực tuyến cài đặt phần mềm và giải quyết lỗi 24/7.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Categories */}
        <section id="categories-section" className="py-5 position-relative" style={{ zIndex: 5, backgroundColor: 'var(--bg-primary)' }}>
          <motion.div 
            className="container px-4 px-md-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="text-center mb-5">
              <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                Dòng Laptop Chuyên Biệt
              </span>
              <h2 className="fs-2 display-font text-dark mb-0" style={{ fontWeight: '700' }}>Danh Mục Sản Phẩm</h2>
            </div>

            <div className="row g-4 justify-content-center">
              {/* Gaming Card */}
              <div className="col-12 col-md-4">
                <div 
                  className="tech-card rounded-4 overflow-hidden cursor-pointer"
                  onClick={() => handleShopRedirect('gaming')}
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  <div className="position-relative" style={{ height: '170px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <img src={bannerImg} alt="Gaming Laptop" className="img-fluid h-100 object-fit-contain" />
                  </div>
                  <div className="p-4 text-start bg-white" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="p-1.5 rounded bg-primary bg-opacity-10 text-primary"><Cpu size={18} style={{ color: 'var(--accent-red)' }} /></span>
                      <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Laptop Gaming</h3>
                    </div>
                    <p className="fs-8 text-secondary mb-0">Cấu hình khủng, card rời chuyên game, màn hình quét siêu tốc mượt mà.</p>
                  </div>
                </div>
              </div>

              {/* Office Card */}
              <div className="col-12 col-md-4">
                <div 
                  className="tech-card rounded-4 overflow-hidden cursor-pointer"
                  onClick={() => handleShopRedirect('vanphong')}
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  <div className="position-relative" style={{ height: '170px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <img src={laptopOfficeImg} alt="Office Laptop" className="img-fluid h-100 object-fit-contain" />
                  </div>
                  <div className="p-4 text-start bg-white" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="p-1.5 rounded bg-primary bg-opacity-10 text-primary"><Laptop size={18} style={{ color: 'var(--accent-red)' }} /></span>
                      <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Laptop Văn Phòng</h3>
                    </div>
                    <p className="fs-8 text-secondary mb-0">Thiết kế thanh lịch siêu mỏng, thời lượng pin cả ngày dài và bàn phím êm ái.</p>
                  </div>
                </div>
              </div>

              {/* Graphics Card */}
              <div className="col-12 col-md-4">
                <div 
                  className="tech-card rounded-4 overflow-hidden cursor-pointer"
                  onClick={() => handleShopRedirect('doha')}
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  <div className="position-relative" style={{ height: '170px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <img src={laptopGraphicsImg} alt="Graphics Laptop" className="img-fluid h-100 object-fit-contain" />
                  </div>
                  <div className="p-4 text-start bg-white" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="p-1.5 rounded bg-primary bg-opacity-10 text-primary"><Palette size={18} style={{ color: 'var(--accent-red)' }} /></span>
                      <h3 className="fs-5 display-font mb-0 text-dark" style={{ fontWeight: '600' }}>Laptop Đồ Họa</h3>
                    </div>
                    <p className="fs-8 text-secondary mb-0">Chuẩn màu OLED cực sắc nét, vi xử lý đa nhân chuyên render hình ảnh & video.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 3: Featured Laptops */}
        <section id="featured-section" className="py-5 position-relative" style={{ zIndex: 5, backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
          <motion.div 
            className="container px-4 px-md-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 text-start gap-3">
              <div>
                <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                  Sản Phẩm Cao Cấp
                </span>
                <h2 className="fs-2 display-font text-dark mb-0" style={{ fontWeight: '700' }}>Laptop Nổi Bật Nhất</h2>
              </div>
              <button 
                className="btn btn-link text-danger fw-bold d-flex align-items-center gap-1 p-0 border-0 text-decoration-none"
                onClick={() => handleShopRedirect('all')}
                style={{ color: 'var(--accent-red)' }}
              >
                Xem tất cả sản phẩm <ChevronRight size={16} />
              </button>
            </div>

            <div className="row g-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="col-12 col-md-6 col-lg-4">
                  <ProductCard 
                    product={product} 
                    onSelectProduct={onSelectProduct} 
                    setCurrentPage={setCurrentPage} 
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 4: Sale Products */}
        <section id="sale-section" className="py-5 position-relative" style={{ zIndex: 5, backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
          <motion.div 
            className="container px-4 px-md-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 text-start gap-3">
              <div>
                <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                  Giá Tốt Mỗi Ngày
                </span>
                <h2 className="fs-2 display-font text-dark mb-0" style={{ fontWeight: '700' }}>Laptop Đang Giảm Giá</h2>
              </div>
              <button 
                className="btn btn-link text-danger fw-bold d-flex align-items-center gap-1 p-0 border-0 text-decoration-none"
                onClick={() => handleShopRedirect('all')}
                style={{ color: 'var(--accent-red)' }}
              >
                Xem tất cả ưu đãi <ChevronRight size={16} />
              </button>
            </div>

            <div className="row g-4">
              {saleProducts.map((product) => (
                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <ProductCard 
                    product={product} 
                    onSelectProduct={onSelectProduct} 
                    setCurrentPage={setCurrentPage} 
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </>
  )
}

export default Home

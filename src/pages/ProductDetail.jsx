import { useState, useContext, useEffect } from 'react'
import { ProductContext, formatDisplayPrice } from '../context/ProductContext'
import { CartContext } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { Star, ShieldCheck, ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ProductDetail = ({ productId, setCurrentPage, onSelectProduct, onBuyNow }) => {
  const { addToCart } = useContext(CartContext)
  const { products } = useContext(ProductContext)
  
  const product = products.find(p => String(p.id) === String(productId))
  const [quantity, setQuantity] = useState(1)
  
  const getConfigurations = (p) => {
    if (!p) return ['Standard Configuration']
    const ram = p.ram || '16 GB'
    const storage = p.storage || '512 GB'
    
    // Calculate upgraded RAM
    let upgradedRam = '32 GB'
    if (ram.includes('8')) upgradedRam = '16 GB'
    else if (ram.includes('16')) upgradedRam = '32 GB'
    else if (ram.includes('32')) upgradedRam = '64 GB'
    else upgradedRam = ram
    
    return [
      `${ram} RAM / ${storage}`,
      `${upgradedRam} RAM / 1 TB SSD (Hiệu năng cao)`
    ]
  }
  
  const [configurations] = useState(() => getConfigurations(product))
  const [selectedConfig, setSelectedConfig] = useState(() => getConfigurations(product)[0])
  const [activeTab, setActiveTab] = useState('specs') // 'specs', 'reviews'
  const [activeImage, setActiveImage] = useState(null)
  
  useEffect(() => {
    if (product) {
      setActiveImage(product.image)
    }
  }, [product])

  if (!product) {
    return (
      <div className="container py-5 text-center text-white">
        <h2 className="fs-3 mb-3 display-font">Không tìm thấy sản phẩm</h2>
        <button className="btn btn-danger glow-btn" onClick={() => setCurrentPage('shop')}>
          Quay lại cửa hàng
        </button>
      </div>
    )
  }

  // Related products (same category or others, exclude current)
  const relatedProducts = products
    .filter(p => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 3)

  const handleQtyChange = (val) => {
    const newQty = quantity + val
    if (newQty >= 1) setQuantity(newQty)
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedConfig)
  }

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedConfig)
    if (onBuyNow) {
      onBuyNow()
    }
  }

  // JSON-LD dynamic schema for product
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': [
      window.location.origin + product.image
    ],
    'description': product.description,
    'sku': product.id,
    'brand': {
      '@type': 'Brand',
      'name': 'NEXUS'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating.toString(),
      'reviewCount': product.reviewCount.toString()
    },
    'offers': {
      '@type': 'Offer',
      'url': window.location.href,
      'priceCurrency': 'USD',
      'price': product.price.toString(),
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': 'https://schema.org/InStock'
    }
  }



  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription}
        keywords={`${product.name}, đồ công nghệ, ${product.category}, nexus store`}
        schema={productSchema}
      />

      <div className="container py-5 px-4 px-md-5">
        {/* Back navigation link */}
        <div className="text-start mb-4">
          <button 
            className="btn btn-link text-secondary hover-red p-0 border-0 d-flex align-items-center gap-1 text-decoration-none"
            onClick={() => {
              setCurrentPage('shop')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <ChevronLeft size={16} /> Quay lại cửa hàng
          </button>
        </div>

        {/* Product Details Columns */}
        <div className="row g-5 text-start">
          {/* Left Column: Image view */}
          <div className="col-12 col-lg-6">
            <div className="p-4 rounded text-center d-flex align-items-center justify-content-center bg-black" style={{ border: '1px solid var(--border-color)', minHeight: '380px' }}>
              <motion.img 
                key={activeImage || product.image}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={activeImage || product.image} 
                alt={product.name} 
                className="img-fluid"
                style={{ maxHeight: '350px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
              />
            </div>
            {/* Visual configuration details */}
            {product.imagesList && product.imagesList.length > 1 && (
              <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                {product.imagesList.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className="p-1 rounded bg-secondary bg-opacity-25" 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      border: (activeImage || product.image) === imgUrl ? '2px solid var(--accent-red)' : '1px solid var(--border-color)', 
                      cursor: 'pointer' 
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="img-fluid h-100 w-100 object-fit-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information specs configurator */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-between">
            <div>
              {/* Product category tag */}
              <span className="text-uppercase text-danger fw-bold mb-2 d-block tracking-wider" style={{ fontSize: '0.75rem' }}>
                NEXUS / {product.category}
              </span>
              
              {/* Main product heading (H1 SEO) */}
              <h1 className="fs-2 text-white display-font mb-2 fw-bold" style={{ lineHeight: '1.2' }}>
                {product.name}
              </h1>

              {/* Reviews score stars */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} 
                      className={i < Math.floor(product.rating) ? 'text-warning' : 'text-secondary'}
                    />
                  ))}
                </div>
                <span className="text-white fw-medium fs-7">{product.rating}</span>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>({product.reviewCount} Đánh giá khách hàng)</span>
              </div>

              <div className="fs-3 text-white fw-bold mb-4 display-font">
                {formatDisplayPrice(product.price, product.displayPrice)}
              </div>

              {/* Description body */}
              <p className="text-secondary mb-4 fs-7" style={{ fontSize: '0.95rem' }}>
                {product.description}
              </p>

              {/* Configurations selection */}
              <div className="mb-4">
                <span className="d-block text-secondary fs-7 mb-2">Cấu hình lựa chọn:</span>
                <div className="d-flex flex-column gap-2" style={{ maxWidth: '400px' }}>
                  {configurations.map((config) => {
                    const isSelected = selectedConfig === config
                    return (
                      <button
                        key={config}
                        onClick={() => setSelectedConfig(config)}
                        className="btn text-start p-3 rounded transition-smooth d-flex align-items-center justify-content-between text-white"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255, 0, 60, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isSelected ? 'var(--accent-red)' : 'var(--border-color)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <span className="fs-7 fw-medium">{config}</span>
                        {isSelected && <span className="fs-8 text-danger fw-semibold">Đã chọn</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity config */}
              <div className="d-flex align-items-center gap-3 mb-5">
                <span className="text-secondary fs-7">Số lượng:</span>
                <div className="d-flex align-items-center border border-secondary rounded" style={{ overflow: 'hidden', width: '120px', height: '40px' }}>
                  <button 
                    className="btn btn-link text-white flex-grow-1 h-100 d-flex align-items-center justify-content-center p-0 border-0" 
                    onClick={() => handleQtyChange(-1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 text-white fw-bold">{quantity}</span>
                  <button 
                    className="btn btn-link text-white flex-grow-1 h-100 d-flex align-items-center justify-content-center p-0 border-0" 
                    onClick={() => handleQtyChange(1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-outline-danger py-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleAddToCart}
                  style={{ flex: 1, borderRadius: '6px' }}
                >
                  <ShoppingCart size={18} /> Thêm Vào Giỏ
                </button>
                <button 
                  className="btn btn-danger py-3 glow-btn d-flex align-items-center justify-content-center gap-2 fw-bold"
                  onClick={handleBuyNow}
                  style={{ flex: 1.5, borderRadius: '6px' }}
                >
                  Mua Ngay
                </button>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary fs-8 mt-2" style={{ fontSize: '0.8rem' }}>
                <ShieldCheck size={16} className="text-danger" />
                <span>Bảo hành chính hãng 2 năm lỗi 1 đổi 1. Hoàn tiền 100% nếu phát hiện hàng giả.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative specs and reviews tabs section */}
        <div className="my-5 pt-4 text-start">
          <div className="d-flex border-bottom border-secondary mb-4">
            <button
              className={`btn btn-link text-uppercase text-decoration-none px-3 pb-2 pt-0 border-0 fs-7 fw-bold ${activeTab === 'specs' ? 'text-white' : 'text-secondary'}`}
              style={{ borderBottom: activeTab === 'specs' ? '2px solid var(--accent-red)' : '2px solid transparent', borderRadius: 0 }}
              onClick={() => setActiveTab('specs')}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`btn btn-link text-uppercase text-decoration-none px-3 pb-2 pt-0 border-0 fs-7 fw-bold ${activeTab === 'reviews' ? 'text-white' : 'text-secondary'}`}
              style={{ borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-red)' : '2px solid transparent', borderRadius: 0 }}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({product.reviews.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'specs' ? (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="table-responsive"
              >
                {/* 
                  PHẦN HIỂN THỊ THÔNG SỐ KỸ THUẬT:
                  Duyệt qua đối tượng `product.specs` (đã được xử lý gom nhóm và dịch nhãn tiếng Việt 
                  từ `ProductContext.jsx`) để hiển thị dạng bảng thông tin chi tiết cấu hình (như CPU, GPU, 
                  RAM, kích thước màn hình, độ phân giải,...). Mỗi thuộc tính là một hàng <tr> gồm:
                  - Cột 1: Tên thông số kỹ thuật (key)
                  - Cột 2: Giá trị chi tiết tương ứng (value)
                */}
                <table className="table table-dark table-striped table-bordered border-secondary" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="fw-semibold text-secondary w-25" style={{ fontSize: '0.9rem' }}>{key}</td>
                        <td className="text-white" style={{ fontSize: '0.9rem' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="d-flex flex-column gap-3"
              >
                {product.reviews.map((rev, index) => (
                  <div key={index} className="p-3 rounded" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-black font-weight-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {rev.name.charAt(0)}
                        </div>
                        <span className="text-white fw-medium fs-7">{rev.name}</span>
                      </div>
                      <div className="d-flex text-warning">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < rev.rating ? 'currentColor' : 'none'} 
                            className={i < rev.rating ? 'text-warning' : 'text-secondary'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary mb-0 fs-7" style={{ fontSize: '0.9rem', paddingLeft: '40px' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related products recommendation row */}
        {relatedProducts.length > 0 && (
          <div className="mt-5 pt-5 text-start" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h2 className="fs-4 text-white display-font mb-4">Sản Phẩm Tương Tự</h2>
            <div className="row g-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-4">
                  <ProductCard
                    product={p}
                    onSelectProduct={onSelectProduct}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProductDetail

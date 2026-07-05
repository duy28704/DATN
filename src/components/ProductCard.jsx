import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { Star, ShoppingCart, Eye, GitCompare } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductContext, formatDisplayPrice } from '../context/ProductContext'

const categoryNames = {
  gaming: 'Laptop Gaming',
  vanphong: 'Laptop Văn phòng',
  doha: 'Laptop Đồ họa',
  wearables: 'Thiết bị Đeo',
  audio: 'Âm thanh',
  computing: 'Máy tính',
  input: 'Thiết bị ngoại vi'
}

const ProductCard = ({ product, onSelectProduct, setCurrentPage }) => {
  const { addToCart } = useContext(CartContext)
  const { compareItems, toggleCompare } = useContext(ProductContext)
  const isCompared = compareItems.some(item => item.id === product.id)
  const stock = product.stockQuantity != null ? product.stockQuantity : 50

  const handleQuickAdd = (e) => {
    e.stopPropagation() // Don't trigger card selection detail page
    if (stock <= 0) return
    addToCart(product, 1)
  }

  const handleCardClick = () => {
    onSelectProduct(product.id)
    // Directly update hash to trigger router
    window.location.hash = `product/${product.id}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      onClick={handleCardClick}
      className="tech-card h-100 cursor-pointer"
      style={{ cursor: 'pointer' }}
    >
      <div className="tech-card-img-wrapper">
        {/* Hot / New Badge */}
        {product.tag && (
          <span className="tech-card-tag">{product.tag}</span>
        )}
        
        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="tech-card-img img-fluid"
          loading="lazy"
        />
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 text-start">
        {/* Category */}
        <span className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em', color: 'var(--accent-red)' }}>
          {categoryNames[product.category] || product.category}
        </span>
        
        {/* Title */}
        <h3 className="fs-6 text-dark text-truncate-2 mb-2" style={{ fontWeight: '600', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="d-flex align-items-center gap-1 mb-3">
          <div className="d-flex text-warning">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} 
                className={i < Math.floor(product.rating) ? 'text-warning' : 'text-secondary'}
              />
            ))}
          </div>
          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price and Action Buttons */}
        <div className="mt-auto d-flex align-items-center justify-content-between pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
          <span className="fs-6 fw-bold display-font" style={{ color: stock <= 0 ? '#dc3545' : 'var(--accent-red)' }}>
            {stock <= 0 ? 'Hết hàng' : formatDisplayPrice(product.price, product.displayPrice)}
          </span>
          <div className="d-flex gap-2">
            <button 
              className={`btn btn-sm p-2 d-flex align-items-center justify-content-center ${isCompared ? 'btn-danger' : 'btn-outline-secondary'}`}
              style={{ borderRadius: '6px', width: '34px', height: '34px' }}
              onClick={(e) => {
                e.stopPropagation()
                toggleCompare(product)
              }}
              title={isCompared ? "Xóa so sánh" : "Thêm so sánh"}
            >
              <GitCompare size={15} style={{ color: isCompared ? '#ffffff' : 'inherit' }} />
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary p-2 d-flex align-items-center justify-content-center"
              style={{ borderRadius: '6px', width: '34px', height: '34px' }}
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick()
              }}
              title="Xem chi tiết"
            >
              <Eye size={15} />
            </button>
            <button 
              className="btn btn-sm btn-danger p-2 d-flex align-items-center justify-content-center"
              style={{ borderRadius: '6px', width: '34px', height: '34px' }}
              onClick={handleQuickAdd}
              disabled={stock <= 0}
              title={stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
            >
              <ShoppingCart size={15} style={{ color: '#ffffff' }} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard

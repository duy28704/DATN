import { useState, useMemo, useContext, useEffect } from 'react'
import { ProductContext } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { Filter, RotateCcw, LayoutGrid, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Shop = ({ currentPage, onSelectProduct, setCurrentPage }) => {
  const { products, categories } = useContext(ProductContext)
  const [sortOption, setSortOption] = useState('featured')
  const [loadingMore, setLoadingMore] = useState(false)

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 6)
      setLoadingMore(false)
    }, 400)
  }

  // Parse parameters directly in render
  let selectedCat = 'all'
  let searchQuery = ''

  if (currentPage.includes('?')) {
    const queryStr = currentPage.split('?')[1]
    const params = new URLSearchParams(queryStr)
    if (params.get('cat')) selectedCat = params.get('cat')
    if (params.get('search')) searchQuery = params.get('search')
  }

  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    setVisibleCount(6)
  }, [selectedCat, searchQuery, sortOption])

  // Filter and sort mechanism
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedCat !== 'all') {
      result = result.filter(item => item.category === selectedCat)
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        item => item.name.toLowerCase().includes(q) || 
                item.shortDescription.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [selectedCat, searchQuery, sortOption, products])

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const handleResetFilters = () => {
    setSortOption('featured')
    setCurrentPage('shop')
  }

  // Schema LD JSON for Product List (ItemPage)
  const shopSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': filteredProducts.map((p, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'url': `${window.location.origin}/#product/${p.id}`,
      'name': p.name
    }))
  }

  return (
    <>
      <SEO
        title="Danh Sách Sản Phẩm"
        description="Duyệt qua danh mục thiết bị công nghệ cao cấp của NEXUS Tech. Lọc theo thiết bị đeo, thiết bị âm thanh, bàn phím cơ gaming gear."
        keywords="đồ công nghệ cao cấp, tai nghe gaming, chuột không dây, bàn phím cơ nhôm, kính vr pancake"
        schema={shopSchema}
      />

      <div className="container py-5 px-4 px-md-5">
        {/* Page title and stats */}
        <div className="text-start mb-5">
          <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>
            NEXUS SHOP
          </span>
          <h1 className="fs-2 text-white display-font mb-2">
            {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-secondary fs-7 mb-0">
            Hiển thị {filteredProducts.length} sản phẩm công nghệ tương lai
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="row g-4 mb-4 align-items-center justify-content-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          {/* Category Filter Pills */}
          <div className="col-12 col-lg-8 d-flex flex-wrap align-items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'all') {
                    setCurrentPage('shop')
                  } else {
                    setCurrentPage(`shop?cat=${cat.id}`)
                  }
                }}
                className={`category-pill ${selectedCat === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort selection & controls */}
          <div className="col-12 col-lg-4 d-flex align-items-center justify-content-lg-end gap-3">
            <div className="d-flex align-items-center gap-2 flex-grow-1 flex-lg-grow-0">
              <Filter size={16} className="text-secondary" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="form-select bg-black text-white border-secondary fs-7"
                style={{ height: '38px', borderRadius: '4px', fontSize: '0.85rem' }}
                aria-label="Sắp xếp sản phẩm"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
            
            {(selectedCat !== 'all' || sortOption !== 'featured' || searchQuery) && (
              <button
                className="btn btn-outline-danger p-2 d-flex align-items-center justify-content-center"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc"
                style={{ height: '38px', width: '38px', borderRadius: '4px' }}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-5 text-center d-flex flex-column align-items-center gap-3">
            <LayoutGrid size={48} className="text-secondary" />
            <h3 className="fs-5 text-white display-font">Không Tìm Thấy Sản Phẩm</h3>
            <p className="text-secondary mb-0 max-w-400">
              Không có sản phẩm nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng thử lại với cấu hình khác hoặc nhấn đặt lại.
            </p>
            <button className="btn btn-danger glow-btn" onClick={handleResetFilters}>
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <motion.div 
              layout 
              className="row g-4"
            >
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((product) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    key={product.id} 
                    className="col-12 col-sm-6 col-md-4"
                  >
                    <ProductCard
                      product={product}
                      onSelectProduct={onSelectProduct}
                      setCurrentPage={setCurrentPage}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-5">
                <button 
                  className="btn btn-danger btn-lg px-5 py-3 glow-btn d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ minWidth: '180px', minHeight: '56px' }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="spinner-border border-0" style={{ width: '16px', height: '16px' }} />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default Shop

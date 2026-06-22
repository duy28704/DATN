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

  // Bộ lọc thông minh bổ sung
  const [filterCpu, setFilterCpu] = useState('all')
  const [filterRam, setFilterRam] = useState('all')
  const [filterGpu, setFilterGpu] = useState('all')
  const [filterPriceRange, setFilterPriceRange] = useState('all')

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 8)
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

  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    setVisibleCount(8)
  }, [selectedCat, searchQuery, sortOption, filterCpu, filterRam, filterGpu, filterPriceRange])

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

    // Lọc theo CPU
    if (filterCpu !== 'all') {
      const cpu = filterCpu.toLowerCase()
      result = result.filter(item => {
        const cpuTech = (item.cpuTechnology || '').toLowerCase()
        const name = (item.name || '').toLowerCase()
        return cpuTech.includes(cpu) || name.includes(cpu)
      })
    }

    // Lọc theo RAM
    if (filterRam !== 'all') {
      const ramVal = filterRam.toLowerCase()
      result = result.filter(item => {
        const ram = (item.ram || '').toLowerCase()
        return ram.startsWith(ramVal) || ram.includes(ramVal)
      })
    }

    // Lọc theo GPU
    if (filterGpu !== 'all') {
      result = result.filter(item => {
        const gpu = (item.gpuCard || '').toLowerCase()
        if (filterGpu === 'nvidia') {
          return gpu.includes('nvidia') || gpu.includes('geforce') || gpu.includes('rtx') || gpu.includes('gtx')
        } else if (filterGpu === 'intel') {
          return gpu.includes('intel') || gpu.includes('arc') || gpu.includes('iris')
        } else if (filterGpu === 'apple') {
          return gpu.includes('apple')
        }
        return true
      })
    }

    // Lọc theo khoảng giá (VND)
    if (filterPriceRange !== 'all') {
      result = result.filter(item => {
        const price = item.price
        if (filterPriceRange === 'under15m') return price < 15000000
        if (filterPriceRange === '15to25m') return price >= 15000000 && price <= 25000000
        if (filterPriceRange === '25to40m') return price >= 25000000 && price <= 40000000
        if (filterPriceRange === 'over40m') return price > 40000000
        return true
      })
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
  }, [selectedCat, searchQuery, sortOption, products, filterCpu, filterRam, filterGpu, filterPriceRange])

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const handleResetFilters = () => {
    setSortOption('featured')
    setFilterCpu('all')
    setFilterRam('all')
    setFilterGpu('all')
    setFilterPriceRange('all')
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
        title="Danh Sách Sản Phẩm | NEXUS Tech"
        description="Duyệt qua danh mục Laptop Gaming, Laptop Văn phòng, Laptop Đồ họa chính hãng cao cấp của NEXUS Tech. Bộ lọc thông minh theo cấu hình phần cứng."
        keywords="laptop gaming, laptop van phong, laptop do hoa, core i7, rtx 4060, ram 16gb, ssd 1tb, oled"
        schema={shopSchema}
      />

      <div className="container py-5 px-4 px-md-5">
        {/* Page title and stats */}
        <div className="text-start mb-5">
          <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
            NEXUS SHOP
          </span>
          <h1 className="fs-2 display-font mb-2" style={{ color: 'var(--text-primary)' }}>
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
                className="form-select bg-white text-dark border-secondary fs-7"
                style={{ height: '38px', borderRadius: '4px', fontSize: '0.85rem' }}
                aria-label="Sắp xếp sản phẩm"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
            
            {(selectedCat !== 'all' || sortOption !== 'featured' || searchQuery || filterCpu !== 'all' || filterRam !== 'all' || filterGpu !== 'all' || filterPriceRange !== 'all') && (
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

        {/* Smart Filters Grid */}
        <div className="p-4 rounded mb-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(15,98,254,0.03)' }}>
          <div className="row g-3">
            {/* CPU Filter */}
            <div className="col-12 col-sm-6 col-md-3 text-start">
              <label className="form-label fs-8 fw-semibold text-secondary mb-1">Cấu hình CPU</label>
              <select
                value={filterCpu}
                onChange={(e) => setFilterCpu(e.target.value)}
                className="form-select bg-white text-dark border-secondary fs-7"
                style={{ height: '38px', borderRadius: '6px' }}
                aria-label="Lọc CPU"
              >
                <option value="all">Tất cả CPU</option>
                <option value="ultra">Intel Core Ultra</option>
                <option value="i9">Intel Core i9</option>
                <option value="i7">Intel Core i7</option>
                <option value="i5">Intel Core i5</option>
                <option value="ryzen 9">AMD Ryzen 9</option>
                <option value="ryzen 7">AMD Ryzen 7</option>
                <option value="ryzen 5">AMD Ryzen 5</option>
                <option value="m1">Apple M-Series</option>
              </select>
            </div>

            {/* RAM Filter */}
            <div className="col-12 col-sm-6 col-md-3 text-start">
              <label className="form-label fs-8 fw-semibold text-secondary mb-1">Dung lượng RAM</label>
              <select
                value={filterRam}
                onChange={(e) => setFilterRam(e.target.value)}
                className="form-select bg-white text-dark border-secondary fs-7"
                style={{ height: '38px', borderRadius: '6px' }}
                aria-label="Lọc RAM"
              >
                <option value="all">Tất cả RAM</option>
                <option value="8 gb">8 GB</option>
                <option value="16 gb">16 GB</option>
                <option value="32 gb">32 GB</option>
                <option value="64 gb">64 GB+</option>
              </select>
            </div>

            {/* GPU Filter */}
            <div className="col-12 col-sm-6 col-md-3 text-start">
              <label className="form-label fs-8 fw-semibold text-secondary mb-1">Card đồ họa (GPU)</label>
              <select
                value={filterGpu}
                onChange={(e) => setFilterGpu(e.target.value)}
                className="form-select bg-white text-dark border-secondary fs-7"
                style={{ height: '38px', borderRadius: '6px' }}
                aria-label="Lọc Card đồ họa"
              >
                <option value="all">Tất cả đồ họa</option>
                <option value="nvidia">NVIDIA Dedicated GPU</option>
                <option value="intel">Intel integrated/Arc</option>
                <option value="apple">Apple GPU</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="col-12 col-sm-6 col-md-3 text-start">
              <label className="form-label fs-8 fw-semibold text-secondary mb-1">Mức giá</label>
              <select
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value)}
                className="form-select bg-white text-dark border-secondary fs-7"
                style={{ height: '38px', borderRadius: '6px' }}
                aria-label="Lọc theo Giá"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="under15m">Dưới 15 triệu</option>
                <option value="15to25m">15 - 25 triệu</option>
                <option value="25to40m">25 - 40 triệu</option>
                <option value="over40m">Trên 40 triệu</option>
              </select>
            </div>
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

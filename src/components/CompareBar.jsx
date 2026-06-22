import { useContext } from 'react'
import { ProductContext } from '../context/ProductContext'
import { X, GitCompare } from 'lucide-react'

const CompareBar = ({ setCurrentPage }) => {
  const { compareItems, toggleCompare, clearCompare } = useContext(ProductContext)

  if (compareItems.length === 0) return null

  const handleCompareClick = () => {
    const ids = compareItems.map(p => p.id).join(',')
    window.location.hash = `#compare?ids=${ids}`
    setCurrentPage(`compare?ids=${ids}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1040, width: '100%', maxWidth: '680px' }}>
      <div 
        className="glass-panel p-3 rounded-4 shadow-lg d-flex align-items-center justify-content-between gap-3"
        style={{ 
          border: '1px solid var(--accent-red)', 
          boxShadow: '0 10px 30px rgba(15, 98, 254, 0.15)',
          backgroundColor: '#ffffff',
          borderRadius: '16px'
        }}
      >
        <div className="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle flex-shrink-0" style={{ width: '40px', height: '40px', color: 'var(--accent-red)' }}>
            <GitCompare size={20} />
          </div>
          
          <div className="d-flex align-items-center gap-2 overflow-hidden flex-wrap">
            {compareItems.map(product => (
              <div 
                key={product.id} 
                className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 border flex-shrink-0"
                style={{ fontSize: '0.8rem', maxWidth: '220px' }}
              >
                <img src={product.image} alt={product.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span className="text-truncate fw-semibold text-dark" style={{ maxWidth: '120px' }}>{product.name}</span>
                <button 
                  className="btn btn-link p-0 text-muted hover-red border-0 d-flex align-items-center justify-content-center"
                  onClick={() => toggleCompare(product)}
                  aria-label={`Xóa so sánh ${product.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {compareItems.length < 2 && (
              <div className="text-secondary fs-8 fw-medium px-2 py-1 text-truncate">
                Chọn thêm 1 sản phẩm để so sánh
              </div>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <button 
            className="btn btn-sm btn-link text-secondary text-decoration-none fw-semibold border-0"
            onClick={clearCompare}
            style={{ fontSize: '0.8rem' }}
          >
            Xóa tất cả
          </button>
          <button 
            className="btn btn-sm btn-danger px-3 py-2 fw-semibold text-white border-0"
            disabled={compareItems.length < 2}
            onClick={handleCompareClick}
            style={{ fontSize: '0.8rem', borderRadius: '8px', backgroundColor: 'var(--accent-red)' }}
          >
            So sánh ({compareItems.length}/2)
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareBar

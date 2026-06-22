import { useEffect, useState, useContext } from 'react';
import { ProductContext, formatDisplayPrice } from '../context/ProductContext';
import { motion } from 'framer-motion';
import { Check, X, GitCompare } from 'lucide-react';
import SEO from '../components/SEO';

const Compare = ({ setCurrentPage }) => {
  const { products, compareItems, toggleCompare, clearCompare } = useContext(ProductContext);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const maxCompare = 2;

  useEffect(() => {
    // Đồng bộ danh sách sản phẩm so sánh từ context toàn cục
    setSelectedProducts(compareItems);

    // Cập nhật URL hash để đồng bộ với các sản phẩm đang so sánh
    if (window.location.hash.startsWith('#compare')) {
      const ids = compareItems.map(p => p.id).join(',');
      if (ids) {
        window.location.hash = `#compare?ids=${ids}`;
      } else {
        window.location.hash = `#compare`;
      }
    }
  }, [compareItems]);

  const handleAddProductSelect = (id) => {
    const prod = products.find(p => String(p.id) === String(id));
    if (prod) {
      toggleCompare(prod);
    }
  };

  const handleRemoveProduct = (prod) => {
    toggleCompare(prod);
  };

  // Render từng thuộc tính và highlight sự khác biệt
  const renderValue = (product, key) => {
    const val = product.specs[key] ?? '-';
    // Kiểm tra xem tất cả các sản phẩm đang so sánh có cùng giá trị cho thuộc tính này không
    const othersSame = selectedProducts.every(p => (p.specs[key] ?? '-') === val);
    
    return (
      <td 
        style={{ 
          fontSize: '0.875rem',
          backgroundColor: !othersSame ? 'rgba(15, 98, 254, 0.05)' : 'transparent',
          color: !othersSame ? 'var(--accent-red)' : 'var(--text-secondary)',
          fontWeight: !othersSame ? '600' : 'normal',
          borderLeft: !othersSame ? '3px solid var(--accent-red)' : '1px solid var(--border-color)',
          transition: 'var(--transition-fast)'
        }}
      >
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span>{val}</span>
          {!othersSame && selectedProducts.length > 1 && (
            <span 
              className="badge px-2 py-1 flex-shrink-0"
              style={{ 
                fontSize: '0.65rem', 
                backgroundColor: 'var(--accent-red)', 
                color: '#ffffff',
                borderRadius: '4px',
                fontWeight: '700'
              }}
            >
              Khác biệt
            </span>
          )}
        </div>
      </td>
    );
  };

  // Nếu chưa đủ 2 sản phẩm so sánh
  if (selectedProducts.length < 2) {
    return (
      <>
        <SEO title="So Sánh Laptop" description="So sánh chi tiết thông số kỹ thuật giữa các dòng laptop." />
        <div className="container py-5 px-4 px-md-5 text-center text-dark">
          <div className="d-flex flex-column align-items-center gap-3 mb-5">
            <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary" style={{ color: 'var(--accent-red)' }}>
              <GitCompare size={48} />
            </div>
            <h1 className="fs-2 fw-bold display-font text-dark">So Sánh Laptop</h1>
            <p className="text-secondary max-w-400">
              Vui lòng chọn 2 sản phẩm laptop để so sánh chi tiết cấu hình, bộ nhớ, card đồ họa và mức giá.
            </p>
          </div>

          <div className="row g-4 justify-content-center mb-5">
            {[...Array(maxCompare)].map((_, idx) => (
              <div key={idx} className="col-12 col-md-5">
                <div 
                  className="glass-panel p-4 rounded-4 text-center d-flex flex-column align-items-center justify-content-center border" 
                  style={{ minHeight: '300px', backgroundColor: '#ffffff', borderColor: 'var(--border-color)' }}
                >
                  {selectedProducts[idx] ? (
                    <div className="d-flex flex-column align-items-center w-100">
                      <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                        <img src={selectedProducts[idx].image} alt={selectedProducts[idx].name} className="img-fluid object-fit-contain h-100" />
                      </div>
                      <h3 className="fs-6 fw-bold text-dark text-truncate w-100 px-3 mb-2">{selectedProducts[idx].name}</h3>
                      <span className="text-danger fw-bold display-font mb-3">{formatDisplayPrice(selectedProducts[idx].price, selectedProducts[idx].displayPrice)}</span>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveProduct(selectedProducts[idx])} style={{ borderRadius: '6px' }}>
                        Xóa khỏi so sánh
                      </button>
                    </div>
                  ) : (
                    <div className="w-100 px-3">
                      <div className="p-3 bg-light rounded-circle mb-3 d-inline-flex text-secondary" style={{ width: '60px', height: '60px', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </div>
                      <h3 className="fs-6 fw-bold text-secondary mb-3">Chọn laptop so sánh</h3>
                      <select 
                        className="form-select bg-white text-dark border-secondary fs-7" 
                        onChange={(e) => handleAddProductSelect(e.target.value)} 
                        defaultValue=""
                        style={{ height: '42px', borderRadius: '8px' }}
                      >
                        <option value="" disabled>-- Chọn sản phẩm --</option>
                        {products
                          .filter(p => !selectedProducts.some(sp => sp.id === p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-outline-secondary outline-btn" onClick={() => setCurrentPage('shop')}>Quay lại cửa hàng</button>
          </div>
        </div>
      </>
    );
  }

  // Thu thập tất cả các spec keys có trong các sản phẩm so sánh
  const allKeys = Array.from(
    new Set(selectedProducts.flatMap(p => Object.keys(p.specs)))
  );

  return (
    <>
      <SEO title="So Sánh Laptop | NEXUS Tech" description="So sánh chi tiết cấu hình thông số kỹ thuật 2 dòng laptop." />
      <motion.div
        className="container py-5 px-4 px-md-5 text-start"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <span className="text-danger text-uppercase fw-bold tracking-widest fs-8 mb-2 d-block" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
              ĐỐI CHIẾU CẤU HÌNH
            </span>
            <h2 className="fs-2 display-font text-dark mb-0">So Sánh Sản Phẩm</h2>
          </div>
          <button className="btn btn-outline-danger" onClick={clearCompare} style={{ borderRadius: '6px' }}>
            Xóa so sánh
          </button>
        </div>

        <div className="table-responsive rounded-4 border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-color)' }}>
          <table className="table table-striped table-bordered mb-0 align-middle">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th className="text-dark fw-bold py-3" style={{ width: '20%', fontSize: '0.9rem' }}>Thông số kỹ thuật</th>
                {selectedProducts.map(p => (
                  <th key={p.id} className="text-dark py-3 position-relative" style={{ width: '40%', paddingRight: '40px' }}>
                    <div className="d-flex gap-3 align-items-center text-start">
                      <div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                        <img src={p.image} alt={p.name} className="img-fluid object-fit-contain h-100" />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-bold text-truncate-2 text-dark fs-7" style={{ maxWidth: '280px', fontSize: '0.85rem', lineHeight: '1.3' }}>{p.name}</div>
                        <div className="text-danger fw-bold fs-7 display-font mt-1">{formatDisplayPrice(p.price, p.displayPrice)}</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-link p-1 text-secondary hover-red border-0 position-absolute"
                      style={{ top: '10px', right: '10px', zIndex: 10 }}
                      onClick={() => handleRemoveProduct(p)}
                      title="Xóa khỏi so sánh"
                    >
                      <X size={16} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* So sánh giá bán */}
              <tr>
                <td className="fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>Giá bán lẻ</td>
                {selectedProducts.map(p => {
                  const val = formatDisplayPrice(p.price, p.displayPrice);
                  const pricesSame = selectedProducts.every(item => item.price === p.price);
                  return (
                    <td 
                      key={p.id}
                      style={{ 
                        fontSize: '0.875rem',
                        backgroundColor: !pricesSame ? 'rgba(15, 98, 254, 0.05)' : 'transparent',
                        color: 'var(--accent-red)',
                        fontWeight: '700',
                        borderLeft: !pricesSame ? '3px solid var(--accent-red)' : '1px solid var(--border-color)'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{val}</span>
                        {!pricesSame && (
                          <span className="badge px-2 py-1" style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent-red)', color: '#ffffff', borderRadius: '4px' }}>
                            Giá khác biệt
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* So sánh thương hiệu */}
              <tr>
                <td className="fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>Thương hiệu</td>
                {selectedProducts.map(p => {
                  const val = p.brand || 'NEXUS';
                  const brandsSame = selectedProducts.every(item => (item.brand || 'NEXUS') === val);
                  return (
                    <td 
                      key={p.id}
                      style={{ 
                        fontSize: '0.875rem',
                        backgroundColor: !brandsSame ? 'rgba(15, 98, 254, 0.05)' : 'transparent',
                        color: !brandsSame ? 'var(--accent-red)' : 'var(--text-secondary)',
                        fontWeight: !brandsSame ? '600' : 'normal',
                        borderLeft: !brandsSame ? '3px solid var(--accent-red)' : '1px solid var(--border-color)',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{val}</span>
                        {!brandsSame && (
                          <span className="badge px-2 py-1" style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent-red)', color: '#ffffff', borderRadius: '4px' }}>
                            Khác biệt
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Các thông số specs kỹ thuật */}
              {allKeys.map(key => {
                const vals = selectedProducts.map(p => p.specs[key] ?? '-');
                const othersSame = vals.every(v => v === vals[0]);
                return (
                  <tr key={key}>
                    <td 
                      className="fw-semibold text-secondary" 
                      style={{ 
                        fontSize: '0.875rem',
                        color: !othersSame ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: !othersSame ? '#f8fafc' : 'transparent'
                      }}
                    >
                      {key}
                    </td>
                    {selectedProducts.map(p => renderValue(p, key))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 d-flex gap-3">
          <button className="btn btn-outline-secondary outline-btn" onClick={() => setCurrentPage('shop')}>Quay lại cửa hàng</button>
          <button className="btn btn-danger glow-btn" onClick={() => setCurrentPage('home')}>Về trang chủ</button>
        </div>
      </motion.div>
    </>
  );
};

export default Compare;

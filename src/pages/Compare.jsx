import { useEffect, useState } from 'react';
import { products } from '../data/products';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import SEO from '../components/SEO';



const Compare = ({ setCurrentPage }) => {
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const maxCompare = 3;

  useEffect(() => {
    // Extract query parameters from the hash (e.g., #compare?ids=1,2)
    const hash = window.location.hash;
    const query = new URLSearchParams(hash.replace('#compare?', ''));
    const ids = query.get('ids');
    if (ids) {
      const idArray = ids.split(',').filter(Boolean);
      const found = products.filter(p => idArray.includes(p.id.toString()));
      setSelectedProducts(found);
    }
  }, []);

  const addProduct = (product) => {
    const newList = [...selectedProducts, product];
    if (newList.length > maxCompare) return;
    setSelectedProducts(newList);
    const ids = newList.map(p => p.id).join(',');
    const newHash = `#compare?ids=${ids}`;
    window.location.hash = newHash;
  };

  const removeProduct = (id) => {
    const newList = selectedProducts.filter(p => p.id !== id);
    setSelectedProducts(newList);
    const ids = newList.map(p => p.id).join(',');
    window.location.hash = ids ? `#compare?ids=${ids}` : '#compare';
  };

  if (selectedProducts.length < 2) {
    return (
      <div className="container py-5 text-center text-white">
        <h3 className="mb-4">Chọn ít nhất 2 sản phẩm để so sánh.</h3>
        {/* Product addition boxes */}
        <div className="d-flex justify-content-center gap-4">
          {[...Array(maxCompare)].map((_, idx) => (
            <div key={idx} className="glass-panel p-4 rounded" style={{ width: '200px', minHeight: '250px' }}>
              {selectedProducts[idx] ? (
                <div className="d-flex flex-column align-items-center">
                  <img src={selectedProducts[idx].image} alt={selectedProducts[idx].name} style={{ maxHeight: '100px', objectFit: 'contain' }} />
                  <p className="text-white mt-2">{selectedProducts[idx].name}</p>
                  <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => removeProduct(selectedProducts[idx].id)}>
                    Xóa
                  </button>
                </div>
              ) : (
                <select className="form-select bg-dark text-white" onChange={(e) => {
                  const prod = products.find(p => p.id.toString() === e.target.value);
                  if (prod) addProduct(prod);
                }} defaultValue="">
                  <option value="" disabled>Chọn sản phẩm</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Gather all spec keys
  const allKeys = Array.from(
    new Set(selectedProducts.flatMap(p => Object.keys(p.specs)))
  );

  const renderValue = (product, key) => {
    const val = product.specs[key] ?? '-';
    const othersSame = selectedProducts.every(p => (p.specs[key] ?? '-') === val);
    return (
      <td className="text-white" style={{ fontSize: '0.9rem' }}>
        {val}{!othersSame && <Check size={14} className="ms-1 text-accent-red" />}
      </td>
    );
  };

  return (
    <>
      <SEO title="So sánh sản phẩm" description="So sánh chi tiết các sản phẩm" />
      <motion.div
        className="container py-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="fs-3 text-white mb-4 display-font">So sánh sản phẩm</h2>
        <div className="table-responsive glass-panel p-4 rounded">
          <table className="table table-dark table-bordered mb-0">
            <thead>
              <tr>
                <th className="text-white" style={{ width: '20%' }}>Thông số</th>
                {selectedProducts.map(p => (
                  <th key={p.id} className="text-white text-center">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allKeys.map(key => (
                <tr key={key}>
                  <td className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>{key}</td>
                  {selectedProducts.map(p => renderValue(p, key))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 d-flex justify-content-between">
          <button className="btn btn-outline-danger glow-btn" onClick={() => setCurrentPage('shop')}>Quay lại cửa hàng</button>
          <button className="btn btn-danger glow-btn" onClick={() => setCurrentPage('home')}>Về trang chủ</button>
        </div>
      </motion.div>
    </>
  );
};

export default Compare;

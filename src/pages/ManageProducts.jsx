import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Loader2, Plus, Edit, Trash2, ShieldAlert, Search, X, FileSpreadsheet, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function ManageProducts() {
  const { showToast, confirm } = useToast();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [importing, setImporting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalMode, setProductModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    brand: 'NEXUS',
    category: 'computing',
    images: '/assets/nexus-keyboard.png',
    tag: 'New',
    description: '',
    shortDescription: ''
  });
  const [productFormErrors, setProductFormErrors] = useState({});

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const data = await apiService.products.getAll();
      setProducts(data);
    } catch (err) {
      setProductsError(err.message || 'Lỗi khi lấy danh sách sản phẩm.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset value
    e.target.value = '';

    setImporting(true);
    try {
      const result = await apiService.products.importExcel(file);
      
      if (result.hasError) {
        const errorList = result.errors
          .map(err => `Dòng ${err.row}, Cột ${err.column}: ${err.message}`)
          .slice(0, 10) // Show up to 10 errors
          .join('\n');
        
        const overflow = result.errors.length > 10 ? `\n... và ${result.errors.length - 10} lỗi khác.` : '';
        
        showToast({
          type: 'warning',
          title: 'Nhập Excel có lỗi',
          message: `Đã nhập thành công ${result.data ? result.data.length : 0} sản phẩm. Xem chi tiết lỗi ở console.`
        });
        console.warn(`Chi tiết lỗi nhập Excel:\n${errorList}${overflow}`);
      } else {
        showToast({
          type: 'success',
          title: 'Nhập Excel thành công',
          message: `Đã nhập thành công ${result.data ? result.data.length : 0} sản phẩm mới.`
        });
      }
      
      loadProducts();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Nhập Excel thất bại',
        message: err.message || 'Lỗi khi nhập sản phẩm từ Excel.'
      });
    } finally {
      setImporting(false);
    }
  };

  const openAddProduct = () => {
    setProductFormData({
      name: '',
      price: '',
      brand: 'NEXUS',
      category: 'computing',
      images: '/assets/nexus-keyboard.png',
      tag: 'New',
      description: '',
      shortDescription: ''
    });
    setProductFormErrors({});
    setProductModalMode('add');
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setSelectedProduct(prod);
    setProductFormData({
      name: prod.name || '',
      price: prod.price || '',
      brand: prod.brand || 'NEXUS',
      category: prod.category || 'computing',
      images: prod.images || '/assets/nexus-keyboard.png',
      tag: prod.tag || 'New',
      description: prod.description || '',
      shortDescription: prod.shortDescription || ''
    });
    setProductFormErrors({});
    setProductModalMode('edit');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductFormErrors({});

    const errs = {};
    if (!productFormData.name.trim()) errs.name = 'Tên sản phẩm không được trống';
    if (!productFormData.price.trim()) errs.price = 'Giá không được trống';
    if (!productFormData.images.trim()) errs.images = 'URL ảnh không được trống';

    if (Object.keys(errs).length > 0) {
      setProductFormErrors(errs);
      return;
    }

    const linkStr = productFormData.link || productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const payload = {
      ...productFormData,
      link: linkStr,
      specsJson: productFormData.specsJson || '{}',
      reviewsJson: productFormData.reviewsJson || '[]'
    };

    try {
      if (productModalMode === 'add') {
        await apiService.products.create(payload);
        showToast({ type: 'success', title: 'Thêm thành công', message: `Sản phẩm "${payload.name}" đã được thêm.` });
      } else {
        await apiService.products.update(selectedProduct.id, payload);
        showToast({ type: 'success', title: 'Cập nhật thành công', message: `Đã lưu sản phẩm "${payload.name}".` });
      }
      setShowProductModal(false);
      loadProducts();
    } catch (err) {
      setProductFormErrors({ global: err.message || 'Lỗi khi lưu sản phẩm.' });
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Sản phẩm sẽ được chuyển vào Thùng rác.'
    });
    if (!confirmed) return;
    try {
      await apiService.products.delete(id, false); // soft delete
      showToast({ type: 'success', title: 'Xóa thành công', message: 'Sản phẩm đã được chuyển vào Thùng rác.' });
      loadProducts();
    } catch (err) {
      showToast({ type: 'error', title: 'Xóa thất bại', message: err.message || 'Xóa sản phẩm thất bại.' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <main id="main" className="main">
      <div className="pagetitle d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
              <li className="breadcrumb-item active">Products</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="file"
            id="excel-file-input"
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            onChange={handleExcelImport}
          />
          <button 
            className="btn btn-outline-success d-flex align-items-center gap-1 py-2 px-3" 
            onClick={() => document.getElementById('excel-file-input').click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="spinner-border border-0" style={{ width: '16px', height: '16px' }} />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            {importing ? 'Đang nhập...' : 'Nhập Excel'}
          </button>
          
          <button className="btn btn-primary d-flex align-items-center gap-1 py-2 px-3" onClick={openAddProduct}>
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body pt-3">
            <div className="d-flex mb-3 position-relative" style={{ maxWidth: '360px' }}>
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, hãng, loại..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="form-control ps-5"
                style={{ borderRadius: '20px' }}
              />
            </div>

            {productsLoading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                <Loader2 className="spinner-border text-primary border-0" style={{ width: '32px', height: '32px' }} />
                <span className="text-muted fs-8">Đang tải danh sách sản phẩm...</span>
              </div>
            ) : productsError ? (
              <div className="alert alert-danger d-flex align-items-center gap-2 m-3">
                <ShieldAlert size={18} />
                <span>{productsError}</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Xem trước</th>
                      <th scope="col">Tên sản phẩm</th>
                      <th scope="col">Hãng</th>
                      <th scope="col">Danh mục</th>
                      <th scope="col">Giá bán</th>
                      <th scope="col">Đánh giá</th>
                      <th scope="col">Nhãn</th>
                      <th scope="col" className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào.</td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <th scope="row">{p.id}</th>
                          <td>
                            <div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                              <img
                                src={p.images ? p.images.split(',')[0] : '/assets/nexus-keyboard.png'}
                                alt={p.name}
                                className="img-fluid"
                                style={{ maxHeight: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          </td>
                          <td><strong className="text-dark">{p.name}</strong></td>
                          <td>{p.brand}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {p.category === 'wearables' ? 'Đồ đeo thông nhịp' : p.category === 'audio' ? 'Âm thanh' : p.category === 'computing' ? 'Máy tính' : p.category === 'input' ? 'Phụ kiện nhập' : p.category}
                            </span>
                          </td>
                          <td><strong className="text-danger">${Number(p.price).toLocaleString()}</strong></td>
                          <td>
                            <div className="d-flex align-items-center gap-1 fs-8 text-warning">
                              <span>★</span><span>{p.rating || '5.0'}</span>
                              <span className="text-muted">({p.reviewCount || 0})</span>
                            </div>
                          </td>
                          <td>
                            {p.tag && (
                              <span className={`badge ${p.tag === 'Hot' ? 'bg-danger' : p.tag === 'New' ? 'bg-info' : 'bg-primary'}`}>
                                {p.tag}
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <button className="btn btn-sm btn-outline-info p-2" onClick={() => { setDetailProduct(p); setActiveImageIndex(0); }} title="Xem chi tiết">
                                <Eye size={14} />
                              </button>
                              <button className="btn btn-sm btn-outline-primary p-2" onClick={() => openEditProduct(p)}>
                                <Edit size={14} />
                              </button>
                              <button className="btn btn-sm btn-outline-danger p-2" onClick={() => deleteProduct(p.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      {showProductModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card w-100 m-3 shadow" style={{ maxWidth: '550px', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">{productModalMode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}</h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setShowProductModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="card-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {productFormErrors.global && (
                  <div className="alert alert-danger py-2 px-3 fs-7 mb-3 d-flex align-items-center gap-2 border-0 bg-danger bg-opacity-10 text-danger">
                    <ShieldAlert size={16} />
                    <span>{productFormErrors.global}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className={`form-control ${productFormErrors.name ? 'is-invalid' : ''}`}
                  />
                  {productFormErrors.name && <span className="invalid-feedback fs-8">{productFormErrors.name}</span>}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Giá bán ($) *</label>
                    <input
                      type="number"
                      required
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                      className={`form-control ${productFormErrors.price ? 'is-invalid' : ''}`}
                    />
                    {productFormErrors.price && <span className="invalid-feedback fs-8">{productFormErrors.price}</span>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Hãng sản xuất</label>
                    <input
                      type="text"
                      value={productFormData.brand}
                      onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Danh mục</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="computing">Computing (Máy tính)</option>
                      <option value="wearables">Wearables (Thiết bị đeo)</option>
                      <option value="audio">Audio (Thiết bị âm thanh)</option>
                      <option value="input">Input (Thiết bị nhập liệu)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Nhãn hiển thị (Tag)</label>
                    <select
                      value={productFormData.tag}
                      onChange={(e) => setProductFormData({ ...productFormData, tag: e.target.value })}
                      className="form-select"
                    >
                      <option value="New">New</option>
                      <option value="Hot">Hot</option>
                      <option value="Bán Chạy">Bán Chạy</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Đường dẫn ảnh sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.images}
                    onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                    className={`form-control ${productFormErrors.images ? 'is-invalid' : ''}`}
                  />
                  {productFormErrors.images && <span className="invalid-feedback fs-8">{productFormErrors.images}</span>}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={productFormData.shortDescription}
                    onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
                    className="form-control"
                    placeholder="Mô tả tóm tắt tính năng sản phẩm"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1">Mô tả chi tiết</label>
                  <textarea
                    rows="3"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="form-control"
                    placeholder="Giới thiệu đầy đủ chi tiết sản phẩm"
                  ></textarea>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-end gap-2 bg-light py-3 border-top px-4">
                <button type="button" className="btn btn-outline-secondary px-3 py-2 fs-7" onClick={() => setShowProductModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 fs-7">
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="modal-overlay d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="card w-100 m-3 shadow" style={{ maxWidth: '750px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#1e1e24', color: '#fff' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white-5 border-bottom py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <span className="badge bg-primary fs-7">{detailProduct.brand}</span>
                {detailProduct.name}
              </h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setDetailProduct(null)}><X size={20} /></button>
            </div>
            <div className="card-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div className="row g-4">
                {/* Images Section */}
                <div className="col-md-5">
                  <h6 className="fw-bold mb-3 text-primary">Hình ảnh sản phẩm</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded bg-light border d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                      <img
                        src={detailProduct.images ? detailProduct.images.split(',')[activeImageIndex] : '/assets/nexus-keyboard.png'}
                        alt={detailProduct.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    {/* Thumbnail list */}
                    {detailProduct.images && detailProduct.images.split(',').length > 1 && (
                      <div className="d-flex gap-2 overflow-x-auto pb-2">
                        {detailProduct.images.split(',').map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveImageIndex(idx)}
                            className="p-1 rounded bg-light border d-flex align-items-center justify-content-center" 
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              flexShrink: 0, 
                              cursor: 'pointer',
                              border: activeImageIndex === idx ? '2px solid #4154f1' : '1px solid #dee2e6'
                            }}
                          >
                            <img src={imgUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Specs Section */}
                <div className="col-md-7">
                  <h6 className="fw-bold mb-3 text-primary">Thông tin cơ bản</h6>
                  <table className="table table-sm table-dark table-borderless fs-7 mb-4">
                    <tbody>
                      <tr>
                        <td className="text-muted w-25">ID:</td>
                        <td>{detailProduct.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Danh mục:</td>
                        <td>{detailProduct.category}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Giá bán:</td>
                        <td className="text-danger fw-bold">
                          {detailProduct.price ? parseFloat(detailProduct.price).toLocaleString('vi-VN') + ' ₫' : 'Chưa cập nhật'}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Đánh giá:</td>
                        <td>★ {detailProduct.rating || '5.0'} ({detailProduct.reviewCount || 0} lượt đánh giá)</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Mô tả ngắn:</td>
                        <td>{detailProduct.shortDescription || '—'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h6 className="fw-bold mb-3 text-primary">Thông số kỹ thuật chi tiết</h6>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {(() => {
                      const specFields = [
                        { label: 'Vi xử lý (CPU)', value: detailProduct.cpuTechnology },
                        { label: 'Nhân/Luồng', value: detailProduct.cpuCores && detailProduct.cpuThreads ? `${detailProduct.cpuCores} nhân, ${detailProduct.cpuThreads} luồng` : null },
                        { label: 'Tốc độ CPU', value: detailProduct.cpuSpeed },
                        { label: 'Bộ nhớ RAM', value: detailProduct.ram ? `${detailProduct.ram} ${detailProduct.ramType || ''} ${detailProduct.ramBusSpeed || ''}`.trim() : null },
                        { label: 'Card đồ họa (GPU)', value: detailProduct.gpuCard },
                        { label: 'Ổ cứng (Storage)', value: detailProduct.storage },
                        { label: 'Màn hình', value: detailProduct.screenSize ? `${detailProduct.screenSize} inch ${detailProduct.screenResolution || ''} ${detailProduct.panel || ''}`.trim() : null },
                        { label: 'Tần số quét', value: detailProduct.refreshRate },
                        { label: 'Dung lượng pin', value: detailProduct.battery },
                        { label: 'Hệ điều hành', value: detailProduct.operatingSystem },
                        { label: 'Kích thước & Trọng lượng', value: detailProduct.dimensionsWeight },
                        { label: 'Thời điểm ra mắt', value: detailProduct.releaseTime }
                      ];

                      const activeSpecs = specFields.filter(f => f.value !== null && f.value !== undefined && f.value !== '');

                      if (activeSpecs.length === 0) {
                        return detailProduct.description ? (
                          <div className="p-3 rounded bg-dark border border-secondary fs-7" style={{ whiteSpace: 'pre-wrap' }}>
                            {detailProduct.description}
                          </div>
                        ) : (
                          <div className="text-muted fs-7">Chưa cập nhật thông số kỹ thuật.</div>
                        );
                      }

                      return (
                        <table className="table table-sm table-dark table-striped table-bordered fs-7 mb-0">
                          <tbody>
                            {activeSpecs.map((spec, idx) => (
                              <tr key={idx}>
                                <td className="text-muted w-40" style={{ fontSize: '0.78rem' }}>{spec.label}</td>
                                <td style={{ fontSize: '0.78rem' }}>{spec.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end bg-light-5 py-3 border-top px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <button type="button" className="btn btn-outline-secondary px-4 py-2 fs-7" onClick={() => setDetailProduct(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManageProducts;

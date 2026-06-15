import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Loader2, RotateCcw, Trash2, ShieldAlert, Search, AlertCircle, Eye, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function ManageTrash() {
  const { showToast, confirm } = useToast();
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDeletedProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.products.getDeleted();
      setDeletedProducts(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy danh sách sản phẩm đã xóa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedProducts();
  }, []);

  const handleRestore = async (id, name) => {
    const confirmed = await confirm({
      title: 'Khôi phục sản phẩm',
      message: `Bạn có chắc muốn khôi phục sản phẩm "${name}"?`
    });
    if (!confirmed) return;
    try {
      await apiService.products.restore(id);
      showToast({ type: 'success', title: 'Khôi phục thành công', message: `Đã khôi phục sản phẩm "${name}" thành công!` });
      loadDeletedProducts();
    } catch (err) {
      showToast({ type: 'error', title: 'Lỗi khôi phục', message: err.message || 'Khôi phục sản phẩm thất bại.' });
    }
  };

  const handlePermanentDelete = async (id, name) => {
    const confirmed = await confirm({
      title: 'CẢNH BÁO: Xóa vĩnh viễn',
      message: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm "${name}"? Hành động này không thể hoàn tác!`
    });
    if (!confirmed) return;
    try {
      await apiService.products.delete(id, true); // hard delete
      showToast({ type: 'success', title: 'Đã xóa vĩnh viễn', message: `Sản phẩm "${name}" đã bị xóa vĩnh viễn khỏi hệ thống.` });
      loadDeletedProducts();
    } catch (err) {
      showToast({ type: 'error', title: 'Xóa thất bại', message: err.message || 'Xóa vĩnh viễn sản phẩm thất bại.' });
    }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 30;
    const deleteDate = new Date(deletedAt);
    const now = new Date();
    const diffTime = now - deleteDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffDays;
    return remaining < 0 ? 0 : remaining;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredProducts = deletedProducts.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main id="main" className="main">
      <div className="pagetitle d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Thùng rác sản phẩm</h1>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
              <li className="breadcrumb-item"><a href="#dashboard/products">Products</a></li>
              <li className="breadcrumb-item active">Trash</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="d-flex position-relative" style={{ maxWidth: '360px', width: '100%' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm đã xóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control ps-5"
                  style={{ borderRadius: '20px' }}
                />
              </div>
              <div className="text-muted fs-7">
                Sản phẩm trong thùng rác sẽ được tự động xóa vĩnh viễn sau <strong>30 ngày</strong>.
              </div>
            </div>

            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                <Loader2 className="spinner-border text-primary border-0" style={{ width: '32px', height: '32px' }} />
                <span className="text-muted fs-8">Đang tải thùng rác...</span>
              </div>
            ) : error ? (
              <div className="alert alert-danger d-flex align-items-center gap-2 m-3">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Ảnh</th>
                      <th scope="col">Tên sản phẩm</th>
                      <th scope="col">Hãng</th>
                      <th scope="col">Giá bán</th>
                      <th scope="col">Ngày xóa</th>
                      <th scope="col">Thời gian còn lại</th>
                      <th scope="col" className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">Thùng rác trống.</td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const daysLeft = getDaysRemaining(p.deletedAt);
                        const isNearingDeletion = daysLeft <= 3;

                        return (
                          <tr key={p.id} className={isNearingDeletion ? 'table-danger-light' : ''}>
                            <th scope="row">{p.id}</th>
                            <td>
                              <div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                                <img
                                  src={p.images ? p.images.split(',')[0] : '/assets/nexus-keyboard.png'}
                                  alt={p.name}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold">{p.name}</div>
                              <div className="text-muted fs-8">{p.category}</div>
                            </td>
                            <td>
                              <span className="badge bg-secondary-light text-secondary">{p.brand}</span>
                            </td>
                            <td>
                              <span className="fw-bold">
                                {p.price ? parseFloat(p.price).toLocaleString('vi-VN') + ' ₫' : 'Chưa cập nhật'}
                              </span>
                            </td>
                            <td>{formatDate(p.deletedAt)}</td>
                            <td>
                              {isNearingDeletion ? (
                                <span className="badge bg-danger d-inline-flex align-items-center gap-1 py-1.5 px-2.5 animate-pulse-warning">
                                  <AlertCircle size={12} />
                                  Sắp bị xóa vĩnh viễn! Còn {daysLeft} ngày
                                </span>
                              ) : (
                                <span className="badge bg-info-light text-info py-1.5 px-2.5">
                                  Còn {daysLeft} ngày
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                  onClick={() => { setDetailProduct(p); setActiveImageIndex(0); }}
                                  title="Xem chi tiết"
                                >
                                  <Eye size={14} /> Chi tiết
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                  onClick={() => handleRestore(p.id, p.name)}
                                  title="Khôi phục sản phẩm"
                                >
                                  <RotateCcw size={14} /> Khôi phục
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                  onClick={() => handlePermanentDelete(p.id, p.name)}
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 size={14} /> Xóa vĩnh viễn
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      
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

      {/* Dynamic CSS animations */}
      <style>{`
        .table-danger-light {
          background-color: rgba(220, 53, 69, 0.05) !important;
        }
        .bg-secondary-light {
          background-color: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }
        .bg-info-light {
          background-color: rgba(13, 202, 240, 0.1);
          color: #0dcaf0;
        }
        .animate-pulse-warning {
          animation: pulseWarning 2s infinite;
          background-color: #dc3545 !important;
          color: #fff !important;
        }
        @keyframes pulseWarning {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        .fs-7 {
          font-size: 0.875rem;
        }
        .fs-8 {
          font-size: 0.75rem;
        }
      `}</style>
    </main>
  );
}

export default ManageTrash;

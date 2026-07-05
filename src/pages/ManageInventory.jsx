import { useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import { ProductContext, DEFAULT_LOW_STOCK_THRESHOLD } from '../context/ProductContext';
import {
  Loader2, Search, X, History, ArrowUpRight, ArrowDownRight,
  ClipboardCheck, Sliders, AlertTriangle, CheckCircle, Info, RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ReactPaginate from 'react-paginate';

const resolveComponent = (obj) => {
  if (!obj) return null;
  if (typeof obj === 'function' || typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    if (typeof obj.default === 'function' || typeof obj.default === 'string') return obj.default;
    if (typeof obj.default === 'object') return resolveComponent(obj.default);
  }
  return obj;
};

const ReactPaginateComponent = resolveComponent(ReactPaginate);

function ManageInventory() {
  const { showToast } = useToast();
  const { products = [], loading: productsLoading, refreshProducts } = useContext(ProductContext);

  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    if (refreshProducts) {
      refreshProducts();
    }
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'OutOfStock', 'LowStock', 'Normal'
  const [filterBrand, setFilterBrand] = useState('All');

  // Pagination
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  // History Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All'); // 'All', 'IMPORT', 'EXPORT', 'ADJUST', 'AUDIT'
  const [historyPageNum, setHistoryPageNum] = useState(1);
  const historyItemsPerPage = 10;

  // Modals state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('IMPORT'); // 'IMPORT', 'EXPORT', 'ADJUST', 'AUDIT'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Product Log Modal
  const [showProductLogModal, setShowProductLogModal] = useState(false);
  const [productLogs, setProductLogs] = useState([]);
  const [productLogLoading, setProductLogLoading] = useState(false);

  // Load global history logs
  const loadHistoryLogs = async () => {
    setHistoryLoading(true);
    try {
      const data = await apiService.inventory.getAllTransactions();
      setHistoryLogs(data || []);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể tải nhật ký thay đổi kho.'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryLogs();
    }
  }, [activeTab]);

  // Load single product logs
  const loadProductLogs = async (productId) => {
    setProductLogLoading(true);
    try {
      const data = await apiService.inventory.getTransactionsByProduct(productId);
      setProductLogs(data || []);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể tải lịch sử sản phẩm.'
      });
    } finally {
      setProductLogLoading(false);
    }
  };

  // Open transaction modal
  const openTransaction = (product, type) => {
    setSelectedProduct(product);
    setTransactionType(type);
    setQuantityInput('');
    setNoteInput('');
    setShowTransactionModal(true);
  };

  // Open product logs modal
  const openProductLogs = (product) => {
    setSelectedProduct(product);
    setProductLogs([]);
    setShowProductLogModal(true);
    loadProductLogs(product.id);
  };

  // Submit transaction
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = Number(quantityInput);
    if (isNaN(qty) || qty < 0 && transactionType !== 'ADJUST') {
      showToast({
        type: 'error',
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập số lượng hợp lệ.'
      });
      return;
    }

    if ((transactionType === 'IMPORT' || transactionType === 'EXPORT') && qty <= 0) {
      showToast({
        type: 'error',
        title: 'Dữ liệu không hợp lệ',
        message: 'Số lượng nhập/xuất phải lớn hơn 0.'
      });
      return;
    }

    setModalSubmitting(true);
    try {
      await apiService.inventory.createTransaction(
        selectedProduct.id,
        transactionType,
        qty,
        noteInput || getDefaultNote(transactionType, qty, selectedProduct.name)
      );

      showToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã thực hiện nghiệp vụ ${getVietnameseType(transactionType)} cho sản phẩm.`
      });

      setShowTransactionModal(false);

      // Reload products catalog from database
      if (refreshProducts) {
        await refreshProducts();
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Thất bại',
        message: err.message || 'Gặp lỗi khi thực hiện giao dịch kho.'
      });
    } finally {
      setModalSubmitting(false);
    }
  };

  const getVietnameseType = (type) => {
    switch (type) {
      case 'IMPORT': return 'Nhập kho';
      case 'EXPORT': return 'Xuất kho';
      case 'ADJUST': return 'Điều chỉnh';
      case 'AUDIT': return 'Kiểm kê';
      default: return type;
    }
  };

  const getDefaultNote = (type, qty, name) => {
    const timeStr = new Date().toLocaleDateString('vi-VN');
    switch (type) {
      case 'IMPORT': return `Nhập thêm kho sản phẩm ${name} - Ngày ${timeStr}`;
      case 'EXPORT': return `Xuất kho sản phẩm ${name} - Ngày ${timeStr}`;
      case 'ADJUST': return `Điều chỉnh kho sản phẩm ${name} lượng: ${qty}`;
      case 'AUDIT': return `Kiểm kê kho thực tế sản phẩm ${name}: ${qty} cái`;
      default: return '';
    }
  };

  // Filter products for inventory tab
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = filterBrand === 'All' || p.brand === filterBrand;

    const stock = p.stockQuantity != null ? p.stockQuantity : 0;
    const threshold = p.lowStockThreshold != null ? p.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD;

    let matchesStatus = true;
    if (filterStatus === 'OutOfStock') {
      matchesStatus = stock === 0;
    } else if (filterStatus === 'LowStock') {
      matchesStatus = stock > 0 && stock <= threshold;
    } else if (filterStatus === 'Normal') {
      matchesStatus = stock > threshold;
    }

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPageNum * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Filter history logs
  const filteredHistory = historyLogs.filter(log => {
    const matchesSearch = log.productName?.toLowerCase().includes(historySearch.toLowerCase()) ||
      String(log.productId).includes(historySearch) ||
      log.note?.toLowerCase().includes(historySearch.toLowerCase()) ||
      log.createdBy?.toLowerCase().includes(historySearch.toLowerCase());

    const matchesType = historyTypeFilter === 'All' || log.type === historyTypeFilter;

    return matchesSearch && matchesType;
  });

  const historyTotalPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
  const indexOfLastHistory = historyPageNum * historyItemsPerPage;
  const indexOfFirstHistory = indexOfLastHistory - historyItemsPerPage;
  const currentHistory = filteredHistory.slice(indexOfFirstHistory, indexOfLastHistory);

  // Reset paging on filters
  useEffect(() => {
    setCurrentPageNum(1);
  }, [searchQuery, filterStatus, filterBrand]);

  useEffect(() => {
    setHistoryPageNum(1);
  }, [historySearch, historyTypeFilter]);

  // Extract unique brands for filter
  const brands = [...new Set(products.map(p => p.brand))].filter(Boolean);

  return (
    <main id="main" className="main">
      <div className="pagetitle d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Quản lý kho hàng</h1>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
              <li className="breadcrumb-item active">Kho hàng</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn d-flex align-items-center gap-1 py-2 px-3 ${activeTab === 'current' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('current')}
          >
            Tồn kho hiện tại
          </button>
          <button
            className={`btn d-flex align-items-center gap-1 py-2 px-3 ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} /> Nhật ký thay đổi kho
          </button>
        </div>
      </div>

      <section className="section">
        {activeTab === 'current' ? (
          <div className="card">
            <div className="card-body pt-3">
              {/* Filter controls */}
              <div className="d-flex gap-2 flex-wrap mb-4 align-items-center">
                {/* Search Box */}
                <div className="position-relative flex-grow-1" style={{ minWidth: '240px', maxWidth: '360px' }}>
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên, hãng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control ps-5"
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Status Filter */}
                <div style={{ minWidth: '160px' }}>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Normal">Đủ hàng (Bình thường)</option>
                    <option value="LowStock">Cảnh báo: Tồn kho thấp</option>
                    <option value="OutOfStock">Hết hàng</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div style={{ minWidth: '130px' }}>
                  <select
                    className="form-select"
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="All">Tất cả hãng</option>
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {(searchQuery || filterStatus !== 'All' || filterBrand !== 'All') && (
                  <button
                    className="btn btn-link btn-sm text-decoration-none text-muted"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('All');
                      setFilterBrand('All');
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {productsLoading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                  <Loader2 className="spinner-border text-primary border-0" style={{ width: '32px', height: '32px' }} />
                  <span className="text-muted fs-8">Đang tải danh sách tồn kho từ database...</span>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '60px' }}>ID</th>
                          <th scope="col" style={{ width: '80px' }}>Ảnh</th>
                          <th scope="col">Tên sản phẩm</th>
                          <th scope="col">Hãng</th>
                          <th scope="col">Tồn hiện tại</th>
                          <th scope="col">Ngưỡng cảnh báo</th>
                          <th scope="col">Trạng thái kho</th>
                          <th scope="col" className="text-end">Nghiệp vụ kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào.</td>
                          </tr>
                        ) : (
                          currentProducts.map((p) => {
                            const stock = p.stockQuantity != null ? p.stockQuantity : 0;
                            const threshold = p.lowStockThreshold != null ? p.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD;

                            let badgeColor = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
                            let badgeText = 'Đủ hàng';

                            if (stock === 0) {
                              badgeColor = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                              badgeText = 'Hết hàng';
                            } else if (stock <= threshold) {
                              badgeColor = 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
                              badgeText = 'Sắp hết hàng';
                            }

                            return (
                              <tr key={p.id}>
                                <th scope="row">{p.id}</th>
                                <td>
                                  <div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <img
                                      src={p.images ? p.images.split(/[\s,]+/)[0].trim() : '/assets/nexus-keyboard.png'}
                                      alt={p.name}
                                      className="img-fluid"
                                      style={{ maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <strong className="text-dark d-block text-truncate" style={{ maxWidth: '280px' }}>{p.name}</strong>
                                  <span className="text-muted fs-8">{p.category === 'computing' ? 'Máy tính' : p.category}</span>
                                </td>
                                <td>{p.brand}</td>
                                <td>
                                  <span className={`fs-6 fw-bold ${stock <= threshold ? 'text-danger' : 'text-dark'}`}>{stock}</span> cái
                                </td>
                                <td>{threshold} cái</td>
                                <td>
                                  <span className={`badge ${badgeColor} py-1.5 px-2.5 rounded-pill`}>
                                    {badgeText}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <div className="d-flex justify-content-end gap-1">
                                    <button
                                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1.5 px-2.5"
                                      onClick={() => openTransaction(p, 'IMPORT')}
                                      title="Nhập kho hàng"
                                    >
                                      <ArrowUpRight size={14} /> Nhập
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1.5 px-2.5"
                                      onClick={() => openTransaction(p, 'EXPORT')}
                                      disabled={stock === 0}
                                      title="Xuất kho hàng"
                                    >
                                      <ArrowDownRight size={14} /> Xuất
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 py-1.5 px-2.5"
                                      onClick={() => openTransaction(p, 'AUDIT')}
                                      title="Kiểm kê & điều chỉnh tồn kho"
                                    >
                                      <ClipboardCheck size={14} /> Kiểm kê
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1.5 px-2"
                                      onClick={() => openProductLogs(p)}
                                      title="Nhật ký kho sản phẩm"
                                    >
                                      <History size={14} />
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="d-flex justify-content-between align-items-center mt-3 px-3">
                      <div className="text-muted fs-7">
                        Hiển thị <strong>{indexOfFirstProduct + 1}</strong> đến <strong>{Math.min(indexOfLastProduct, filteredProducts.length)}</strong> trong tổng số <strong>{filteredProducts.length}</strong> sản phẩm
                      </div>
                      <ReactPaginateComponent
                        previousLabel="Trước"
                        nextLabel="Sau"
                        pageCount={totalPages}
                        onPageChange={({ selected }) => setCurrentPageNum(selected + 1)}
                        containerClassName="pagination mb-0"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        activeClassName="active"
                        forcePage={currentPageNum - 1}
                      />
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body pt-3">
              {/* History Filter controls */}
              <div className="d-flex gap-2 flex-wrap mb-4 align-items-center">
                {/* Search Box */}
                <div className="position-relative flex-grow-1" style={{ minWidth: '240px', maxWidth: '360px' }}>
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm theo sản phẩm, người thực hiện, ghi chú..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="form-control ps-5"
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Operation Type Filter */}
                <div style={{ minWidth: '160px' }}>
                  <select
                    className="form-select"
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="All">Tất cả nghiệp vụ</option>
                    <option value="IMPORT">Nhập kho (IMPORT)</option>
                    <option value="EXPORT">Xuất kho (EXPORT)</option>
                    <option value="ADJUST">Điều chỉnh (ADJUST)</option>
                    <option value="AUDIT">Kiểm kê (AUDIT)</option>
                  </select>
                </div>

                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-1.5 py-2 px-3"
                  onClick={loadHistoryLogs}
                  disabled={historyLoading}
                >
                  <RefreshCw size={14} className={historyLoading ? 'spin-element' : ''} /> Làm mới
                </button>

                {(historySearch || historyTypeFilter !== 'All') && (
                  <button
                    className="btn btn-link btn-sm text-decoration-none text-muted"
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryTypeFilter('All');
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {historyLoading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                  <Loader2 className="spinner-border text-primary border-0" style={{ width: '32px', height: '32px' }} />
                  <span className="text-muted fs-8">Đang tải nhật ký thay đổi kho...</span>
                </div>
              ) : (
                <>
                  {/* Table History */}
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th scope="col">Thời gian</th>
                          <th scope="col">Sản phẩm (ID)</th>
                          <th scope="col">N nghiệp vụ</th>
                          <th scope="col">Lượng thay đổi</th>
                          <th scope="col">Tồn trước</th>
                          <th scope="col">Tồn sau</th>
                          <th scope="col">Người thực hiện</th>
                          <th scope="col">Lý do / Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentHistory.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy nhật ký thay đổi nào.</td>
                          </tr>
                        ) : (
                          currentHistory.map((log) => {
                            let typeBadge = 'bg-secondary';
                            let diffColor = 'text-dark';
                            let diffPrefix = '';

                            if (log.type === 'IMPORT') {
                              typeBadge = 'bg-success';
                              diffColor = 'text-success fw-bold';
                              diffPrefix = '+';
                            } else if (log.type === 'EXPORT') {
                              typeBadge = 'bg-danger';
                              diffColor = 'text-danger fw-bold';
                              diffPrefix = '';
                            } else if (log.type === 'ADJUST') {
                              typeBadge = 'bg-warning text-dark';
                              diffColor = log.quantityChanged >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                              diffPrefix = log.quantityChanged >= 0 ? '+' : '';
                            } else if (log.type === 'AUDIT') {
                              typeBadge = 'bg-info text-dark';
                              diffColor = log.quantityChanged >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                              diffPrefix = log.quantityChanged >= 0 ? '+' : '';
                            }

                            return (
                              <tr key={log.id}>
                                <td className="fs-7 text-muted">
                                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td>
                                  <strong className="text-dark d-block text-truncate" style={{ maxWidth: '200px' }}>
                                    {log.productName}
                                  </strong>
                                  <span className="text-muted fs-8">ID: {log.productId}</span>
                                </td>
                                <td>
                                  <span className={`badge ${typeBadge}`}>
                                    {getVietnameseType(log.type)}
                                  </span>
                                </td>
                                <td className={diffColor}>
                                  {diffPrefix}{log.quantityChanged}
                                </td>
                                <td>{log.previousStock}</td>
                                <td><strong className="text-dark">{log.newStock}</strong></td>
                                <td>
                                  <span className="text-muted fs-8 d-block text-truncate" style={{ maxWidth: '120px' }}>
                                    {log.createdBy}
                                  </span>
                                </td>
                                <td className="fs-8 text-secondary" style={{ maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                  {log.note}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyTotalPages > 1 && (
                    <nav className="d-flex justify-content-between align-items-center mt-3 px-3">
                      <div className="text-muted fs-7">
                        Hiển thị <strong>{indexOfFirstHistory + 1}</strong> đến <strong>{Math.min(indexOfLastHistory, filteredHistory.length)}</strong> trong tổng số <strong>{filteredHistory.length}</strong> nhật ký
                      </div>
                      <ReactPaginateComponent
                        previousLabel="Trước"
                        nextLabel="Sau"
                        pageCount={historyTotalPages}
                        onPageChange={({ selected }) => setHistoryPageNum(selected + 1)}
                        containerClassName="pagination mb-0"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        activeClassName="active"
                        forcePage={historyPageNum - 1}
                      />
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* TRANSACTION MANUAL MODAL */}
      {showTransactionModal && selectedProduct && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="card w-100 mx-auto shadow" style={{ maxWidth: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                {transactionType === 'IMPORT' && <ArrowUpRight className="text-success" />}
                {transactionType === 'EXPORT' && <ArrowDownRight className="text-danger" />}
                {transactionType === 'AUDIT' && <ClipboardCheck className="text-warning" />}
                {getVietnameseType(transactionType)} Sản Phẩm
              </h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setShowTransactionModal(false)} disabled={modalSubmitting}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit}>
              <div className="card-body p-4">
                <div className="p-3 bg-light rounded border mb-4 d-flex align-items-center gap-3">
                  <div className="p-1 rounded bg-white border d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                    <img
                      src={selectedProduct.images ? selectedProduct.images.split(/[\s,]+/)[0].trim() : '/assets/nexus-keyboard.png'}
                      alt={selectedProduct.name}
                      style={{ maxHeight: '100%', objectFit: 'contain' }}
                      className="img-fluid"
                    />
                  </div>
                  <div>
                    <h6 className="text-dark fw-bold mb-0.5 text-truncate" style={{ maxWidth: '320px' }}>{selectedProduct.name}</h6>
                    <span className="text-muted fs-8 d-block">Tồn kho hiện tại: <strong className="text-dark">{selectedProduct.stockQuantity || 0}</strong> cái</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1 fw-semibold">
                    {transactionType === 'AUDIT' ? 'Số lượng kiểm kê thực tế *' : 'Số lượng thay đổi *'}
                  </label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    placeholder={transactionType === 'AUDIT' ? 'Nhập số lượng đếm được thực tế tại kho' : 'Nhập số lượng'}
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    disabled={modalSubmitting}
                  />
                  {transactionType === 'AUDIT' && (
                    <small className="text-muted d-block mt-1.5 fs-8 leading-normal">
                      <Info size={12} className="inline me-1" /> Hệ thống sẽ tự động cập nhật tồn kho về số lượng này và tính chênh lệch so với tồn kho hiện tại ({selectedProduct.stockQuantity || 0} cái).
                    </small>
                  )}
                  {transactionType === 'EXPORT' && (
                    <small className="text-muted d-block mt-1.5 fs-8 leading-normal">
                      <Info size={12} className="inline me-1" /> Số lượng xuất tối đa: {selectedProduct.stockQuantity || 0} cái.
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1 fw-semibold">Lý do / Ghi chú</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Nhập lý do thực hiện nghiệp vụ kho này..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    disabled={modalSubmitting}
                  />
                </div>
              </div>

              <div className="card-footer bg-light py-3 border-top d-flex justify-content-end gap-2 px-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary py-2 px-3 fs-7"
                  onClick={() => setShowTransactionModal(false)}
                  disabled={modalSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary py-2 px-4 fs-7 d-flex align-items-center gap-1.5"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? (
                    <Loader2 size={16} className="spinner-border border-0" />
                  ) : (
                    'Xác nhận'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE PRODUCT LOG MODAL */}
      {showProductLogModal && selectedProduct && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="card w-100 mx-auto shadow" style={{ maxWidth: '700px', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <History className="text-primary" /> Nhật Ký Kho: {selectedProduct.name}
              </h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setShowProductLogModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="card-body p-4" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <div className="p-3 bg-light rounded border mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted fs-8 d-block">Tồn kho hiện tại</span>
                  <strong className="fs-3 text-dark">{selectedProduct.stockQuantity || 0}</strong> cái
                </div>
                <div className="text-end">
                  <span className="text-muted fs-8 d-block">Ngưỡng cảnh báo</span>
                  <strong className="fs-5 text-dark">{selectedProduct.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD}</strong> cái
                </div>
              </div>

              {productLogLoading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
                  <Loader2 className="spinner-border text-primary border-0" style={{ width: '28px', height: '28px' }} />
                  <span className="text-muted fs-8">Đang tải lịch sử thay đổi...</span>
                </div>
              ) : productLogs.length === 0 ? (
                <div className="text-center py-5 text-muted">Chưa có lịch sử thay đổi kho nào cho sản phẩm này.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Nghiệp vụ</th>
                        <th>Thay đổi</th>
                        <th>Tồn cũ</th>
                        <th>Tồn mới</th>
                        <th>Người thực hiện</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productLogs.map((log) => {
                        let typeBadge = 'bg-secondary';
                        let diffColor = 'text-dark';
                        let diffPrefix = '';

                        if (log.type === 'IMPORT') {
                          typeBadge = 'bg-success';
                          diffColor = 'text-success fw-bold';
                          diffPrefix = '+';
                        } else if (log.type === 'EXPORT') {
                          typeBadge = 'bg-danger';
                          diffColor = 'text-danger fw-bold';
                          diffPrefix = '';
                        } else if (log.type === 'ADJUST') {
                          typeBadge = 'bg-warning text-dark';
                          diffColor = log.quantityChanged >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                          diffPrefix = log.quantityChanged >= 0 ? '+' : '';
                        } else if (log.type === 'AUDIT') {
                          typeBadge = 'bg-info text-dark';
                          diffColor = log.quantityChanged >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                          diffPrefix = log.quantityChanged >= 0 ? '+' : '';
                        }

                        return (
                          <tr key={log.id} style={{ fontSize: '0.8rem' }}>
                            <td className="text-muted">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                            <td>
                              <span className={`badge ${typeBadge}`} style={{ fontSize: '0.7rem' }}>
                                {getVietnameseType(log.type)}
                              </span>
                            </td>
                            <td className={diffColor}>
                              {diffPrefix}{log.quantityChanged}
                            </td>
                            <td>{log.previousStock}</td>
                            <td><strong>{log.newStock}</strong></td>
                            <td className="text-muted">{log.createdBy}</td>
                            <td className="text-secondary" style={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '150px' }}>
                              {log.note}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card-footer bg-light py-3 border-top d-flex justify-content-end px-4">
              <button type="button" className="btn btn-secondary py-2 px-3 fs-7" onClick={() => setShowProductLogModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManageInventory;

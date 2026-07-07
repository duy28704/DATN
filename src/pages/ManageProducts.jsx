import { useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import { Loader2, Plus, Edit, Trash2, ShieldAlert, Search, X, FileSpreadsheet, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import ReactPaginate from 'react-paginate';
import { formatDisplayPrice, DEFAULT_LOW_STOCK_THRESHOLD } from '../context/ProductContext';

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

// Hàm chuyển đổi và gộp các thông số kỹ thuật chi tiết của sản phẩm.
// Đọc các cột thông số cấu hình riêng lẻ từ cơ sở dữ liệu (như CPU, GPU, RAM,...) rồi chuyển đổi chúng 
// thành các cặp khóa-giá trị tiếng Việt trực quan, gộp chung với các thuộc tính tùy biến từ specsJson.
const buildSpecs = (item) => {
  if (!item) return {}
  let specs = {}
  try {
    if (item.specsJson) {
      specs = JSON.parse(item.specsJson)
    }
  } catch (e) {
    console.error("Lỗi khi phân tích cú pháp specsJson:", e)
  }

  const fieldMapping = {
    cpuTechnology: 'Công nghệ CPU',
    cpuCores: 'Số nhân CPU',
    cpuThreads: 'Số luồng CPU',
    cpuSpeed: 'Tốc độ CPU',
    npu: 'Bộ xử lý NPU',
    cpuAiPerformanceTops: 'Hiệu năng AI CPU (TOPS)',
    gpuCard: 'Card đồ họa (GPU)',
    gpuCores: 'Số nhân GPU',
    gpuTgp: 'TGP GPU',
    gpuAiPerformanceTops: 'Hiệu năng AI GPU (TOPS)',
    ram: 'Dung lượng RAM',
    ramType: 'Loại RAM',
    ramBusSpeed: 'Tốc độ Bus RAM',
    maxRam: 'Hỗ trợ RAM tối đa',
    storage: 'Ổ cứng (Storage)',
    screenSize: 'Kích thước màn hình',
    screenResolution: 'Độ phân giải màn hình',
    panel: 'Tấm nền màn hình',
    refreshRate: 'Tần số quét',
    colorGamut: 'Độ bao phủ màu',
    touchScreen: 'Màn hình cảm ứng',
    displayTechnology: 'Công nghệ màn hình',
    ports: 'Cổng kết nối',
    wireless: 'Kết nối không dây',
    webcam: 'Webcam',
    keyboardBacklight: 'Đèn bàn phím',
    security: 'Bảo mật',
    audioTechnology: 'Công nghệ âm thanh',
    cooling: 'Hệ thống tản nhiệt',
    otherFeatures: 'Tính năng khác',
    battery: 'Dung lượng Pin',
    operatingSystem: 'Hệ điều hành',
    releaseTime: 'Thời điểm ra mắt',
    dimensionsWeight: 'Kích thước & Trọng lượng',
    material: 'Chất liệu chế tạo',
    memoryCardReader: 'Khe cắm thẻ nhớ'
  }

  for (const [field, label] of Object.entries(fieldMapping)) {
    if (item[field] !== undefined && item[field] !== null && String(item[field]).trim() !== '') {
      let value = item[field];
      if (field === 'ramBusSpeed' && !String(value).includes('MHz')) {
        value = `${value} MHz`;
      } else if (field === 'gpuTgp' && !String(value).includes('W')) {
        value = `${value} W`;
      } else if (field === 'screenSize' && !String(value).includes('inch')) {
        value = `${value} inch`;
      } else if (field === 'refreshRate' && !String(value).includes('Hz')) {
        value = `${value} Hz`;
      }
      specs[label] = String(value);
    }
  }

  return specs;
}

function ManageProducts() {
  const { showToast, showConfirm } = useToast();
  const { user } = useContext(AuthContext);
  const userPermissions = user?.permissions || [];
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [importing, setImporting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalMode, setProductModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAndShowDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await apiService.products.getById(id);
      setDetailProduct(data);
      setActiveImageIndex(0);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể lấy thông tin chi tiết sản phẩm.'
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // Pagination State
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  // Filter States
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [tempImagesList, setTempImagesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    brand: 'NEXUS',
    category: 'computing',
    images: '',
    tag: 'New',
    description: '',
    shortDescription: '',
    link: '',
    cpuTechnology: '',
    cpuCores: '',
    cpuThreads: '',
    cpuSpeed: '',
    npu: '',
    cpuAiPerformanceTops: '',
    gpuCard: '',
    gpuCores: '',
    gpuTgp: '',
    gpuAiPerformanceTops: '',
    ram: '',
    ramType: '',
    ramBusSpeed: '',
    maxRam: '',
    storage: '',
    screenSize: '',
    screenResolution: '',
    panel: '',
    refreshRate: '',
    colorGamut: '',
    touchScreen: '',
    displayTechnology: '',
    ports: '',
    wireless: '',
    webcam: '',
    keyboardBacklight: '',
    security: '',
    audioTechnology: '',
    cooling: '',
    otherFeatures: '',
    memoryCardReader: '',
    battery: '',
    operatingSystem: '',
    releaseTime: '',
    dimensionsWeight: '',
    material: '',
    stockQuantity: 0,
    lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD
  });
  const [productFormErrors, setProductFormErrors] = useState({});

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const data = await apiService.products.getAll();
      setProducts(data);
      setSelectedIds([]); // Clear selection when data reloads
    } catch (err) {
      setProductsError(err.message || 'Lỗi khi lấy danh sách sản phẩm.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPageNum(1);
    setSelectedIds([]); // Clear selection when filters change
  }, [productSearch, filterBrand, filterCategory, filterPrice, sortBy]);

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
      images: '',
      tag: 'New',
      description: '',
      shortDescription: '',
      link: '',
      cpuTechnology: '',
      cpuCores: '',
      cpuThreads: '',
      cpuSpeed: '',
      npu: '',
      cpuAiPerformanceTops: '',
      gpuCard: '',
      gpuCores: '',
      gpuTgp: '',
      gpuAiPerformanceTops: '',
      ram: '',
      ramType: '',
      ramBusSpeed: '',
      maxRam: '',
      storage: '',
      screenSize: '',
      screenResolution: '',
      panel: '',
      refreshRate: '',
      colorGamut: '',
      touchScreen: '',
      displayTechnology: '',
      ports: '',
      wireless: '',
      webcam: '',
      keyboardBacklight: '',
      security: '',
      audioTechnology: '',
      cooling: '',
      otherFeatures: '',
      memoryCardReader: '',
      battery: '',
      operatingSystem: '',
      releaseTime: '',
      dimensionsWeight: '',
      material: '',
      stockQuantity: 50,
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD
    });
    setProductFormErrors({});
    setProductModalMode('add');
    setTempImagesList([]);
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setSelectedProduct(prod);
    setProductFormData({
      name: prod.name || '',
      price: prod.price ? String(prod.price) : '',
      brand: prod.brand || 'NEXUS',
      category: prod.category || 'computing',
      images: prod.images || '',
      tag: prod.tag || 'New',
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      link: prod.link || '',
      cpuTechnology: prod.cpuTechnology || '',
      cpuCores: prod.cpuCores || '',
      cpuThreads: prod.cpuThreads || '',
      cpuSpeed: prod.cpuSpeed || '',
      npu: prod.npu || '',
      cpuAiPerformanceTops: prod.cpuAiPerformanceTops || '',
      gpuCard: prod.gpuCard || '',
      gpuCores: prod.gpuCores || '',
      gpuTgp: prod.gpuTgp || '',
      gpuAiPerformanceTops: prod.gpuAiPerformanceTops || '',
      ram: prod.ram || '',
      ramType: prod.ramType || '',
      ramBusSpeed: prod.ramBusSpeed || '',
      maxRam: prod.maxRam || '',
      storage: prod.storage || '',
      screenSize: prod.screenSize || '',
      screenResolution: prod.screenResolution || '',
      panel: prod.panel || '',
      refreshRate: prod.refreshRate || '',
      colorGamut: prod.colorGamut || '',
      touchScreen: prod.touchScreen || '',
      displayTechnology: prod.displayTechnology || '',
      ports: prod.ports || '',
      wireless: prod.wireless || '',
      webcam: prod.webcam || '',
      keyboardBacklight: prod.keyboardBacklight || '',
      security: prod.security || '',
      audioTechnology: prod.audioTechnology || '',
      cooling: prod.cooling || '',
      otherFeatures: prod.otherFeatures || '',
      memoryCardReader: prod.memoryCardReader || '',
      battery: prod.battery || '',
      operatingSystem: prod.operatingSystem || '',
      releaseTime: prod.releaseTime || '',
      dimensionsWeight: prod.dimensionsWeight || '',
      material: prod.material || '',
      stockQuantity: prod.stockQuantity != null ? prod.stockQuantity : 50,
      lowStockThreshold: prod.lowStockThreshold != null ? prod.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD,
      specsJson: prod.specsJson || '{}',
      reviewsJson: prod.reviewsJson || '[]',
      rating: prod.rating || 5.0,
      reviewCount: prod.reviewCount || 0
    });
    setProductFormErrors({});
    setProductModalMode('edit');
    const existing = prod.images
      ? prod.images.split(/[\s,]+/).map(url => url.trim()).filter(url => url && url !== '/assets/nexus-keyboard.png').map(url => ({ type: 'url', value: url }))
      : [];
    setTempImagesList(existing);
    setShowProductModal(true);
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems = Array.from(files).map(file => ({
      type: 'file',
      value: file,
      previewUrl: URL.createObjectURL(file)
    }));

    setTempImagesList(prev => [...prev, ...newItems]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setTempImagesList(prev => {
      const item = prev[indexToRemove];
      if (item && item.type === 'file' && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductFormErrors({});

    const errs = {};
    if (!productFormData.name.trim()) errs.name = 'Tên sản phẩm không được trống';
    if (!productFormData.price.trim()) errs.price = 'Giá không được trống';
    if (tempImagesList.length === 0) errs.images = 'Vui lòng chọn hoặc tải lên ít nhất một hình ảnh sản phẩm';

    if (Object.keys(errs).length > 0) {
      setProductFormErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      const finalUrls = [];
      for (const item of tempImagesList) {
        if (item.type === 'file') {
          const uploadedUrl = await apiService.products.uploadImage(item.value);
          finalUrls.push(uploadedUrl);
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        } else {
          finalUrls.push(item.value);
        }
      }

      const imagesString = finalUrls.join(',');
      const linkStr = productFormData.link || productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const payload = {
        ...productFormData,
        images: imagesString,
        link: linkStr,
        specsJson: productFormData.specsJson || '{}',
        reviewsJson: productFormData.reviewsJson || '[]'
      };

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
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = await showConfirm({
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

  const handleBulkDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa hàng loạt',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Các sản phẩm này sẽ được chuyển vào Thùng rác.`
    });
    if (!confirmed) return;
    try {
      await apiService.products.delete(selectedIds, false); // soft delete bulk
      showToast({ type: 'success', title: 'Xóa thành công', message: `Đã chuyển ${selectedIds.length} sản phẩm vào Thùng rác.` });
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      showToast({ type: 'error', title: 'Xóa thất bại', message: err.message || 'Lỗi khi xóa hàng loạt sản phẩm.' });
    }
  };

  const filteredProducts = products.filter(p => {
    // 1. Text Search Filter
    const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase());

    // 2. Brand Filter
    const matchesBrand = filterBrand === 'All' || p.brand === filterBrand;

    // 3. Category Filter
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;

    // 4. Price Filter
    const priceVal = parseFloat(p.price) || 0;
    let matchesPrice = true;
    if (filterPrice === 'under500') matchesPrice = priceVal < 500;
    else if (filterPrice === '500to1000') matchesPrice = priceVal >= 500 && priceVal <= 1000;
    else if (filterPrice === '1000to1500') matchesPrice = priceVal >= 1000 && priceVal <= 1500;
    else if (filterPrice === 'over1500') matchesPrice = priceVal > 1500;

    return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sortBy === 'priceDesc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPageNum * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Trích xuất danh sách hãng độc nhất từ sản phẩm trong database phục vụ bộ lọc
  const brands = [...new Set(products.map(p => p.brand))].filter(Boolean);

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
          {userPermissions.includes('product.import') && (
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
          )}

          {selectedIds.length > 0 && userPermissions.includes('product.delete') && (
            <button
              className="btn btn-danger d-flex align-items-center gap-1 py-2 px-3 animate-fade-in"
              onClick={handleBulkDelete}
            >
              <Trash2 size={16} /> Xóa đã chọn ({selectedIds.length})
            </button>
          )}

          {userPermissions.includes('product.create') && (
            <button className="btn btn-primary d-flex align-items-center gap-1 py-2 px-3" onClick={openAddProduct}>
              <Plus size={16} /> Thêm sản phẩm
            </button>
          )}
        </div>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body pt-3">
            <div className="d-flex gap-2 flex-wrap mb-4 align-items-center">
              {/* Search Box */}
              <div className="position-relative flex-grow-1" style={{ minWidth: '240px', maxWidth: '360px' }}>
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên, hãng, loại..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="form-control ps-5"
                  style={{ borderRadius: '8px' }}
                />
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

              {/* Category Filter */}
              <div style={{ minWidth: '130px' }}>
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="All">Tất cả danh mục</option>
                  <option value="computing">Máy tính (Computing)</option>
                  <option value="wearables">Đồ đeo (Wearables)</option>
                  <option value="audio">Âm thanh (Audio)</option>
                  <option value="input">Phụ kiện nhập (Input)</option>
                </select>
              </div>

              {/* Price Filter */}
              <div style={{ minWidth: '130px' }}>
                <select
                  className="form-select"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="All">Tất cả mức giá</option>
                  <option value="under500">Dưới $500</option>
                  <option value="500to1000">$500 - $1000</option>
                  <option value="1000to1500">$1000 - $1500</option>
                  <option value="over1500">Trên $1500</option>
                </select>
              </div>

              {/* Sorting */}
              <div style={{ minWidth: '130px' }}>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="none">Sắp xếp</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>

              {/* Reset Filters Link */}
              {(productSearch || filterBrand !== 'All' || filterCategory !== 'All' || filterPrice !== 'All' || sortBy !== 'none') && (
                <button
                  className="btn btn-link btn-sm text-decoration-none text-muted"
                  onClick={() => {
                    setProductSearch('');
                    setFilterBrand('All');
                    setFilterCategory('All');
                    setFilterPrice('All');
                    setSortBy('none');
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
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
                      {userPermissions.includes('product.delete') && (
                        <th scope="col" style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={currentProducts.length > 0 && currentProducts.every(p => selectedIds.includes(p.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const pageIds = currentProducts.map(p => p.id);
                                setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
                              } else {
                                const pageIds = currentProducts.map(p => p.id);
                                setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                              }
                            }}
                          />
                        </th>
                      )}
                      <th scope="col">ID</th>
                      <th scope="col">Ảnh</th>
                      <th scope="col">Tên sản phẩm</th>
                      <th scope="col">Hãng</th>
                      <th scope="col">Danh mục</th>
                      <th scope="col">Giá bán</th>
                      <th scope="col">Tồn kho</th>
                      <th scope="col">Đánh giá</th>
                      <th scope="col">Nhãn</th>
                      <th scope="col" className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td colSpan={userPermissions.includes('product.delete') ? 11 : 10} className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào.</td>
                      </tr>
                    ) : (
                      currentProducts.map((p) => (
                        <tr key={p.id} className={selectedIds.includes(p.id) ? 'table-active' : ''}>
                          {userPermissions.includes('product.delete') && (
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedIds.includes(p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds(prev => [...prev, p.id]);
                                  } else {
                                    setSelectedIds(prev => prev.filter(id => id !== p.id));
                                  }
                                }}
                              />
                            </td>
                          )}
                          <th scope="row">{p.id}</th>
                          <td>
                            <div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                              <img
                                src={p.images ? p.images.split(/[\s,]+/)[0].trim() : '/assets/nexus-keyboard.png'}
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
                          <td><strong className="text-danger">{formatDisplayPrice(p.price, p.displayPrice)}</strong></td>
                          <td>
                            <div className="d-flex flex-column fs-7">
                              <span><strong>{p.stockQuantity != null ? p.stockQuantity : 0}</strong> cái</span>
                              {p.stockQuantity === 0 ? (
                                <span className="badge bg-danger" style={{ fontSize: '0.65rem', padding: '2px 4px', width: 'fit-content' }}>Hết hàng</span>
                              ) : p.stockQuantity <= (p.lowStockThreshold != null ? p.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD) ? (
                                <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem', padding: '2px 4px', width: 'fit-content' }}>Sắp hết</span>
                              ) : (
                                <span className="badge bg-success" style={{ fontSize: '0.65rem', padding: '2px 4px', width: 'fit-content' }}>Còn hàng</span>
                              )}
                            </div>
                          </td>
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
                              <button className="btn btn-sm btn-outline-info p-2" onClick={() => fetchAndShowDetail(p.id)} disabled={detailLoading} title="Xem chi tiết">
                                <Eye size={14} />
                              </button>
                              {userPermissions.includes('product.update') && (
                                <button className="btn btn-sm btn-outline-primary p-2" onClick={() => openEditProduct(p)}>
                                  <Edit size={14} />
                                </button>
                              )}
                              {userPermissions.includes('product.delete') && (
                                <button className="btn btn-sm btn-outline-danger p-2" onClick={() => deleteProduct(p.id)}>
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-between align-items-center mt-3 px-3">
                <div className="text-muted fs-7">
                  Hiển thị <strong>{indexOfFirstProduct + 1}</strong> đến <strong>{Math.min(indexOfLastProduct, sortedProducts.length)}</strong> trong tổng số <strong>{sortedProducts.length}</strong> sản phẩm
                </div>
                <ReactPaginateComponent
                  previousLabel="Trước"
                  nextLabel="Sau"
                  pageCount={totalPages}
                  onPageChange={({ selected }) => {
                    setCurrentPageNum(selected + 1);
                    setSelectedIds([]);
                  }}
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
          </div>
        </div>
      </section>

      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      {showProductModal && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto', padding: '40px 10px' }}>
          <div className="card w-100 mx-auto shadow" style={{ maxWidth: '800px', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">{productModalMode === 'add' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}</h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setShowProductModal(false)} disabled={submitting}><X size={20} /></button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="card-body p-4">
                {productFormErrors.global && (
                  <div className="alert alert-danger py-2 px-3 fs-7 mb-3 d-flex align-items-center gap-2 border-0 bg-danger bg-opacity-10 text-danger">
                    <ShieldAlert size={16} />
                    <span>{productFormErrors.global}</span>
                  </div>
                )}

                {/* SECTION 1: THÔNG TIN CHUNG */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">1. Thông tin chung</h6>
                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1 fw-semibold">Tên sản phẩm *</label>
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
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Giá bán ($) *</label>
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
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Hãng sản xuất</label>
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
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Số lượng tồn kho *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productFormData.stockQuantity}
                      onChange={(e) => setProductFormData({ ...productFormData, stockQuantity: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Ngưỡng cảnh báo tồn *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productFormData.lowStockThreshold}
                      onChange={(e) => setProductFormData({ ...productFormData, lowStockThreshold: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Danh mục</label>
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
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Nhãn hiển thị (Tag)</label>
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

                <div className="row g-3 mb-3">
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Hình ảnh sản phẩm (chọn từ máy tính) *</label>

                    <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
                      {tempImagesList.map((item, idx) => (
                        <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '80px', background: '#0e0e11', borderColor: 'var(--border-color)' }}>
                          <img
                            src={item.type === 'file' ? item.previewUrl : item.value}
                            alt={`Product preview ${idx}`}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle d-flex align-items-center justify-content-center m-1 shadow-sm"
                            style={{ width: '18px', height: '18px', fontSize: '10px', padding: 0 }}
                            title="Xóa hình ảnh này"
                            disabled={submitting}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      <label
                        className={`border rounded d-flex flex-column align-items-center justify-content-center m-0 hover-opacity ${submitting ? 'disabled' : ''}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'var(--border-color)',
                          borderStyle: 'dashed',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.borderColor = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(255,0,60,0.02)'; } }}
                        onMouseLeave={(e) => { if (!submitting) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
                      >
                        <Plus size={20} className="text-muted" />
                        <span className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>Thêm ảnh</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="d-none"
                          disabled={submitting}
                        />
                      </label>
                    </div>
                    {productFormErrors.images && <span className="text-danger fs-8 d-block mt-1">{productFormErrors.images}</span>}
                    <small className="text-muted fs-8">Hỗ trợ chọn nhiều hình ảnh từ máy tính (tải lên Cloudinary khi lưu sản phẩm).</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1 fw-semibold">Đường dẫn tĩnh (Link - tự động tạo nếu bỏ trống)</label>
                    <input
                      type="text"
                      value={productFormData.link}
                      onChange={(e) => setProductFormData({ ...productFormData, link: e.target.value })}
                      className="form-control"
                      placeholder="laptop-asus-rog-strix"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fs-7 mb-1 fw-semibold">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={productFormData.shortDescription}
                    onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
                    className="form-control"
                    placeholder="Mô tả tóm tắt tính năng nổi bật"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted fs-7 mb-1 fw-semibold">Mô tả chi tiết</label>
                  <textarea
                    rows="3"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="form-control"
                    placeholder="Giới thiệu đầy đủ chi tiết sản phẩm"
                  ></textarea>
                </div>

                {/* SECTION 2: BỘ VI XỬ LÝ (CPU) */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">2. Bộ vi xử lý (CPU)</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Công nghệ CPU</label>
                    <input
                      type="text"
                      value={productFormData.cpuTechnology}
                      onChange={(e) => setProductFormData({ ...productFormData, cpuTechnology: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Intel Core Ultra 7 155H"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Tốc độ CPU</label>
                    <input
                      type="text"
                      value={productFormData.cpuSpeed}
                      onChange={(e) => setProductFormData({ ...productFormData, cpuSpeed: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 1.40 GHz (Max 4.8 GHz)"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted fs-7 mb-1">Số nhân</label>
                    <input
                      type="text"
                      value={productFormData.cpuCores}
                      onChange={(e) => setProductFormData({ ...productFormData, cpuCores: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 16 nhân"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted fs-7 mb-1">Số luồng</label>
                    <input
                      type="text"
                      value={productFormData.cpuThreads}
                      onChange={(e) => setProductFormData({ ...productFormData, cpuThreads: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 22 luồng"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted fs-7 mb-1">Bộ xử lý NPU (AI)</label>
                    <input
                      type="text"
                      value={productFormData.npu}
                      onChange={(e) => setProductFormData({ ...productFormData, npu: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Intel AI Boost"
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1">Hiệu năng AI CPU (TOPS)</label>
                    <input
                      type="text"
                      value={productFormData.cpuAiPerformanceTops}
                      onChange={(e) => setProductFormData({ ...productFormData, cpuAiPerformanceTops: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 11 TOPS"
                    />
                  </div>
                </div>

                {/* SECTION 3: ĐỒ HỌA (GPU) */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">3. Đồ họa (GPU)</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Card đồ họa (GPU)</label>
                    <input
                      type="text"
                      value={productFormData.gpuCard}
                      onChange={(e) => setProductFormData({ ...productFormData, gpuCard: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: NVIDIA GeForce RTX 4060"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Số nhân GPU</label>
                    <input
                      type="text"
                      value={productFormData.gpuCores}
                      onChange={(e) => setProductFormData({ ...productFormData, gpuCores: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 3072 CUDA Cores"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">TGP GPU (W)</label>
                    <input
                      type="text"
                      value={productFormData.gpuTgp}
                      onChange={(e) => setProductFormData({ ...productFormData, gpuTgp: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 115 W"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Hiệu năng AI GPU (TOPS)</label>
                    <input
                      type="text"
                      value={productFormData.gpuAiPerformanceTops}
                      onChange={(e) => setProductFormData({ ...productFormData, gpuAiPerformanceTops: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 233 TOPS"
                    />
                  </div>
                </div>

                {/* SECTION 4: BỘ NHỚ RAM & LƯU TRỮ */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">4. Bộ nhớ RAM & Lưu trữ</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Dung lượng RAM</label>
                    <input
                      type="text"
                      value={productFormData.ram}
                      onChange={(e) => setProductFormData({ ...productFormData, ram: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 16 GB"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Loại RAM</label>
                    <input
                      type="text"
                      value={productFormData.ramType}
                      onChange={(e) => setProductFormData({ ...productFormData, ramType: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: LPDDR5X"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Tốc độ Bus RAM (MHz)</label>
                    <input
                      type="text"
                      value={productFormData.ramBusSpeed}
                      onChange={(e) => setProductFormData({ ...productFormData, ramBusSpeed: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 7467 MHz"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Hỗ trợ RAM tối đa</label>
                    <input
                      type="text"
                      value={productFormData.maxRam}
                      onChange={(e) => setProductFormData({ ...productFormData, maxRam: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 16 GB (Onboard)"
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1">Ổ cứng (Storage)</label>
                    <input
                      type="text"
                      value={productFormData.storage}
                      onChange={(e) => setProductFormData({ ...productFormData, storage: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 512 GB SSD NVMe PCIe Gen 4"
                    />
                  </div>
                </div>

                {/* SECTION 5: MÀN HÌNH */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">5. Màn hình</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Kích thước màn hình</label>
                    <input
                      type="text"
                      value={productFormData.screenSize}
                      onChange={(e) => setProductFormData({ ...productFormData, screenSize: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 14 inch"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Độ phân giải</label>
                    <input
                      type="text"
                      value={productFormData.screenResolution}
                      onChange={(e) => setProductFormData({ ...productFormData, screenResolution: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 3K (2880 x 1800)"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Tấm nền</label>
                    <input
                      type="text"
                      value={productFormData.panel}
                      onChange={(e) => setProductFormData({ ...productFormData, panel: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: OLED"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Tần số quét (Hz)</label>
                    <input
                      type="text"
                      value={productFormData.refreshRate}
                      onChange={(e) => setProductFormData({ ...productFormData, refreshRate: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 120 Hz"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Độ phủ màu (Color Gamut)</label>
                    <input
                      type="text"
                      value={productFormData.colorGamut}
                      onChange={(e) => setProductFormData({ ...productFormData, colorGamut: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 100% DCI-P3"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Màn hình cảm ứng</label>
                    <input
                      type="text"
                      value={productFormData.touchScreen}
                      onChange={(e) => setProductFormData({ ...productFormData, touchScreen: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Có / Không"
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1">Công nghệ màn hình</label>
                    <textarea
                      rows="2"
                      value={productFormData.displayTechnology}
                      onChange={(e) => setProductFormData({ ...productFormData, displayTechnology: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: HDR True Black 500, Glossy display, SGS Eye Care..."
                    ></textarea>
                  </div>
                </div>

                {/* SECTION 6: CỔNG KẾT NỐI & TIỆN ÍCH */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">6. Cổng kết nối & Tiện ích</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Kết nối không dây</label>
                    <input
                      type="text"
                      value={productFormData.wireless}
                      onChange={(e) => setProductFormData({ ...productFormData, wireless: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Wi-Fi 6E, Bluetooth 5.3"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Webcam</label>
                    <input
                      type="text"
                      value={productFormData.webcam}
                      onChange={(e) => setProductFormData({ ...productFormData, webcam: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: FHD IR Camera hỗ trợ Windows Hello"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Đèn bàn phím</label>
                    <input
                      type="text"
                      value={productFormData.keyboardBacklight}
                      onChange={(e) => setProductFormData({ ...productFormData, keyboardBacklight: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Đơn sắc trắng / RGB 1 vùng"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Khe đọc thẻ nhớ</label>
                    <input
                      type="text"
                      value={productFormData.memoryCardReader}
                      onChange={(e) => setProductFormData({ ...productFormData, memoryCardReader: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: MicroSD card reader"
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1">Cổng giao tiếp (Ports)</label>
                    <textarea
                      rows="2"
                      value={productFormData.ports}
                      onChange={(e) => setProductFormData({ ...productFormData, ports: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 1x Thunderbolt 4, 1x USB 3.2, 1x HDMI 2.1, 1x Jack 3.5mm..."
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Bảo mật</label>
                    <input
                      type="text"
                      value={productFormData.security}
                      onChange={(e) => setProductFormData({ ...productFormData, security: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Chip TPM 2.0, Bảo mật vân tay"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Hệ thống tản nhiệt</label>
                    <input
                      type="text"
                      value={productFormData.cooling}
                      onChange={(e) => setProductFormData({ ...productFormData, cooling: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Quạt kép IceBlade, 2 ống dẫn nhiệt"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Công nghệ âm thanh</label>
                    <input
                      type="text"
                      value={productFormData.audioTechnology}
                      onChange={(e) => setProductFormData({ ...productFormData, audioTechnology: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Harman Kardon, Dolby Atmos"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Tính năng khác</label>
                    <input
                      type="text"
                      value={productFormData.otherFeatures}
                      onChange={(e) => setProductFormData({ ...productFormData, otherFeatures: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Đạt chuẩn độ bền quân đội MIL-STD 810H"
                    />
                  </div>
                </div>

                {/* SECTION 7: PIN & HỆ ĐIỀU HÀNH */}
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">7. Pin & Hệ điều hành</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Thông tin Pin</label>
                    <input
                      type="text"
                      value={productFormData.battery}
                      onChange={(e) => setProductFormData({ ...productFormData, battery: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 3-cell Li-ion, 75 Wh"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Hệ điều hành</label>
                    <input
                      type="text"
                      value={productFormData.operatingSystem}
                      onChange={(e) => setProductFormData({ ...productFormData, operatingSystem: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Windows 11 Home"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Thời điểm ra mắt</label>
                    <input
                      type="text"
                      value={productFormData.releaseTime}
                      onChange={(e) => setProductFormData({ ...productFormData, releaseTime: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 2024"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fs-7 mb-1">Kích thước & Trọng lượng</label>
                    <input
                      type="text"
                      value={productFormData.dimensionsWeight}
                      onChange={(e) => setProductFormData({ ...productFormData, dimensionsWeight: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: 31.2 x 22.0 x 1.49 cm - 1.2 kg"
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted fs-7 mb-1">Chất liệu vỏ</label>
                    <input
                      type="text"
                      value={productFormData.material}
                      onChange={(e) => setProductFormData({ ...productFormData, material: e.target.value })}
                      className="form-control"
                      placeholder="Ví dụ: Vỏ nhôm nguyên khối"
                    />
                  </div>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-end gap-2 bg-light py-3 border-top px-4">
                <button type="button" className="btn btn-outline-secondary px-3 py-2 fs-7" onClick={() => setShowProductModal(false)} disabled={submitting}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 fs-7" disabled={submitting}>
                  {submitting ? (
                    <span className="d-flex align-items-center gap-2">
                      <Loader2 className="spinner-border border-0 text-white" style={{ width: '16px', height: '16px', margin: 0 }} />
                      Đang lưu...
                    </span>
                  ) : (
                    'Lưu sản phẩm'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto', padding: '40px 10px' }}>
          <div className="card w-100 mx-auto shadow" style={{ maxWidth: '750px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', background: '#ffffff', color: '#212529' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-light border-bottom py-3" style={{ background: '#f8f9fa' }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <span className="badge bg-primary fs-7">{detailProduct.brand}</span>
                {detailProduct.name}
              </h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setDetailProduct(null)}><X size={20} /></button>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Images Section */}
                <div className="col-md-5">
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Hình ảnh sản phẩm</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded bg-light border d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                      <img
                        src={detailProduct.images ? detailProduct.images.split(/[\s,]+/)[activeImageIndex].trim() : '/assets/nexus-keyboard.png'}
                        alt={detailProduct.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    {/* Thumbnail list */}
                    {detailProduct.images && detailProduct.images.split(/[\s,]+/).filter(url => url.trim()).length > 1 && (
                      <div className="d-flex gap-2 overflow-x-auto pb-2">
                        {detailProduct.images.split(/[\s,]+/).map(url => url.trim()).filter(Boolean).map((imgUrl, idx) => (
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
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Thông tin cơ bản</h6>
                  <table className="table table-sm table-striped table-bordered fs-7 mb-4 text-dark">
                    <tbody>
                      <tr>
                        <td className="text-secondary fw-semibold w-30">ID sản phẩm</td>
                        <td className="text-dark">{detailProduct.id}</td>
                      </tr>
                      <tr>
                        <td className="text-secondary fw-semibold">Danh mục</td>
                        <td className="text-dark">{detailProduct.category}</td>
                      </tr>
                      <tr>
                        <td className="text-secondary fw-semibold">Giá bán lẻ</td>
                        <td className="text-danger fw-bold">
                          {formatDisplayPrice(detailProduct.price, detailProduct.displayPrice)}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-secondary fw-semibold">Đánh giá</td>
                        <td className="text-dark">★ {detailProduct.rating || '5.0'} ({detailProduct.reviewCount || 0} lượt đánh giá)</td>
                      </tr>
                      <tr>
                        <td className="text-secondary fw-semibold">Mô tả ngắn</td>
                        <td className="text-dark">{detailProduct.shortDescription || '—'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Thông số kỹ thuật chi tiết</h6>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {(() => {
                      // Sử dụng hàm buildSpecs để tự động gộp tất cả các thông số kỹ thuật chi tiết
                      // (bao gồm cả các cột cơ sở dữ liệu riêng lẻ và thông số tùy biến từ specsJson).
                      const specs = buildSpecs(detailProduct);
                      const specsEntries = Object.entries(specs);

                      if (specsEntries.length === 0) {
                        return detailProduct.description ? (
                          <div className="p-3 rounded bg-light border text-dark fs-7" style={{ whiteSpace: 'pre-wrap' }}>
                            {detailProduct.description}
                          </div>
                        ) : (
                          <div className="text-muted fs-7">Chưa cập nhật thông số kỹ thuật.</div>
                        );
                      }

                      return (
                        <table className="table table-sm table-striped table-bordered table-hover fs-7 mb-0 text-dark">
                          <tbody>
                            {specsEntries.map(([key, value], idx) => (
                              <tr key={idx}>
                                <td className="text-secondary fw-semibold w-40" style={{ fontSize: '0.78rem' }}>{key}</td>
                                <td style={{ fontSize: '0.78rem', color: '#212529' }}>{String(value)}</td>
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
            <div className="card-footer d-flex justify-content-end bg-light py-3 border-top px-4">
              <button type="button" className="btn btn-secondary px-4 py-2 fs-7" onClick={() => setDetailProduct(null)}>
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

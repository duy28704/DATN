import { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Search, AlertTriangle, TrendingUp, RefreshCw, Loader2, BarChart2 } from 'lucide-react';

function Dashboard() {
  const { products } = useContext(ProductContext);
  const { showToast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await apiService.search.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi khi lấy thống kê tìm kiếm:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSyncIndex = async () => {
    setSyncing(true);
    try {
      await apiService.search.syncIndex();
      showToast({
        type: 'success',
        title: 'Đồng bộ thành công',
        message: 'Đã hoàn thành đánh chỉ mục lại toàn bộ sản phẩm lên Elasticsearch.'
      });
      fetchStats();
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Đồng bộ thất bại',
        message: err.message || 'Lỗi xảy ra trong quá trình đồng bộ chỉ mục.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const totalProducts = products.length;
  
  // Calculate average price
  const avgPrice = totalProducts > 0 
    ? (products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0) / totalProducts).toFixed(2) 
    : '0.00';

  // Count by category
  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const computingCount = categoryCounts['computing'] || 0;
  const wearablesCount = categoryCounts['wearables'] || 0;
  const audioCount = categoryCounts['audio'] || 0;
  const inputCount = categoryCounts['input'] || 0;

  // Find most expensive product
  const mostExpensiveProduct = products.length > 0
    ? [...products].sort((a, b) => b.price - a.price)[0]
    : null;

  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Dashboard Overview</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
            <li className="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-8">
            <div className="row">
              <div className="col-xxl-4 col-md-6">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Sales <span>| Today</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-cart"></i>
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark">145</h6>
                        <span className="text-success small pt-1 fw-bold">12%</span> <span className="text-muted small pt-2 ps-1">increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xxl-4 col-md-6">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Revenue <span>| This Month</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-currency-dollar"></i>
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark">$3,264</h6>
                        <span className="text-success small pt-1 fw-bold">8%</span> <span className="text-muted small pt-2 ps-1">increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xxl-4 col-xl-12">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Customers <span>| This Year</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-people"></i>
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark">1,244</h6>
                        <span className="text-danger small pt-1 fw-bold">12%</span> <span className="text-muted small pt-2 ps-1">decrease</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Searches Card */}
              <div className="col-xxl-4 col-md-6 text-start">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Lượt Tìm Kiếm <span>| Tổng số</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary-light text-primary">
                        <Search size={22} />
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark">{stats?.totalSearches || 0}</h6>
                        <span className="text-muted small pt-2">truy vấn từ khách</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hot Keyword Card */}
              <div className="col-xxl-4 col-md-6 text-start">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Từ Khóa Hot <span>| Hàng đầu</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success-light text-success">
                        <TrendingUp size={22} />
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark text-truncate" style={{ maxWidth: '120px' }}>
                          {stats?.topKeywords && stats.topKeywords.length > 0 ? stats.topKeywords[0].keyword : 'N/A'}
                        </h6>
                        <span className="text-success small fw-bold">
                          {stats?.topKeywords && stats.topKeywords.length > 0 ? `${stats.topKeywords[0].count} lượt` : '0 lượt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zero Results Keyword Card */}
              <div className="col-xxl-4 col-md-6 text-start">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Không Tìm Thấy <span>| Từ khóa</span></h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-danger-light text-danger">
                        <AlertTriangle size={22} />
                      </div>
                      <div className="ps-3">
                        <h6 className="text-dark">
                          {stats?.zeroResultKeywords ? stats.zeroResultKeywords.length : 0}
                        </h6>
                        <span className="text-danger small fw-bold">từ khóa chưa đáp ứng</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card info-card">
                  <div className="card-body">
                    <h5 className="card-title">Thống kê sản phẩm <span>| Thời gian thực</span></h5>
                    <div className="row g-4 pt-2">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded border text-center">
                          <span className="text-muted fs-8 d-block mb-1">TỔNG SỐ SẢN PHẨM</span>
                          <strong className="fs-3 text-dark">{totalProducts}</strong>
                          <span className="d-block text-muted fs-9 mt-1">sản phẩm trong hệ thống</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded border text-center">
                          <span className="text-muted fs-8 d-block mb-1">GIÁ BÁN TRUNG BÌNH</span>
                          <strong className="fs-3 text-danger">{Number(avgPrice).toLocaleString('vi-VN')} ₫</strong>
                          <span className="d-block text-muted fs-9 mt-1">trên mỗi thiết bị</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded border text-center">
                          <span className="text-muted fs-8 d-block mb-1">THIẾT BỊ ĐẮT NHẤT</span>
                          <strong className="fs-6 text-dark d-block text-truncate" title={mostExpensiveProduct?.name || 'N/A'}>
                            {mostExpensiveProduct ? mostExpensiveProduct.name : 'N/A'}
                          </strong>
                          <span className="text-danger fw-bold fs-7">{mostExpensiveProduct ? (mostExpensiveProduct.displayPrice || `${Number(mostExpensiveProduct.price).toLocaleString('vi-VN')} ₫`) : '0'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="text-dark fw-bold mb-3 fs-7">Phân bố sản phẩm theo danh mục</h6>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1 fs-8 text-muted">
                          <span>Máy tính & Linh kiện</span>
                          <span>{computingCount} sản phẩm ({totalProducts > 0 ? Math.round((computingCount/totalProducts)*100) : 0}%)</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${totalProducts > 0 ? (computingCount/totalProducts)*100 : 0}%` }} aria-valuenow={computingCount} aria-valuemin="0" aria-valuemax={totalProducts}></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1 fs-8 text-muted">
                          <span>Thiết bị Đeo thông minh</span>
                          <span>{wearablesCount} sản phẩm ({totalProducts > 0 ? Math.round((wearablesCount/totalProducts)*100) : 0}%)</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${totalProducts > 0 ? (wearablesCount/totalProducts)*100 : 0}%` }} aria-valuenow={wearablesCount} aria-valuemin="0" aria-valuemax={totalProducts}></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1 fs-8 text-muted">
                          <span>Thiết bị Âm thanh</span>
                          <span>{audioCount} sản phẩm ({totalProducts > 0 ? Math.round((audioCount/totalProducts)*100) : 0}%)</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${totalProducts > 0 ? (audioCount/totalProducts)*100 : 0}%` }} aria-valuenow={audioCount} aria-valuemin="0" aria-valuemax={totalProducts}></div>
                        </div>
                      </div>

                      <div>
                        <div className="d-flex justify-content-between mb-1 fs-8 text-muted">
                          <span>Phụ kiện & Thiết bị nhập</span>
                          <span>{inputCount} sản phẩm ({totalProducts > 0 ? Math.round((inputCount/totalProducts)*100) : 0}%)</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-info" role="progressbar" style={{ width: `${totalProducts > 0 ? (inputCount/totalProducts)*100 : 0}%` }} aria-valuenow={inputCount} aria-valuemin="0" aria-valuemax={totalProducts}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card recent-sales overflow-auto">
                  <div className="card-body">
                    <h5 className="card-title">Recent Sales <span>| Today</span></h5>
                    <table className="table table-borderless datatable">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Customer</th>
                          <th scope="col">Product</th>
                          <th scope="col">Price</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row"><a href="#dashboard" className="text-primary">#2457</a></th>
                          <td>Brandon Jacob</td>
                          <td><a href="#dashboard" className="text-primary">At praesentium minu</a></td>
                          <td className="text-dark">$64</td>
                          <td><span className="badge bg-success">Approved</span></td>
                        </tr>
                        <tr>
                          <th scope="row"><a href="#dashboard" className="text-primary">#2147</a></th>
                          <td>Bridie Kessler</td>
                          <td><a href="#dashboard" className="text-primary">Blanditiis dolor omnis</a></td>
                          <td className="text-dark">$47</td>
                          <td><span className="badge bg-warning">Pending</span></td>
                        </tr>
                        <tr>
                          <th scope="row"><a href="#dashboard" className="text-primary">#2049</a></th>
                          <td>Ashleigh Langosh</td>
                          <td><a href="#dashboard" className="text-primary">At recusandae</a></td>
                          <td className="text-dark">$147</td>
                          <td><span className="badge bg-success">Approved</span></td>
                        </tr>
                        <tr>
                          <th scope="row"><a href="#dashboard" className="text-primary">#2644</a></th>
                          <td>Angus Grady</td>
                          <td><a href="#dashboard" className="text-primary">Ut voluptatem id</a></td>
                          <td className="text-dark">$67</td>
                          <td><span className="badge bg-danger">Rejected</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Recent Activity <span>| Today</span></h5>
                <div className="activity">
                  <div className="activity-item d-flex mb-3">
                    <div className="activite-label text-muted me-3" style={{ minWidth: '50px' }}>32 min</div>
                    <i className="bi bi-circle-fill activity-badge text-success align-self-start me-2 mt-1 fs-9"></i>
                    <div className="activity-content text-dark">
                      Quia quae rerum <a href="#dashboard" className="fw-bold text-dark">explicabo</a>
                    </div>
                  </div>
                  <div className="activity-item d-flex mb-3">
                    <div className="activite-label text-muted me-3" style={{ minWidth: '50px' }}>56 min</div>
                    <i className="bi bi-circle-fill activity-badge text-danger align-self-start me-2 mt-1 fs-9"></i>
                    <div className="activity-content text-dark">
                      Voluptatem tương tác bán hàng thành công
                    </div>
                  </div>
                  <div className="activity-item d-flex">
                    <div className="activite-label text-muted me-3" style={{ minWidth: '50px' }}>2 hrs</div>
                    <i className="bi bi-circle-fill activity-badge text-primary align-self-start me-2 mt-1 fs-9"></i>
                    <div className="activity-content text-dark">
                      Cập nhật kho hàng tự động từ Excel
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body pb-0">
                <h5 className="card-title">Website Traffic <span>| Today</span></h5>
                <div className="py-4 text-center text-muted fs-7">
                  60% Mobile  |  30% Desktop  |  10% Tablet
                </div>
            </div>
          </div>
        </div>

        {/* Detailed Search Analytics Section */}
          <div className="col-12 mt-4 text-start">
            <h4 className="fw-bold mb-3 fs-5 display-font text-white" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Chi tiết Phân tích Tìm kiếm (Elasticsearch)
            </h4>
          </div>

          <div className="col-lg-8 text-start">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center gap-2">
                  <BarChart2 size={18} className="text-primary" />
                  <span>Biểu Đồ Xu Hướng Tìm Kiếm Theo Ngày</span>
                </h5>
                {stats?.searchVolumeOverTime && stats.searchVolumeOverTime.length > 0 ? (
                  <div className="pt-3" style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                    {stats.searchVolumeOverTime.map((item, idx) => {
                      const count = Number(item.searchCount) || 0;
                      const maxSearchCount = Math.max(...stats.searchVolumeOverTime.map(i => Number(i.searchCount) || 0), 10);
                      const heightPct = (count / maxSearchCount) * 80 + 10;
                      const dateStr = item.searchDate ? new Date(item.searchDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }) : '';
                      return (
                        <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
                          <div className="w-100 d-flex align-items-end justify-content-center" style={{ height: '80%' }}>
                            <div 
                              className="bg-primary rounded-top cursor-pointer text-center text-white position-relative"
                              style={{ 
                                height: `${heightPct}%`, 
                                width: '32px',
                                background: 'linear-gradient(to top, var(--accent-red) 0%, #ff4d6d 100%)',
                                opacity: 0.95
                              }}
                              title={`${count} lượt tìm kiếm`}
                            >
                              <span className="position-absolute bottom-100 start-50 translate-middle-x fs-9 text-secondary fw-bold mb-1">{count}</span>
                            </div>
                          </div>
                          <span className="text-secondary mt-2 fs-9 font-monospace" style={{ fontSize: '0.65rem' }}>{dateStr}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center py-5 text-muted fs-8">
                    Chưa có đủ dữ liệu lịch sử tìm kiếm để vẽ xu hướng.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 text-start">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Hạ Tầng Tìm Kiếm</h5>
                <div className="p-3 bg-light rounded border d-flex flex-column gap-3 fs-8">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Bộ máy tìm kiếm:</span>
                    <span className="badge bg-success">Elasticsearch + DB Fallback</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Chỉ mục (Index):</span>
                    <span className="font-monospace text-dark text-decoration-underline fw-bold">laptops</span>
                  </div>
                  <button 
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-2 mt-2 w-100"
                    onClick={handleSyncIndex}
                    disabled={syncing}
                    style={{ height: '36px' }}
                  >
                    {syncing ? (
                      <Loader2 size={12} className="spinner-border border-0" style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    <span>Đồng bộ chỉ mục ES</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 text-start">
            <div className="card overflow-auto" style={{ maxHeight: '350px' }}>
              <div className="card-body">
                <h5 className="card-title">Top Từ Khóa Tìm Nhiều Nhất</h5>
                <table className="table table-borderless fs-8">
                  <thead>
                    <tr className="border-bottom">
                      <th scope="col" className="text-muted">Hạng</th>
                      <th scope="col" className="text-muted">Từ khóa</th>
                      <th scope="col" className="text-muted text-end">Lượt tìm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.topKeywords && stats.topKeywords.length > 0 ? (
                      stats.topKeywords.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="align-middle">
                          <td>
                            <span 
                              className={`badge rounded-circle d-inline-flex align-items-center justify-content-center`}
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                backgroundColor: idx === 0 ? 'var(--accent-red)' : idx === 1 ? '#ff4d6d' : idx === 2 ? '#ff758f' : '#6c757d',
                                color: 'white',
                                fontSize: '0.6rem'
                              }}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="fw-medium text-dark">{item.keyword}</td>
                          <td className="text-end fw-bold text-secondary">{item.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-3 text-muted">Chưa có từ khóa nào được lưu.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6 text-start">
            <div className="card overflow-auto" style={{ maxHeight: '350px' }}>
              <div className="card-body">
                <h5 className="card-title text-danger">Từ Khóa Không Có Kết Quả</h5>
                <table className="table table-borderless fs-8">
                  <thead>
                    <tr className="border-bottom">
                      <th scope="col" className="text-muted">STT</th>
                      <th scope="col" className="text-muted">Từ khóa</th>
                      <th scope="col" className="text-muted text-end">Lượt tìm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.zeroResultKeywords && stats.zeroResultKeywords.length > 0 ? (
                      stats.zeroResultKeywords.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="align-middle">
                          <td>
                            <span className="text-secondary">#{idx + 1}</span>
                          </td>
                          <td className="fw-medium text-dark d-flex align-items-center gap-2">
                            <AlertTriangle size={12} className="text-warning" />
                            <span>{item.keyword}</span>
                          </td>
                          <td className="text-end fw-bold text-danger">{item.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-3 text-muted">Tất cả lượt tìm kiếm đều có kết quả.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
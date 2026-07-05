import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Search, AlertTriangle, TrendingUp, RefreshCw, Loader2, BarChart2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

function SearchAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const { showToast } = useToast()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await apiService.search.getStats()
      setStats(data)
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Lỗi tải dữ liệu',
        message: 'Không thể tải thống kê phân tích tìm kiếm từ hệ thống.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleSyncIndex = async () => {
    setSyncing(true)
    try {
      await apiService.search.syncIndex()
      showToast({
        type: 'success',
        title: 'Đồng bộ thành công',
        message: 'Đã hoàn thành đánh chỉ mục lại toàn bộ sản phẩm lên Elasticsearch.'
      })
      fetchStats()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Đồng bộ thất bại',
        message: err.message || 'Lỗi xảy ra trong quá trình đồng bộ chỉ mục.'
      })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <main id="main" className="main">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3" style={{ minHeight: '400px' }}>
          <Loader2 size={36} className="spinner-border text-danger border-0" style={{ width: '36px', height: '36px' }} />
          <span className="text-secondary fs-7">Đang tải phân tích tìm kiếm...</span>
        </div>
      </main>
    )
  }

  // Helper to compute max count for SVG chart scaling
  const maxSearchCount = stats?.searchVolumeOverTime && stats.searchVolumeOverTime.length > 0
    ? Math.max(...stats.searchVolumeOverTime.map(item => Number(item.searchCount) || 0))
    : 10

  return (
    <main id="main" className="main">
      <div className="pagetitle d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Phân Tích Tìm Kiếm</h1>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
              <li className="breadcrumb-item active">Search Analytics</li>
            </ol>
          </nav>
        </div>
        
        <button 
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
          onClick={handleSyncIndex}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 size={14} className="spinner-border border-0" style={{ width: '14px', height: '14px' }} />
          ) : (
            <RefreshCw size={14} />
          )}
          <span>Đồng bộ Elasticsearch</span>
        </button>
      </div>

      <section className="section dashboard">
        <div className="row g-4">
          
          {/* Card: Total Searches */}
          <div className="col-xxl-3 col-md-6">
            <div className="card info-card sales-card text-start">
              <div className="card-body">
                <h5 className="card-title">Tổng Lượt Tìm Kiếm <span>| Hệ thống</span></h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary-light">
                    <Search className="text-primary" size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark">{stats?.totalSearches || 0}</h6>
                    <span className="text-muted small pt-2">lượt truy vấn từ khách hàng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Top Search Keyword */}
          <div className="col-xxl-3 col-md-6">
            <div className="card info-card revenue-card text-start">
              <div className="card-body">
                <h5 className="card-title">Từ Khóa Hot Nhất <span>| Hôm nay</span></h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success-light">
                    <TrendingUp className="text-success" size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark text-truncate" style={{ maxWidth: '180px' }}>
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

          {/* Card: Zero Result Rate */}
          <div className="col-xxl-3 col-md-6">
            <div className="card info-card customers-card text-start">
              <div className="card-body">
                <h5 className="card-title">Không Tìm Thấy <span>| Tỷ lệ</span></h5>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-danger-light">
                    <AlertTriangle className="text-danger" size={24} />
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

          {/* Chart: Search Volume Over Time */}
          <div className="col-12 col-lg-8 text-start">
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
                      const heightPct = maxSearchCount > 0 ? (count / maxSearchCount) * 80 + 10 : 10;
                      const dateStr = item.searchDate ? new Date(item.searchDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }) : '';
                      return (
                        <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
                          <div className="w-100 d-flex align-items-end justify-content-center" style={{ height: '80%' }}>
                            <div 
                              className="bg-primary rounded-top cursor-pointer text-center text-white position-relative hover-opacity"
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

          {/* Quick Info Box: Elasticsearch Status */}
          <div className="col-12 col-lg-4 text-start">
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
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Cơ chế sửa lỗi:</span>
                    <span className="text-dark">Fuzzy Match (AUTO / Levenshtein)</span>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    Chỉ mục tìm kiếm sẽ tự động đồng bộ hóa mỗi khi sản phẩm được thêm mới, cập nhật hoặc xóa vĩnh viễn. Nếu Elasticsearch bị gián đoạn, hệ thống tự động chạy trên chế độ dự phòng cơ sở dữ liệu.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table: Top Keywords */}
          <div className="col-12 col-md-6 text-start">
            <div className="card overflow-auto" style={{ maxHeight: '420px' }}>
              <div className="card-body">
                <h5 className="card-title">Top 10 Từ Khóa Tìm Nhiều Nhất</h5>
                <table className="table table-borderless">
                  <thead>
                    <tr className="border-bottom">
                      <th scope="col" className="text-muted fs-8">Hạng</th>
                      <th scope="col" className="text-muted fs-8">Từ khóa</th>
                      <th scope="col" className="text-muted fs-8 text-end">Số lượt tìm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.topKeywords && stats.topKeywords.length > 0 ? (
                      stats.topKeywords.map((item, idx) => (
                        <tr key={idx} className="align-middle">
                          <td>
                            <span 
                              className={`badge rounded-circle d-inline-flex align-items-center justify-content-center`}
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: idx === 0 ? 'var(--accent-red)' : idx === 1 ? '#ff4d6d' : idx === 2 ? '#ff758f' : '#6c757d',
                                color: 'white',
                                fontSize: '0.65rem'
                              }}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="fw-medium text-dark">{item.keyword}</td>
                          <td className="text-end fw-bold text-secondary display-font">{item.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted fs-8">Chưa có từ khóa nào được lưu.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Table: Zero Result Keywords */}
          <div className="col-12 col-md-6 text-start">
            <div className="card overflow-auto" style={{ maxHeight: '420px' }}>
              <div className="card-body">
                <h5 className="card-title text-danger">Từ Khóa Không Có Kết Quả</h5>
                <table className="table table-borderless">
                  <thead>
                    <tr className="border-bottom">
                      <th scope="col" className="text-muted fs-8">STT</th>
                      <th scope="col" className="text-muted fs-8">Từ khóa</th>
                      <th scope="col" className="text-muted fs-8 text-end">Số lượt tìm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.zeroResultKeywords && stats.zeroResultKeywords.length > 0 ? (
                      stats.zeroResultKeywords.map((item, idx) => (
                        <tr key={idx} className="align-middle">
                          <td>
                            <span className="text-secondary fs-8">#{idx + 1}</span>
                          </td>
                          <td className="fw-medium text-dark d-flex align-items-center gap-2">
                            <AlertTriangle size={12} className="text-warning" />
                            <span>{item.keyword}</span>
                          </td>
                          <td className="text-end fw-bold text-danger display-font">{item.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted fs-8">Tuyệt vời! Tất cả các lượt tìm kiếm đều trả về sản phẩm.</td>
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
  )
}

export default SearchAnalytics

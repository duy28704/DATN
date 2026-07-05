import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Chart from 'react-apexcharts'
import { useToast } from '../context/ToastContext'
import { DollarSign, ShoppingBag, Users, Laptop, Loader2 } from 'lucide-react'

function ManageStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // States for dynamic resolution toggling
  const [revenuePeriod, setRevenuePeriod] = useState('all')
  const [ordersPeriod, setOrdersPeriod] = useState('all')
  const [customersPeriod, setCustomersPeriod] = useState('all')
  const [productsPeriod, setProductsPeriod] = useState('all')

  const [revenueResolution, setRevenueResolution] = useState('day')
  const [ordersResolution, setOrdersResolution] = useState('day')
  const [visitsResolution, setVisitsResolution] = useState('day')

  const { showToast } = useToast()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const statsData = await apiService.orders.getDashboardStats('all')
      setData(statsData)
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Lỗi tải thống kê',
        message: err.message || 'Không thể lấy dữ liệu phân tích thống kê từ máy chủ.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <main id="main" className="main">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3" style={{ minHeight: '500px' }}>
          <Loader2 size={40} className="spinner-border text-danger border-0" style={{ width: '40px', height: '40px' }} />
          <span className="text-secondary fs-7">Đang tổng hợp báo cáo và vẽ biểu đồ ApexCharts...</span>
        </div>
      </main>
    )
  }

  // --- Helpers to aggregate Daily data into Yearly / Monthly client-side ---
  const getYearlyStats = () => {
    const yearlyMap = {}
    data?.monthlyMixedStats?.forEach(item => {
      if (item.month && item.month.length >= 4) {
        const year = item.month.substring(0, 4)
        if (!yearlyMap[year]) {
          yearlyMap[year] = { year, revenue: 0, orders: 0 }
        }
        yearlyMap[year].revenue += Number(item.revenue || 0)
        yearlyMap[year].orders += Number(item.orders || 0)
      }
    })
    return Object.values(yearlyMap).sort((a, b) => a.year.localeCompare(b.year))
  }

  const getMonthlyVisits = () => {
    const monthlyMap = {}
    data?.websiteVisitsOverTime?.forEach(item => {
      if (item.date && item.date.length >= 7) {
        const month = item.date.substring(0, 7) // "YYYY-MM"
        if (!monthlyMap[month]) {
          monthlyMap[month] = { month, visits: 0 }
        }
        monthlyMap[month].visits += Number(item.visits || 0)
      }
    })
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  const getYearlyVisits = () => {
    const yearlyMap = {}
    data?.websiteVisitsOverTime?.forEach(item => {
      if (item.date && item.date.length >= 4) {
        const year = item.date.substring(0, 4) // "YYYY"
        if (!yearlyMap[year]) {
          yearlyMap[year] = { year, visits: 0 }
        }
        yearlyMap[year].visits += Number(item.visits || 0)
      }
    })
    return Object.values(yearlyMap).sort((a, b) => a.year.localeCompare(b.year))
  }

  const yearlyStats = getYearlyStats()

  // --- Dynamic Configuration for Chart 1: Revenue ---
  const getRevenueChartConfig = () => {
    let seriesData = []
    let categories = []
    let name = ''

    if (revenueResolution === 'day') {
      seriesData = data?.revenueOverTime?.map(item => item.revenue) || []
      categories = data?.revenueOverTime?.map(item => item.date) || []
      name = 'Doanh thu theo ngày'
    } else if (revenueResolution === 'month') {
      seriesData = data?.monthlyMixedStats?.map(item => item.revenue) || []
      categories = data?.monthlyMixedStats?.map(item => item.month) || []
      name = 'Doanh thu theo tháng'
    } else if (revenueResolution === 'year') {
      seriesData = yearlyStats.map(item => item.revenue)
      categories = yearlyStats.map(item => item.year)
      name = 'Doanh thu theo năm'
    }

    return {
      series: [{ name, data: seriesData }],
      options: {
        chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent' },
        colors: ['#ff003c'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 95] } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories, labels: { style: { colors: '#888' } } },
        yaxis: {
          labels: {
            style: { colors: '#888' },
            formatter: (val) => `${(val / 1000000).toFixed(1)}M ₫`
          }
        },
        grid: { borderColor: 'rgba(255,255,255,0.06)' },
        tooltip: { theme: 'dark', y: { formatter: (val) => `${Number(val).toLocaleString('vi-VN')} ₫` } }
      }
    }
  }

  // --- Dynamic Configuration for Chart 2: Orders ---
  const getOrdersChartConfig = () => {
    let seriesData = []
    let categories = []
    let name = ''

    if (ordersResolution === 'day') {
      seriesData = data?.revenueOverTime?.map(item => item.orders) || []
      categories = data?.revenueOverTime?.map(item => item.date) || []
      name = 'Đơn hàng theo ngày'
    } else if (ordersResolution === 'month') {
      seriesData = data?.monthlyMixedStats?.map(item => item.orders) || []
      categories = data?.monthlyMixedStats?.map(item => item.month) || []
      name = 'Đơn hàng theo tháng'
    } else if (ordersResolution === 'year') {
      seriesData = yearlyStats.map(item => item.orders)
      categories = yearlyStats.map(item => item.year)
      name = 'Đơn hàng theo năm'
    }

    return {
      series: [{ name, data: seriesData }],
      options: {
        chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
        colors: ['#0f62fe'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 95] } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories, labels: { style: { colors: '#888' } } },
        yaxis: { labels: { style: { colors: '#888' }, formatter: (val) => `${val}` } },
        grid: { borderColor: 'rgba(255,255,255,0.06)' },
        tooltip: { theme: 'dark', y: { formatter: (val) => `${val} đơn` } }
      }
    }
  }

  // --- Dynamic Configuration for Chart 3: Website Visits ---
  const getVisitsChartConfig = () => {
    let seriesData = []
    let categories = []
    let name = ''

    if (visitsResolution === 'day') {
      seriesData = data?.websiteVisitsOverTime?.map(item => item.visits) || []
      categories = data?.websiteVisitsOverTime?.map(item => item.date) || []
      name = 'Truy cập theo ngày'
    } else if (visitsResolution === 'month') {
      const mData = getMonthlyVisits()
      seriesData = mData.map(item => item.visits)
      categories = mData.map(item => item.month)
      name = 'Truy cập theo tháng'
    } else if (visitsResolution === 'year') {
      const yData = getYearlyVisits()
      seriesData = yData.map(item => item.visits)
      categories = yData.map(item => item.year)
      name = 'Truy cập theo năm'
    }

    return {
      series: [{ name, data: seriesData }],
      options: {
        chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
        colors: ['#20c997'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 95] } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories, labels: { style: { colors: '#888' } } },
        yaxis: { labels: { style: { colors: '#888' }, formatter: (val) => `${val}` } },
        grid: { borderColor: 'rgba(255,255,255,0.06)' },
        tooltip: { theme: 'dark', y: { formatter: (val) => `${val} lượt` } }
      }
    }
  }

  const { options: revOptions, series: revSeries } = getRevenueChartConfig()
  const { options: ordOptions, series: ordSeries } = getOrdersChartConfig()
  const { options: visOptions, series: visSeries } = getVisitsChartConfig()

  // --- Other Charts ---
  // Horizontal Bar Chart: Top 10 sản phẩm bán chạy
  const barChartOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '65%', borderRadius: 4 } },
    colors: ['#0f62fe'],
    xaxis: {
      categories: data?.topProducts?.map(item => item.name) || [],
      labels: { style: { colors: '#888' } }
    },
    yaxis: { labels: { style: { colors: '#888' }, maxWidth: 200 } },
    grid: { borderColor: 'rgba(255,255,255,0.06)' },
    tooltip: { theme: 'dark' }
  }
  const barChartSeries = [{
    name: 'Số lượng bán',
    data: data?.topProducts?.map(item => item.quantity) || []
  }]

  // Donut Chart: Trạng thái đơn hàng
  const donutChartOptions = {
    chart: { type: 'donut', height: 300 },
    labels: data?.ordersByStatus?.map(item => item.status) || [],
    colors: ['#ffaa00', '#0f62fe', '#198754', '#dc3545', '#6c757d'],
    legend: { position: 'bottom', labels: { colors: '#888' } },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Tổng đơn hàng',
              color: '#888',
              formatter: () => data?.totalOrders || 0
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark' }
  }
  const donutChartSeries = data?.ordersByStatus?.map(item => Number(item.count)) || []

  // Pie Chart: Doanh thu theo thương hiệu
  const pieChartOptions = {
    chart: { type: 'pie', height: 300 },
    labels: data?.revenueByBrand?.map(item => item.brand) || [],
    colors: ['#ff003c', '#00f2fe', '#00f5a0', '#ffaa00', '#7f00ff', '#f000ff'],
    legend: { position: 'bottom', labels: { colors: '#888' } },
    tooltip: { theme: 'dark', y: { formatter: (val) => `${Number(val).toLocaleString('vi-VN')} ₫` } }
  }
  const pieChartSeries = data?.revenueByBrand?.map(item => item.revenue) || []

  // Heatmap: Khung giờ & ngày đặt hàng
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const generateHeatmapSeries = () => {
    return daysOfWeek.map(dayName => {
      const dayData = []
      for (let h = 0; h < 24; h += 2) {
        const match = data?.heatmapStats?.find(item => item.day === dayName && (item.hour === h || item.hour === h + 1))
        dayData.push({ x: `${h}h-${h+2}h`, y: match ? Number(match.count) : 0 })
      }
      return { name: dayName, data: dayData }
    })
  }

  const heatmapChartOptions = {
    chart: { type: 'heatmap', height: 350, toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors: ['#ff003c'],
    xaxis: { labels: { style: { colors: '#888' } } },
    yaxis: { labels: { style: { colors: '#888' } } },
    tooltip: { theme: 'dark' },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: 'rgba(255,255,255,0.03)', name: 'Không có đơn' },
            { from: 1, to: 2, color: '#ff758f', name: 'Thấp' },
            { from: 3, to: 5, color: '#ff4d6d', name: 'Trung bình' },
            { from: 6, to: 100, color: '#ff003c', name: 'Cao' }
          ]
        }
      }
    }
  }

  const getRevenueValue = () => {
    if (revenuePeriod === 'day') return { val: data?.todayRevenue || 0, lbl: 'Hôm nay' }
    if (revenuePeriod === 'month') return { val: data?.thisMonthRevenue || 0, lbl: 'Tháng này' }
    if (revenuePeriod === 'year') return { val: data?.thisYearRevenue || 0, lbl: 'Năm nay' }
    return { val: data?.totalRevenue || 0, lbl: 'Tất cả' }
  }
  const getOrdersValue = () => {
    if (ordersPeriod === 'day') return { val: data?.todayOrders || 0, lbl: 'Hôm nay' }
    if (ordersPeriod === 'month') return { val: data?.thisMonthOrders || 0, lbl: 'Tháng này' }
    if (ordersPeriod === 'year') return { val: data?.thisYearOrders || 0, lbl: 'Năm nay' }
    return { val: data?.totalOrders || 0, lbl: 'Tất cả' }
  }
  const getCustomersValue = () => {
    if (customersPeriod === 'day') return { val: data?.todayCustomers || 0, lbl: 'Hôm nay' }
    if (customersPeriod === 'month') return { val: data?.thisMonthCustomers || 0, lbl: 'Tháng này' }
    if (customersPeriod === 'year') return { val: data?.thisYearCustomers || 0, lbl: 'Năm nay' }
    return { val: data?.newCustomers || 0, lbl: 'Tất cả' }
  }
  const getProductsValue = () => {
    if (productsPeriod === 'day') return { val: data?.todayProducts || 0, lbl: 'Hôm nay' }
    if (productsPeriod === 'month') return { val: data?.thisMonthProducts || 0, lbl: 'Tháng này' }
    if (productsPeriod === 'year') return { val: data?.thisYearProducts || 0, lbl: 'Năm nay' }
    return { val: data?.totalProducts || 0, lbl: 'Tất cả' }
  }

  const revVal = getRevenueValue()
  const ordVal = getOrdersValue()
  const custVal = getCustomersValue()
  const prodVal = getProductsValue()

  const heatmapChartSeries = generateHeatmapSeries()

  return (
    <main id="main" className="main">
      {/* Page Title */}
      <div className="pagetitle text-start mb-4">
        <h1>Báo Cáo Thống Kê</h1>
        <nav>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><a href="#dashboard">Home</a></li>
            <li className="breadcrumb-item active">Statistics</li>
          </ol>
        </nav>
      </div>

      <section className="section dashboard">
        {/* KPI Cards Row */}
        <div className="row g-4 mb-4">
          {/* Card: Revenue */}
          <div className="col-xxl-3 col-md-6 text-start">
            <div className="card info-card sales-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Doanh Thu <span>| {revVal.lbl}</span></h5>
                  <select 
                    className="form-select bg-light text-dark border-0 fs-8 py-0 px-2" 
                    style={{ width: '95px', height: '24px', borderRadius: '4px' }}
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="day">Hôm nay</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary-light text-primary">
                    <DollarSign size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark fs-5 fw-bold">{Number(revVal.val).toLocaleString('vi-VN')} ₫</h6>
                    <span className="text-muted small pt-2">doanh số thanh toán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Orders */}
          <div className="col-xxl-3 col-md-6 text-start">
            <div className="card info-card revenue-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Đơn Hàng <span>| {ordVal.lbl}</span></h5>
                  <select 
                    className="form-select bg-light text-dark border-0 fs-8 py-0 px-2" 
                    style={{ width: '95px', height: '24px', borderRadius: '4px' }}
                    value={ordersPeriod}
                    onChange={(e) => setOrdersPeriod(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="day">Hôm nay</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success-light text-success">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark fs-5 fw-bold">{ordVal.val}</h6>
                    <span className="text-muted small pt-2">giao dịch hệ thống</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Customers */}
          <div className="col-xxl-3 col-md-6 text-start">
            <div className="card info-card customers-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Khách Hàng Mới <span>| {custVal.lbl}</span></h5>
                  <select 
                    className="form-select bg-light text-dark border-0 fs-8 py-0 px-2" 
                    style={{ width: '95px', height: '24px', borderRadius: '4px' }}
                    value={customersPeriod}
                    onChange={(e) => setCustomersPeriod(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="day">Hôm nay</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-danger-light text-danger">
                    <Users size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark fs-5 fw-bold">{custVal.val}</h6>
                    <span className="text-muted small pt-2">thành viên đăng ký</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Products */}
          <div className="col-xxl-3 col-md-6 text-start">
            <div className="card info-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Sản Phẩm Mới <span>| {prodVal.lbl}</span></h5>
                  <select 
                    className="form-select bg-light text-dark border-0 fs-8 py-0 px-2" 
                    style={{ width: '95px', height: '24px', borderRadius: '4px' }}
                    value={productsPeriod}
                    onChange={(e) => setProductsPeriod(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="day">Hôm nay</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>
                <div className="d-flex align-items-center">
                  <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info-light text-info">
                    <Laptop size={24} />
                  </div>
                  <div className="ps-3">
                    <h6 className="text-dark fs-5 fw-bold">{prodVal.val}</h6>
                    <span className="text-muted small pt-2">thiết bị thêm mới</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 1: Revenue (Full Width) */}
        <div className="row g-4 mb-4">
          <div className="col-12 text-start">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="card-title mb-0">Xu Hướng Doanh Thu</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary fs-8">Thống kê theo:</span>
                    <select
                      className="form-select bg-light text-dark border-secondary fs-8 py-1"
                      style={{ width: '150px', borderRadius: '4px', height: '32px' }}
                      value={revenueResolution}
                      onChange={(e) => setRevenueResolution(e.target.value)}
                    >
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <Chart options={revOptions} series={revSeries} type="area" height={350} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Orders & Website Visits (Two Columns) */}
        <div className="row g-4 mb-4">
          {/* Chart 2: Orders */}
          <div className="col-lg-6 text-start">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="card-title mb-0">Xu Hướng Số Lượng Đơn Hàng</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary fs-8">Thống kê theo:</span>
                    <select
                      className="form-select bg-light text-dark border-secondary fs-8 py-1"
                      style={{ width: '130px', borderRadius: '4px', height: '32px' }}
                      value={ordersResolution}
                      onChange={(e) => setOrdersResolution(e.target.value)}
                    >
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <Chart options={ordOptions} series={ordSeries} type="area" height={320} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Website Visits */}
          <div className="col-lg-6 text-start">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="card-title mb-0">Xu Hướng Lượt Truy Cập Website</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary fs-8">Thống kê theo:</span>
                    <select
                      className="form-select bg-light text-dark border-secondary fs-8 py-1"
                      style={{ width: '130px', borderRadius: '4px', height: '32px' }}
                      value={visitsResolution}
                      onChange={(e) => setVisitsResolution(e.target.value)}
                    >
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <Chart options={visOptions} series={visSeries} type="area" height={320} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 3: Product Selling & Brands Revenue */}
        <div className="row g-4 mb-4">
          <div className="col-lg-7 text-start">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Top 10 Sản Phẩm Bán Chạy</h5>
                <div className="pt-2">
                  <Chart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 text-start">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Cơ Cấu Doanh Thu Theo Thương Hiệu</h5>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                  <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="100%" height={300} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 4: Status Distribution & Heatmap */}
        <div className="row g-4 mb-4">
          <div className="col-lg-5 text-start">
            <div className="card" style={{ height: 'calc(100% - 0px)' }}>
              <div className="card-body">
                <h5 className="card-title">Trạng Thái Đơn Hàng</h5>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                  <Chart options={donutChartOptions} series={donutChartSeries} type="donut" width="100%" height={300} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7 text-start">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Mật Độ Đơn Hàng Theo Khung Giờ & Thứ</h5>
                <div className="pt-2">
                  <Chart options={heatmapChartOptions} series={heatmapChartSeries} type="heatmap" height={350} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ManageStats

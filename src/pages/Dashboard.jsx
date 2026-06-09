function Dashboard() {
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

              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Reports <span>/Today</span></h5>
                    <div className="py-5 text-center text-muted fs-7">
                      Hệ thống phân tích báo cáo thời gian thực đang chạy ngầm...
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
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
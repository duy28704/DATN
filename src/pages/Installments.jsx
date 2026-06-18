import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, ChevronDown, ChevronUp, Landmark, ShieldAlert, Phone, User, Mail, Calendar, Calculator } from 'lucide-react';
import { ProductContext, formatDisplayPrice } from '../context/ProductContext';
import { AuthContext } from '../context/AuthContext';
import { apiService, validators } from '../services/api';

const Installments = ({ setCurrentPage }) => {
  const { user } = useContext(AuthContext);
  const { products } = useContext(ProductContext);

  const [selectedProduct, setSelectedProduct] = useState(() => products[0] || null);

  useEffect(() => {
    if (products && products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);
  const [selectedPackage, setSelectedPackage] = useState('niendim'); // 'niendim' (Annuity), 'giamdan' (Declining), 'rate0' (0% Interest)
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [termMonths, setTermMonths] = useState(12);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Form states for Counseling
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTime, setFormTime] = useState('morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', email: '' });

  const banks = [
    { id: 'tcb', name: 'Techcombank', rate: 5.9, logo: 'TCB', color: '#E01E26' },
    { id: 'mbb', name: 'MB Bank', rate: 6.5, logo: 'MB', color: '#004A9C' },
    { id: 'bidv', name: 'BIDV', rate: 6.9, logo: 'BIDV', color: '#00979C' },
    { id: 'vcb', name: 'Vietcombank', rate: 7.2, logo: 'VCB', color: '#00A859' },
  ];

  const packages = [
    { id: 'niendim', title: 'Niên Kim Cố Định', description: 'Số tiền đóng mỗi tháng cố định dễ cân đối chi tiêu.' },
    { id: 'giamdan', title: 'Dư Nợ Giảm Dần', description: 'Lãi tính trên nợ gốc thực tế, giảm dần theo thời gian.' },
    { id: 'rate0', title: 'Ưu Đãi Trả Góp 0%', description: '0% lãi suất trong 6 tháng đầu (chỉ áp dụng Techcombank).' }
  ];

  useEffect(() => {
    // Set default bank
    setSelectedBank(banks[0]);
  }, []);

  useEffect(() => {
    if (user) {
      setFormName(user.name || '');
      setFormEmail(user.email || '');
      setFormPhone(user.phone || '');
    }
  }, [user]);

  // Adjust package restrictions
  useEffect(() => {
    if (selectedPackage === 'rate0') {
      setTermMonths(6); // Force 6 months for 0%
      const tcb = banks.find(b => b.id === 'tcb');
      if (tcb) setSelectedBank({ ...tcb, rate: 0 });
    } else {
      // Restore standard rates
      if (selectedBank && selectedBank.rate === 0) {
        const original = banks.find(b => b.id === selectedBank.id);
        if (original) setSelectedBank(original);
      }
    }
  }, [selectedPackage]);

  // Product Selection handler
  const handleProductChange = (e) => {
    const prod = products.find(p => String(p.id) === String(e.target.value));
    if (prod) setSelectedProduct(prod);
  };

  const calculate = () => {
    if (!selectedProduct || !selectedBank) return null;
    
    const price = selectedProduct.price;
    const downPayment = (downPaymentPct / 100) * price;
    const loanAmount = price - downPayment;
    
    let annualRate = selectedBank.rate;
    
    // Custom package adjustments
    if (selectedPackage === 'rate0') {
      annualRate = 0;
    }

    const monthlyRate = (annualRate / 100) / 12;
    const n = termMonths;
    
    let schedule = [];
    let totalInterest = 0;
    let monthlyPayment = 0; // standard month 1 or annuity fixed

    if (selectedPackage === 'niendim') {
      // Fixed monthly payment formula (Annuity)
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / n;
      } else {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }

      let remainingBalance = loanAmount;
      for (let i = 1; i <= n; i++) {
        const interest = remainingBalance * monthlyRate;
        const principal = monthlyPayment - interest;
        const startBalance = remainingBalance;
        remainingBalance -= principal;
        if (remainingBalance < 0.1) remainingBalance = 0;

        schedule.push({
          month: i,
          startBalance,
          principal,
          interest,
          total: monthlyPayment,
          endBalance: remainingBalance
        });
        totalInterest += interest;
      }
    } else {
      // Declining Balance (Dư nợ giảm dần)
      const monthlyPrincipal = loanAmount / n;
      let remainingBalance = loanAmount;

      for (let i = 1; i <= n; i++) {
        const interest = remainingBalance * monthlyRate;
        const total = monthlyPrincipal + interest;
        const startBalance = remainingBalance;
        remainingBalance -= monthlyPrincipal;
        if (remainingBalance < 0.1) remainingBalance = 0;

        schedule.push({
          month: i,
          startBalance,
          principal: monthlyPrincipal,
          interest,
          total,
          endBalance: remainingBalance
        });
        totalInterest += interest;
      }
      monthlyPayment = schedule[0]?.total || 0; // First month payment
    }

    const totalCost = loanAmount + totalInterest + downPayment;

    return {
      downPayment,
      loanAmount,
      monthlyPayment, // Annuity or First Month
      totalInterest,
      totalCost,
      schedule
    };
  };

  const results = calculate();

  const handleCounselSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({ name: '', phone: '', email: '' });

    // Validate fields
    let hasErr = false;
    const errs = { name: '', phone: '', email: '' };

    const nameVal = validators.name(formName);
    if (nameVal) {
      errs.name = nameVal;
      hasErr = true;
    }

    const phoneVal = validators.phone(formPhone);
    if (phoneVal) {
      errs.phone = phoneVal;
      hasErr = true;
    }

    const emailVal = validators.email(formEmail);
    if (emailVal) {
      errs.email = emailVal;
      hasErr = true;
    }

    if (hasErr) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.installments.submitRequest({
        email: formEmail,
        customerName: formName,
        phone: formPhone,
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        price: selectedProduct.price,
        productImage: selectedProduct.image,
        downPaymentPct,
        loanTerm: termMonths,
        bankName: selectedBank?.name || '',
        packageName: packages.find(p => p.id === selectedPackage)?.title || '',
        preferredContactTime: formTime,
        monthlyEstimate: results?.monthlyPayment || 0
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Auto reset success after 5s
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      setFormError(err.message || 'Lỗi khi gửi yêu cầu đăng ký.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 px-4 px-md-5">
      {/* Page Header */}
      <div className="text-center mb-5">
        <span className="hero-tagline">TÍNH TOÁN TRẢ GÓP THÔNG MINH</span>
        <h1 className="text-white hero-title text-gradient display-font">NEXUS INSTALLMENT PLATFORM</h1>
        <p className="text-secondary mx-auto" style={{ maxWidth: '650px' }}>
          Được tối ưu hóa dựa trên mô hình tài chính VinFast, giúp bạn tự do cấu hình mức trả trước, lựa chọn ngân hàng liên kết, tính toán khấu hao lãi vay tức thì.
        </p>
      </div>

      <div className="row g-5">
        {/* Left Control Column */}
        <div className="col-12 col-lg-7">
          <div className="glass-panel p-4 p-md-5 rounded d-flex flex-column gap-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="fs-5 text-white display-font d-flex align-items-center gap-2 mb-2">
              <Calculator className="text-danger" size={22} /> CẤU HÌNH GÓI VAY
            </h2>

            {/* 1. Select Product */}
            <div>
              <label className="form-label text-secondary fs-7 uppercase tracking-wider mb-2">1. Chọn sản phẩm công nghệ</label>
              <select 
                className="form-select tech-input w-100" 
                value={selectedProduct?.id || ''} 
                onChange={handleProductChange}
                style={{ height: '50px' }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {formatDisplayPrice(p.price, p.displayPrice)}</option>
                ))}
              </select>
            </div>

            {/* 2. Select Payment Package */}
            <div>
              <label className="form-label text-secondary fs-7 uppercase tracking-wider mb-2">2. Gói vay ưu đãi</label>
              <div className="d-flex flex-column gap-2">
                {packages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-3 rounded border text-start transition-smooth d-flex align-items-center justify-content-between cursor-pointer ${selectedPackage === pkg.id ? 'border-danger' : 'border-secondary'}`}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedPackage === pkg.id ? 'rgba(255,0,60,0.04)' : 'rgba(255,255,255,0.01)',
                      borderColor: selectedPackage === pkg.id ? 'var(--accent-red)' : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div>
                      <h4 className="text-white fs-6 mb-1">{pkg.title}</h4>
                      <p className="text-muted fs-8 mb-0" style={{ fontSize: '0.75rem' }}>{pkg.description}</p>
                    </div>
                    <div className={`rounded-circle border d-flex align-items-center justify-content-center`} style={{ width: '20px', height: '20px', borderColor: selectedPackage === pkg.id ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {selectedPackage === pkg.id && <div className="rounded-circle bg-danger" style={{ width: '12px', height: '12px' }}></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Slider Down Payment */}
            <div>
              <div className="d-flex justify-content-between mb-2">
                <label className="form-label text-secondary fs-7 uppercase tracking-wider mb-0">3. Số tiền trả trước ({downPaymentPct}%)</label>
                <span className="text-danger fw-bold display-font">
                  {((downPaymentPct / 100) * (selectedProduct?.price || 0)).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
                </span>
              </div>
              <input 
                type="range" 
                className="form-range custom-slider-range" 
                min="20" 
                max="80" 
                step="10"
                value={downPaymentPct} 
                onChange={e => setDownPaymentPct(Number(e.target.value))}
                style={{ accentColor: 'var(--accent-red)' }}
              />
              <div className="d-flex justify-content-between fs-8 text-secondary mt-1">
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
                <span>60%</span>
                <span>70%</span>
                <span>80%</span>
              </div>
            </div>

            {/* 4. Loan Term */}
            <div>
              <label className="form-label text-secondary fs-7 uppercase tracking-wider mb-2">4. Kỳ hạn vay (Tháng)</label>
              <div className="row g-2">
                {[6, 12, 18, 24, 36].map(months => {
                  const disabled = selectedPackage === 'rate0' && months !== 6;
                  return (
                    <div className="col" key={months}>
                      <button
                        type="button"
                        disabled={disabled}
                        className={`w-100 py-2 border rounded display-font transition-smooth fs-7 ${termMonths === months ? 'bg-danger text-white border-danger' : 'bg-transparent text-secondary border-secondary'} ${disabled ? 'opacity-25 cursor-not-allowed' : ''}`}
                        style={{ 
                          borderColor: termMonths === months ? 'var(--accent-red)' : 'rgba(255,255,255,0.08)',
                          color: termMonths === months ? '#fff' : 'var(--text-secondary)'
                        }}
                        onClick={() => setTermMonths(months)}
                      >
                        {months} T
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Cooperative Banks */}
            <div>
              <label className="form-label text-secondary fs-7 uppercase tracking-wider mb-2">5. Chọn Ngân Hàng Hợp Tác</label>
              <div className="row g-3">
                {banks.map(bank => {
                  const isSelected = selectedBank?.id === bank.id;
                  const currentRate = selectedPackage === 'rate0' && bank.id === 'tcb' ? 0 : bank.rate;
                  return (
                    <div className="col-6 col-sm-3" key={bank.id}>
                      <div
                        onClick={() => selectedPackage !== 'rate0' || bank.id === 'tcb' ? setSelectedBank(bank) : null}
                        className={`p-3 rounded border text-center transition-smooth cursor-pointer h-100 d-flex flex-column justify-content-center align-items-center ${isSelected ? 'border-danger' : 'border-secondary'} ${(selectedPackage === 'rate0' && bank.id !== 'tcb') ? 'opacity-25 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,0,60,0.04)' : 'rgba(255,255,255,0.01)',
                          borderColor: isSelected ? 'var(--accent-red)' : 'rgba(255,255,255,0.08)',
                          cursor: (selectedPackage === 'rate0' && bank.id !== 'tcb') ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Landmark size={24} style={{ color: bank.color }} className="mb-2" />
                        <h4 className="text-white fs-7 mb-1 display-font fw-bold">{bank.name}</h4>
                        <span className="badge rounded px-2 py-1 fs-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          {currentRate}% / năm
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Cost Summary and Consult Column */}
        <div className="col-12 col-lg-5">
          <div className="d-flex flex-column gap-4 position-sticky" style={{ top: '100px' }}>
            {/* Calculation summary */}
            {results && (
              <div className="glass-panel p-4 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <h3 className="fs-6 text-uppercase text-danger tracking-wider mb-4 display-font">ƯỚC TÍNH CHI PHÍ</h3>

                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-secondary fs-7">Giá trị sản phẩm:</span>
                  <span className="text-white fw-semibold display-font">{formatDisplayPrice(selectedProduct.price, selectedProduct.displayPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-secondary fs-7">Số tiền trả trước ({downPaymentPct}%):</span>
                  <span className="text-white fw-semibold display-font">{results.downPayment.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-secondary fs-7">Số tiền cần vay ngân hàng:</span>
                  <span className="text-white fw-semibold display-font">{results.loanAmount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-secondary fs-7">Lãi suất vay áp dụng:</span>
                  <span className="text-white fw-semibold display-font">
                    {selectedPackage === 'rate0' ? '0% (6T đầu)' : `${selectedBank?.rate}% / năm`}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-secondary fs-7">Kỳ hạn trả góp:</span>
                  <span className="text-white fw-semibold display-font">{termMonths} tháng</span>
                </div>
                <div className="d-flex justify-content-between mb-4 pb-2">
                  <span className="text-secondary fs-7">Tổng lãi phải trả:</span>
                  <span className="text-white fw-semibold display-font">{results.totalInterest.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span>
                </div>

                <div className="p-3 rounded mb-4 text-center" style={{ backgroundColor: 'rgba(255,0,60,0.05)', border: '1px solid var(--accent-red-dim)' }}>
                  <span className="text-secondary fs-8 uppercase tracking-widest d-block mb-1">
                    {selectedPackage === 'niendim' ? 'TRẢ GÓP HÀNG THÁNG CỐ ĐỊNH' : 'TRẢ HÀNG THÁNG (THÁNG ĐẦU)'}
                  </span>
                  <span className="text-danger fw-extrabold display-font fs-3">
                    {results.monthlyPayment.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
                  </span>
                  <span className="text-muted fs-8 d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    *Gồm nợ gốc cố định + tiền lãi tháng đầu
                  </span>
                </div>

                {/* Collapsible Amortization Trigger */}
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 fs-7 d-flex align-items-center justify-content-center gap-2 mb-2 py-2"
                  onClick={() => setShowSchedule(!showSchedule)}
                  style={{ color: '#fff', borderColor: 'var(--border-color)' }}
                >
                  {showSchedule ? (
                    <>Ẩn Lịch Trả Nợ Chi Tiết <ChevronUp size={16} /></>
                  ) : (
                    <>Xem Lịch Trả Nợ Chi Tiết <ChevronDown size={16} /></>
                  )}
                </button>
              </div>
            )}

            {/* 6. Consultation Form */}
            <div className="glass-panel p-4 rounded text-start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="fs-6 text-uppercase text-danger tracking-wider mb-3 display-font">ĐĂNG KÝ NHẬN TƯ VẤN VAY</h3>
              <p className="text-secondary fs-8 mb-4">
                Điền thông tin dưới đây, đội ngũ tài chính chuyên nghiệp của NEXUS sẽ liên hệ thẩm định hồ sơ của bạn trong vòng 15 phút.
              </p>

              {formError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 fs-8 border-0 bg-danger bg-opacity-10 text-danger mb-3">
                  <ShieldAlert size={14} />
                  <span>{formError}</span>
                </div>
              )}

              {submitSuccess ? (
                <div className="text-center py-4 text-success d-flex flex-column align-items-center gap-2">
                  <CheckCircle size={48} className="pulse-glow-element text-success" />
                  <h4 className="fs-6 mt-2">Đăng ký thành công!</h4>
                  <p className="text-secondary fs-8 mb-0">Hồ sơ tư vấn trả góp đã được ghi nhận vào tài khoản của bạn.</p>
                </div>
              ) : (
                <form onSubmit={handleCounselSubmit} className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Họ và Tên</label>
                    <div className="position-relative">
                      <User size={14} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                      <input 
                        type="text" 
                        required 
                        className={`form-control tech-input ps-5 py-2 fs-7 ${fieldErrors.name ? 'is-invalid border-danger' : ''}`}
                        placeholder="Họ tên của bạn"
                        value={formName}
                        onChange={e => { setFormName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })) }}
                      />
                    </div>
                    {fieldErrors.name && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.name}</span>}
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-secondary fs-8 mb-1">Số điện thoại</label>
                      <div className="position-relative">
                        <Phone size={14} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                        <input 
                          type="tel" 
                          required 
                          className={`form-control tech-input ps-5 py-2 fs-7 ${fieldErrors.phone ? 'is-invalid border-danger' : ''}`}
                          placeholder="Số điện thoại"
                          value={formPhone}
                          onChange={e => { setFormPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: '' })) }}
                        />
                      </div>
                      {fieldErrors.phone && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.phone}</span>}
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label text-secondary fs-8 mb-1">Email</label>
                      <div className="position-relative">
                        <Mail size={14} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                        <input 
                          type="email" 
                          required 
                          className={`form-control tech-input ps-5 py-2 fs-7 ${fieldErrors.email ? 'is-invalid border-danger' : ''}`}
                          placeholder="Địa chỉ Email"
                          value={formEmail}
                          onChange={e => { setFormEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })) }}
                        />
                      </div>
                      {fieldErrors.email && <span className="text-danger fs-8 mt-1 d-block">{fieldErrors.email}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Thời gian liên hệ thuận tiện</label>
                    <div className="position-relative">
                      <Calendar size={14} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                      <select 
                        className="form-select tech-input ps-5 py-2 fs-7" 
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                      >
                        <option value="morning">Buổi sáng (8h - 12h)</option>
                        <option value="afternoon">Buổi chiều (13h30 - 17h30)</option>
                        <option value="evening">Buổi tối (18h - 21h)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-danger w-100 py-3 mt-2 glow-btn d-flex align-items-center justify-content-center gap-2 fs-7"
                  >
                    {isSubmitting ? (
                      <div className="spinner-border spinner-border-sm text-white" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      'NỘP HỒ SƠ TƯ VẤN NGAY'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Collapsible Detailed Amortization Table */}
      <AnimatePresence>
        {showSchedule && results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-100 overflow-hidden mt-5 text-start"
            transition={{ duration: 0.3 }}
          >
            <div className="glass-panel p-4 p-md-5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="fs-5 text-white display-font mb-4 text-uppercase tracking-wider">
                BẢNG KHẤU HAO LÃI VAY CHI TIẾT THEO THÁNG
              </h3>
              
              <div className="table-responsive">
                <table className="table table-dark table-hover table-borderless text-white align-middle" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr className="border-bottom border-secondary border-opacity-25" style={{ color: 'var(--text-secondary)' }}>
                      <th className="py-3">KỲ HẠN</th>
                      <th className="py-3 text-end">DƯ NỢ ĐẦU KỲ</th>
                      <th className="py-3 text-end">TIỀN GỐC</th>
                      <th className="py-3 text-end">TIỀN LÃI</th>
                      <th className="py-3 text-end">TỔNG THANH TOÁN</th>
                      <th className="py-3 text-end">DƯ NỢ CUỐI KỲ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.schedule.map((row) => (
                      <tr key={row.month} className="border-bottom border-secondary border-opacity-10 hover-bg-dark">
                        <td className="py-3 fw-bold display-font text-danger">Tháng {row.month}</td>
                        <td className="py-3 text-end display-font">{row.startBalance.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</td>
                        <td className="py-3 text-end display-font text-white">{row.principal.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</td>
                        <td className="py-3 text-end display-font text-warning">{row.interest.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</td>
                        <td className="py-3 text-end display-font fw-bold text-success">{row.total.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</td>
                        <td className="py-3 text-end display-font">{row.endBalance.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Installments;

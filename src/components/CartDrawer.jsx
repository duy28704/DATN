import { useContext, useState, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { apiService, validators } from '../services/api'
import { useToast } from '../context/ToastContext'
import { X, Plus, Minus, Trash2, ShieldCheck, ShoppingBag, ArrowRight, Truck, CreditCard, Landmark, QrCode, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CartDrawer = ({ isOpen, onClose, setCurrentPage, initialStep = 'cart' }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartShipping, 
    cartTotal,
    clearCart 
  } = useContext(CartContext)

  const { user } = useContext(AuthContext)
  const { showToast } = useToast()

  const [checkoutStep, setCheckoutStep] = useState(initialStep) // 'cart', 'checkout', 'success'

  useEffect(() => {
    if (isOpen) {
      setCheckoutStep(initialStep)
    }
  }, [isOpen, initialStep])
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod', 'visa', 'atm', 'momo'
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [selectedBank, setSelectedBank] = useState('VCB')
  const [isOrdering, setIsOrdering] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Field validation errors
  const [checkoutErrors, setCheckoutErrors] = useState({ name: '', phone: '', address: '' })
  const [cardErrors, setCardErrors] = useState({ number: '', name: '', expiry: '', cvc: '' })

  // Auto pre-fill checkout details if user is logged in
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        note: ''
      })
    }
  }, [user, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setCheckoutErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
    setCardErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setCheckoutErrors({ name: '', phone: '', address: '' })
    setCardErrors({ number: '', name: '', expiry: '', cvc: '' })

    let hasErr = false
    const infoErrs = { name: '', phone: '', address: '' }
    const paymentErrs = { number: '', name: '', expiry: '', cvc: '' }

    // Validate delivery fields
    const nameVal = validators.name(formData.name)
    if (nameVal) {
      infoErrs.name = nameVal
      hasErr = true
    }

    const phoneVal = validators.phone(formData.phone)
    if (phoneVal) {
      infoErrs.phone = phoneVal
      hasErr = true
    }

    const addrVal = validators.address(formData.address)
    if (addrVal) {
      infoErrs.address = addrVal
      hasErr = true
    }

    // Validate Visa details if selected
    if (paymentMethod === 'visa') {
      const cardNumVal = validators.cardNumber(cardData.number)
      if (cardNumVal) {
        paymentErrs.number = cardNumVal
        hasErr = true
      }

      const cardHolderVal = validators.name(cardData.name)
      if (cardHolderVal) {
        paymentErrs.name = cardHolderVal
        hasErr = true
      }

      const cardExpiryVal = validators.cardExpiry(cardData.expiry)
      if (cardExpiryVal) {
        paymentErrs.expiry = cardExpiryVal
        hasErr = true
      }

      const cardCvcVal = validators.cardCVC(cardData.cvc)
      if (cardCvcVal) {
        paymentErrs.cvc = cardCvcVal
        hasErr = true
      }
    }

    if (hasErr) {
      setCheckoutErrors(infoErrs)
      setCardErrors(paymentErrs)
      return
    }

    setIsOrdering(true)

    // Construct checkout payload
    const orderPayload = {
      email: user?.email || 'guest@nexus.com',
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      paymentMethod: paymentMethod,
      paymentCardInfo: paymentMethod === 'visa' ? `•••• •••• •••• ${cardData.number.slice(-4) || '4242'}` : null,
      cardDetails: paymentMethod === 'visa' ? cardData : null,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        image: item.image
      })),
      subtotal: cartSubtotal,
      shipping: cartShipping,
      total: cartTotal
    }

    try {
      const resultOrder = await apiService.orders.checkout(orderPayload)
      setPlacedOrder(resultOrder)
      setCheckoutStep('success')
    } catch (err) {
      showToast({ type: 'error', title: 'Lỗi đặt hàng', message: err.message || 'Có lỗi xảy ra khi tạo đơn hàng.' })
    } finally {
      setIsOrdering(false)
    }
  }

  const handleSuccessClose = () => {
    clearCart()
    setCheckoutStep('cart')
    setFormData({ name: '', phone: '', address: '', note: '' })
    setPaymentMethod('cod')
    setCardData({ number: '', name: '', expiry: '', cvc: '' })
    setPlacedOrder(null)
    setCheckoutErrors({ name: '', phone: '', address: '' })
    setCardErrors({ number: '', name: '', expiry: '', cvc: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-end" style={{ zIndex: 1050 }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="position-absolute top-0 start-0 w-100 h-100 bg-black"
        style={{ cursor: 'pointer' }}
      />

      {/* Slide-out Drawer Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="position-relative h-100 glass-panel d-flex flex-column text-white shadow-lg"
        style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}
      >
        {/* Drawer Header */}
        <div className="p-4 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="d-flex align-items-center gap-2">
            <ShoppingBag size={20} className="text-danger" />
            <h2 className="fs-5 mb-0 text-uppercase tracking-wider display-font">Giỏ Hàng</h2>
          </div>
          <button className="btn btn-link text-white p-0 border-0" onClick={onClose} aria-label="Đóng giỏ hàng">
            <X size={22} />
          </button>
        </div>

        {/* Step 1: Cart Items Listing */}
        {checkoutStep === 'cart' && (
          <>
            <div className="flex-grow-1 overflow-auto p-4">
              {cartItems.length === 0 ? (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center gap-3">
                  <ShoppingBag size={48} className="text-secondary" />
                  <p className="text-secondary mb-0">Giỏ hàng của bạn đang trống.</p>
                  <button 
                    className="btn btn-sm btn-danger glow-btn"
                    onClick={() => { onClose(); setCurrentPage('shop'); }}
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="d-flex gap-3 align-items-start pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="p-2 bg-black rounded" style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={item.image} alt={item.name} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="fs-7 text-white fw-semibold mb-1 display-font" style={{ fontSize: '0.9rem' }}>{item.name}</h3>
                        <p className="fs-8 text-danger mb-2" style={{ fontSize: '0.75rem' }}>Màu sắc: {item.selectedColor}</p>
                        
                        <div className="d-flex align-items-center justify-content-between">
                          {/* Quantity selector */}
                          <div className="d-flex align-items-center border border-secondary rounded" style={{ overflow: 'hidden' }}>
                            <button 
                              className="btn btn-sm text-white px-2 py-0 border-0" 
                              onClick={() => updateQuantity(item.id, item.selectedColor, -1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 fs-7 fw-medium">{item.quantity}</span>
                            <button 
                              className="btn btn-sm text-white px-2 py-0 border-0" 
                              onClick={() => updateQuantity(item.id, item.selectedColor, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="fs-7 fw-bold display-font">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                        </div>
                      </div>
                      
                      {/* Delete button */}
                      <button 
                        className="btn btn-link text-secondary hover-red p-0 border-0"
                        onClick={() => removeFromCart(item.id, item.selectedColor)}
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary fs-7">Tạm tính:</span>
                  <span className="text-white fw-medium display-font">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary fs-7">Vận chuyển:</span>
                  <span className="text-white fw-medium display-font">
                    {cartShipping === 0 ? 'Miễn phí' : `${cartShipping.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
                {cartShipping > 0 && (
                  <p className="fs-8 text-secondary mb-3" style={{ fontSize: '0.75rem' }}>
                    *Miễn phí vận chuyển cho đơn hàng trên 15.000.000 ₫
                  </p>
                )}
                <div className="h-line w-100 my-3" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-white fw-semibold">Tổng thanh toán:</span>
                  <span className="text-danger fw-bold fs-4 display-font">{cartTotal.toLocaleString('vi-VN')} ₫</span>
                </div>

                <button 
                  className="btn btn-danger w-100 py-3 glow-btn d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setCheckoutStep('checkout')}
                >
                  Tiến Hành Đặt Hàng <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Checkout Information & Payment Form */}
        {checkoutStep === 'checkout' && (
          <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column">
            <form onSubmit={handleOrderSubmit} className="d-flex flex-column gap-4">
              
              {/* Shipping info */}
              <div>
                <h3 className="fs-7 text-uppercase tracking-wider mb-3 display-font" style={{ color: 'var(--accent-red)' }}>
                  1. THÔNG TIN GIAO HÀNG
                </h3>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Họ và Tên người nhận</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-control tech-input py-2 fs-7 w-100 ${checkoutErrors.name ? 'is-invalid border-danger' : ''}`}
                      placeholder="Họ và tên"
                    />
                    {checkoutErrors.name && <span className="text-danger fs-8 mt-1 d-block">{checkoutErrors.name}</span>}
                  </div>
                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-control tech-input py-2 fs-7 w-100 ${checkoutErrors.phone ? 'is-invalid border-danger' : ''}`}
                      placeholder="Số điện thoại liên hệ"
                    />
                    {checkoutErrors.phone && <span className="text-danger fs-8 mt-1 d-block">{checkoutErrors.phone}</span>}
                  </div>
                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Địa Chỉ Nhận Hàng</label>
                    <input
                      type="text"
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-control tech-input py-2 fs-7 w-100 ${checkoutErrors.address ? 'is-invalid border-danger' : ''}`}
                      placeholder="Số nhà, tên đường, quận/tỉnh"
                    />
                    {checkoutErrors.address && <span className="text-danger fs-8 mt-1 d-block">{checkoutErrors.address}</span>}
                  </div>
                  <div>
                    <label className="form-label text-secondary fs-8 mb-1">Ghi chú (Tùy chọn)</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="2"
                      className="form-control tech-input py-2 fs-7 w-100"
                      placeholder="Lưu ý cho shipper..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <h3 className="fs-7 text-uppercase tracking-wider mb-3 display-font" style={{ color: 'var(--accent-red)' }}>
                  2. PHƯƠNG THỨC THANH TOÁN
                </h3>
                
                <div className="d-flex flex-column gap-2">
                  {/* Option 1: COD */}
                  <label 
                    className={`p-3 rounded border text-start cursor-pointer d-flex flex-column transition-smooth ${paymentMethod === 'cod' ? 'border-danger bg-danger bg-opacity-5' : 'border-secondary'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')} 
                          className="form-check-input"
                          style={{ accentColor: 'var(--accent-red)' }}
                        />
                        <span className="fs-7 fw-medium text-white">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                      <Truck size={18} className="text-secondary" />
                    </div>
                    {paymentMethod === 'cod' && (
                      <p className="text-muted fs-8 mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                        Quý khách sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi kiểm tra sản phẩm.
                      </p>
                    )}
                  </label>

                  {/* Option 2: Visa/Mastercard */}
                  <label 
                    className={`p-3 rounded border text-start cursor-pointer d-flex flex-column transition-smooth ${paymentMethod === 'visa' ? 'border-danger bg-danger bg-opacity-5' : 'border-secondary'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'visa'} 
                          onChange={() => setPaymentMethod('visa')}
                          className="form-check-input"
                          style={{ accentColor: 'var(--accent-red)' }}
                        />
                        <span className="fs-7 fw-medium text-white">Thẻ Quốc Tế (Visa / Mastercard)</span>
                      </div>
                      
                      {/* Credit Card SVGs Group */}
                      <div className="d-flex gap-1">
                        {/* Visa SVG */}
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="16" rx="2" fill="#0E1A63"/>
                          <path d="M4.6 11.5L6.1 4.5H8.2L6.7 11.5H4.6ZM13.8 4.7C13.4 4.5 12.7 4.4 12.1 4.4C10.5 4.4 9.4 5.2 9.4 6.4C9.4 7.3 10.2 7.8 10.8 8.1C11.4 8.4 11.6 8.6 11.6 8.9C11.6 9.3 11.1 9.6 10.6 9.6C9.9 9.6 9.4 9.4 9.1 9.2L8.6 10.7C9.1 10.9 10.0 11.1 10.8 11.1C12.5 11.1 13.6 10.3 13.6 9.1C13.6 8.1 13.0 7.6 12.0 7.1C11.4 6.8 11.1 6.6 11.1 6.3C11.1 6.0 11.5 5.7 12.2 5.7C12.7 5.7 13.2 5.8 13.5 6.0L13.8 4.7ZM17.9 4.5H16.2C15.7 4.5 15.3 4.7 15.1 5.2L12.3 11.5H14.5L14.9 10.2H17.6L17.9 11.5H19.9L18.2 4.5H17.9ZM15.5 8.7L16.8 5.6L17.3 8.7H15.5ZM2.8 4.5L1.1 5.7C0.8 5.9 0.6 6.1 0.6 6.5L0.5 11.5H2.6L2.6 7.4L3.4 11.5H5.4L7.8 4.5H5.7L4.4 9.0L3.5 4.5H2.8Z" fill="#FFF"/>
                        </svg>
                        {/* Mastercard SVG */}
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="16" rx="2" fill="#1E1E1E"/>
                          <circle cx="9.5" cy="8" r="5" fill="#EB001B"/>
                          <circle cx="14.5" cy="8" r="5" fill="#F79E1B"/>
                          <path d="M12 5.2C12.8 6.0 13.2 7.0 13.2 8C13.2 9.0 12.8 10.0 12 10.8C11.2 10.0 10.8 9.0 10.8 8C10.8 7.0 11.2 6.0 12 5.2Z" fill="#FF5F00"/>
                        </svg>
                      </div>
                    </div>

                    {paymentMethod === 'visa' && (
                      <div className="mt-3 p-3 rounded bg-black d-flex flex-column gap-2" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="row g-2">
                          <div className="col-12">
                            <input 
                              type="text" 
                              required 
                              name="number"
                              value={cardData.number}
                              onChange={handleCardInputChange}
                              placeholder="Số thẻ Visa (16 chữ số)" 
                              className={`form-control tech-input py-1 fs-8 ${cardErrors.number ? 'is-invalid border-danger' : ''}`}
                              maxLength="19"
                            />
                            {cardErrors.number && <span className="text-danger fs-8 mt-1 d-block">{cardErrors.number}</span>}
                          </div>
                          <div className="col-12">
                            <input 
                              type="text" 
                              required 
                              name="name"
                              value={cardData.name}
                              onChange={handleCardInputChange}
                              placeholder="Tên in trên thẻ (Ví dụ: NGUYEN VAN A)" 
                              className={`form-control tech-input py-1 fs-8 text-uppercase ${cardErrors.name ? 'is-invalid border-danger' : ''}`}
                            />
                            {cardErrors.name && <span className="text-danger fs-8 mt-1 d-block">{cardErrors.name}</span>}
                          </div>
                          <div className="col-6">
                            <input 
                              type="text" 
                              required 
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleCardInputChange}
                              placeholder="Hạn dùng (MM/YY)" 
                              className={`form-control tech-input py-1 fs-8 ${cardErrors.expiry ? 'is-invalid border-danger' : ''}`}
                              maxLength="5"
                            />
                            {cardErrors.expiry && <span className="text-danger fs-8 mt-1 d-block">{cardErrors.expiry}</span>}
                          </div>
                          <div className="col-6">
                            <input 
                              type="password" 
                              required 
                              name="cvc"
                              value={cardData.cvc}
                              onChange={handleCardInputChange}
                              placeholder="Mã bảo mật CVC/CVV" 
                              className={`form-control tech-input py-1 fs-8 ${cardErrors.cvc ? 'is-invalid border-danger' : ''}`}
                              maxLength="3"
                            />
                            {cardErrors.cvc && <span className="text-danger fs-8 mt-1 d-block">{cardErrors.cvc}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Option 3: ATM / Local Bank */}
                  <label 
                    className={`p-3 rounded border text-start cursor-pointer d-flex flex-column transition-smooth ${paymentMethod === 'atm' ? 'border-danger bg-danger bg-opacity-5' : 'border-secondary'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'atm'} 
                          onChange={() => setPaymentMethod('atm')}
                          className="form-check-input"
                          style={{ accentColor: 'var(--accent-red)' }}
                        />
                        <span className="fs-7 fw-medium text-white">Thẻ ATM Nội địa / Internet Banking</span>
                      </div>
                      <Landmark size={18} className="text-secondary" />
                    </div>

                    {paymentMethod === 'atm' && (
                      <div className="mt-3">
                        <label className="form-label text-muted fs-8 mb-1">Chọn Ngân hàng phát hành thẻ</label>
                        <select 
                          value={selectedBank} 
                          onChange={e => setSelectedBank(e.target.value)} 
                          className="form-select tech-input py-1 fs-8"
                        >
                          <option value="VCB">Vietcombank</option>
                          <option value="TCB">Techcombank</option>
                          <option value="BIDV">BIDV</option>
                          <option value="MB">MB Bank</option>
                          <option value="ACB">ACB</option>
                        </select>
                        <p className="text-muted fs-8 mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                          Hệ thống sẽ liên kết qua cổng Napas an toàn. Cần đăng ký Internet Banking để thực hiện giao dịch.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Option 4: MoMo */}
                  <label 
                    className={`p-3 rounded border text-start cursor-pointer d-flex flex-column transition-smooth ${paymentMethod === 'momo' ? 'border-danger bg-danger bg-opacity-5' : 'border-secondary'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'momo'} 
                          onChange={() => setPaymentMethod('momo')}
                          className="form-check-input"
                          style={{ accentColor: 'var(--accent-red)' }}
                        />
                        <span className="fs-7 fw-medium text-white">Ví Điện Tử MoMo</span>
                      </div>
                      
                      {/* MoMo Badge Logo SVG */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#A50064"/>
                        <path d="M12.062 14.77C12.87 14.77 13.525 14.116 13.525 13.308C13.525 12.502 12.871 11.846 12.062 11.846C11.254 11.846 10.598 12.502 10.598 13.308C10.598 14.116 11.254 14.77 12.062 14.77Z" fill="white"/>
                        <path d="M6.35 15.35V8.65H8.32V13.88H8.38L10.35 8.65H12.35L14.32 13.88H14.38V8.65H16.35V15.35H14.35L12.35 10.12H12.29L10.29 15.35H6.35Z" fill="white"/>
                      </svg>
                    </div>

                    {paymentMethod === 'momo' && (
                      <div className="mt-3 p-3 rounded bg-black d-flex flex-column align-items-center text-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="p-2 bg-white rounded">
                          <QrCode size={100} className="text-black" />
                        </div>
                        <span className="text-white fw-semibold fs-8 display-font">QUÉT MÃ QR ĐỂ THANH TOÁN</span>
                        <p className="text-muted fs-8 mb-0" style={{ fontSize: '0.72rem' }}>
                          Mở ứng dụng MoMo của bạn và quét mã QR này để thanh toán hóa đơn tạm tính của đơn hàng.
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Sticky bottom price and buttons */}
              <div className="mt-4 pt-3 text-start" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="d-flex justify-content-between mb-2 fs-7">
                  <span className="text-secondary">Tạm tính (Subtotal):</span>
                  <span className="text-white fw-medium">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fs-7">
                  <span className="text-secondary">Phí vận chuyển (Shipping):</span>
                  <span className="text-white fw-medium">
                    {cartShipping === 0 ? 'Miễn phí' : `${cartShipping.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2 fs-7">
                  <span className="text-secondary">Thuế (VAT):</span>
                  <span className="text-white fw-medium">Đã bao gồm (10%)</span>
                </div>
                <div className="d-flex justify-content-between mb-3 fs-7">
                  <span className="text-secondary">Giao hàng dự kiến:</span>
                  <span className="text-white fw-medium">2 - 3 ngày làm việc</span>
                </div>
                <div className="h-line w-100 my-2" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
                <div className="d-flex justify-content-between mb-4 align-items-center">
                  <span className="text-white fw-semibold">Tổng thanh toán:</span>
                  <span className="text-danger fw-bold fs-4 display-font">{cartTotal.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary flex-fill py-3 fs-7 text-white"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setCheckoutStep('cart')}
                  >
                    Quay Lại
                  </button>
                  <button 
                    type="submit" 
                    disabled={isOrdering}
                    className="btn btn-danger flex-fill py-3 glow-btn fs-7 d-flex align-items-center justify-content-center gap-2"
                  >
                    {isOrdering ? (
                      <Loader2 size={16} className="spinner-border spinner-border-sm border-0" />
                    ) : (
                      'Xác Nhận Mua'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation Receipt Page */}
        {checkoutStep === 'success' && placedOrder && (
          <div className="flex-grow-1 p-4 d-flex flex-column align-items-center justify-content-center text-center gap-4">
            <div className="p-3 bg-danger rounded-circle bg-opacity-10 d-inline-flex" style={{ color: 'var(--accent-red)' }}>
              <ShieldCheck size={64} className="pulse-glow-element" />
            </div>
            <div>
              <h3 className="fs-4 text-white mb-2 display-font">ĐẶT HÀNG THÀNH CÔNG!</h3>
              <p className="text-secondary fs-7">
                Cảm ơn bạn đã mua sắm tại NEXUS Tech. Đơn hàng của bạn đang được xử lý.
              </p>
            </div>

            {/* Receipt details */}
            <div className="w-100 text-start p-3 rounded bg-black" style={{ border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <p className="text-danger fw-semibold mb-2 uppercase tracking-widest">HÓA ĐƠN ĐƠN HÀNG</p>
              <p className="text-secondary mb-1">Mã đơn: <span className="text-white fw-bold display-font">#{placedOrder.id}</span></p>
              <p className="text-secondary mb-1">Khách hàng: <span className="text-white fw-medium">{placedOrder.customerName}</span></p>
              <p className="text-secondary mb-1">Số điện thoại: <span className="text-white fw-medium">{placedOrder.phone}</span></p>
              <p className="text-secondary mb-1">Giao tới: <span className="text-white fw-medium">{placedOrder.address}</span></p>
              <p className="text-secondary mb-1">Phương thức: <span className="text-white fw-medium text-capitalize">{placedOrder.paymentMethod}</span></p>
              <div className="h-line w-100 my-2" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
              <p className="text-secondary mb-1">
                Tổng cộng: <span className="text-danger fw-bold display-font fs-6">{placedOrder.total.toLocaleString('vi-VN')} ₫</span>
              </p>
              <p className="text-muted mb-0 fs-8 text-center mt-2" style={{ fontSize: '0.75rem' }}>
                Hóa đơn ảo được lưu trong Lịch sử mua hàng của bạn.
              </p>
            </div>

            <button 
              className="btn btn-danger w-100 py-3 glow-btn"
              onClick={handleSuccessClose}
            >
              Tiếp tục Mua sắm
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default CartDrawer

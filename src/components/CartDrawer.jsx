import { useContext, useState } from 'react'
import { CartContext } from '../context/CartContext'
import { X, Plus, Minus, Trash2, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const CartDrawer = ({ isOpen, onClose, setCurrentPage }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartShipping, 
    cartTotal,
    clearCart 
  } = useContext(CartContext)

  const [checkoutStep, setCheckoutStep] = useState('cart') // 'cart', 'checkout', 'success'
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrderSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.phone && formData.address) {
      setCheckoutStep('success')
    }
  }

  const handleSuccessClose = () => {
    clearCart()
    setCheckoutStep('cart')
    setFormData({ name: '', phone: '', address: '', note: '' })
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
                          <span className="fs-7 fw-bold display-font">${(item.price * item.quantity).toLocaleString()}</span>
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
                  <span className="text-white fw-medium display-font">${cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary fs-7">Vận chuyển:</span>
                  <span className="text-white fw-medium display-font">
                    {cartShipping === 0 ? 'Miễn phí' : `$${cartShipping.toLocaleString()}`}
                  </span>
                </div>
                {cartShipping > 0 && (
                  <p className="fs-8 text-secondary mb-3" style={{ fontSize: '0.75rem' }}>
                    *Miễn phí vận chuyển cho đơn hàng trên $500
                  </p>
                )}
                <div className="h-line w-100 my-3" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-white fw-semibold">Tổng thanh toán:</span>
                  <span className="text-danger fw-bold fs-4 display-font">${cartTotal.toLocaleString()}</span>
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

        {/* Step 2: Checkout Information Form */}
        {checkoutStep === 'checkout' && (
          <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column">
            <h3 className="fs-6 text-uppercase tracking-wider mb-4 display-font" style={{ color: 'var(--accent-red)' }}>
              Thông Tin Giao Hàng
            </h3>
            <form onSubmit={handleOrderSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control tech-input"
                  placeholder="Nhập họ và tên người nhận"
                />
              </div>
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control tech-input"
                  placeholder="Nhập số điện thoại liên hệ"
                />
              </div>
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Địa Chỉ Nhận Hàng</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control tech-input"
                  placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"
                />
              </div>
              <div>
                <label className="form-label text-secondary fs-7 mb-1">Ghi Chú Đơn Hàng (Tùy chọn)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-control tech-input"
                  placeholder="Lưu ý giao hàng, v.v."
                />
              </div>

              <div className="h-line w-100 my-3" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
              
              <div className="d-flex justify-content-between mb-3 fs-7">
                <span className="text-secondary">Tổng số tiền:</span>
                <span className="text-white fw-bold fs-5 display-font">${cartTotal.toLocaleString()}</span>
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary flex-fill py-2 fs-7"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  onClick={() => setCheckoutStep('cart')}
                >
                  Quay Lại
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger flex-fill py-2 glow-btn fs-7"
                >
                  Xác Nhận Mua
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation Receipt Page */}
        {checkoutStep === 'success' && (
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
            <div className="w-100 text-start p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <p className="text-danger fw-semibold mb-2">HÓA ĐƠN ĐƠN HÀNG</p>
              <p className="text-secondary mb-1">Khách hàng: <span className="text-white fw-medium">{formData.name}</span></p>
              <p className="text-secondary mb-1">Số điện thoại: <span className="text-white fw-medium">{formData.phone}</span></p>
              <p className="text-secondary mb-1">Giao tới: <span className="text-white fw-medium">{formData.address}</span></p>
              <div className="h-line w-100 my-2" style={{ borderTop: '1px dashed var(--border-color)' }}></div>
              <p className="text-secondary mb-1">
                Tổng cộng: <span className="text-danger fw-bold display-font fs-6">${cartTotal.toLocaleString()}</span>
              </p>
              <p className="text-muted mb-0 fs-8 text-center mt-2" style={{ fontSize: '0.75rem' }}>
                Hóa đơn ảo được tạo tự động bởi NEXUS Systems
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

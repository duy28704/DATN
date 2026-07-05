import { useState, useEffect, useContext } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthContext, AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { ToastProvider, useToast } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Installments from './pages/Installments'
import ProductDetail from './pages/ProductDetail'
import Compare from './pages/Compare'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManageProducts from './pages/ManageProducts'
import ManageUsers from './pages/ManageUsers'
import ManageTrash from './pages/ManageTrash'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ManageInventory from './pages/ManageInventory'
import ManageStats from './pages/ManageStats'
import Headerdashboard from './components/Headerdashboard'
import Sidebar from './components/Sidebar'
import Footerdashboard from './components/Footerdashboard'
import { motion, AnimatePresence } from 'framer-motion'
import CompareBar from './components/CompareBar'

function AppContent() {
  const [currentPage, setCurrentPageState] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartDrawerStep, setCartDrawerStep] = useState('cart')
  const { user } = useContext(AuthContext)
  const { showToast } = useToast()

  // Listen to VNPAY return URL callbacks in the hash
  useEffect(() => {
    const checkVnPayCallback = () => {
      const hash = window.location.hash
      if (hash.includes('vnpay=')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '')
        const vnpayStatus = urlParams.get('vnpay')
        const orderId = urlParams.get('orderId')
        
        if (vnpayStatus === 'success') {
          showToast({
            type: 'success',
            title: 'Thanh toán thành công',
            message: `Đơn hàng #${orderId} đã thanh toán thành công qua cổng VNPAY.`
          })
        } else if (vnpayStatus === 'fail') {
          const errorCode = urlParams.get('errorCode')
          showToast({
            type: 'error',
            title: 'Thanh toán không thành công',
            message: `Giao dịch VNPAY cho đơn hàng #${orderId} bị hủy hoặc lỗi. Mã lỗi: ${errorCode || 'đã hủy'}.`
          })
        } else if (vnpayStatus === 'error') {
          showToast({
            type: 'error',
            title: 'Lỗi xác minh',
            message: `Không thể xác thực chữ ký bảo mật giao dịch VNPAY cho đơn hàng #${orderId}.`
          })
        }
        
        // Clean up hash parameters to avoid showing toast repeatedly on refresh
        window.location.hash = hash.split('?')[0]
      }
    }

    checkVnPayCallback()
    window.addEventListener('hashchange', checkVnPayCallback)
    return () => window.removeEventListener('hashchange', checkVnPayCallback)
  }, [showToast])

  const handleOpenCart = (step = 'cart') => {
    setCartDrawerStep(step)
    setCartOpen(true)
  }

  const setCurrentPage = (pageString) => {
    setCurrentPageState(pageString)
    window.location.hash = pageString
  }

  // 1. Role-based redirect logic
  useEffect(() => {
    if (user) {
      if ((user.role === 'ADMIN' || user.role === 'STAFF') && !currentPage.startsWith('dashboard')) {
        setCurrentPage('dashboard')
      } else if (user.role === 'CUSTOMER' && currentPage.startsWith('dashboard')) {
        setCurrentPage('shop')
      } else {
        // Permission-based guards for dashboard screens
        const permissions = user.permissions || []
        let isAuthorized = true
        if (currentPage === 'dashboard/trash' && !permissions.includes('product.trash')) {
          isAuthorized = false
        } else if (currentPage === 'dashboard/users' && !permissions.includes('users.read')) {
          isAuthorized = false
        } else if (currentPage === 'dashboard/settings' && !permissions.includes('settings.manage')) {
          isAuthorized = false
        }

        if (!isAuthorized) {
          setCurrentPage('dashboard')
          showToast({
            type: 'error',
            title: 'Không có quyền truy cập',
            message: 'Tài khoản của bạn không có quyền thực hiện chức năng này.'
          })
        }
      }
    } else {
      if (currentPage.startsWith('dashboard')) {
        setCurrentPage('login')
      }
    }
  }, [user, currentPage, showToast])

  // 2. Global Event Listener for sidebar toggle button
  useEffect(() => {
    const handleToggleClick = (e) => {
      const btn = e.target.closest('.toggle-sidebar-btn')
      if (btn) {
        document.body.classList.toggle('toggle-sidebar')
      }
    }
    document.addEventListener('click', handleToggleClick)
    return () => document.removeEventListener('click', handleToggleClick)
  }, [])

  // 3. Router hash change listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash) {
        setCurrentPageState('home')
      } else if (hash.startsWith('product/')) {
        const id = hash.replace('product/', '')
        setSelectedProductId(id)
        setCurrentPageState(hash)
      } else if (hash.startsWith('shop')) {
        setCurrentPageState(hash)
      } else if (hash.startsWith('compare')) {
        setCurrentPageState(hash)
      } else if (hash.startsWith('installments')) {
        setCurrentPageState('installments')
      } else if (hash === 'login') {
        setCurrentPageState('login')
      } else if (hash.startsWith('dashboard')) {
        setCurrentPageState(hash)
      } else {
        setCurrentPageState('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderPage = () => {
    if (currentPage === 'home') {
      return <Home setCurrentPage={setCurrentPage} onSelectProduct={setSelectedProductId} />
    }
    if (currentPage.startsWith('shop')) {
      return <Shop currentPage={currentPage} onSelectProduct={setSelectedProductId} setCurrentPage={setCurrentPage} />
    }
    if (currentPage.startsWith('product/')) {
      return <ProductDetail key={selectedProductId} productId={selectedProductId} setCurrentPage={setCurrentPage} onSelectProduct={setSelectedProductId} onBuyNow={() => handleOpenCart('checkout')} />
    }
    if (currentPage === 'installments') {
      return <Installments setCurrentPage={setCurrentPage} />
    }
    if (currentPage.startsWith('compare')) {
      return <Compare setCurrentPage={setCurrentPage} />
    }
    if (currentPage === 'login') {
      return <Login setCurrentPage={setCurrentPage} />
    }
    return <Home setCurrentPage={setCurrentPage} onSelectProduct={setSelectedProductId} />
  }

  const renderDashboardContent = () => {
    if (currentPage === 'dashboard/products') {
      return <ManageProducts />
    }
    if (currentPage === 'dashboard/trash') {
      return <ManageTrash />
    }
    if (currentPage === 'dashboard/users') {
      return <ManageUsers />
    }
    if (currentPage === 'dashboard/profile') {
      return <Profile />
    }
    if (currentPage === 'dashboard/settings') {
      return <Settings />
    }
    if (currentPage === 'dashboard/inventory') {
      return <ManageInventory />
    }
    if (currentPage === 'dashboard/stats') {
      return <ManageStats />
    }
    return <Dashboard currentPage={currentPage} />
  }

  // 4. Render Layout based on page
  if (currentPage.startsWith('dashboard')) {
    return (
      <div className="admin-dashboard-layout">
        <Headerdashboard />
        <Sidebar currentPage={currentPage} />
        {renderDashboardContent()}
        <Footerdashboard />
        <ToastContainer />
      </div>
    )
  }

  return (
    <div id="root" className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} onCartOpen={() => handleOpenCart('cart')} />

      <main className="flex-grow-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage.split('?')[0]}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setCurrentPage={setCurrentPage} />

      <CompareBar setCurrentPage={setCurrentPage} />

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} setCurrentPage={setCurrentPage} initialStep={cartDrawerStep} />
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

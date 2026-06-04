import { useState, useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
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
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [currentPage, setCurrentPageState] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  const setCurrentPage = (pageString) => {
    setCurrentPageState(pageString)
    window.location.hash = pageString
  }

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
      return <ProductDetail key={selectedProductId} productId={selectedProductId} setCurrentPage={setCurrentPage} onSelectProduct={setSelectedProductId} />
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

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <div id="root" className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} onCartOpen={() => setCartOpen(true)} />

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

            <AnimatePresence>
              {cartOpen && (
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} setCurrentPage={setCurrentPage} />
              )}
            </AnimatePresence>

            {/* Toast Notification Container — top-right corner, slide from right */}
            <ToastContainer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

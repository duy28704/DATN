import { useState, useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [currentPage, setCurrentPageState] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  // Synchronization wrapper to update URL Hash in parallel
  const setCurrentPage = (pageString) => {
    setCurrentPageState(pageString)
    window.location.hash = pageString
  }

  // Hash-based router listener to enable back/forward browser navigation
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
      } else if (hash === 'login') {
        setCurrentPageState('login')
      } else {
        setCurrentPageState('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    // Run on mount
    handleHashChange()

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Page selection renderer
  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <Home 
          setCurrentPage={setCurrentPage} 
          onSelectProduct={setSelectedProductId} 
        />
      )
    }
    
    if (currentPage.startsWith('shop')) {
      return (
        <Shop 
          currentPage={currentPage}
          onSelectProduct={setSelectedProductId}
          setCurrentPage={setCurrentPage}
        />
      )
    }

    if (currentPage.startsWith('product/')) {
      return (
        <ProductDetail 
          key={selectedProductId}
          productId={selectedProductId}
          setCurrentPage={setCurrentPage}
          onSelectProduct={setSelectedProductId}
        />
      )
    }

    if (currentPage === 'login') {
      return (
        <Login 
          setCurrentPage={setCurrentPage} 
        />
      )
    }

    // Default fallback
    return <Home setCurrentPage={setCurrentPage} onSelectProduct={setSelectedProductId} />
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div id="root" className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {/* Sticky Header Navigation */}
          <Header 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            onCartOpen={() => setCartOpen(true)} 
          />

          {/* Animate Page Transitions using Framer Motion */}
          <main className="flex-grow-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage.split('?')[0]} // Ignore query params for page change transitions
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Persistent Footer */}
          <Footer setCurrentPage={setCurrentPage} />

          {/* Floating Slide-out Cart Panel */}
          <AnimatePresence>
            {cartOpen && (
              <CartDrawer 
                isOpen={cartOpen} 
                onClose={() => setCartOpen(false)} 
                setCurrentPage={setCurrentPage}
              />
            )}
          </AnimatePresence>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

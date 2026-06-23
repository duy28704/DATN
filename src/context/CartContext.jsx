/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { ToastContext } from './ToastContext'
import { AuthContext } from './AuthContext'
import { ProductContext } from './ProductContext'
import { apiService } from '../services/api'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const { products } = useContext(ProductContext)
  const toastCtx = useContext(ToastContext)

  // Initialize cart as an empty list (will be populated from the API when logged in)
  const [cartItems, setCartItems] = useState([])

  // Load user-specific cart from API when user logs in
  useEffect(() => {
    let active = true
    if (user && user.email) {
      apiService.cart.get()
        .then(data => {
          if (active) {
            setCartItems(data || [])
          }
        })
        .catch(err => {
          console.error('[CartContext] Error fetching cart from API', err)
          if (active) {
            setCartItems([])
          }
        })
    } else {
      setCartItems([])
    }
    return () => {
      active = false
    }
  }, [user])

  // Add item to cart with login check
  const addToCart = useCallback((product, quantity = 1, configuration = 'Standard') => {
    if (!user) {
      if (toastCtx?.showToast) {
        toastCtx.showToast({
          type: 'error',
          title: 'Yêu cầu đăng nhập',
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
          duration: 3500
        })
      }
      return
    }

    // Fast state update
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.configuration === configuration
      )

      if (existingItemIndex > -1) {
        const newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      } else {
        return [...prevItems, { id: product.id, quantity, configuration }]
      }
    })

    // Async sync in background
    apiService.cart.add(product.id, quantity, configuration)
      .catch(err => {
        console.error('[CartContext] Error adding item to database', err)
      })

    // Show Toast notification
    if (toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'cart',
        title: 'Đã thêm vào giỏ hàng',
        message: `${product.name} — Cấu hình: ${configuration}`,
        image: product.image,
        duration: 3500
      })
    }
  }, [toastCtx, user])

  const removeFromCart = useCallback((productId, configuration) => {
    // Fast state update
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.configuration === configuration)
      )
    )

    // Async sync in background
    apiService.cart.remove(productId, configuration)
      .catch(err => {
        console.error('[CartContext] Error removing item from database', err)
      })
  }, [])

  const updateQuantity = useCallback((productId, configuration, amount) => {
    // Fast state update & determine backend sync
    setCartItems((prevItems) => {
      const item = prevItems.find(i => i.id === productId && i.configuration === configuration)
      if (!item) return prevItems

      const newQty = item.quantity + amount

      // Async sync in background
      if (newQty <= 0) {
        apiService.cart.remove(productId, configuration)
          .catch(err => console.error('[CartContext] Error removing quantity', err))
      } else {
        apiService.cart.updateQuantity(productId, configuration, newQty)
          .catch(err => console.error('[CartContext] Error updating quantity', err))
      }

      return prevItems
        .map((i) => {
          if (i.id === productId && i.configuration === configuration) {
            return { ...i, quantity: newQty }
          }
          return i
        })
        .filter((i) => i.quantity > 0)
    })
  }, [])

  const clearCart = useCallback(() => {
    // Fast state update
    setCartItems([])

    // Async sync in background
    apiService.cart.clear()
      .catch(err => {
        console.error('[CartContext] Error clearing database cart', err)
      })
  }, [])

  // Resolve cart item details and prices dynamically against catalog products
  const resolvedCartItems = useMemo(() => {
    return cartItems
      .map((item) => {
        const catalogProd = products.find((p) => String(p.id) === String(item.id))
        if (catalogProd) {
          return {
            ...item,
            name: catalogProd.name,
            price: catalogProd.price,
            displayPrice: catalogProd.displayPrice,
            image: catalogProd.image,
            imagesList: catalogProd.imagesList
          }
        }
        return null
      })
      .filter(Boolean)
  }, [cartItems, products])

  // Calculate totals
  const cartCount = resolvedCartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = resolvedCartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartShipping = cartSubtotal > 15000000 || cartSubtotal === 0 ? 0 : 50000
  const cartTotal = cartSubtotal + cartShipping

  return (
    <CartContext.Provider
      value={{
        cartItems: resolvedCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartShipping,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

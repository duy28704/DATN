/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { ToastContext } from './ToastContext'
import { AuthContext } from './AuthContext'
import { ProductContext } from './ProductContext'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const { products } = useContext(ProductContext)
  const toastCtx = useContext(ToastContext)

  // Initialize cart dynamically based on the currently logged-in user
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('nexus_user')
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr)
        if (savedUser && savedUser.email) {
          const savedCart = localStorage.getItem(`nexus_cart_${savedUser.email}`)
          return savedCart ? JSON.parse(savedCart) : []
        }
      }
      return []
    } catch (e) {
      console.error('Error loading cart from localStorage', e)
      return []
    }
  })

  // Load user-specific cart when user authentication state changes
  useEffect(() => {
    if (user && user.email) {
      const savedCart = localStorage.getItem(`nexus_cart_${user.email}`)
      setCartItems(savedCart ? JSON.parse(savedCart) : [])
    } else {
      setCartItems([])
    }
  }, [user])

  // Save cart items to user-specific local storage when cart changes
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`nexus_cart_${user.email}`, JSON.stringify(cartItems))
    }
  }, [cartItems, user])

  // Add item to cart with login check
  const addToCart = useCallback((product, quantity = 1, selectedColor = 'Standard') => {
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

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedColor === selectedColor
      )

      if (existingItemIndex > -1) {
        const newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      } else {
        return [...prevItems, { id: product.id, quantity, selectedColor }]
      }
    })

    // Show Toast notification
    if (toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'cart',
        title: 'Đã thêm vào giỏ hàng',
        message: `${product.name} — Màu: ${selectedColor}`,
        image: product.image,
        duration: 3500
      })
    }
  }, [toastCtx, user])

  const removeFromCart = (productId, selectedColor) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.selectedColor === selectedColor)
      )
    )
  }

  const updateQuantity = (productId, selectedColor, amount) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId && item.selectedColor === selectedColor) {
            const newQty = item.quantity + amount
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

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

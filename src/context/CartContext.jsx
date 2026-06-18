/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { ToastContext } from './ToastContext'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('nexus_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (e) {
      console.error('Error loading cart from localStorage', e)
      return []
    }
  })

  // Toast context (may be null if ToastProvider not yet mounted — safe guard)
  const toastCtx = useContext(ToastContext)

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product, quantity = 1, selectedColor = 'Standard') => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedColor === selectedColor
      )

      if (existingItemIndex > -1) {
        const newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      } else {
        return [...prevItems, { ...product, quantity, selectedColor }]
      }
    })

    // Show Toast notification instead of browser alert
    if (toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'cart',
        title: 'Đã thêm vào giỏ hàng',
        message: `${product.name} — Màu: ${selectedColor}`,
        image: product.image,
        duration: 3500
      })
    }
  }, [toastCtx])

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

  // Calculate totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartShipping = cartSubtotal > 15000000 || cartSubtotal === 0 ? 0 : 50000
  const cartTotal = cartSubtotal + cartShipping

  return (
    <CartContext.Provider
      value={{
        cartItems,
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

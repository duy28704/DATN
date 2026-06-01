/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'

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

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1, selectedColor = 'Standard') => {
    setCartItems((prevItems) => {
      // Find if item already exists in cart with same product and color
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
  }

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
        .filter((item) => item.quantity > 0) // Remove if quantity drops to 0
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Calculate totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartShipping = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 35 // Free shipping above $500
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

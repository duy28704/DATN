import { createContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products'

export const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(fallbackCategories)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await apiService.products.getAll()
      if (data && data.length > 0) {
        // Transform database models to frontend UI format
        const transformed = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || 'computing',
          price: parseFloat(item.price) || 0,
          rating: item.rating || 5.0,
          reviewCount: item.reviewCount || 0,
          tag: item.tag,
          image: item.images || '',
          shortDescription: item.shortDescription || item.description || '',
          description: item.description || '',
          specs: item.specsJson ? JSON.parse(item.specsJson) : {},
          reviews: item.reviewsJson ? JSON.parse(item.reviewsJson) : []
        }))
        setProducts(transformed)
        setError(null)
      } else {
        // Empty DB, fallback
        setProducts(fallbackProducts)
      }
    } catch (err) {
      console.warn('[ProductContext] Error loading products from database, falling back to local dataset:', err)
      setError('Sử dụng dữ liệu cục bộ dự phòng (offline mode).')
      setProducts(fallbackProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <ProductContext.Provider value={{ products, categories, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

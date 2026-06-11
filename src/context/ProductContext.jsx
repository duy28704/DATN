import { createContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

export const ProductContext = createContext()

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'wearables', name: 'Thiết bị Đeo' },
  { id: 'audio', name: 'Âm thanh' },
  { id: 'computing', name: 'Máy tính' },
  { id: 'input', name: 'Thiết bị ngoại vi' }
]

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(CATEGORIES)
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
        setProducts([])
        setError(null)
      }
    } catch (err) {
      console.error('[ProductContext] Error loading products from database:', err)
      setError('Lỗi khi tải danh sách sản phẩm từ máy chủ.')
      setProducts([])
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


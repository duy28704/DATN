/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { apiService } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexus_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (e) {
      console.error('Error loading user from localStorage', e)
      return null
    }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const fetchedUser = await apiService.auth.login(email, password)
      setUser(fetchedUser)
      localStorage.setItem('nexus_user', JSON.stringify(fetchedUser))
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      setLoading(false)
      return false
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError('')
    try {
      const fetchedUser = await apiService.auth.register(name, email, password)
      setUser(fetchedUser)
      localStorage.setItem('nexus_user', JSON.stringify(fetchedUser))
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.')
      setLoading(false)
      return false
    }
  }

  const updateUserProfile = async (updatedFields) => {
    if (!user) return false
    setLoading(true)
    setError('')
    try {
      const updatedUser = await apiService.auth.updateProfile(user.email, updatedFields)
      setUser(updatedUser)
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Cập nhật hồ sơ thất bại.')
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiService.auth.logout()
    } catch (err) {
      console.error('[API] Logout call failed:', err)
    }
    setUser(null)
    localStorage.removeItem('nexus_user')
  }

  return (
    <AuthContext.Provider value={{ user, error, loading, login, register, updateUserProfile, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}


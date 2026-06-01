/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'

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
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // Simplistic mockup credentials verification
    if (email && password.length >= 6) {
      const mockUser = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        joinedDate: new Date().toLocaleDateString('vi-VN')
      }
      setUser(mockUser)
      localStorage.setItem('nexus_user', JSON.stringify(mockUser))
      setLoading(false)
      return true
    } else {
      setError('Email hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 6 ký tự).')
      setLoading(false)
      return false
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError('')
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (name && email && password.length >= 6) {
      const mockUser = {
        name: name,
        email: email,
        joinedDate: new Date().toLocaleDateString('vi-VN')
      }
      setUser(mockUser)
      localStorage.setItem('nexus_user', JSON.stringify(mockUser))
      setLoading(false)
      return true
    } else {
      setError('Vui lòng nhập đầy đủ thông tin và mật khẩu dài tối thiểu 6 ký tự.')
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('nexus_user')
  }

  return (
    <AuthContext.Provider value={{ user, error, loading, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

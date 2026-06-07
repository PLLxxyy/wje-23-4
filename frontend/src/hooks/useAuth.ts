import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/api'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@shared/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const data: LoginRequest = { username, password }
    const res = await api.post<AuthResponse>('/auth/login', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    navigate('/')
  }

  const register = async (username: string, password: string, name: string) => {
    const data: RegisterRequest = { username, password, name }
    const res = await api.post<AuthResponse>('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return { user, loading, login, register, logout }
}

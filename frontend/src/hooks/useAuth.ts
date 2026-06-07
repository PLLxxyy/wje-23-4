import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/api'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
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
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    navigate('/')
  }

  const register = async (username: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { username, password, name })
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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ChefHat } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">个人菜谱收藏</h1>
          <p className="text-gray-500 mt-2">记录和分享你的美食</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">登录</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              登录
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            还没有账号？<Link to="/register" className="text-orange-500 hover:text-orange-600">去注册</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

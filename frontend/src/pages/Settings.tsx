import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Settings as SettingsIcon, User, Lock } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('资料已更新')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('密码已修改')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-orange-600" />
        设置
      </h1>

      {message && (
        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{message}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-400" />
          个人资料
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input type="text" value={user?.username || ''} disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <button type="submit"
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
            保存
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-400" />
          修改密码
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <button type="submit"
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
            修改密码
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">关于</h2>
        <p className="text-sm text-gray-500">个人菜谱收藏 v1.0.0</p>
        <p className="text-sm text-gray-400 mt-1">记录和分享你的美食</p>
      </div>
    </div>
  )
}

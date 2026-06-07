import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, Check, ClipboardList } from 'lucide-react'

export default function ShoppingList() {
  const [items, setItems] = useState<string[]>([])
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [customItem, setCustomItem] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('shoppingList')
    if (saved) {
      setItems(saved.split('\n').filter(Boolean))
    }
  }, [])

  const toggleCheck = (index: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const removeItem = (index: number) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      localStorage.setItem('shoppingList', next.join('\n'))
      return next
    })
    setChecked(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const addCustomItem = () => {
    if (!customItem.trim()) return
    setItems(prev => {
      const next = [...prev, customItem.trim()]
      localStorage.setItem('shoppingList', next.join('\n'))
      return next
    })
    setCustomItem('')
  }

  const clearAll = () => {
    if (!confirm('确定清空购物清单吗？')) return
    setItems([])
    setChecked(new Set())
    localStorage.removeItem('shoppingList')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-500" />
          购物清单
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customItem}
          onChange={e => setCustomItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustomItem()}
          placeholder="添加自定义物品..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onClick={addCustomItem}
          className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          添加
        </button>
      </div>

      {items.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 ${checked.has(index) ? 'bg-gray-50' : ''}`}
            >
              <button
                onClick={() => toggleCheck(index)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  checked.has(index)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {checked.has(index) && <Check className="w-3 h-3" />}
              </button>
              <span className={`flex-1 ${checked.has(index) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item}
              </span>
              <button
                onClick={() => removeItem(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>购物清单为空</p>
          <p className="text-sm mt-1">从菜谱详情页一键生成购物清单</p>
        </div>
      )}
    </div>
  )
}

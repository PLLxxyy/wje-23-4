import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import DifficultyBadge from '@/components/DifficultyBadge'
import type { Recipe } from '@shared/types'
import { Clock, ChefHat, SlidersHorizontal } from 'lucide-react'
import { CUISINE_OPTIONS } from '@/utils/format'

export default function Home() {
  const { recipes, loading } = useRecipes()
  const [cuisineFilter, setCuisineFilter] = useState('全部')
  const [difficultyFilter, setDifficultyFilter] = useState('全部')
  const [maxTime, setMaxTime] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...recipes]
    if (cuisineFilter !== '全部') {
      result = result.filter(r => r.cuisine === cuisineFilter)
    }
    if (difficultyFilter !== '全部') {
      result = result.filter(r => r.difficulty === difficultyFilter)
    }
    if (maxTime) {
      result = result.filter(r => r.cookTime <= Number(maxTime))
    }
    return result
  }, [recipes, cuisineFilter, difficultyFilter, maxTime])

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">菜谱瀑布流</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">菜系</label>
              <select
                value={cuisineFilter}
                onChange={e => setCuisineFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option>全部</option>
                {CUISINE_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">难度</label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="全部">全部</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最长时间(分钟)</label>
              <input
                type="number"
                value={maxTime}
                onChange={e => setMaxTime(e.target.value)}
                placeholder="不限"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map(recipe => (
          <Link
            key={recipe.id}
            to={`/recipes/${recipe.id}`}
            className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow break-inside-avoid"
          >
            {recipe.photo ? (
              <img src={recipe.photo} alt={recipe.title} className="w-full object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-gray-300" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{recipe.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{recipe.cuisine}</p>
              <div className="flex items-center justify-between">
                <DifficultyBadge difficulty={recipe.difficulty} />
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  {recipe.cookTime}分钟
                </div>
              </div>
              {recipe.authorName && (
                <p className="text-xs text-gray-400 mt-2">by {recipe.authorName}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无菜谱</p>
          <p className="text-sm mt-1">点击左侧发布按钮添加第一道菜谱</p>
        </div>
      )}
    </div>
  )
}

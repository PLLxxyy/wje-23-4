import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/utils/api'
import StarRating from '@/components/StarRating'
import DifficultyBadge from '@/components/DifficultyBadge'
import { Recipe, Ingredient, Step, Review } from '@/types'
import { ArrowLeft, Clock, Heart, ShoppingCart, ChefHat, Star, User } from 'lucide-react'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, ingRes, stepRes, reviewRes, favRes] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get(`/recipes/${id}/ingredients`),
          api.get(`/recipes/${id}/steps`),
          api.get(`/recipes/${id}/reviews`),
          api.get(`/recipes/${id}/favorite`).catch(() => ({ data: { isFavorited: false } }))
        ])
        setRecipe(recipeRes.data)
        setIngredients(ingRes.data)
        setSteps(stepRes.data.sort((a: Step, b: Step) => a.orderNum - b.orderNum))
        setReviews(reviewRes.data)
        setIsFavorited(favRes.data.isFavorited)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleFavorite = async () => {
    if (isFavorited) {
      await api.delete(`/recipes/${id}/favorite`)
      setIsFavorited(false)
    } else {
      await api.post(`/recipes/${id}/favorite`)
      setIsFavorited(true)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userRating) return
    const res = await api.post(`/recipes/${id}/reviews`, { rating: userRating, comment: userComment })
    setReviews(prev => [res.data, ...prev])
    setUserRating(0)
    setUserComment('')
  }

  const handleShoppingList = () => {
    const list = ingredients.map(i => `${i.name} ${i.amount}`).join('\n')
    localStorage.setItem('shoppingList', list)
    navigate('/shopping-list')
  }

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>
  if (!recipe) return <div className="text-center py-20 text-gray-500">菜谱不存在</div>

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{recipe.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              isFavorited ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorited ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={handleShoppingList}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            购物清单
          </button>
        </div>
      </div>

      {recipe.photo && (
        <img src={recipe.photo} alt={recipe.title} className="w-full max-h-96 object-cover rounded-lg" />
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <DifficultyBadge difficulty={recipe.difficulty} />
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {recipe.cookTime}分钟
        </div>
        <div className="flex items-center gap-1">
          <ChefHat className="w-4 h-4" />
          {recipe.cuisine}
        </div>
        {avgRating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {avgRating} ({reviews.length}条评价)
          </div>
        )}
        {recipe.authorName && (
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {recipe.authorName}
          </div>
        )}
      </div>

      {recipe.description && (
        <p className="text-gray-600">{recipe.description}</p>
      )}

      {/* Ingredients */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">食材清单</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ingredients.map(ing => (
            <div key={ing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{ing.name}</span>
              <span className="text-sm text-gray-500">{ing.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">烹饪步骤</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-700">{step.content}</p>
                {step.photo && (
                  <img src={step.photo} alt={`步骤${index + 1}`} className="mt-2 w-48 h-32 object-cover rounded-lg" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">评价</h2>

        <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <p className="text-sm text-gray-600">给这道菜打分</p>
          <StarRating rating={userRating} onChange={setUserRating} />
          <textarea
            value={userComment}
            onChange={e => setUserComment(e.target.value)}
            placeholder="写下你的评价..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!userRating}
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors"
          >
            提交评价
          </button>
        </form>

        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{review.userName}</span>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <StarRating rating={review.rating} size={16} />
              {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无评价，来做第一个评价的人吧</p>}
        </div>
      </div>
    </div>
  )
}

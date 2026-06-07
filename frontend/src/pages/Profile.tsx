import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/utils/api'
import { Recipe, Review, Follow } from '@/types'
import { User, ChefHat, Star, Heart, Users } from 'lucide-react'

export default function Profile() {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [following, setFollowing] = useState<Follow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, reviewsRes, followingRes] = await Promise.all([
          api.get('/recipes/my'),
          api.get('/reviews/my'),
          api.get('/follows')
        ])
        setMyRecipes(recipesRes.data)
        setMyReviews(reviewsRes.data)
        setFollowing(followingRes.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUnfollow = async (id: number) => {
    await api.delete(`/follows/${id}`)
    setFollowing(prev => prev.filter(f => f.id !== id))
  }

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <User className="w-6 h-6 text-orange-500" />
        我的主页
      </h1>

      {/* My Recipes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-orange-500" />
          我的菜谱 ({myRecipes.length})
        </h2>
        {myRecipes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {myRecipes.map(recipe => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                {recipe.photo && (
                  <img src={recipe.photo} alt={recipe.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <p className="font-medium text-gray-800">{recipe.title}</p>
                <p className="text-sm text-gray-500">{recipe.cuisine}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">还没有发布菜谱</p>
        )}
      </div>

      {/* My Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          做过的菜 ({myReviews.length})
        </h2>
        {myReviews.length > 0 ? (
          <div className="space-y-3">
            {myReviews.map(review => (
              <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">菜谱 #{review.recipeId}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">还没有评价记录</p>
        )}
      </div>

      {/* Following */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-orange-500" />
          关注的人 ({following.length})
        </h2>
        {following.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {following.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                    {f.followingName?.[0]}
                  </div>
                  <span className="text-sm text-gray-700">{f.followingName}</span>
                </div>
                <button
                  onClick={() => handleUnfollow(f.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  取消关注
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">还没有关注任何人</p>
        )}
      </div>
    </div>
  )
}

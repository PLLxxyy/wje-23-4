export interface User {
  id: number
  username: string
  name: string
}

export interface Recipe {
  id: number
  userId: number
  title: string
  cuisine: string
  difficulty: string
  cookTime: number
  photo?: string
  description?: string
  createdAt: string
  authorName?: string
}

export interface Ingredient {
  id: number
  recipeId: number
  name: string
  amount: string
  orderNum: number
}

export interface Step {
  id: number
  recipeId: number
  orderNum: number
  content: string
  photo?: string
}

export interface Review {
  id: number
  recipeId: number
  userId: number
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ReviewWithRecipe extends Review {
  recipeTitle: string
}

export interface Favorite {
  id: number
  userId: number
  recipeId: number
  createdAt: string
}

export interface Follow {
  id: number
  followerId: number
  followingId: number
  followingName: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CreateRecipeRequest {
  title: string
  cuisine: string
  difficulty: string
  cookTime: number
  photo?: string
  description?: string
  ingredients?: Array<{ name: string; amount: string }>
  steps?: Array<{ content: string; photo?: string }>
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface CreateFollowRequest {
  username: string
}

export interface FavoriteStatusResponse {
  isFavorited: boolean
}

export interface SuccessResponse {
  success: boolean
}

export interface ErrorResponse {
  error: string
}

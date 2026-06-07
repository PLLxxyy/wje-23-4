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

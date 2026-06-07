import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../database'
import jwt from 'jsonwebtoken'
import type { ReviewWithRecipe, ErrorResponse } from '../../shared/types'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pdd-169-secret-key'

interface AuthRequest extends Request {
  userId?: number
}

function authMiddleware(req: AuthRequest, res: Response<ErrorResponse>, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期' })
  }
}

router.get('/my', authMiddleware, (req: AuthRequest, res: Response<ReviewWithRecipe[] | ErrorResponse>) => {
  const reviews = db.prepare(`
    SELECT r.*, rec.title as recipe_title
    FROM reviews r
    JOIN recipes rec ON r.recipe_id = rec.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.userId) as Array<{
    id: number
    recipe_id: number
    recipe_title: string
    user_id: number
    user_name: string
    rating: number
    comment: string | null
    created_at: string
  }>
  res.json(reviews.map((r): ReviewWithRecipe => ({
    id: r.id,
    recipeId: r.recipe_id,
    recipeTitle: r.recipe_title,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment ?? '',
    createdAt: r.created_at
  })))
})

export default router

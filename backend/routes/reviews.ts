import { Router } from 'express'
import { db } from '../database'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pdd-169-secret-key'

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期' })
  }
}

router.get('/my', authMiddleware, (req: any, res) => {
  const reviews = db.prepare(`
    SELECT r.*, rec.title as recipe_title
    FROM reviews r
    JOIN recipes rec ON r.recipe_id = rec.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.userId)
  res.json(reviews.map((r: any) => ({
    id: r.id,
    recipeId: r.recipe_id,
    recipeTitle: r.recipe_title,
    userId: r.user_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  })))
})

export default router

import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../database'
import jwt from 'jsonwebtoken'
import type { Follow, CreateFollowRequest, SuccessResponse, ErrorResponse } from '../../shared/types'

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

router.use(authMiddleware)

router.get('/', (req: AuthRequest, res: Response<Follow[] | ErrorResponse>) => {
  const follows = db.prepare(`
    SELECT f.id, f.follower_id, f.following_id, f.created_at, u.name as following_name
    FROM follows f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `).all(req.userId) as Array<{
    id: number
    follower_id: number
    following_id: number
    created_at: string
    following_name: string
  }>

  res.json(follows.map((f): Follow => ({
    id: f.id,
    followerId: f.follower_id,
    followingId: f.following_id,
    followingName: f.following_name,
    createdAt: f.created_at
  })))
})

router.post('/', (req: AuthRequest & Request<{}, {}, CreateFollowRequest>, res: Response<Follow | ErrorResponse>) => {
  const { username } = req.body
  if (!username) {
    return res.status(400).json({ error: '请填写用户名' })
  }

  const user = db.prepare('SELECT id, name FROM users WHERE username = ?').get(username) as { id: number; name: string } | undefined
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  if (user.id === req.userId) {
    return res.status(400).json({ error: '不能关注自己' })
  }

  const existing = db.prepare(
    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?'
  ).get(req.userId, user.id)

  if (existing) {
    return res.status(400).json({ error: '已关注该用户' })
  }

  const result = db.prepare(
    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)'
  ).run(req.userId, user.id)

  const response: Follow = {
    id: result.lastInsertRowid as number,
    followerId: req.userId!,
    followingId: user.id,
    followingName: user.name,
    createdAt: new Date().toISOString()
  }
  res.json(response)
})

router.delete('/:id', (req: AuthRequest & Request<{ id: string }>, res: Response<SuccessResponse | ErrorResponse>) => {
  db.prepare('DELETE FROM follows WHERE id = ? AND follower_id = ?')
    .run(req.params.id, req.userId)
  res.json({ success: true })
})

export default router

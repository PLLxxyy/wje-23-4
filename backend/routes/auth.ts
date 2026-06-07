import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../database'
import type { User, LoginRequest, RegisterRequest, AuthResponse, ErrorResponse } from '../../shared/types'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pdd-169-secret-key'

function generateToken(user: { id: number; username: string }) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', (req: Request<{}, {}, RegisterRequest>, res: Response<AuthResponse | ErrorResponse>) => {
  const { username, password, name } = req.body
  if (!username || !password || !name) {
    return res.status(400).json({ error: '请填写所有必填项' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' })
  }

  const hashed = bcrypt.hashSync(password, 10)
  const result = db.prepare(
    'INSERT INTO users (username, password, name) VALUES (?, ?, ?)'
  ).run(username, hashed, name)

  const user: User = { id: result.lastInsertRowid as number, username, name }
  const token = generateToken(user)
  res.json({ token, user })
})

router.post('/login', (req: Request<{}, {}, LoginRequest>, res: Response<AuthResponse | ErrorResponse>) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number; username: string; name: string; password: string } | undefined
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = generateToken(user)
  const responseUser: User = { id: user.id, username: user.username, name: user.name }
  res.json({
    token,
    user: responseUser
  })
})

export default router

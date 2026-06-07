import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../database'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'pdd-169-secret-key'

function generateToken(user: any) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', (req, res) => {
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

  const user = { id: result.lastInsertRowid, username, name }
  const token = generateToken(user)
  res.json({ token, user })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' })
  }

  const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = generateToken(user)
  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name }
  })
})

export default router

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

router.get('/', (req: any, res) => {
  const recipes = db.prepare(`
    SELECT r.*, u.name as author_name
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `).all()
  res.json(recipes.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    cuisine: r.cuisine,
    difficulty: r.difficulty,
    cookTime: r.cook_time,
    photo: r.photo,
    description: r.description,
    authorName: r.author_name,
    createdAt: r.created_at
  })))
})

router.get('/my', authMiddleware, (req: any, res) => {
  const recipes = db.prepare(
    'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId)
  res.json(recipes.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    cuisine: r.cuisine,
    difficulty: r.difficulty,
    cookTime: r.cook_time,
    photo: r.photo,
    description: r.description,
    createdAt: r.created_at
  })))
})

router.get('/:id', (req: any, res) => {
  const recipe: any = db.prepare(`
    SELECT r.*, u.name as author_name
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(req.params.id)

  if (!recipe) return res.status(404).json({ error: '菜谱不存在' })

  res.json({
    id: recipe.id,
    userId: recipe.user_id,
    title: recipe.title,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    cookTime: recipe.cook_time,
    photo: recipe.photo,
    description: recipe.description,
    authorName: recipe.author_name,
    createdAt: recipe.created_at
  })
})

router.post('/', authMiddleware, (req: any, res) => {
  const { title, cuisine, difficulty, cookTime, photo, description, ingredients, steps } = req.body
  if (!title || !cuisine || !difficulty || !cookTime) {
    return res.status(400).json({ error: '请填写必填项' })
  }

  const result = db.prepare(`
    INSERT INTO recipes (user_id, title, cuisine, difficulty, cook_time, photo, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, title, cuisine, difficulty, cookTime, photo || null, description || null)

  const recipeId = result.lastInsertRowid as number

  if (ingredients && ingredients.length > 0) {
    const stmt = db.prepare('INSERT INTO ingredients (recipe_id, name, amount, order_num) VALUES (?, ?, ?, ?)')
    ingredients.forEach((ing: any, index: number) => {
      stmt.run(recipeId, ing.name, ing.amount, index)
    })
  }

  if (steps && steps.length > 0) {
    const stmt = db.prepare('INSERT INTO steps (recipe_id, order_num, content, photo) VALUES (?, ?, ?, ?)')
    steps.forEach((step: any, index: number) => {
      stmt.run(recipeId, index + 1, step.content, step.photo || null)
    })
  }

  const recipe: any = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId)
  res.json({
    id: recipe.id,
    userId: recipe.user_id,
    title: recipe.title,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    cookTime: recipe.cook_time,
    photo: recipe.photo,
    description: recipe.description,
    createdAt: recipe.created_at
  })
})

router.get('/:id/ingredients', (req: any, res) => {
  const ingredients = db.prepare(
    'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY order_num'
  ).all(req.params.id)
  res.json(ingredients.map((i: any) => ({
    id: i.id,
    recipeId: i.recipe_id,
    name: i.name,
    amount: i.amount,
    orderNum: i.order_num
  })))
})

router.get('/:id/steps', (req: any, res) => {
  const steps = db.prepare(
    'SELECT * FROM steps WHERE recipe_id = ? ORDER BY order_num'
  ).all(req.params.id)
  res.json(steps.map((s: any) => ({
    id: s.id,
    recipeId: s.recipe_id,
    orderNum: s.order_num,
    content: s.content,
    photo: s.photo
  })))
})

router.get('/:id/reviews', (req: any, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.recipe_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id)
  res.json(reviews.map((r: any) => ({
    id: r.id,
    recipeId: r.recipe_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  })))
})

router.post('/:id/reviews', authMiddleware, (req: any, res) => {
  const { rating, comment } = req.body
  if (!rating) {
    return res.status(400).json({ error: '请评分' })
  }

  const result = db.prepare(`
    INSERT INTO reviews (recipe_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(req.params.id, req.userId, rating, comment || null)

  const review: any = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid)
  const user: any = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId)

  res.json({
    id: review.id,
    recipeId: review.recipe_id,
    userId: review.user_id,
    userName: user.name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at
  })
})

router.get('/:id/favorite', authMiddleware, (req: any, res) => {
  const fav: any = db.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?'
  ).get(req.userId, req.params.id)
  res.json({ isFavorited: !!fav })
})

router.post('/:id/favorite', authMiddleware, (req: any, res) => {
  try {
    db.prepare(
      'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)'
    ).run(req.userId, req.params.id)
    res.json({ success: true })
  } catch {
    res.status(400).json({ error: '已收藏' })
  }
})

router.delete('/:id/favorite', authMiddleware, (req: any, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
    .run(req.userId, req.params.id)
  res.json({ success: true })
})

export default router

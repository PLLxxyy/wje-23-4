import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../database'
import jwt from 'jsonwebtoken'
import type { Recipe, Ingredient, Step, Review, CreateRecipeRequest, CreateReviewRequest, FavoriteStatusResponse, SuccessResponse, ErrorResponse } from '../../shared/types'

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

router.get('/', (req: Request, res: Response<Recipe[]>) => {
  const recipes = db.prepare(`
    SELECT r.*, u.name as author_name
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `).all() as Array<{
    id: number
    user_id: number
    title: string
    cuisine: string
    difficulty: string
    cook_time: number
    photo: string | null
    description: string | null
    author_name: string
    created_at: string
  }>
  res.json(recipes.map((r): Recipe => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    cuisine: r.cuisine,
    difficulty: r.difficulty,
    cookTime: r.cook_time,
    photo: r.photo ?? undefined,
    description: r.description ?? undefined,
    authorName: r.author_name,
    createdAt: r.created_at
  })))
})

router.get('/my', authMiddleware, (req: AuthRequest, res: Response<Recipe[] | ErrorResponse>) => {
  const recipes = db.prepare(
    'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId) as Array<{
    id: number
    user_id: number
    title: string
    cuisine: string
    difficulty: string
    cook_time: number
    photo: string | null
    description: string | null
    created_at: string
  }>
  res.json(recipes.map((r): Recipe => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    cuisine: r.cuisine,
    difficulty: r.difficulty,
    cookTime: r.cook_time,
    photo: r.photo ?? undefined,
    description: r.description ?? undefined,
    createdAt: r.created_at
  })))
})

router.get('/:id', (req: Request<{ id: string }>, res: Response<Recipe | ErrorResponse>) => {
  const recipe = db.prepare(`
    SELECT r.*, u.name as author_name
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(req.params.id) as {
    id: number
    user_id: number
    title: string
    cuisine: string
    difficulty: string
    cook_time: number
    photo: string | null
    description: string | null
    author_name: string
    created_at: string
  } | undefined

  if (!recipe) return res.status(404).json({ error: '菜谱不存在' })

  const result: Recipe = {
    id: recipe.id,
    userId: recipe.user_id,
    title: recipe.title,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    cookTime: recipe.cook_time,
    photo: recipe.photo ?? undefined,
    description: recipe.description ?? undefined,
    authorName: recipe.author_name,
    createdAt: recipe.created_at
  }
  res.json(result)
})

router.post('/', authMiddleware, (req: AuthRequest & Request<{}, {}, CreateRecipeRequest>, res: Response<Recipe | ErrorResponse>) => {
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
    ingredients.forEach((ing, index: number) => {
      stmt.run(recipeId, ing.name, ing.amount, index)
    })
  }

  if (steps && steps.length > 0) {
    const stmt = db.prepare('INSERT INTO steps (recipe_id, order_num, content, photo) VALUES (?, ?, ?, ?)')
    steps.forEach((step, index: number) => {
      stmt.run(recipeId, index + 1, step.content, step.photo || null)
    })
  }

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId) as {
    id: number
    user_id: number
    title: string
    cuisine: string
    difficulty: string
    cook_time: number
    photo: string | null
    description: string | null
    created_at: string
  }
  const response: Recipe = {
    id: recipe.id,
    userId: recipe.user_id,
    title: recipe.title,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    cookTime: recipe.cook_time,
    photo: recipe.photo ?? undefined,
    description: recipe.description ?? undefined,
    createdAt: recipe.created_at
  }
  res.json(response)
})

router.get('/:id/ingredients', (req: Request<{ id: string }>, res: Response<Ingredient[]>) => {
  const ingredients = db.prepare(
    'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY order_num'
  ).all(req.params.id) as Array<{
    id: number
    recipe_id: number
    name: string
    amount: string
    order_num: number
  }>
  res.json(ingredients.map((i): Ingredient => ({
    id: i.id,
    recipeId: i.recipe_id,
    name: i.name,
    amount: i.amount,
    orderNum: i.order_num
  })))
})

router.get('/:id/steps', (req: Request<{ id: string }>, res: Response<Step[]>) => {
  const steps = db.prepare(
    'SELECT * FROM steps WHERE recipe_id = ? ORDER BY order_num'
  ).all(req.params.id) as Array<{
    id: number
    recipe_id: number
    order_num: number
    content: string
    photo: string | null
  }>
  res.json(steps.map((s): Step => ({
    id: s.id,
    recipeId: s.recipe_id,
    orderNum: s.order_num,
    content: s.content,
    photo: s.photo ?? undefined
  })))
})

router.get('/:id/reviews', (req: Request<{ id: string }>, res: Response<Review[]>) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.recipe_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id) as Array<{
    id: number
    recipe_id: number
    user_id: number
    user_name: string
    rating: number
    comment: string | null
    created_at: string
  }>
  res.json(reviews.map((r): Review => ({
    id: r.id,
    recipeId: r.recipe_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment ?? '',
    createdAt: r.created_at
  })))
})

router.post('/:id/reviews', authMiddleware, (req: AuthRequest & Request<{ id: string }, {}, CreateReviewRequest>, res: Response<Review | ErrorResponse>) => {
  const { rating, comment } = req.body
  if (!rating) {
    return res.status(400).json({ error: '请评分' })
  }

  const result = db.prepare(`
    INSERT INTO reviews (recipe_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(req.params.id, req.userId, rating, comment || null)

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid) as {
    id: number
    recipe_id: number
    user_id: number
    rating: number
    comment: string | null
    created_at: string
  }
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId) as { name: string }

  const response: Review = {
    id: review.id,
    recipeId: review.recipe_id,
    userId: review.user_id,
    userName: user.name,
    rating: review.rating,
    comment: review.comment ?? '',
    createdAt: review.created_at
  }
  res.json(response)
})

router.get('/:id/favorite', authMiddleware, (req: AuthRequest & Request<{ id: string }>, res: Response<FavoriteStatusResponse | ErrorResponse>) => {
  const fav = db.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?'
  ).get(req.userId, req.params.id)
  res.json({ isFavorited: !!fav })
})

router.post('/:id/favorite', authMiddleware, (req: AuthRequest & Request<{ id: string }>, res: Response<SuccessResponse | ErrorResponse>) => {
  try {
    db.prepare(
      'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)'
    ).run(req.userId, req.params.id)
    res.json({ success: true })
  } catch {
    res.status(400).json({ error: '已收藏' })
  }
})

router.delete('/:id/favorite', authMiddleware, (req: AuthRequest & Request<{ id: string }>, res: Response<SuccessResponse | ErrorResponse>) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
    .run(req.userId, req.params.id)
  res.json({ success: true })
})

export default router

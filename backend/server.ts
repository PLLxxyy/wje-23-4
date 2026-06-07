import express from 'express'
import cors from 'cors'
import { db } from './database'
import './init-db'
import authRoutes from './routes/auth'
import recipeRoutes from './routes/recipes'
import reviewRoutes from './routes/reviews'
import followRoutes from './routes/follows'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/follows', followRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

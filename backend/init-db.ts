import { db } from './database'

// Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Recipes table
db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    cook_time INTEGER NOT NULL,
    photo TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`)

// Ingredients table
db.exec(`
  CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
  )
`)

// Steps table
db.exec(`
  CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    order_num INTEGER NOT NULL,
    content TEXT NOT NULL,
    photo TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
  )
`)

// Reviews table
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`)

// Favorites table
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    UNIQUE(user_id, recipe_id)
  )
`)

// Follows table
db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id),
    UNIQUE(follower_id, following_id)
  )
`)

console.log('Database initialized successfully')

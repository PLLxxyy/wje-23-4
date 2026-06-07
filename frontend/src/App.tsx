import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import Profile from './pages/Profile'
import ShoppingList from './pages/ShoppingList'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="recipes/new" element={<AddRecipe />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shopping-list" element={<ShoppingList />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App

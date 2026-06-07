import { useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'
import { Recipe } from '@/types'

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/recipes')
      setRecipes(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const createRecipe = async (data: any) => {
    const res = await api.post('/recipes', data)
    setRecipes(prev => [res.data, ...prev])
    return res.data
  }

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  return { recipes, loading, fetchRecipes, createRecipe }
}

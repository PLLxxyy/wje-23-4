import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/api'
import { CUISINE_OPTIONS } from '@/utils/format'
import { Plus, Trash2, ChefHat } from 'lucide-react'
import type { CreateRecipeRequest, Recipe } from '@shared/types'

type IngredientInput = CreateRecipeRequest['ingredients'] extends (infer T)[] ? T : never
type StepInput = CreateRecipeRequest['steps'] extends (infer T)[] ? T : never

export default function AddRecipe() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [cuisine, setCuisine] = useState('家常菜')
  const [difficulty, setDifficulty] = useState('easy')
  const [cookTime, setCookTime] = useState('')
  const [photo, setPhoto] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', amount: '' }])
  const [steps, setSteps] = useState<StepInput[]>([{ content: '' }])
  const [submitting, setSubmitting] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleStepPhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSteps(prev => prev.map((s, i) => i === index ? { ...s, photo: reader.result as string } : s))
      }
      reader.readAsDataURL(file)
    }
  }

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', amount: '' }])
  const removeIngredient = (index: number) => setIngredients(prev => prev.filter((_, i) => i !== index))
  const updateIngredient = (index: number, field: keyof IngredientInput, value: string) => {
    setIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing))
  }

  const addStep = () => setSteps(prev => [...prev, { content: '' }])
  const removeStep = (index: number) => setSteps(prev => prev.filter((_, i) => i !== index))
  const updateStep = (index: number, value: string) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, content: value } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data: CreateRecipeRequest = {
        title,
        cuisine,
        difficulty,
        cookTime: Number(cookTime),
        photo: photo || undefined,
        description: description || undefined,
        ingredients: ingredients.filter(i => i.name),
        steps: steps.filter(s => s.content)
      }
      const res = await api.post<Recipe>('/recipes', data)
      navigate(`/recipes/${res.data.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ChefHat className="w-6 h-6 text-orange-500" />
        发布菜谱
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">菜名</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">菜系</label>
            <select value={cuisine} onChange={e => setCuisine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              {CUISINE_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">烹饪时间(分钟)</label>
            <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">成品照片</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          {photo && <img src={photo} alt="预览" className="mt-2 w-48 h-32 object-cover rounded-lg" />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">食材清单</label>
            <button type="button" onClick={addIngredient}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
              <Plus className="w-4 h-4" /> 添加食材
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="text" value={ing.name} onChange={e => updateIngredient(index, 'name', e.target.value)}
                  placeholder="食材名称" required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <input type="text" value={ing.amount} onChange={e => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="用量" required
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <button type="button" onClick={() => removeIngredient(index)}
                  className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">烹饪步骤</label>
            <button type="button" onClick={addStep}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
              <Plus className="w-4 h-4" /> 添加步骤
            </button>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea value={step.content} onChange={e => updateStep(index, e.target.value)}
                    placeholder="描述这一步..." required rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  <input type="file" accept="image/*" onChange={e => handleStepPhoto(index, e)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" />
                  {step.photo && <img src={step.photo} alt="" className="w-32 h-20 object-cover rounded-lg" />}
                </div>
                <button type="button" onClick={() => removeStep(index)}
                  className="p-2 text-gray-400 hover:text-red-500 self-start">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/')}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            取消
          </button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors">
            {submitting ? '发布中...' : '发布菜谱'}
          </button>
        </div>
      </form>
    </div>
  )
}

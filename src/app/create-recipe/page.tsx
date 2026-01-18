'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// UI Components
const Button = ({ children, className = '', disabled, ...props }: any) => (
  <button
    className={`px-6 py-3 rounded-lg font-medium transition-all ${
      disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    } ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

const TextArea = ({ className = '', ...props }: any) => (
  <textarea
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
    {...props}
  />
)

const Card = ({ children, className = '', ...props }: any) => (
  <div
    className={`bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
)

const Label = ({ children, className = '' }: any) => (
  <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
)

export default function EditRecipePage() {
  const router = useRouter()
  const params = useParams()
  const recipeId = params.id
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load the recipe from localStorage
    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      const recipes = JSON.parse(savedRecipes)
      const recipe = recipes.find((r: any) => r.id === Number(recipeId))
      
      if (recipe) {
        setTitle(recipe.title)
        setDescription(recipe.description)
        setIngredients(recipe.ingredients?.join('\n') || '')
        setInstructions(recipe.instructions?.join('\n') || '')
        setPrepTime(recipe.prepTime || '')
        setCookTime(recipe.cookTime || '')
        setServings(recipe.servings?.toString() || '')
      } else {
        alert('Recipe not found!')
        router.push('/')
      }
    }
    setLoading(false)
  }, [recipeId, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedRecipe = {
      id: Number(recipeId),
      title,
      description,
      ingredients: ingredients.split('\n').filter(i => i.trim()),
      instructions: instructions.split('\n').filter(i => i.trim()),
      prepTime,
      cookTime,
      servings: parseInt(servings),
      createdAt: new Date().toISOString()
    }

    // Update recipe in localStorage
    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      const recipes = JSON.parse(savedRecipes)
      const updatedRecipes = recipes.map((r: any) => 
        r.id === Number(recipeId) ? updatedRecipe : r
      )
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-100 py-8 px-4 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading recipe...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Recipe</h1>
          <Button onClick={() => router.push('/')} className="bg-gray-600 hover:bg-gray-700">
            ← Back to Home
          </Button>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            ✅ Recipe updated successfully! Redirecting...
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipe Title */}
            <div>
              <Label>Recipe Name *</Label>
              <Input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g., Mom's Spaghetti Carbonara"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description *</Label>
              <TextArea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Tell us about this recipe... What makes it special?"
                rows={3}
                required
              />
            </div>

            {/* Time & Servings Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Prep Time *</Label>
                <Input
                  type="text"
                  value={prepTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrepTime(e.target.value)}
                  placeholder="15 mins"
                  required
                />
              </div>
              <div>
                <Label>Cook Time *</Label>
                <Input
                  type="text"
                  value={cookTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCookTime(e.target.value)}
                  placeholder="30 mins"
                  required
                />
              </div>
              <div>
                <Label>Servings *</Label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServings(e.target.value)}
                  placeholder="4"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Ingredients Text Box */}
            <div>
              <Label>Ingredients * (write each ingredient on a new line)</Label>
              <TextArea
                value={ingredients}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIngredients(e.target.value)}
                placeholder="2 cups all-purpose flour&#10;1 cup granulated sugar&#10;3 large eggs"
                rows={12}
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Tip: Press Enter after each ingredient</p>
            </div>

            {/* Instructions Text Box */}
            <div>
              <Label>Cooking Instructions * (write each step on a new line)</Label>
              <TextArea
                value={instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                placeholder="Preheat oven to 350°F&#10;Mix ingredients&#10;Bake for 30 minutes"
                rows={15}
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Tip: Write each step on a new line</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full text-lg py-4 bg-orange-500 hover:bg-orange-600">
              ✨ Update Recipe
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
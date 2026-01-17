'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'

type FormData = {
  age: number
  sex: 'male' | 'female' | 'other'
  monthlyBudget: number
  dietStyle: 'none' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'keto' | 'low-carb' | 'high-protein'
}

// Tailwind UI Components (no shadcn needed)
const Button = ({ children, className = '', disabled, ...props }: any) => (
  <button 
    className={`px-6 py-3 rounded-lg font-medium transition-all ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} ${className}`} 
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

const Select = ({ children, className = '', ...props }: any) => (
  <select 
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} 
    {...props}
  >
    {children}
  </select>
)

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-2xl mx-auto ${className}`}>
    {children}
  </div>
)

const Label = ({ children, className = '' }: any) => (
  <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
)

export default function Home() {
  const [mealPlan, setMealPlan] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    defaultValues: { 
      age: 18, 
      sex: 'other' as const, 
      monthlyBudget: 300, 
      dietStyle: 'none' as const 
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Fake AI delay
    const fakePlan = generateFakePlan(data)
    setMealPlan(fakePlan)
    setLoading(false)
  }

  const generateFakePlan = (data: FormData): string => {
    const weeks = ['Mon: Eggs + oats (high protein), chicken salad lunch, salmon dinner',
                   'Tue: Greek yogurt breakfast, turkey wrap lunch, tofu stir-fry dinner',
                   'Wed: Smoothie bowl, quinoa salad lunch, beef stir-fry dinner',
                   'Thu: Overnight oats, veggie omelette lunch, lentil curry dinner',
                   'Fri: Protein pancakes, tuna salad lunch, shrimp tacos dinner',
                   'Sat: Avocado toast, chickpea salad lunch, grilled chicken dinner',
                   'Sun: Chia pudding, egg salad lunch, veggie burger dinner']
    
    return `**AI Generated Weekly Meal Plan for ${data.age}yo ${data.sex}, $${data.monthlyBudget}/month budget, ${data.dietStyle} diet:**

**Est. Weekly Cost: ~$${Math.round(data.monthlyBudget / 4)} (budget-friendly!)**

**Shopping List:** Protein (chicken/eggs/tofu: $25), Veggies (broccoli/spinach: $15), Carbs (oats/rice: $10), Extras ($10).

${weeks.join('\n\n')}

*Recipes & exact portions in full app. Swap meals below or save to favorites!*`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">AI Meal Planner</h1>
        
        <Card>
          {!mealPlan ? (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-center">Quick Survey</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label>Age</Label>
                  <Input type="number" {...form.register('age', { valueAsNumber: true })} min={16} max={80} />
                </div>
                
                <div>
                  <Label>Sex</Label>
                  <Select {...form.register('sex')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other/Prefer not to say</option>
                  </Select>
                </div>
                
                <div>
                  <Label>Monthly Grocery Budget ($ CAD)</Label>
                  <Input type="number" {...form.register('monthlyBudget', { valueAsNumber: true })} min={100} max={2000} />
                </div>
                
                <div>
                  <Label>Diet Style</Label>
                  <Select {...form.register('dietStyle')}>
                    <option value="none">No preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="keto">Keto</option>
                    <option value="low-carb">Low Carb</option>
                    <option value="high-protein">High Protein</option>
                  </Select>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Generating Plan...' : 'Generate My Week!'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6">Your Personalized Plan</h2>
              <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-6 rounded-lg overflow-auto max-h-96">{mealPlan}</pre>
              <div className="flex gap-4 mt-6">
                <Button type="button" onClick={() => { setMealPlan(''); form.reset() }} className="flex-1">
                  New Plan
                </Button>
                <Button type="button" className="flex-1 bg-green-600 hover:bg-green-700">
                  Save to Favorites
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}

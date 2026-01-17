'use client'
import MQTT from 'mqtt'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState, useEffect } from 'react'

// ---------------- Type Definitions ----------------
type FormData = {
  age: number
  sex: 'male' | 'female' | 'other'
  monthlyBudget: number
  dietStyle:
    | 'none'
    | 'vegetarian'
    | 'vegan'
    | 'halal'
    | 'kosher'
    | 'keto'
    | 'low-carb'
    | 'high-protein'
}

type Recipe = {
  id: number
  title: string
  description: string
}

// ---------------- Tailwind UI Components ----------------
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

const Select = ({ children, className = '', ...props }: any) => (
  <select
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  >
    {children}
  </select>
)

const Card = ({ children, className = '', ...props }: any) => (
  <div
    className={`bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow ${className}`}
    {...props}
  >
    {children}
  </div>
)

const Label = ({ children, className = '' }: any) => (
  <label
    className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
  >
    {children}
  </label>
)

// ---------------- Main Component ----------------
export default function Home() {
  const [mealPlan, setMealPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [mqttClient, setMqttClient] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [queuedPayload, setQueuedPayload] = useState<any>(null)

  const [user, setUser] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 1, title: 'Spaghetti Bolognese', description: 'Classic Italian pasta with meat sauce' },
    { id: 2, title: 'Vegan Buddha Bowl', description: 'Quinoa, chickpeas, and roasted veggies' },
    { id: 3, title: 'Chicken Caesar Salad', description: 'Crisp romaine with grilled chicken' },
    { id: 4, title: 'Avocado Toast', description: 'Simple and healthy breakfast' },
    { id: 5, title: 'Beef Stir Fry', description: 'Quick and tasty stir fry with vegetables' },
  ])
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, Recipe[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  })
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      age: 18,
      sex: 'other',
      monthlyBudget: 300,
      dietStyle: 'none',
    },
  })

  // ---------------- MQTT AI Meal Planner ----------------
  useEffect(() => {
  if (typeof window === 'undefined') return

  const url = process.env.NEXT_PUBLIC_SOLACE_MQTT_URL!
  const client = MQTT.connect(url, {
    username: process.env.NEXT_PUBLIC_SOLACE_USER,
    password: process.env.NEXT_PUBLIC_SOLACE_PASS,
    reconnectPeriod: 2000,
  })

  client.on('connect', () => {
    setConnected(true)
    console.log('✅ MQTT Connected!')
    client.subscribe('meal-plans/test')
  })

  client.on('message', (topic, message) => {
    console.log('AI Plan:', message.toString())
    setMealPlan(message.toString())
    setLoading(false)
  })

  client.on('error', (err) => console.error('MQTT Error:', err))

  setMqttClient(client)

  return () => {
    client.end()
  }
}, [])


  useEffect(() => {
    if (connected && queuedPayload) {
      mqttClient?.publish('meal-requests/test', JSON.stringify(queuedPayload))
      setQueuedPayload(null)
    }
  }, [connected, queuedPayload])

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setLoading(true)
    setMealPlan('Sent to Solace AI... Waiting for response.')
    const payload = { ...data, userId: 'test', timestamp: Date.now() }
    if (connected) {
      mqttClient?.publish('meal-requests/test', JSON.stringify(payload))
    } else {
      setQueuedPayload(payload)
    }
  }

  const handleLike = (recipe: Recipe) => {
    if (!user) return setShowLoginPrompt(true)
    alert(`Saved ${recipe.title} to favorites!`)
  }

  const navigateToCreateRecipe = () => {
    if (!user) return setShowLoginPrompt(true)
    alert('Navigate to create recipe page')
  }

  const navigateToLogin = () => {
    alert('Navigate to login page')
  }

  const addToDay = (day: string, recipe: Recipe) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], recipe],
    }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-100 py-8 px-4">
      {/* ---------------- Header ---------------- */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Recipe Hub</h1>
        <Button onClick={() => navigateToLogin()}>Login</Button>
      </div>

      {/* ---------------- Recipe Feed ---------------- */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} onClick={() => setSelectedRecipe(recipe)}>
            <h3 className="font-semibold text-lg">{recipe.title}</h3>
            <p className="text-gray-700 text-sm">{recipe.description}</p>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  handleLike(recipe)
                }}
                className="flex-1"
              >
                Like
              </Button>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  const day = prompt('Add to which day? (Monday-Sunday)')
                  if (day && weeklyPlan[day]) addToDay(day, recipe)
                }}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500"
              >
                Add to Day
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ---------------- Weekly Planner ---------------- */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4">Weekly Meal Plan</h2>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {Object.keys(weeklyPlan).map((day) => (
            <div key={day} className="p-2 border rounded-lg bg-white bg-opacity-80 backdrop-blur-sm">
              <h3 className="font-semibold">{day}</h3>
              {weeklyPlan[day].map((recipe) => (
                <p key={recipe.id} className="text-gray-700">{recipe.title}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- AI Meal Planner Survey ---------------- */}
      <Card className="max-w-3xl mx-auto mb-8">
        {!mealPlan ? (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-center">AI Meal Planner Survey</h2>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {connected ? 'Connected to AI ✅' : 'Connecting to AI...'}
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Age</Label>
                <Input type="number" {...form.register('age', { valueAsNumber: true })} min={16} max={80} />
              </div>
              <div>
                <Label>Sex</Label>
                <Select {...form.register('sex')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
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

              <Button type="submit" className="w-full">
                {loading ? 'Generating Plan...' : 'Generate My Week!'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-center">Your AI-Generated Meal Plan</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              {mealPlan}
            </pre>
            <Button onClick={() => setMealPlan('')} className="mt-4 w-full">
              New Plan
            </Button>
          </>
        )}
      </Card>

      {/* ---------------- Floating Add Recipe Button ---------------- */}
      <Button
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl"
        onClick={() => navigateToCreateRecipe()}
      >
        +
      </Button>

      {/* ---------------- Login Prompt Modal ---------------- */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 text-xl font-bold"
              onClick={() => setShowLoginPrompt(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="mb-4">Please log in to like or create a recipe.</p>
            <Button onClick={() => navigateToLogin()}>Go to Login</Button>
          </div>
        </div>
      )}
    </main>
  )
}

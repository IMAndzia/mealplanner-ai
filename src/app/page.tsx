'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Recipe = {
  id: number
  title: string
  description: string
  ingredients?: string[]
  instructions?: string[]
  prepTime?: string
  cookTime?: string
  servings?: number
  createdBy?: string
}

type Message = {
  id: number
  from: string
  to: string
  text: string
  timestamp: number
}

// UI Components
const Button = ({ children, className = '', disabled, ...props }: any) => (
  <button
    className={`px-6 py-3 rounded-lg font-medium transition-all ${
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
    } ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

const Card = ({ children, className = '', ...props }: any) => (
  <div
    className={`bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow ${className}`}
    {...props}
  >
    {children}
  </div>
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

export default function Home() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [currentView, setCurrentView] = useState<'all' | 'favorites' | 'profile' | 'messages'>('all')
  const [viewingProfile, setViewingProfile] = useState<string | null>(null)
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
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageTo, setMessageTo] = useState<string>('')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const getWeekDates = () => {
    const curr = new Date(currentWeek)
    const first = curr.getDate() - curr.getDay() + 1
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return days.map((day, i) => {
      const date = new Date(curr.setDate(first + i))
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: new Date().toDateString() === date.toDateString()
      }
    })
  }

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    setCurrentUser(user)

    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes))
    }

    if (user) {
      const userWeeklyPlan = localStorage.getItem(`weeklyPlan_${user}`)
      if (userWeeklyPlan) {
        setWeeklyPlan(JSON.parse(userWeeklyPlan))
      }

      const userMessages = localStorage.getItem(`messages_${user}`)
      if (userMessages) {
        setMessages(JSON.parse(userMessages))
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`weeklyPlan_${currentUser}`, JSON.stringify(weeklyPlan))
    }
  }, [weeklyPlan, currentUser])

  const getFavorites = () => {
    if (!currentUser) return []
    const favorites = localStorage.getItem(`favorites_${currentUser}`)
    return favorites ? JSON.parse(favorites) : []
  }

  const handleLike = (recipe: Recipe) => {
    if (!currentUser) {
      alert('Please login to like recipes!')
      router.push('/login')
      return
    }
    
    const favorites = getFavorites()
    const alreadyLiked = favorites.find((f: Recipe) => f.id === recipe.id)
    
    if (alreadyLiked) {
      const updated = favorites.filter((f: Recipe) => f.id !== recipe.id)
      localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(updated))
      alert('❌ Removed from favorites!')
    } else {
      favorites.push(recipe)
      localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites))
      alert(`❤️ Saved ${recipe.title} to favorites!`)
    }
    
    setRecipes([...recipes])
  }

  const addToDay = (day: string, recipe: Recipe) => {
    if (!currentUser) {
      alert('Please login to add recipes to your weekly plan!')
      router.push('/login')
      return
    }

    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], recipe],
    }))
    alert(`✅ Added ${recipe.title} to ${day}!`)
  }

  const removeFromDay = (day: string, recipeId: number) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter(r => r.id !== recipeId),
    }))
  }

  const handleDelete = (recipeId: number) => {
    const confirmed = confirm('Are you sure you want to delete this recipe?')
    if (confirmed) {
      const updatedRecipes = recipes.filter(r => r.id !== recipeId)
      setRecipes(updatedRecipes)
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
      setSelectedRecipe(null)
      alert('🗑️ Recipe deleted!')
    }
  }

  const handleEdit = (recipeId: number) => {
    router.push(`/edit-recipe/${recipeId}`)
  }

  const claimUnownedRecipes = () => {
    if (!currentUser) {
      alert('Please login first!')
      return
    }
    
    const confirmed = confirm('This will assign all recipes without an owner to your account. Continue?')
    if (confirmed) {
      const updatedRecipes = recipes.map(r => 
        !r.createdBy ? { ...r, createdBy: currentUser } : r
      )
      setRecipes(updatedRecipes)
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes))
      alert('✅ Unowned recipes claimed!')
    }
  }

  const handleLogout = () => {
    const confirmed = confirm('Are you sure you want to logout?')
    if (confirmed) {
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
      setWeeklyPlan({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      })
      setCurrentView('all')
      alert('✅ Logged out successfully!')
    }
  }

  const viewProfile = (email: string) => {
    setViewingProfile(email)
    setCurrentView('profile')
  }

  const sendMessage = () => {
    if (!currentUser || !messageText.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      from: currentUser,
      to: messageTo,
      text: messageText,
      timestamp: Date.now()
    }

    // Save to sender's messages
    const senderMessages = JSON.parse(localStorage.getItem(`messages_${currentUser}`) || '[]')
    senderMessages.push(newMessage)
    localStorage.setItem(`messages_${currentUser}`, JSON.stringify(senderMessages))

    // Save to receiver's messages
    const receiverMessages = JSON.parse(localStorage.getItem(`messages_${messageTo}`) || '[]')
    receiverMessages.push(newMessage)
    localStorage.setItem(`messages_${messageTo}`, JSON.stringify(receiverMessages))

    alert('✉️ Message sent!')
    setShowMessageModal(false)
    setMessageText('')
    setMessageTo('')
  }

  const openMessageModal = (email: string) => {
    if (!currentUser) {
      alert('Please login to send messages!')
      router.push('/login')
      return
    }
    setMessageTo(email)
    setShowMessageModal(true)
  }

  const getRecipesToDisplay = () => {
    if (currentView === 'favorites') {
      return getFavorites()
    } else if (currentView === 'profile' && viewingProfile) {
      // Filter recipes by creator email
      return recipes.filter(r => r.createdBy === viewingProfile)
    } else {
      return recipes
    }
  }

  const weekDates = getWeekDates()
  const displayRecipes = getRecipesToDisplay()
  const unreadCount = messages.filter(m => m.to === currentUser).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">🍳 Recipe Hub</h1>
        <div className="flex gap-3 items-center">
          {currentUser && (
            <>
              <span className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg">
                👤 {currentUser}
              </span>
              <Button 
                onClick={() => {
                  setCurrentView('messages')
                  setViewingProfile(null)
                }}
                className="bg-pink-500 hover:bg-pink-600 relative"
              >
                💬 Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/ai-meal-planner')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ✨ Generate Meal Using AI
          </Button>
          {currentUser ? (
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Logout
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')}>Login</Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 flex-wrap">
        <Button 
          onClick={() => {
            setCurrentView('all')
            setViewingProfile(null)
          }}
          className={currentView === 'all' ? 'bg-blue-600' : 'bg-gray-500'}
        >
          🏠 All Recipes
        </Button>
        {currentUser && (
          <>
            <Button 
              onClick={() => {
                setCurrentView('profile')
                setViewingProfile(currentUser)
              }}
              className={currentView === 'profile' && viewingProfile === currentUser ? 'bg-blue-600' : 'bg-gray-500'}
            >
              📝 My Recipes
            </Button>
            <Button 
              onClick={() => {
                setCurrentView('favorites')
                setViewingProfile(null)
              }}
              className={currentView === 'favorites' ? 'bg-blue-600' : 'bg-gray-500'}
            >
              ❤️ My Favorites
            </Button>
            {recipes.some(r => !r.createdBy) && (
              <Button 
                onClick={claimUnownedRecipes}
                className="bg-green-600 hover:bg-green-700 text-sm"
              >
                🔧 Claim My Old Recipes
              </Button>
            )}
          </>
        )}
      </div>

      {/* Messages View */}
      {currentView === 'messages' && currentUser && (
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <h2 className="text-2xl font-bold mb-4">💬 Messages</h2>
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-4 rounded-lg ${msg.to === currentUser ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">
                        {msg.to === currentUser ? `From: ${msg.from}` : `To: ${msg.to}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Profile View */}
      {currentView === 'profile' && viewingProfile && (
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {viewingProfile === currentUser ? '👤 My Profile' : `👤 ${viewingProfile}`}
                </h2>
                <p className="text-gray-600 mb-2">📧 {viewingProfile}</p>
                <p className="text-gray-600">{displayRecipes.length} recipes</p>
              </div>
              {currentUser && currentUser !== viewingProfile && (
                <Button 
                  onClick={() => openMessageModal(viewingProfile)}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  💬 Send Message
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Calendar */}
      {currentView !== 'messages' && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">📅 Weekly Meal Plan</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}
                className="text-sm py-2"
              >
                ← Previous Week
              </Button>
              <Button 
                onClick={() => setCurrentWeek(new Date())}
                className="text-sm py-2 bg-green-600 hover:bg-green-700"
              >
                This Week
              </Button>
              <Button 
                onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}
                className="text-sm py-2"
              >
                Next Week →
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-sm">
            {weekDates.map(({ day, date, month, isToday }) => (
              <div
                key={day}
                className={`p-3 border rounded-lg bg-white bg-opacity-80 backdrop-blur-sm min-h-32 ${
                  isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="text-center mb-2">
                  <h3 className="font-semibold">{day}</h3>
                  <p className={`text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {month} {date}
                  </p>
                </div>
                {weeklyPlan[day].length === 0 ? (
                  <p className="text-gray-400 text-xs text-center">Empty</p>
                ) : (
                  <div className="space-y-1">
                    {weeklyPlan[day].map((recipe) => (
                      <div key={recipe.id} className="text-gray-700 text-xs bg-blue-50 rounded p-2 relative group">
                        <p className="font-medium">{recipe.title}</p>
                        <button
                          onClick={() => removeFromDay(day, recipe.id)}
                          className="absolute top-1 right-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Feed */}
      {currentView !== 'messages' && (
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {currentView === 'favorites' ? '❤️ My Favorite Recipes' : 
             currentView === 'profile' && viewingProfile === currentUser ? '📝 My Recipes' :
             currentView === 'profile' ? `${viewingProfile}'s Recipes` : 
             'All Recipes'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayRecipes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {currentView === 'favorites' 
                    ? 'No favorites yet. Like some recipes!' 
                    : 'No recipes yet. Start building your collection!'}
                </p>
                {currentView === 'all' && (
                  <Button onClick={() => router.push('/create-recipe')} className="bg-green-600 hover:bg-green-700">
                    + Add Your First Recipe
                  </Button>
                )}
              </div>
            ) : (
              displayRecipes.map((recipe:any) => {
                const isOwner = currentUser === recipe.createdBy
                const isFavorite = getFavorites().some((f: Recipe) => f.id === recipe.id)
                
                return (
                  <Card key={recipe.id} className="cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
                    {recipe.createdBy && (
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            viewProfile(recipe.createdBy!)
                          }}
                          className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded font-medium"
                        >
                          👤 {isOwner ? 'You' : recipe.createdBy}
                        </button>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{recipe.title}</h3>
                      {isFavorite && <span className="text-red-500">❤️</span>}
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                    {recipe.prepTime && (
                      <div className="text-xs text-gray-600 mb-3 flex gap-3">
                        <span>⏱️ {recipe.prepTime}</span>
                        <span>🔥 {recipe.cookTime}</span>
                        <span>🍽️ {recipe.servings}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          handleLike(recipe)
                        }}
                        className={`flex-1 text-sm py-2 ${isFavorite ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      >
                        {isFavorite ? '❤️ Unlike' : '❤️ Like'}
                      </Button>
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          const day = prompt('Add to which day? (Monday-Sunday)')
                          if (day && weeklyPlan[day] !== undefined) addToDay(day, recipe)
                        }}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-sm py-2"
                      >
                        📅 Add
                      </Button>
                    </div>
                    {isOwner && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            handleEdit(recipe.id)
                          }}
                          className="flex-1 text-sm py-2 bg-orange-500 hover:bg-orange-600"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            handleDelete(recipe.id)
                          }}
                          className="flex-1 text-sm py-2 bg-red-500 hover:bg-red-600"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Floating Add Recipe Button */}
      <Button
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 rounded-full w-16 h-16 flex items-center justify-center text-white text-3xl shadow-2xl"
        onClick={() => router.push('/create-recipe')}
        title="Add Recipe"
      >
        +
      </Button>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">💬 Send Message to {messageTo}</h2>
            <TextArea
              value={messageText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={sendMessage} className="flex-1 bg-pink-500 hover:bg-pink-600">
                Send Message
              </Button>
              <Button onClick={() => setShowMessageModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={() => setSelectedRecipe(null)}
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-3">{selectedRecipe.title}</h2>
            {selectedRecipe.createdBy && (
              <button 
                onClick={() => {
                  viewProfile(selectedRecipe.createdBy!)
                  setSelectedRecipe(null)
                }}
                className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded mb-3"
              >
                👤 by {selectedRecipe.createdBy === currentUser ? 'You' : selectedRecipe.createdBy}
              </button>
            )}
            <p className="text-gray-700 mb-4 text-lg">{selectedRecipe.description}</p>
            
            {selectedRecipe.prepTime && (
              <div className="flex gap-6 mb-6 text-gray-600 bg-gray-50 p-4 rounded-lg">
                <span className="font-medium">⏱️ Prep: {selectedRecipe.prepTime}</span>
                <span className="font-medium">🔥 Cook: {selectedRecipe.cookTime}</span>
                <span className="font-medium">🍽️ Servings: {selectedRecipe.servings}</span>
              </div>
            )}
            
            {selectedRecipe.ingredients && (
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-3 text-blue-600">📝 Ingredients</h3>
                <ul className="space-y-2 bg-blue-50 p-4 rounded-lg">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-gray-800 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedRecipe.instructions && (
              <div>
                <h3 className="font-bold text-xl mb-3 text-green-600">👨‍🍳 Instructions</h3>
                <ol className="space-y-3 bg-green-50 p-4 rounded-lg">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="text-gray-800 flex items-start">
                      <span className="font-bold text-green-600 mr-3 min-w-6">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {currentUser === selectedRecipe.createdBy ? (
                <>
                  <Button 
                    onClick={() => {
                      handleEdit(selectedRecipe.id)
                      setSelectedRecipe(null)
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    ✏️ Edit Recipe
                  </Button>
                  <Button 
                    onClick={() => handleDelete(selectedRecipe.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    🗑️ Delete Recipe
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => handleLike(selectedRecipe)}
                    className="flex-1"
                  >
                    ❤️ {getFavorites().some((f: Recipe) => f.id === selectedRecipe.id) ? 'Unlike' : 'Like'}
                  </Button>
                  {selectedRecipe.createdBy && currentUser && (
                    <Button 
                      onClick={() => {
                        openMessageModal(selectedRecipe.createdBy!)
                        setSelectedRecipe(null)
                      }}
                      className="flex-1 bg-pink-500 hover:bg-pink-600"
                    >
                      💬 Message Creator
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}